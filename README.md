# Cartes de visite & Badges QR — AMBACI Vienne

Application Next.js (App Router, TypeScript) pour gérer les cartes de visite numériques et les
badges d'identité du personnel de l'Ambassade / Mission permanente de Côte d'Ivoire à Vienne
(~100 fiches), déployée sur **Cloudflare Workers** via l'adaptateur OpenNext.

Voir [`BUILD_SPEC.md`](./BUILD_SPEC.md) pour la spécification complète.

## Stack

- Next.js 16 (App Router) + TypeScript, Tailwind CSS 4
- Cloudflare D1 (base de données), Cloudflare R2 (photos des badges), Cloudflare Workers AI (traduction FR→EN)
- `@opennextjs/cloudflare` pour déployer sur Workers
- `qrcode` pour générer les QR codes côté serveur
- Authentification admin : page `/login` (email + mot de passe, comptes stockés dans D1) protégeant
  `/admin` et `/api/staff/*` via un cookie de session signé, avec authentification à deux facteurs
  (TOTP) optionnelle et réinitialisation de mot de passe par e-mail (Resend) — voir section
  « Authentification admin » ci-dessous

## Développement local

```bash
npm install
cp .dev.vars.example .dev.vars   # renseigner SESSION_SECRET / RESEND_API_KEY

# Appliquer le schéma à la base D1 locale (émulée par wrangler)
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0001_init.sql
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0002_add_english_fields.sql
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0003_admin_users.sql

npm run dev
```

`next dev` utilise l'émulation locale des bindings Cloudflare (D1/R2/AI) via
`initOpenNextCloudflareForDev()` — aucune ressource Cloudflare réelle n'est nécessaire pour la
base/le stockage (Workers AI, lui, appelle toujours le service distant — voir avertissement au
build). Créez un premier compte admin dans la base locale (voir « Authentification admin »
ci-dessous), connectez-vous sur `/login`, créez une première fiche via `/admin/new`, puis vérifiez
`/c/[slug]`, `/verify/[matricule]` et les deux routes `/qr/.../[x].png`.

Après toute modification de `wrangler.jsonc`, régénérez les types :

```bash
npm run cf-typegen
```

## Déploiement (à exécuter par vous, avec votre compte Cloudflare)

### 1. Créer les ressources Cloudflare

```bash
npx wrangler d1 create ambaci-cartes
npx wrangler r2 bucket create ambaci-photos
```

Copiez le `database_id` renvoyé dans `wrangler.jsonc` (remplace `REPLACE_WITH_D1_DATABASE_ID`).

### 2. Appliquer le schéma à la base distante

```bash
npx wrangler d1 execute ambaci-cartes --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute ambaci-cartes --remote --file=./migrations/0002_add_english_fields.sql
npx wrangler d1 execute ambaci-cartes --remote --file=./migrations/0003_admin_users.sql
```

### 3. Build + déploiement

```bash
npm run deploy
```

(équivaut à `opennextjs-cloudflare build && wrangler deploy`)

### 4. Domaine

Router le domaine choisi (ex. `cartes.ambaci-vienne.at`) vers le Worker via **Custom Domain**
dans le tableau de bord Cloudflare.

### 5. Secrets d'authentification admin

```bash
npx wrangler secret put SESSION_SECRET   # chaîne aléatoire longue, ex: openssl rand -hex 32
npx wrangler secret put RESEND_API_KEY   # clé API Resend, pour l'e-mail de réinitialisation de mot de passe
```

Ces valeurs ne sont **jamais** dans `wrangler.jsonc` ni commitées — uniquement des secrets
Cloudflare (production) et `.dev.vars` (local, gitignored).

## Authentification admin

`/admin` et toutes les routes `/api/staff/*` sont protégées par `middleware.ts`, qui vérifie un
cookie de session signé (HMAC SHA-256, `lib/auth.ts`). Les comptes admin sont stockés dans la table
D1 `admin_users` (`migrations/0003_admin_users.sql`) — email, mot de passe haché (PBKDF2-SHA256,
`lib/passwordHash.ts`), et un secret TOTP optionnel. La session expire après **30 minutes
d'inactivité** (elle se renouvelle automatiquement à chaque requête authentifiée).

