-- Add 'lue' column to notifications table
ALTER TABLE public.notifications
ADD COLUMN lue boolean NOT NULL DEFAULT false;