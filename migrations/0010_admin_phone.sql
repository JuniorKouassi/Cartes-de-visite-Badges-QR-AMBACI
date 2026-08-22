-- Numero de telephone de l'administrateur, au format international
-- (+43..., +225...). Transmis a Chrono lors du passage de temoin, pour les
-- notifications WhatsApp.
ALTER TABLE admin_users ADD COLUMN phone TEXT;
