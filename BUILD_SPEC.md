# Build spec — Cartes de visite & Badges QR (Ambassade de Côte d'Ivoire, Vienne)

> À donner à **Claude Code**. Objectif : générer une application Next.js déployable sur **Cloudflare Workers**, qui permet à **un seul administrateur** de créer/mettre à jour des cartes de visite numériques et des badges d'identité pour ~100 membres du personnel, chacun accessible via un **QR code**.

---

## 1. Prompt de démarrage (à coller dans Claude Code)

```
Construis une application Next.js (App Router, TypeScript) déployable sur Cloudflare Workers
via l'adaptateur OpenNext (@opennextjs/cloudflare), selon la spec du fichier BUILD_SPEC.md
présent à la racine.

L'app gère des cartes de visite numériques et des badges d'identité pour le personnel d'une
ambassade. Un seul admin y accède (protégé par Cloudflare Access). Chaque personne a deux QR
codes distincts : un vers sa carte de visite publique, un vers sa page de vérification de badge.

Commence par : (1) le schéma D1, (2) la config Cloudflare (wrangler + open-next), (3) les
routes publiques /c/[slug] et /verify/[matricule], (4) le dashboard admin. Respecte les specs
de design de la section 6. Ne mets aucun secret en dur. Explique chaque étape et fournis les
commandes de déploiement à la fin.
```

---

## 2. Décisions déjà prises

- **Hébergement** : Cloudflare, application possédée de bout en bout (pas de no-code).
- **Accès admin** : une seule personne. Pas de système de comptes multi-utilisateurs.
- **Échelle** : ~100 fiches personnel.
- **Deux sections**, chacune avec son propre QR :
  1. **Cartes de visite** → QR public partageable.
  2. **Badges / cartes d'identité** → QR de vérification, réservé au contrôle.
- **Institution** : `Ambassade / Mission permanente de Côte d'Ivoire - Vienne`.
- **Devise** : `RÉPUBLIQUE DE CÔTE D'IVOIRE — Union – Discipline – Travail`.

---

## 3. Stack technique (Cloudflare)

| Besoin | Service Cloudflare |
|---|---|
| Framework app | Next.js (App Router, TS) via `@opennextjs/cloudflare` → **Workers** |
| Base de données | **Cloudflare D1** (SQLite) |
| Stockage photos | **Cloudflare R2** |
| Optimisation images | **Cloudflare Images** (optionnel mais recommandé) |
| Authentification admin | **Cloudflare Access** (Zero Trust) devant `/admin` — aucune logique d'auth à coder |
| Génération QR | Librairie côté serveur (`qrcode`) rendue en SVG/PNG dans les routes |

**Contraintes runtime importantes** (adaptateur OpenNext) :
- Utiliser le **runtime Node.js** (pas Edge).
- Activer le flag `nodejs_compat` avec `compatibility_date` ≥ `2024-09-23`.
- L'ancien chemin `Pages + next-on-pages` est déprécié : viser **Workers + OpenNext**.

---

## 4. Modèle de données (D1)

```sql
-- migrations/0001_init.sql
CREATE TABLE staff (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT UNIQUE NOT NULL,        -- ex: "junior-kouassi" (URL carte de visite)
  matricule     TEXT UNIQUE NOT NULL,        -- ex: "AMB-VIE-0042" (URL vérification badge)
  full_name     TEXT NOT NULL,
  function_title TEXT NOT NULL,
  institution   TEXT NOT NULL DEFAULT 'Ambassade / Mission permanente de Côte d''Ivoire - Vienne',
  phone_office  TEXT,
  phone_cell    TEXT,
  email         TEXT,
  photo_key     TEXT,                        -- clé objet R2 pour la photo du badge
  valid_until   TEXT,                        -- ex: "2027-12-31"
  active        INTEGER NOT NULL DEFAULT 1,  -- 1 = badge valide, 0 = désactivé
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_staff_matricule ON staff(matricule);
CREATE INDEX idx_staff_slug ON staff(slug);
```

Génération du `slug` : minuscules, tirets, sans accents, unicité garantie (suffixe `-2` si collision).

---

## 5. Routes

### Publiques (aucune auth)
- `GET /c/[slug]` — **carte de visite en ligne**. Rend le recto (nom, fonction, contacts cliquables tel:/mailto:) + bouton **« Enregistrer le contact »** qui sert un fichier `.vcf` (vCard 3.0). C'est la cible du QR de la carte de visite.
- `GET /c/[slug]/vcard` — renvoie le `.vcf` (Content-Type `text/vcard`, `Content-Disposition: attachment`).
- `GET /verify/[matricule]` — **page de vérification du badge**. Voir section 8 pour le niveau de détail (à décider).
- `GET /qr/card/[slug].png` et `GET /qr/verify/[matricule].png` — images QR générées à la volée (PNG haute résolution, marge, correction niveau M), pour impression.

### Admin (derrière Cloudflare Access)
- `GET /admin` — liste des 100 fiches : recherche, statut actif/inactif, liens vers édition.
- `GET /admin/new` — formulaire de création.
- `GET /admin/[id]/edit` — édition, upload photo, désactivation, aperçu live des deux cartes, téléchargement des deux QR.
- `POST /api/staff` / `PUT /api/staff/[id]` / `POST /api/staff/[id]/photo` — endpoints CRUD + upload R2.

---

## 6. Specs de design des cartes

