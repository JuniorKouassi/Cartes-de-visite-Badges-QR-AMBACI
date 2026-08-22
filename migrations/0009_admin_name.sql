-- Nom affiche de l'administrateur. Sans lui, Chrono n'avait que l'identifiant
-- de connexion a montrer dans ses listes d'imputation.
ALTER TABLE admin_users ADD COLUMN name TEXT;