**Créer le premier compte admin** (aucune UI d'inscription — se fait via `wrangler d1 execute`) :

```bash
node -e "
const crypto = require('crypto');
const password = 'mot-de-passe-a-choisir';
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 210000, 32, 'sha256');
console.log('pbkdf2\$210000\$' + salt.toString('hex') + '\$' + hash.toString('hex'));
"
# puis, avec le hash affiché :
npx wrangler d1 execute ambaci-cartes --remote --command "INSERT INTO admin_users (email, password_hash) VALUES ('admin@example.com', 'pbkdf2\$210000\$...')"
```

(`--local` pour la base de développement.)

**Authentification à deux facteurs (TOTP)** : chaque admin peut l'activer lui-même sur
`/admin/security` — un QR code est généré pour une application d'authentification (Google
Authenticator, Authy…), et un code de confirmation active la 2FA. Elle peut être désactivée depuis
la même page (confirmation par mot de passe requise).

**Mot de passe oublié** : `/forgot-password` envoie un lien de réinitialisation à durée limitée (30
minutes) par e-mail via **Resend** — nécessite `RESEND_API_KEY` (voir étape 5 ci-dessus). Tant que
la clé n'est pas configurée, la demande est acceptée silencieusement mais l'e-mail n'est pas envoyé
(l'erreur est journalisée côté serveur, pas exposée au client). L'expéditeur par défaut est
`onboarding@resend.dev` (`lib/email.ts`) ; pour un domaine vérifié, adaptez l'adresse `from`.

**Optionnel — défense en profondeur** : on peut ajouter **Cloudflare Access** (Zero Trust) devant
`/admin*` en plus de ce login applicatif. Non requis.

## À préparer côté utilisateur

- [ ] Le nom de domaine (ou sous-chemin) à router vers le Worker.
- [ ] `database_id` D1 et bucket R2 créés (étape 1 ci-dessus) reportés dans `wrangler.jsonc`.
- [ ] Secrets `SESSION_SECRET` / `RESEND_API_KEY` définis (étape 5 ci-dessus).
- [ ] Au moins un compte admin inséré dans `admin_users` (voir « Authentification admin »).

`public/armoiries.png` (armoiries officielles) est déjà inclus dans le dépôt.

## Structure

- `app/c/[slug]` — carte de visite publique (recto/verso, vCard, QR).
- `app/verify/[matricule]` — page de vérification de badge (mode minimal par défaut, cf. `VERIFY_MODE`).
- `app/qr/card/[filename]` et `app/qr/verify/[filename]` — QR PNG générés à la volée.
- `app/admin` — liste, création, édition, upload photo, aperçu live, export haute qualité (PNG/JPEG/PDF), protégé par `/login`.
- `app/admin/security` — activation/désactivation de la 2FA (TOTP) pour le compte connecté.
- `app/login` — connexion admin (email + mot de passe, puis code 2FA si activée).
- `app/forgot-password` / `app/reset-password` — demande et application d'une réinitialisation de mot de passe par e-mail.
- `app/api/staff` — endpoints CRUD ; `app/api/staff/[id]/photo` — upload R2 ; `app/api/photo/[...key]` — service des photos.
- `app/api/auth` — login/logout/verify-2fa, `forgot-password`/`reset-password`, `totp/setup`|`confirm`|`disable`.
- `app/api/translate` — traduction FR→EN à la volée (Cloudflare Workers AI) pour la carte de visite publique.
- `middleware.ts` — protège `/admin/*` et `/api/staff/*` (runtime Edge, requis par OpenNext).
- `lib/` — accès D1 (`db.ts`, `staff.ts`, `adminUsers.ts`), auth (`auth.ts` — jetons signés, `authSession.ts` — admin courant, `passwordHash.ts` — PBKDF2, `totp.ts` — RFC 6238), slug (`slug.ts`), vCard (`vcard.ts`), QR (`qr.ts`), e-mail (`email.ts` — Resend), traduction (`translate.ts`).
- `components/` — `BusinessCard.tsx` (recto/verso, 85,6×54 mm), `Badge.tsx` (portrait CR80, 54×85,6 mm).
- `migrations/` — schéma D1 (table `staff`, colonnes `institution_en`/`function_title_en`, puis `admin_users`).
