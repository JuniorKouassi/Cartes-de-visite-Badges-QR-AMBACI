CREATE TABLE admin_departments (
  admin_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  department  TEXT NOT NULL CHECK (department IN ('protocole', 'consulaire', 'paierie')),
  PRIMARY KEY (admin_id, department)
);

-- Existing admins are the founding admins — grant them every department.
INSERT INTO admin_departments (admin_id, department)
SELECT id, 'protocole' FROM admin_users
UNION ALL
SELECT id, 'consulaire' FROM admin_users
UNION ALL
SELECT id, 'paierie' FROM admin_users;
