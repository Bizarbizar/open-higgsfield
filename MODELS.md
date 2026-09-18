# Guide des modèles — singularité et usage prioritaire

Quel modèle pour quel besoin. Pour chaque entrée du catalogue : ce qui la
distingue (entrées acceptées, réglages, positionnement) et à quoi elle sert le
mieux. Les entrées/réglages sont ceux réellement exposés par l'API Higgsfield
(voir `src/generation/catalog/`) ; le positionnement est indicatif — testez sur
votre matière avant d'industrialiser.

Vocabulaire des entrées : **start** = image de départ (first frame),
**end** = image de fin, **références** = images de style/personnage/produit,
**clip** = vidéo source, **audio** = piste audio de référence.

---

## Image

### Soul 2 — `soul-2`
- **Singularité** : modèle maison Higgsfield, spécialisé dans le réalisme
  photographique de personnes et de scènes lifestyle ; rendu 720p/1080p, lot de
  1 ou 4, option *enhance prompt*. Le moins cher du catalogue image (≈ 0,003 $).
- **Usage prioritaire** : portraits et visuels « photo de smartphone / éditorial »
  crédibles, itération rapide sur des ambiances, moodboards.

### Soul Standard — `soul-standard`
- **Singularité** : génération Soul précédente, mêmes réglages que Soul 2 mais
  ≈ 30× plus chère (0,09–0,19 $/image). Conservée pour la continuité de style
  avec des séries déjà produites.
- **Usage prioritaire** : reproduire l'esthétique exacte d'anciennes campagnes
  Soul ; sinon préférer Soul 2.

### Marketing Studio Image — `marketing-studio-image`
- **Singularité** : le seul modèle image qui **édite** à partir de références
  (jusqu'à 16 images) en plus de générer ; sortie 1k/2k/4k, 9 ratios dont
  `auto`, réglage *quality*. Pensé pour les visuels publicitaires (produit +
  logo + décor). Le mode « presets » de la console n'est pas exposé ici.
- **Usage prioritaire** : déclinaisons de campagne à partir d'un packshot ou d'un
  logo, mise en scène produit, key visuals marketing. Gardez les images
  d'entrée sous ~4 000 px / quelques Mo.

### Grok Imagine 2.0 — `grok-imagine-2`
- **Singularité** : modèle image de xAI, texte → image uniquement, résolution
  1k/2k/4k ; orienté rendu contemporain, saturé, très « réseaux sociaux ».
- **Usage prioritaire** : visuels punchy pour le social, concepts rapides,
  illustrations pop.

### Ideogram 4.0 — `ideogram-4`
- **Singularité** : référence du **texte dans l'image** (lettrage, titres,
  affiches) avec une typographie lisible et bien intégrée.
- **Usage prioritaire** : affiches, couvertures, mockups avec slogan ou nom de
  marque écrit dans l'image, logos exploratoires.

### Recraft 4.1 — `recraft-4.1`
- **Singularité** : orienté **design graphique** — illustration vectorielle,
  icônes, flat design, styles cohérents et propres.
- **Usage prioritaire** : illustrations d'interface, pictogrammes, identités
  visuelles, visuels à contours nets destinés à être retravaillés.

### Qwen Image 3 — `qwen-image-3`
- **Singularité** : modèle image d'Alibaba, bon suivi de prompts longs et
  descriptifs, compositions complexes à plusieurs éléments.
- **Usage prioritaire** : scènes détaillées dictées par un brief précis,
  infographies illustrées, quand le prompt est long.

### Z-Image Turbo — `z-image-turbo`
- **Singularité** : le plus **rapide** du catalogue image, qualité correcte,
  peu de réglages.
- **Usage prioritaire** : brouillons, exploration de dizaines de variantes,
  placeholders — avant de refaire la finale avec un modèle plus fin.

### Flux 2 — `flux-2` ⚠️
- **Singularité** : Black Forest Labs, réputé pour la fidélité au prompt et le
  photoréalisme équilibré. **N'apparaît plus dans la console Higgsfield** au
  19/09/2026 — peut échouer.
- **Usage prioritaire** : photoréalisme généraliste — si toujours servi.

---

## Vidéo — génération depuis prompt / image

### Seedance 2.5 — `seedance-2.5`
- **Singularité** : le plus polyvalent du catalogue : start + end frame,
  jusqu'à 30 références, 10 clips et 10 pistes audio en entrée, 4 à **30 s**,
  audio généré, sortie MP4/MOV. Le modèle « couteau suisse » de ByteDance.
- **Usage prioritaire** : plans longs et dirigés (cohérence personnage/produit
  via références), séquences avec son, base des montages complexes.

### Seedance 2.5 Edit — `seedance-2.5-edit`
- **Singularité** : **modifie une vidéo existante** (1 clip obligatoire) guidé
  par prompt + références + audio ; pas de durée à régler, elle suit la source.
