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
| `ANTHROPIC_API_KEY` | Clé API Anthropic (console.anthropic.com) | Seulement pour l'onglet « From a brief » et « Polish with AI » de l'assistant de prompt. L'onglet « Build » (formulaire) fonctionne sans. Chaque appel coûte quelques centimes (Claude Opus 5). |

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

1. **Modèles absents** — *Marketing Studio Image* est maintenant ajouté
   (`POST /marketing-studio/image`, résolution `1k|2k|4k`, ratio
   `auto|1:1|3:2|2:3|4:3|3:4|16:9|9:16|21:9`, `quality low|medium|high`,
   jusqu'à 16 `image_urls` en référence pour l'édition), en **mode direct
   uniquement** : `enhance_prompt` reste à `false`. Le mode enhanced exige un
   `preset_id` tiré d'un catalogue paginé (`GET /marketing-studio/image/presets`),
   géré dans leur CMS — pas représentable en enum statique, à faire plus tard si
   besoin. Référence : console.higgsfield.ai → modèle → onglet *API*.
2. **Réglages faux** — `videoModel()` dans `defaults.ts` donne à tous les modèles
   vidéo génériques `720p/1080p`, ratio `16:9|9:16|1:1`, durée 4–10 s. Ce n'est
   pas ce que chaque modèle accepte.
   - **MiniMax H3** corrigé : `2K` uniquement, ratio
     `auto|adaptive|21:9|16:9|4:3|1:1|3:4|9:16`, durée 5–15 s.
   - **Kling 2.5 Turbo** (Standard + Pro) corrigé : `duration 5|10`, `cfg_scale 0–1`,
     pas de ratio ni de résolution.
   - **Non audités** : Hailuo 2.3, Wan 2.6/2.7/3, LTX, PixVerse, Grok, Happy
     Horse… Même méthode : comparer avec la page playground du modèle sur
     console.higgsfield.ai (les modèles ne sont pas tous dans docs.higgsfield.ai
     ni dans `/docs/openapi.json`).

`parseSettings` a maintenant un mode `lenient` utilisé côté client : quand une
valeur mémorisée en localStorage n'est plus valide après une correction de
catalogue, elle retombe sur le défaut au lieu de casser le composer. Le serveur
reste strict.

## Modèles ajoutés le 19/09/2026 (source : console.higgsfield.ai)

Soul Standard, Genjutsu Motion Transfer, Genjutsu Object Swap
(`higgsfiled/genjutsu/...` — la faute est dans le chemin officiel), Kling 2.5
Turbo Pro. Genjutsu prend 1 vidéo source obligatoire + jusqu'à 8 images, et
facture à la seconde de vidéo d'entrée.

Hors périmètre : la section « Workflows & agents » de la console (Product shots,
Graphic ads, Marketplace design, Cinema Studio 4.0) — pipelines multi-étapes,
pas des modèles à requête unique.

## Modèles probablement retirés de l'API

Au 19/09/2026, **Soul Cinema, DoP et Flux 3** n'ont plus de page dans la console
ni de résultat de recherche. Ils sont conservés dans le catalogue faute d'un test
qui confirme l'échec ; à retirer (comme Veo 3.1 / Nano Banana avant eux) si une
génération renvoie 404. **Flux 2** est aussi absent de la console mais fonctionne
(références comprises) : la console n'est donc pas exhaustive.

## Modèles image : qui lit vraiment les références (audit du 19/09/2026)

Le helper `imageModel()` donnait 8 références à tous les modèles image et
`mapByPaths` les envoyait en `image_urls` — que l'endpoint les accepte ou non.
L'API répond 200 et ignore le champ : le modèle génère sans voir les images.
Corrigé d'après les schémas de la console :

| Modèle | Images d'entrée | Notes |
| --- | --- | --- |
| Marketing Studio Image | `image_urls` ×16 | |
| Flux 2 | oui | constaté |
| Grok Imagine 2.0 | `image_urls` | résolution 1k/2k, `quality low|medium` |
| Ideogram 4.0 | **une** `image_url` + `image_weight` | pas de `resolution` ; `rendering_speed` |
| Qwen Image 3 Edit (nouveau) | `image_urls` ×1–3 **obligatoires** | `alibaba/qwen-image-3/edit` |
| Qwen Image 3, Recraft 4.1, Z-Image Turbo, Soul | **aucune** | tray masqué ; Recraft 1k seul ; Z-Image prompt ≤ 800 car. |

## Assistant de prompt (composer → icône étincelle)

Deux onglets. **Build** : un formulaire par bloc (sujet, action, décor,
lumière, caméra, style, son, contraintes) dont les champs obligatoires /
masqués dépendent du modèle sélectionné (`src/prompting/profiles.ts`, dérivé de
`PROMPTS.md` §3–4) ; le prompt est assemblé en direct (`assemble.ts`) puis
inséré dans le composer. **From a brief** : un brief libre (toute langue) →
Claude rédige le prompt anglais final avec le méta-prompt de `PROMPTS.md` §5
plus la fiche du modèle (`src/prompting/actions.ts`, nécessite
`ANTHROPIC_API_KEY`). « Polish with AI » envoie les champs du formulaire au
même circuit. Pour ajuster les règles d'un modèle : éditer son profil dans
`profiles.ts`, et garder `PROMPTS.md` cohérent.

## Guide des modèles

`MODELS.md` décrit, pour chaque modèle du catalogue, sa singularité et son usage
prioritaire, avec un tableau « Choisir vite » par besoin. `PROMPTS.md` donne la
structure de prompt idéale (générique + variantes par modèle), un gabarit JSON,
une grille « quoi demander à l'utilisateur » et un méta-prompt pour LLM — base
d'un futur générateur de prompts. Les deux sont servis dans l'app sous
`/docs/models` et `/docs/prompts`. À mettre à jour à chaque ajout ou retrait de
modèle.

## Fichiers générés par `next dev`

`AGENTS.md`, `CLAUDE.md` et le contenu de `next-env.d.ts` sont réécrits par
Next 16 à chaque `next dev`. Ils sont commités pour garder l'arbre propre.
