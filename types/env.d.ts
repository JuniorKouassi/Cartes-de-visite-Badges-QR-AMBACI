interface CloudflareEnv {
  // JSON array of { email, password }, e.g. [{"email":"a@x.com","password":"..."}]
  ADMIN_USERS: string;
  SESSION_SECRET: string;
}