> Un prototype HTML de référence (`cartes-badges-qr.html`) accompagne cette spec : reprends fidèlement ses mises en page et couleurs. Résumé ci-dessous.

**Assets** : placer les armoiries officielles dans `/public/armoiries.png` (fond blanc), et servir les photos depuis R2.

### 6.1 Carte de visite (recto — format paysage 85,6 × 54 mm)
- Fond **blanc**, texte **noir**.
- Ratio CSS : `aspect-ratio: 85.6/54`, coins arrondis, ombre portée.
- En-tête : armoiries en haut à gauche (~14 % de largeur), titre institution **centré sur une seule ligne**, avec en dessous, **centré** :
  `RÉPUBLIQUE DE CÔTE D'IVOIRE` puis `Union – Discipline – Travail` (plus petit, gris).
- Centre : **NOM COMPLET** en gras majuscules, fonction en dessous.
- Bas : ligne de séparation noire, puis `Tél.: … – Cel : …` et `E-mail : …` (liens `tel:` / `mailto:`).

### 6.2 Carte de visite (verso)
- Même format, fond blanc.
- **QR code en grand, centré** (~58 % de la hauteur), armoiries réduites au-dessus, nom, et mention « Scannez pour ma carte de visite ».
- Le QR pointe vers `/c/[slug]`.
- Dans l'app web d'aperçu : effet flip 3D au clic (recto ↔ verso).

### 6.3 Badge / carte d'identité (format portrait, type CR80 vertical)
- Fond blanc, `aspect-ratio: 54/85.6`.
- En-tête vert dégradé avec armoiries + `Ambassade / Mission permanente de Côte d'Ivoire - Vienne` **sur une seule ligne**.
- Bande tricolore (orange / blanc / vert) sous l'en-tête.
- Corps centré : **photo** (cadre vert), **NOM**, fonction.
- Métadonnées : `Matricule`, `Institution`, `Valide jusqu'au`.
- Pied : petit QR (vers `/verify/[matricule]`) + mention « Scanner pour vérifier l'authenticité ».

---

## 7. Logique QR (deux cibles distinctes)

```
Carte de visite  → https://DOMAINE/c/{slug}         (public, vCard, partageable)
Badge d'identité → https://DOMAINE/verify/{matricule}  (contrôle, non partageable)
```

Générer les PNG côté serveur (route `/qr/...`) pour que l'admin télécharge un fichier propre et imprimable. Ne jamais mettre de données personnelles dans les query strings.

---

## 8. Page de vérification badge — DÉCISION À TRANCHER

Choisir un des deux modes (paramétrable via une variable d'env `VERIFY_MODE`) :

- **Mode complet** : photo + matricule + fonction + validité + statut.
- **Mode minimal** : bandeau vert « Membre du personnel authentique — valide jusqu'au {date} » (ou rouge si `active = 0` / date dépassée), sans photo ni détails.

Par défaut : **mode minimal** (plus prudent pour une page publiquement scannable). L'admin voit toujours le détail complet dans `/admin`.

---

## 9. Fichiers de configuration attendus

- `wrangler.jsonc` — bindings D1 (`DB`), R2 (`PHOTOS`), variables ; `compatibility_flags: ["nodejs_compat"]`, `compatibility_date` ≥ `2024-09-23`.
- `open-next.config.ts` — config de l'adaptateur Cloudflare.
- `next.config.ts` — intégration OpenNext (`initOpenNextCloudflareForDev`).
- `.dev.vars` — variables locales (jamais commit).
- `migrations/0001_init.sql` — schéma D1.
- `package.json` — scripts `dev`, `build`, `deploy` (via `opennextjs-cloudflare build && wrangler deploy`).

---

## 10. Déploiement (à exécuter par l'utilisateur)

```bash
# 1. Créer les ressources Cloudflare
npx wrangler d1 create ambaci-cartes
npx wrangler r2 bucket create ambaci-photos

# 2. Appliquer le schéma
npx wrangler d1 execute ambaci-cartes --file=./migrations/0001_init.sql --remote

# 3. Build + déploiement
npm run deploy

# 4. Domaine : router le domaine choisi vers le Worker (Custom Domain dans le dashboard)

# 5. Sécuriser l'admin : créer une application Cloudflare Access (Zero Trust)
#    protégeant le chemin /admin*, avec la seule adresse e-mail autorisée.
```

**À préparer côté utilisateur** :
- Le nom de domaine (ex. `cartes.ambaci-vienne.at`) ou un sous-chemin.
- L'adresse e-mail unique autorisée pour Cloudflare Access.
- Le fichier `armoiries.png` officiel.

---

## 11. Coûts indicatifs
- Workers + D1 + R2 : niveaux gratuits suffisants pour ~100 fiches et un trafic modéré.
- Coût principal : le nom de domaine (~15 €/an).
- Cloudflare Images : facturation à l'usage si activé.

---

## 12. Ordre de construction recommandé
1. Schéma D1 + config Cloudflare (wrangler, open-next, next.config).
2. Route `/c/[slug]` + génération vCard + QR carte.
3. Route `/verify/[matricule]` (mode minimal par défaut).
4. Dashboard admin (liste, création, édition, upload photo R2, téléchargement des 2 QR).
5. Aperçu live des deux cartes dans l'admin (reprendre le design du prototype).
6. Protection `/admin` via Cloudflare Access + déploiement.
