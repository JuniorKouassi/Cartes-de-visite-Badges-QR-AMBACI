CREATE TABLE admin_users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,       -- format: pbkdf2$<iterations>$<saltHex>$<hashHex>
  totp_secret     TEXT,                -- base32, set once 2FA is enrolled
  totp_enabled    INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
