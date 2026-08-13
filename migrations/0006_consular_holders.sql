CREATE TABLE consular_holders (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number                 TEXT UNIQUE NOT NULL,   -- ex: "AUT-2026-08-003A"
  last_name                   TEXT NOT NULL,          -- Nom
  first_names                 TEXT NOT NULL,          -- Prénoms
  date_of_birth               TEXT,
  place_of_birth              TEXT,
  sex                         TEXT,                    -- "Masculin" | "Féminin"
  country_of_residence        TEXT,
  profession                  TEXT,
  phone                       TEXT,
  address                     TEXT,
  card_valid_from             TEXT,
  card_valid_until            TEXT,
  passport_number              TEXT,
  passport_issued_at          TEXT,
  passport_expires_at         TEXT,
  passport_issuing_authority  TEXT,
  photo_key                   TEXT,                    -- clé objet R2 pour la photo
  active                      INTEGER NOT NULL DEFAULT 1,
  created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_consular_holders_card_number ON consular_holders(card_number);
