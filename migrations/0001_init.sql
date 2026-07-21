CREATE TABLE staff (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT UNIQUE NOT NULL,        -- ex: "junior-kouassi" (URL carte de visite)
  matricule     TEXT UNIQUE NOT NULL,        -- ex: "AMB-VIE-0042" (URL vérification badge)
  full_name     TEXT NOT NULL,
  function_title TEXT NOT NULL,
  institution   TEXT NOT NULL DEFAULT 'Ambassade / Mission permanente de Côte d''Ivoire - Vienne',
  phone_office  TEXT,
  phone_cell    TEXT,
  email         TEXT,
  photo_key     TEXT,                        -- clé objet R2 pour la photo du badge
  valid_until   TEXT,                        -- ex: "2027-12-31"
  active        INTEGER NOT NULL DEFAULT 1,  -- 1 = badge valide, 0 = désactivé
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_staff_matricule ON staff(matricule);
CREATE INDEX idx_staff_slug ON staff(slug);
