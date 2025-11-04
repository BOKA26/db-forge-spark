-- Lovable E-commerce "Alibaba-like" with Escrow & Courier Role
-- Modified schema with proper role security

-- ========== EXTENSIONS ==========
create extension if not exists pgcrypto;

-- ========== APP ROLE ENUM ==========
create type public.app_role as enum ('acheteur','vendeur','livreur','admin');

-- ========== USERS TABLE (WITHOUT ROLE) ==========
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  email text unique not null,
  entreprise text,
  pays text,
  telephone text,
  statut text default 'actif',
  created_at timestamp default now()
);

-- ========== USER ROLES TABLE (SECURE APPROACH) ==========
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role),
  created_at timestamp default now()
);

-- ========== PRODUCTS ==========
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendeur_id uuid references public.users(id) on delete set null,
  nom text not null,
  prix numeric not null check (prix >= 0),
  description text,
  images jsonb default '[]'::jsonb,
  stock integer default 0 check (stock >= 0),
  categorie text,
  statut text default 'actif',
  created_at timestamp default now()
);

-- ========== ORDERS ==========
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  acheteur_id uuid references public.users(id) on delete set null,
  vendeur_id uuid references public.users(id) on delete set null,
  livreur_id uuid references public.users(id) on delete set null,
  produit_id uuid references public.products(id) on delete set null,
  quantite integer not null default 1 check (quantite > 0),
  montant numeric not null check (montant >= 0),
  statut text check (statut in (
    'en_attente_paiement','fonds_bloques','en_livraison','livré','terminé','litige'
  )) not null default 'en_attente_paiement',
  reference_gateway text,
  created_at timestamp default now()
);

-- ========== PAYMENTS (ESCROW) ==========
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders(id) on delete cascade,
  montant numeric not null check (montant >= 0),
  mode text,
  statut text check (statut in ('bloqué','débloqué','remboursé')) not null default 'bloqué',
  reference_gateway text,
  created_at timestamp default now(),
  debloque_at timestamp
);

-- ========== DELIVERIES (LIVRAISONS) ==========
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders(id) on delete cascade,
  livreur_id uuid references public.users(id) on delete set null,
  vendeur_id uuid references public.users(id) on delete set null,
  acheteur_id uuid references public.users(id) on delete set null,
  statut text check (statut in ('en_attente','en_livraison','livrée')) not null default 'en_attente',
  tracking_code text,
  date_assignation timestamp,
  date_livraison timestamp,
  created_at timestamp default now()
);

-- ========== VALIDATIONS (Triple OK) ==========
create table if not exists public.validations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders(id) on delete cascade,
  acheteur_ok boolean default false,
  vendeur_ok boolean default false,
  livreur_ok boolean default false,
  updated_at timestamp default now()
);

-- ========== NOTIFICATIONS ==========
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  canal text check (canal in ('email','sms','app')) default 'app',
  lu boolean default false,
  created_at timestamp default now()
);

-- ========== TRIGGER: AUTO-CREATE USER PROFILE ON SIGNUP ==========
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, nom, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== TRIGGER: ENSURE VALIDATION ROW ==========
create or replace function public.ensure_validation_row()
returns trigger as $$
begin
  if not exists (select 1 from public.validations v where v.order_id = new.id) then
    insert into public.validations(order_id) values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_orders_ensure_validations on public.orders;
create trigger trg_orders_ensure_validations
after insert on public.orders
for each row execute function public.ensure_validation_row();

-- ========== TRIGGER: ESCROW AUTO-UNLOCK ==========
create or replace function public.unlock_payment_on_full_validation()
returns trigger as $$
begin
  if new.acheteur_ok and new.vendeur_ok and new.livreur_ok then
    update public.payments
       set statut='débloqué', debloque_at=now()
     where order_id=new.order_id and statut='bloqué';
    update public.orders
       set statut='terminé'
     where id=new.order_id and statut in ('livré','en_livraison','fonds_bloques');
    
    insert into public.notifications(user_id, message, canal)
      select o.vendeur_id, 'Paiement libéré pour votre commande', 'app'
      from public.orders o where o.id=new.order_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_unlock_payment on public.validations;
create trigger trg_unlock_payment
after update on public.validations
for each row execute function public.unlock_payment_on_full_validation();

-- ========== SECURITY DEFINER FUNCTION: CHECK ROLE ==========
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- ========== SECURITY DEFINER FUNCTION: IS ADMIN ==========
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- ========== ENABLE RLS ==========
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.validations enable row level security;
alter table public.notifications enable row level security;

-- ========== RLS POLICIES: USERS ==========
create policy "Users can view their own profile or admins can view all"
on public.users for select
using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile or admins can update all"
on public.users for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- ========== RLS POLICIES: USER ROLES ==========
create policy "Users can view their own roles, admins can view all"
on public.user_roles for select
using (user_id = auth.uid() or public.is_admin());

