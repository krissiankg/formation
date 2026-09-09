-- 004_student_profile.sql
-- Ajout de la photo de profil (avatar_url) et du mot de passe sécurisé (password_hash)

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS password_hash text;