- **Usage prioritaire** : changer décor, tenue, ambiance ou objet dans un plan
  déjà tourné, sans le regénérer.

### Seedance 2.5 Extend — `seedance-2.5-extend`
- **Singularité** : **prolonge** un clip (jusqu'à 30 s supplémentaires) en
  gardant continuité de mouvement et de lumière.
- **Usage prioritaire** : rallonger un plan trop court, enchaîner une action
  après la fin d'une génération.

### Seedance 2.0 / Fast / Mini — `seedance-2`, `seedance-2-fast`, `seedance-2-mini`
- **Singularité** : génération précédente, mêmes entrées multi-références (9
  images, 3 clips, 3 audios), 4–15 s. La version standard monte jusqu'en **4K**
  ; Fast et Mini plafonnent à 720p et coûtent moins cher.
- **Usage prioritaire** : 2.0 standard pour une sortie 4K native ; Fast/Mini
  pour les previz et animatiques à petit budget.

### Kling 3.0 Turbo — `kling-3-turbo`
- **Singularité** : la déclinaison **rapide** de Kling 3 (texte ou image de
  départ), 720p/1080p, 3–15 s, sans réglages avancés.
- **Usage prioritaire** : itérer vite sur un mouvement ou un cadrage avant de
  passer en Standard/Pro.

### Kling 3.0 Standard / Pro / 4K — `kling-3-std`, `kling-3-pro`, `kling-3-4k`
- **Singularité** : start **et** end frame, son généré, **CFG** réglable,
  mode *multi-shots* (plusieurs plans dans une génération), 3–15 s. Pro affine
  le rendu, 4K sort en 4K natif. Réputé pour la physique des mouvements et
  la tenue des personnages.
- **Usage prioritaire** : plans narratifs avec transition contrôlée entre deux
  images clés, actions humaines crédibles, livrables haute définition (4K).

### Kling 3.0 Motion Control / Pro — `kling-3-motion-std`, `kling-3-motion-pro`
- **Singularité** : **transfert de mouvement** — une image de personnage + un
  clip de référence ; le personnage rejoue la chorégraphie du clip. Options :
  garder le son d'origine, orienter le personnage selon la vidéo ou l'image.
- **Usage prioritaire** : faire danser/bouger un personnage fixe, cohérence de
  geste sur une mascotte ou un avatar, reprises de performances.

### Kling 2.6 — `kling-2.6`
- **Singularité** : génération Kling intermédiaire (Pro), texte ou image de
  départ ; moins chère que Kling 3, sans end frame.
- **Usage prioritaire** : image-to-video de qualité quand Kling 3 n'est pas
  justifié.

### Kling 2.5 Turbo Standard / Pro — `kling-2.5`, `kling-2.5-pro`
- **Singularité** : réglages minimalistes — durée **5 ou 10 s**, CFG, pas de
  ratio ni de résolution (fixés par le modèle). Standard = image de départ
  obligatoire ; Pro accepte aussi le texte seul et pousse la fidélité.
- **Usage prioritaire** : animer un visuel existant simplement et pas cher
  (Standard) ; Pro quand le prompt seul doit suffire.

### Kling O1 (Omni) — `kling-o1`
- **Singularité** : modèle « omni » first-last-frame : on donne le début et la
  fin, il interpole.
- **Usage prioritaire** : transitions et morphings contrôlés entre deux
  images, boucles.

### Kling O3 — `kling-o3`
- **Singularité** : successeur d'O1 en first-last-frame, meilleure tenue des
  détails sur la durée.
- **Usage prioritaire** : même usage qu'O1 avec plus d'exigence de qualité.

### MiniMax H3 — `minimax-h3`
- **Singularité** : sort uniquement en **2K**, 5–15 s, ratios étendus dont
  `21:9` et `adaptive`. Orienté rendu cinématographique et large.
- **Usage prioritaire** : plans « cinéma » en format large, images d'ambiance
  haute définition.

### MiniMax Hailuo 2.3 — `minimax-hailuo-2.3`
- **Singularité** : génération Hailuo standard, texte ou image de départ ;
  reconnu pour l'expressivité des visages et des gestes.
- **Usage prioritaire** : plans centrés sur des personnages qui jouent,
  réactions, dialogues muets.

### Wan 3.0 Prime — `wan-3-prime`
- **Singularité** : le haut de gamme Wan (Alibaba), texte ou image de départ ;
  meilleure cohérence temporelle que Wan 3.0.
- **Usage prioritaire** : plans finaux Wan quand la qualité prime sur le coût.

### Wan 3.0 — `wan-3`
- **Singularité** : Wan de génération courante, bon rapport qualité/prix,
  texte ou image de départ.
- **Usage prioritaire** : production courante, B-roll, plans d'illustration.

### Wan 2.7 / Wan 2.6 — `wan-2.7`, `wan-2.6`
- **Singularité** : générations précédentes, moins chères ; 2.7 améliore le
  mouvement par rapport à 2.6.
- **Usage prioritaire** : volumes importants à petit budget, tests.

### LTX 2.5 Fast / Pro — `ltx-2.5-fast`, `ltx-2.5-pro`
- **Singularité** : Lightricks, connu pour la **vitesse** de génération ; Fast
  privilégie le délai, Pro la qualité.
- **Usage prioritaire** : previz, animatiques, itération en séance avec le
  client (Fast) ; Pro pour une version présentable sans changer de modèle.

### PixVerse 6 — `pixverse-6`
- **Singularité** : orienté contenus courts et stylisés (anime, effets,
  formats verticaux), texte ou image de départ.
- **Usage prioritaire** : clips social/vertical, styles illustratifs animés.

### Happy Horse 1.0 / 1.1 — `happy-horse-1`, `happy-horse-1.1`
- **Singularité** : modèles vidéo Alibaba, texte ou image de départ ; 1.1
  est la révision la plus récente.
- **Usage prioritaire** : alternative générique à Wan pour comparer les rendus
  sur un même brief.

### Grok Imagine Video 1.5 — `grok-imagine-video-1.5`
- **Singularité** : **reference-to-video** pur — jusqu'à 8 images et 3 clips
  de référence, pas de start frame ; construit la vidéo à partir d'un univers
  de références.
- **Usage prioritaire** : cohérence de personnage/produit sur plusieurs plans
  sans image de départ imposée, déclinaisons d'un même univers.

### Flux 3 — `flux-3` ⚠️
- **Singularité** : modèle vidéo Black Forest Labs. **N'apparaît plus dans la
  console Higgsfield** au 19/09/2026 — peut échouer.

### DoP — `dop` ⚠️
- **Singularité** : modèle maison Higgsfield image-to-video orienté
  « mouvements de caméra » (Director of Photography). **N'apparaît plus dans la
  console** au 19/09/2026 — peut échouer.

---

## Vidéo — transformation d'un clip existant

### Genjutsu Motion Transfer — `genjutsu-motion-transfer`
- **Singularité** : modèle maison Higgsfield : 1 clip source obligatoire +
  jusqu'à 8 images (personnages, produits, vêtements) ; extrait le
  **mouvement** du clip et l'applique aux sujets fournis. 480p/720p, facturé
  **à la seconde de vidéo d'entrée** (0,32–0,68 $/s).
- **Usage prioritaire** : rejouer une performance filmée avec un autre
  personnage ou une mascotte, décliner une chorégraphie.

### Genjutsu Object Swap — `genjutsu-object-swap`
- **Singularité** : mêmes entrées que Motion Transfer, mais **remplace un objet
  ou un élément** du clip (produit, vêtement, accessoire) par ceux des images
  fournies, en conservant le reste du plan.
- **Usage prioritaire** : placement produit a posteriori, changer un vêtement ou
  un packaging dans une vidéo déjà tournée.

### Seedance 2.5 Edit / Extend
Voir la section précédente : Edit modifie un clip, Extend le prolonge.

### Kling 3.0 Motion Control
Voir la section précédente : transfert de mouvement image + clip.

---

## Choisir vite

| Besoin | Premier choix | Alternative |
| --- | --- | --- |
| Portrait / photo réaliste pas chère | Soul 2 | Flux 2 (si servi) |
| Visuel pub avec produit + logo | Marketing Studio Image | Ideogram 4.0 |
| Texte lisible dans l'image | Ideogram 4.0 | Recraft 4.1 |
| Illustration vectorielle / icônes | Recraft 4.1 | Grok Imagine 2.0 |
| Explorer 50 variantes en 2 min | Z-Image Turbo | LTX 2.5 Fast (vidéo) |
| Plan vidéo long, dirigé, avec son | Seedance 2.5 | Kling 3.0 Pro |
| Transition entre deux images clés | Kling 3.0 Std/Pro | Kling O3 |
| Livrable vidéo 4K | Kling 3.0 4K | Seedance 2.0 |
| Animer un visuel existant à bas coût | Kling 2.5 Turbo Standard | Wan 2.7 |
| Faire rejouer un mouvement filmé | Genjutsu Motion Transfer | Kling 3.0 Motion Control |
| Remplacer un produit dans un clip | Genjutsu Object Swap | Seedance 2.5 Edit |
| Prolonger un clip | Seedance 2.5 Extend | — |
| Cohérence personnage sans start frame | Grok Imagine Video 1.5 | Seedance 2.5 (références) |
| Format cinéma large 2K | MiniMax H3 | Kling 3.0 Pro |
