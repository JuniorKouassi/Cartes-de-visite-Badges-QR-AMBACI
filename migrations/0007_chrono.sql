-- Chrono devient le quatrieme service du tableau de bord.
--
-- Deux ajouts. D'abord 'chrono' dans les departements : SQLite ne sait pas
-- modifier une contrainte CHECK, il faut reconstruire la table.
-- Ensuite le role tenu DANS Chrono, qui est une dimension distincte de
-- l'habilitation : voir le service ne dit pas ce qu'on y fait.

PRAGMA foreign_keys = OFF;

CREATE TABLE admin_departments_nouveau (
  admin_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  department  TEXT NOT NULL CHECK (department IN ('protocole', 'consulaire', 'paierie', 'chrono')),
  PRIMARY KEY (admin_id, department)
);

INSERT INTO admin_departments_nouveau (admin_id, department)
  SELECT admin_id, department FROM admin_departments;

DROP TABLE admin_departments;
ALTER TABLE admin_departments_nouveau RENAME TO admin_departments;

PRAGMA foreign_keys = ON;

-- Le role dans Chrono. Un seul par personne : on n'est pas a la fois chef de
-- mission et conseiller sur le meme courrier.
--   chef        signe le courrier depart, impute le courrier arrivee
--   secretariat redige, enregistre, imprime, tient les registres
--   conseiller  ne voit que les dossiers qui lui sont imputes
--   admin       tout, y compris les parametres du poste
CREATE TABLE IF NOT EXISTS admin_chrono_roles (
  admin_id INTEGER PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL CHECK (role IN ('chef', 'secretariat', 'conseiller', 'admin')),
  fonction TEXT,           -- intitule imprime sous la signature, ex. "Le Charge d'Affaires a.i."
  MAJ_le   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Les administrateurs fondateurs prennent le role d'administrateur Chrono.
INSERT OR IGNORE INTO admin_chrono_roles (admin_id, role)
  SELECT id, 'admin' FROM admin_users;

-- Et l'habilitation qui va avec.
INSERT OR IGNORE INTO admin_departments (admin_id, department)
  SELECT id, 'chrono' FROM admin_users;
