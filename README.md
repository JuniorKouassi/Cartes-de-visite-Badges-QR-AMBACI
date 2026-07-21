# Cartes de visite & Badges QR — AMBACI Vienne

Application Next.js (App Router, TypeScript) pour gérer les cartes de visite numériques et les
badges d'identité du personnel de l'Ambassade / Mission permanente de Côte d'Ivoire à Vienne
(~100 fiches), déployée sur **Cloudflare Workers** via l'adaptateur OpenNext.

Voir [`BUILD_SPEC.md`](./BUILD_SPEC.md) pour la spécification complète.

## Stack

- Next.js 16 (App Router) + TypeScript, Tailwind CSS 4
- Cloudflare D1 (base de données), Cloudflare R2 (photos des badges)
- `@opennextjs/cloudflare` pour déployer sur Workers
- `qrcode` pour générer les QR codes côté serveur
- Authentification admin déléguée à **Cloudflare Access** (aucune logique d'auth dans l'app)

## Développement local

```bash
npm install
cp .dev.vars.example .dev.vars   # ajuster VERIFY_MODE si besoin

# Appliquer le schéma à la base D1 locale (émulée par wrangler)
npx wrangler d1 execute ambaci-cartes --local --file=./migrations/0001_init.sql

npm run dev
```

`next dev` utilise l'émulation locale des bindings Cloudflare (D1/R2) via
`initOpenNextCloudflareForDev()` — aucune ressource Cloudflare réelle n'est nécessaire pour
développer. Créez une première fiche via `/admin/new`, puis vérifiez `/c/[slug]`,
`/verify/[matricule]` et les deux routes `/qr/.../[x].png`.

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
```

### 3. Build + déploiement

```bash
npm run deploy
```

(équivaut à `opennextjs-cloudflare build && wrangler deploy`)

### 4. Domaine

Router le domaine choisi (ex. `cartes.ambaci-vienne.at`) vers le Worker via **Custom Domain**
dans le tableau de bord Cloudflare.

### 5. Sécuriser `/admin`

Créer une application **Cloudflare Access** (Zero Trust) protégeant le chemin `/admin*`, avec la
seule adresse e-mail de l'administrateur autorisée. Aucune logique d'auth applicative n'est
nécessaire — Access s'exécute en amont du Worker.

## À préparer côté utilisateur

- [ ] Le nom de domaine (ou sous-chemin) à router vers le Worker.
- [ ] L'adresse e-mail unique autorisée pour Cloudflare Access.
- [ ] `database_id` D1 et bucket R2 créés (étape 1 ci-dessus) reportés dans `wrangler.jsonc`.

`public/armoiries.png` (armoiries officielles) est déjà inclus dans le dépôt.

## Structure

- `app/c/[slug]` — carte de visite publique (recto/verso, vCard, QR).
- `app/verify/[matricule]` — page de vérification de badge (mode minimal par défaut, cf. `VERIFY_MODE`).
- `app/qr/card/[filename]` et `app/qr/verify/[filename]` — QR PNG générés à la volée.
- `app/admin` — liste, création, édition, upload photo, aperçu live, téléchargement des QR (à protéger par Cloudflare Access).
- `app/api/staff` — endpoints CRUD ; `app/api/staff/[id]/photo` — upload R2 ; `app/api/photo/[...key]` — service des photos.
- `lib/` — accès D1 (`db.ts`, `staff.ts`), slug (`slug.ts`), vCard (`vcard.ts`), QR (`qr.ts`).
- `components/` — `BusinessCard.tsx` (recto/verso, 85,6×54 mm), `Badge.tsx` (portrait CR80, 54×85,6 mm).
- `migrations/0001_init.sql` — schéma D1 (table `staff`).
