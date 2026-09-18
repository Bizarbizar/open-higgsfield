# Installation locale — notes de reprise

Journal de mise en route sur macOS (18 septembre 2026), pour repartir sur une
autre machine sans refaire l'analyse. Le README décrit l'app ; ce fichier décrit
ce qu'il faut faire *autour* pour qu'elle tourne.

## Prérequis

- **Node ≥ 20.9** (Next 16 l'exige). Testé avec Node 20.20.
- **pnpm 10** via corepack. pnpm 12 a changé de layout binaire et corepack 0.34
  ne sait pas le lancer (`Cannot find module .../pnpm/12.x/bin/pnpm.cjs`) :

  ```bash
  rm -rf ~/.cache/node/corepack          # seulement si l'erreur ci-dessus apparaît
  corepack enable
  corepack prepare pnpm@10 --activate
  ```

- Le lockfile est en v9 → compatible pnpm 10.

## Installation

```bash
git clone <ce repo> && cd HIGGSFIELD
CI=true pnpm install       # CI=true évite l'invite TTY si node_modules existe déjà
cp .env.example .env       # puis remplir, voir ci-dessous
pnpm dev                   # http://localhost:3000
```

## Variables d'environnement (`.env`, non commité)

| Variable | Valeur | Obligatoire |
| --- | --- | --- |
| `HF_API_BASE_URL` | `https://platform.higgsfield.ai` (fonctionne ; la doc récente indique `https://api.higgsfield.ai`, même API) | Oui |
| `OPEN_HIGGSFIELD_READ_WRITE_TOKEN` | Token **Vercel Blob** read-write (Vercel → Storage → Blob → créer un store) | Seulement pour uploader des médias d'entrée (start/end frame, références). Text-to-image et text-to-video tournent sans. |

Higgsfield doit pouvoir **télécharger** les médias d'entrée, donc ils doivent
être sur une URL publique — Vercel Blob s'en charge ; un serveur local ne suffit pas.

## Clé API (saisie dans l'UI, pas dans `.env`)

- Compte **Higgsfield API** (console.higgsfield.ai), facturation séparée de
  l'abonnement higgsfield.ai. Créer une clé dans *API Keys* : on obtient un
  **Key ID** et un **Key Secret** (affiché une seule fois).
- Dans l'app : bouton **Add key** → coller `KEY_ID:KEY_SECRET` (les deux, séparés
  par `:`). Le message `API key must be id:secret` signifie qu'il manque une des
  deux moitiés.
- La clé est stockée dans un cookie httpOnly (30 jours), donc **par navigateur** :
  à ressaisir sur chaque machine.
- Vérifier une clé hors app :
  `curl -H "Authorization: Key ID:SECRET" https://platform.higgsfield.ai/requests/x/status`
  → `Invalid credentials` = clé fausse, autre réponse = clé OK.

## Diagnostic

Le serveur dev logge chaque appel plateforme (`[platform] request` / `response`)
avec l'URL, le body envoyé et la réponse brute. C'est là qu'il faut regarder en
premier : un `400 … is not one of [...]` est presque toujours un écart entre le
catalogue local et ce que l'API accepte réellement (voir ci-dessous).

## Catalogue : ce qui a été corrigé et ce qui reste à vérifier

Le catalogue (`src/generation/catalog/`) est écrit à la main, il n'est pas
synchronisé avec l'API. Deux conséquences :

1. **Modèles absents** — ex. *Marketing Studio Image* existe côté API
   (`POST /marketing-studio/image`, résolution `1k|2k|4k`, ratio
   `auto|1:1|3:2|2:3|4:3|3:4|16:9|9:16|21:9`, `quality low|medium|high`, mode
   presets via `GET /marketing-studio/image/presets`) mais pas ici. À ajouter :
   un fichier catalogue + un mapping dans `to-platform.ts`.
2. **Réglages faux** — `videoModel()` dans `defaults.ts` donne à tous les modèles
   vidéo génériques `720p/1080p`, ratio `16:9|9:16|1:1`, durée 4–10 s. Ce n'est
   pas ce que chaque modèle accepte.
   - **MiniMax H3** corrigé : `2K` uniquement, ratio
     `auto|adaptive|21:9|16:9|4:3|1:1|3:4|9:16`, durée 5–15 s.
   - **Non audités** : Hailuo 2.3, Wan 2.6/2.7/3, LTX, PixVerse, Grok, Happy
     Horse… Même méthode : comparer avec la page playground du modèle sur
     console.higgsfield.ai (les modèles ne sont pas tous dans docs.higgsfield.ai
     ni dans `/docs/openapi.json`).

`parseSettings` a maintenant un mode `lenient` utilisé côté client : quand une
valeur mémorisée en localStorage n'est plus valide après une correction de
catalogue, elle retombe sur le défaut au lieu de casser le composer. Le serveur
reste strict.

## Fichiers générés par `next dev`

`AGENTS.md`, `CLAUDE.md` et le contenu de `next-env.d.ts` sont réécrits par
Next 16 à chaque `next dev`. Ils sont commités pour garder l'arbre propre.
