-- ========== EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== APP ROLE ENUM ==========
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'acheteur';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendeur';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'livreur';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========== USERS (PROFILES) ==========
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  email text UNIQUE NOT NULL,
  entreprise text,
  pays text,
  telephone text,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now()
);

-- ========== PRODUCTS ==========
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  nom text NOT NULL,
  prix numeric NOT NULL CHECK (prix >= 0),
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  categorie text,
  statut text DEFAULT 'actif',
  created_at timestamp with time zone DEFAULT now()
);

-- ========== ORDERS ==========
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acheteur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  vendeur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  livreur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  produit_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantite integer NOT NULL DEFAULT 1 CHECK (quantite > 0),
  montant numeric NOT NULL CHECK (montant >= 0),
  statut text CHECK (statut IN (
    'en_attente_paiement','fonds_bloques','en_livraison','livré','terminé','litige'
  )) NOT NULL DEFAULT 'en_attente_paiement',
  reference_gateway text,
  created_at timestamp with time zone DEFAULT now()
);

-- ========== PAYMENTS (ESCROW) ==========
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  montant numeric NOT NULL CHECK (montant >= 0),
  mode text,
  statut text CHECK (statut IN ('bloqué','débloqué','remboursé')) NOT NULL DEFAULT 'bloqué',
  reference_gateway text,
  created_at timestamp with time zone DEFAULT now(),
  debloque_at timestamp with time zone
);

-- ========== DELIVERIES (LIVRAISONS) ==========
CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  livreur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  vendeur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  acheteur_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  statut text CHECK (statut IN ('en_attente','en_livraison','livrée')) NOT NULL DEFAULT 'en_attente',
  tracking_code text,
  date_assignation timestamp with time zone,
  date_livraison timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- ========== VALIDATIONS (Triple OK) ==========
CREATE TABLE IF NOT EXISTS public.validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  acheteur_ok boolean DEFAULT false,
  vendeur_ok boolean DEFAULT false,
  livreur_ok boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- ========== NOTIFICATIONS ==========
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  canal text CHECK (canal IN ('email','sms','app')) DEFAULT 'app',
  created_at timestamp with time zone DEFAULT now()
);

-- ========== FUNCTIONS ==========

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, nom, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nom', new.raw_user_meta_data->>'name', 'User'),
    new.email
  );
  RETURN new;
END;
$$;

-- Ensure validation row exists for each order
CREATE OR REPLACE FUNCTION public.ensure_validation_row()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.validations v WHERE v.order_id = new.id) THEN
    INSERT INTO public.validations(order_id) VALUES (new.id);
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Auto-unlock payment when all parties validate
CREATE OR REPLACE FUNCTION public.unlock_payment_on_full_validation()
RETURNS trigger AS $$
BEGIN
  IF new.acheteur_ok AND new.vendeur_ok AND new.livreur_ok THEN
    UPDATE public.payments
       SET statut='débloqué', debloque_at=now()
     WHERE order_id=new.order_id AND statut='bloqué';
    
    UPDATE public.orders
       SET statut='terminé'
     WHERE id=new.order_id AND statut IN ('livré','en_livraison','fonds_bloques');
    
    INSERT INTO public.notifications(user_id, message, canal)
      SELECT o.vendeur_id, 'Paiement libéré pour votre commande', 'app'
      FROM public.orders o WHERE o.id=new.order_id;
  END IF;
  new.updated_at := now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ========== TRIGGERS ==========

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_orders_ensure_validations ON public.orders;
CREATE TRIGGER trg_orders_ensure_validations
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.ensure_validation_row();

DROP TRIGGER IF EXISTS trg_unlock_payment ON public.validations;
CREATE TRIGGER trg_unlock_payment
  AFTER UPDATE ON public.validations
  FOR EACH ROW EXECUTE FUNCTION public.unlock_payment_on_full_validation();

-- ========== RLS POLICIES ==========

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile or admin can update all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
DROP POLICY IF EXISTS "Order parties can view orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Order parties can update orders" ON public.orders;
DROP POLICY IF EXISTS "Order parties can view payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Delivery parties can view deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Vendor or admin can insert deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Courier, vendor or admin can update deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Order parties can view validations" ON public.validations;
DROP POLICY IF EXISTS "Buyers can update buyer validation" ON public.validations;
DROP POLICY IF EXISTS "Vendors can update vendor validation" ON public.validations;
DROP POLICY IF EXISTS "Couriers can update courier validation" ON public.validations;
DROP POLICY IF EXISTS "Admin can update all validations" ON public.validations;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;

-- Create new policies
CREATE POLICY "Users can view own profile or admin can view all" ON public.users
  FOR SELECT USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile or admin can update all" ON public.users
  FOR UPDATE USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (
    statut='actif' 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR vendeur_id=auth.uid()
  );

CREATE POLICY "Vendors can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    vendeur_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Vendors can update own products" ON public.products
  FOR UPDATE TO authenticated
  USING (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (vendeur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Order parties can view orders" ON public.orders
  FOR SELECT USING (
    acheteur_id = auth.uid() 
    OR vendeur_id = auth.uid() 
    OR livreur_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Buyers can insert orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (acheteur_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Order parties can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    acheteur_id = auth.uid() 
    OR vendeur_id = auth.uid() 
    OR livreur_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    acheteur_id = auth.uid() 
    OR vendeur_id = auth.uid() 
    OR livreur_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Order parties can view payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id=order_id 
      AND (
        o.acheteur_id=auth.uid() 
        OR o.vendeur_id=auth.uid() 
        OR o.livreur_id=auth.uid() 
        OR has_role(auth.uid(), 'admin'::app_role)
      )
    )
  );

CREATE POLICY "Admin can insert payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Delivery parties can view deliveries" ON public.deliveries
  FOR SELECT USING (
    livreur_id=auth.uid()
    OR vendeur_id=auth.uid()
    OR acheteur_id=auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Vendor or admin can insert deliveries" ON public.deliveries
  FOR INSERT TO authenticated
  WITH CHECK (vendeur_id=auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Courier, vendor or admin can update deliveries" ON public.deliveries
  FOR UPDATE TO authenticated
  USING (
    livreur_id=auth.uid() 
    OR vendeur_id=auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    livreur_id=auth.uid() 
    OR vendeur_id=auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Order parties can view validations" ON public.validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id=order_id 
      AND (
        o.acheteur_id=auth.uid() 
        OR o.vendeur_id=auth.uid() 
        OR o.livreur_id=auth.uid() 
        OR has_role(auth.uid(), 'admin'::app_role)
      )
    )
  );

CREATE POLICY "Buyers can update buyer validation" ON public.validations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.acheteur_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.acheteur_id=auth.uid()));

CREATE POLICY "Vendors can update vendor validation" ON public.validations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.vendeur_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.vendeur_id=auth.uid()));

CREATE POLICY "Couriers can update courier validation" ON public.validations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.livreur_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.livreur_id=auth.uid()));

CREATE POLICY "Admin can update all validations" ON public.validations
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));