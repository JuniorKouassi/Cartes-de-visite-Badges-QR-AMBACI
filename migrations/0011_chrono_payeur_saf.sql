-- Deux roles Chrono supplementaires, memes attributions que conseiller.
-- SQLite ne sait pas modifier une contrainte CHECK : on reconstruit la table,
-- comme dans 0007_chrono.sql et 0008_chrono_rpa_neutre.sql.

CREATE TABLE admin_chrono_roles_nouveau (
  admin_id INTEGER PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL CHECK (role IN ('chef', 'secretariat', 'conseiller', 'rpa', 'payeur', 'saf', 'admin', 'neutre')),
  fonction TEXT,
  MAJ_le   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO admin_chrono_roles_nouveau (admin_id, role, fonction, MAJ_le)
  SELECT admin_id, role, fonction, MAJ_le FROM admin_chrono_roles;

DROP TABLE admin_chrono_roles;
ALTER TABLE admin_chrono_roles_nouveau RENAME TO admin_chrono_roles;
