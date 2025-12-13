-- Add delivery information columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS nom_destinataire TEXT,
ADD COLUMN IF NOT EXISTS telephone_destinataire TEXT,
ADD COLUMN IF NOT EXISTS adresse_livraison TEXT;