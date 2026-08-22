-- Un role Chrono supplementaire, memes attributions que conseiller.
-- SQLite ne sait pas modifier une contrainte CHECK : on reconstruit la table,
-- comme dans 0007_chrono.sql, 0008_chrono_rpa_neutre.sql et 0011_chrono_payeur_saf.sql.

CREATE TABLE admin_chrono_roles_nouveau (
  admin_id INTEGER PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL CHECK (role IN ('chef', 'secretariat', 'conseiller', 'rpa', 'payeur', 'saf', 'ministre_conseiller', 'admin', 'neutre')),
  fonction TEXT,
  MAJ_le   TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO admin_chrono_roles_nouveau (admin_id, role, fonction, MAJ_le)
  SELECT admin_id, role, fonction, MAJ_le FROM admin_chrono_roles;

DROP TABLE admin_chrono_roles;
ALTER TABLE admin_chrono_roles_nouveau RENAME TO admin_chrono_roles;
