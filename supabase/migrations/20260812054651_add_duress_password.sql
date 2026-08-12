-- Add duress_password_hash column to profiles table
ALTER TABLE public.profiles ADD COLUMN duress_password_hash TEXT;
