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
- Authentification admin : page `/login` (email + mot de passe) protégeant `/admin` et `/api/staff/*`
  via un cookie de session signé (voir section « Authentification admin » ci-dessous)

## Développement local

```bash
npm install
cp .dev.vars.example .dev.vars   # renseigner ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET

# Appliquer le schéma à la base D1 locale (émulée par wrangler)
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0001_init.sql
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0002_add_english_fields.sql

npm run dev
```

`next dev` utilise l'émulation locale des bindings Cloudflare (D1/R2/AI) via
`initOpenNextCloudflareForDev()` — aucune ressource Cloudflare réelle n'est nécessaire pour la
base/le stockage (Workers AI, lui, appelle toujours le service distant — voir avertissement au
build). Connectez-vous sur `/login` avec les identifiants de `.dev.vars`, créez une première fiche
via `/admin/new`, puis vérifiez `/c/[slug]`, `/verify/[matricule]` et les deux routes `/qr/.../[x].png`.

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
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET   # chaîne aléatoire longue, ex: openssl rand -hex 32
```

Ces valeurs ne sont **jamais** dans `wrangler.jsonc` ni commitées — uniquement des secrets
Cloudflare (production) et `.dev.vars` (local, gitignored).

## Authentification admin

`/admin` et toutes les routes `/api/staff/*` sont protégées par `proxy.ts` (middleware Next), qui
vérifie un cookie de session signé (HMAC SHA-256, `lib/auth.ts`). La connexion se fait sur `/login`
avec l'email + mot de passe définis via les secrets ci-dessus. Pas de service tiers, pas de compte
à créer ailleurs.

**Réinitialiser le mot de passe** (pas de réinitialisation par e-mail — un seul admin) :

```bash
npx wrangler secret put ADMIN_PASSWORD
```

**Optionnel — défense en profondeur** : on peut ajouter **Cloudflare Access** (Zero Trust) devant
`/admin*` en plus de ce login applicatif, pour un second facteur au niveau réseau. Non requis.

## À préparer côté utilisateur

- [ ] Le nom de domaine (ou sous-chemin) à router vers le Worker.
- [ ] `database_id` D1 et bucket R2 créés (étape 1 ci-dessus) reportés dans `wrangler.jsonc`.
- [ ] Secrets `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `SESSION_SECRET` définis (étape 5 ci-dessus).

`public/armoiries.png` (armoiries officielles) est déjà inclus dans le dépôt.

## Structure

- `app/c/[slug]` — carte de visite publique (recto/verso, vCard, QR).
- `app/verify/[matricule]` — page de vérification de badge (mode minimal par défaut, cf. `VERIFY_MODE`).
- `app/qr/card/[filename]` et `app/qr/verify/[filename]` — QR PNG générés à la volée.
- `app/admin` — liste, création, édition, upload photo, aperçu live, export haute qualité (PNG/JPEG/PDF), protégé par `/login`.
- `app/login` — connexion admin (email + mot de passe).
- `app/api/staff` — endpoints CRUD ; `app/api/staff/[id]/photo` — upload R2 ; `app/api/photo/[...key]` — service des photos.
- `app/api/auth` — login/logout (cookie de session signé).
- `app/api/translate` — traduction FR→EN à la volée (Cloudflare Workers AI) pour la carte de visite publique.
- `proxy.ts` — middleware protégeant `/admin/*` et `/api/staff/*`.
- `lib/` — accès D1 (`db.ts`, `staff.ts`), auth (`auth.ts`), slug (`slug.ts`), vCard (`vcard.ts`), QR (`qr.ts`), traduction (`translate.ts`).
- `components/` — `BusinessCard.tsx` (recto/verso, 85,6×54 mm), `Badge.tsx` (portrait CR80, 54×85,6 mm).
- `migrations/` — schéma D1 (table `staff`, puis colonnes `institution_en`/`function_title_en`).