create policy "Only admins can insert roles"
on public.user_roles for insert
with check (public.is_admin());

create policy "Only admins can update roles"
on public.user_roles for update
using (public.is_admin())
with check (public.is_admin());

create policy "Only admins can delete roles"
on public.user_roles for delete
using (public.is_admin());

-- ========== RLS POLICIES: PRODUCTS ==========
create policy "Anyone can view active products"
on public.products for select
using (statut='actif' or public.is_admin() or vendeur_id=auth.uid());

create policy "Vendors and admins can insert products"
on public.products for insert
with check (
  vendeur_id = auth.uid() 
  or public.is_admin()
);

create policy "Vendors can update their own products, admins can update all"
on public.products for update
using (vendeur_id = auth.uid() or public.is_admin())
with check (vendeur_id = auth.uid() or public.is_admin());

create policy "Vendors can delete their own products, admins can delete all"
on public.products for delete
using (vendeur_id = auth.uid() or public.is_admin());

-- ========== RLS POLICIES: ORDERS ==========
create policy "Order parties can view their orders"
on public.orders for select
using (
  acheteur_id = auth.uid() 
  or vendeur_id = auth.uid() 
  or livreur_id = auth.uid() 
  or public.is_admin()
);

create policy "Buyers and admins can create orders"
on public.orders for insert
with check (acheteur_id = auth.uid() or public.is_admin());

create policy "Order parties can update their orders"
on public.orders for update
using (
  acheteur_id = auth.uid() 
  or vendeur_id = auth.uid() 
  or livreur_id = auth.uid() 
  or public.is_admin()
)
with check (
  acheteur_id = auth.uid() 
  or vendeur_id = auth.uid() 
  or livreur_id = auth.uid() 
  or public.is_admin()
);

-- ========== RLS POLICIES: PAYMENTS ==========
create policy "Order parties can view payment info"
on public.payments for select
using (
  exists (select 1 from public.orders o where o.id=order_id and (
    o.acheteur_id=auth.uid() 
    or o.vendeur_id=auth.uid() 
    or o.livreur_id=auth.uid() 
    or public.is_admin()
  ))
);

create policy "Only admins can manage payments"
on public.payments for insert
with check (public.is_admin());

create policy "Only admins can update payments"
on public.payments for update
using (public.is_admin())
with check (public.is_admin());

-- ========== RLS POLICIES: DELIVERIES ==========
create policy "Delivery parties can view delivery info"
on public.deliveries for select
using (
  livreur_id=auth.uid()
  or vendeur_id=auth.uid()
  or acheteur_id=auth.uid()
  or public.is_admin()
);

create policy "Vendors and admins can create deliveries"
on public.deliveries for insert
with check (vendeur_id=auth.uid() or public.is_admin());

create policy "Couriers, vendors and admins can update deliveries"
on public.deliveries for update
using (livreur_id=auth.uid() or vendeur_id=auth.uid() or public.is_admin())
with check (livreur_id=auth.uid() or vendeur_id=auth.uid() or public.is_admin());

-- ========== RLS POLICIES: VALIDATIONS ==========
create policy "Order parties can view validations"
on public.validations for select
using (
  exists (select 1 from public.orders o where o.id=order_id and (
    o.acheteur_id=auth.uid() 
    or o.vendeur_id=auth.uid() 
    or o.livreur_id=auth.uid() 
    or public.is_admin()
  ))
);

create policy "Buyers can update their validation flag"
on public.validations for update
using (exists (select 1 from public.orders o where o.id=order_id and o.acheteur_id=auth.uid()))
with check (exists (select 1 from public.orders o where o.id=order_id and o.acheteur_id=auth.uid()));

create policy "Vendors can update their validation flag"
on public.validations for update
using (exists (select 1 from public.orders o where o.id=order_id and o.vendeur_id=auth.uid()))
with check (exists (select 1 from public.orders o where o.id=order_id and o.vendeur_id=auth.uid()));

create policy "Couriers can update their validation flag"
on public.validations for update
using (exists (select 1 from public.orders o where o.id=order_id and o.livreur_id=auth.uid()))
with check (exists (select 1 from public.orders o where o.id=order_id and o.livreur_id=auth.uid()));

create policy "Admins can update all validations"
on public.validations for update
using (public.is_admin())
with check (public.is_admin());

-- ========== RLS POLICIES: NOTIFICATIONS ==========
create policy "Users can view their own notifications"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

create policy "Admins can create notifications"
on public.notifications for insert
with check (public.is_admin());

create policy "Users can update their own notifications (mark as read)"
on public.notifications for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());