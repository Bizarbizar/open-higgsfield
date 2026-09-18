# Guide de prompting — structure idéale par modèle

Ce document sert de base à un générateur de prompts pour l'app. Il décrit la
structure d'un bon prompt Higgsfield, un gabarit générique, les variantes
réellement nécessaires par modèle, une grille « quoi demander à l'utilisateur »
et un méta-prompt pour LLM.

Conventions :
- Les prompts finaux sont **en anglais** (tous les modèles y répondent mieux ;
  les guides officiels sont en anglais). Les explications ici sont en français.
- **[OFF]** = tiré d'une documentation officielle (Higgsfield, Kling, ByteDance,
  Alibaba, Lightricks, Ideogram, Recraft, xAI). **[COM]** = convention
  communautaire ou test tiers, à considérer comme plausible, non garanti.
- Le catalogue de référence est `src/generation/catalog/` et `MODELS.md` : ce que
  l'app expose comme réglages y fait foi (ex. aucun `negative_prompt` dans
  l'app, pas de ratio sur Kling 2.5, `enhance_prompt` seulement sur Soul).

---

## 1. Structure générique

### 1.1 Ordre des blocs

Tous les guides officiels convergent vers le même squelette, du plus important
au plus accessoire. L'ordre compte : Ideogram [OFF] et Grok [COM] documentent
que le début du prompt pèse plus ; Kling [OFF] et Wan [OFF] mettent le sujet
puis le mouvement en tête.

```
1. SUJET        qui / quoi — 1 à 2 attributs concrets (âge, tenue, matière, couleur)
2. ACTION       ce qui se passe (vidéo : un seul arc d'action ; image : la pose)
3. DÉCOR        lieu, époque, premier plan / arrière-plan, météo
4. LUMIÈRE      source, direction, température, ambiance visible (haze, rim light…)
5. CAMÉRA       cadrage (wide / medium / close-up), angle, objectif, et pour la
                vidéo UN mouvement principal (push-in, tracking, static…)
6. STYLE/RENDU  photo / illustration / vectoriel, grain, palette, référence d'époque
7. SON          (vidéo avec audio) ambiance, effets liés à l'action, musique ou
                « no music », dialogue entre guillemets
8. CONTRAINTES  ce qui doit rester intact (logo, visage), texte à l'écran entre
                guillemets, interdits formulés en positif
```

Formules officielles dont ce squelette est la synthèse :
- Kling [OFF] : `Subject + Subject movement + Scene + (Camera + Lighting + Atmosphere)`
- Wan [OFF] : `Entity + Scene + Motion (+ Aesthetic control + Stylization)` ;
  image-to-video : `Motion + Camera movement` uniquement
- Seedance [OFF] : `Subject + Action + Setting + Visual style + Camera + Sound`
- LTX [OFF] : `Shot, Scene, Action, Character, Camera, Audio` en un seul paragraphe
- Ideogram [OFF] : `[Image summary]. [Subject], [Pose], [Secondary elements],
  [Setting], [Lighting], [Framing]`
- Recraft [OFF] : du global au local (concept → environnement → cadrage → détails
  → lumière → caméra → humeur), ou `Style → scene → details`

### 1.2 Longueur

- **Image** : 40–120 mots. Ideogram [OFF] : < 150 mots (~200 tokens), au-delà le
  modèle ignore la fin. Recraft [OFF] : fonctionne aussi bien en 3–6 mots
  (mode interprétatif) qu'en prompt structuré long ; choisir selon qu'on
  explore ou qu'on contrôle.
- **Vidéo** : 60–100 mots pour un plan de 5–10 s [COM, convergent sur Kling,
  Seedance, Wan]. Kling [OFF] : l'API accepte 2 500 caractères mais demande un
  mouvement « simple, adapté à 5 secondes ». Au-delà de 8 requêtes dans un
  prompt, 4–5 seulement sont honorées [COM Seedance].
- **Multi-plans** (Seedance 2.5, Kling 3.0 multi-shots, Wan 3.0) : un bloc
  d'ensemble + 2–4 plans étiquetés `Shot 1:`, `Shot 2:`, chacun en 1–3 phrases.

### 1.3 Forme

- **Phrases, pas listes de mots-clés** [OFF Kling, LTX, Ideogram, Hailuo].
  « A woman in a charcoal coat walks past rain-wet storefronts » bat
  « woman, coat, street, rain, cinematic, 8k ».
- **Présent de l'indicatif, un seul paragraphe** pour la vidéo [OFF LTX].
- **Séparer mouvement caméra et mouvement sujet** dans deux propositions
  distinctes [OFF LTX], et **un seul mouvement de caméra principal** par plan
  [OFF Wan, COM Seedance] — « push in, orbit, crane up » dans le même plan =
  jitter.
- **Émotion par l'action** : « her shoulders drop and she exhales » plutôt que
  « she looks relieved » [OFF LTX].
- **Interdits en positif** : « empty street » plutôt que « no people »
  [OFF Ideogram]. Aucun modèle de l'app n'expose de `negative_prompt` ; les
  « no … » dans le prompt sont tolérés mais peu fiables, sauf la pile audio
  de Seedance (§3.6).
- **Texte à l'écran entre guillemets doubles**, court, placé tôt [OFF Ideogram,
  Recraft].
- **Pas de boosters** (« 8k, masterpiece, ultra-detailed, stunning ») : sans
  effet documenté, ils consomment le budget d'attention [OFF Kling, COM Grok].
- **Pas de nombres précis** (« 10 puppies ») ni de physique complexe
  (« a bouncing ball ») [OFF Kling].

### 1.4 Erreurs de surface

- **Prompt vidéo sur un modèle image** (mouvements de caméra, « the sequence
  begins », ralenti) : le modèle image rend un seul instant ; décrire la frame
  finale voulue.
- **Décrire l'image de départ dans un image-to-video** : redondant et nuisible.
  Décrire ce qui bouge et la caméra [OFF Wan, COM Grok].
- **Décrire le mouvement dans un transfert de mouvement** (Genjutsu, Kling
  Motion Control) : le clip fournit le mouvement ; le prompt nomme le sujet.
- **Trois lieux en 5 secondes** : morphing garanti [COM Seedance]. Adapter la
  complexité à la durée.
- **Mélanger les langues** quand il y a du texte à l'écran : garbled [COM
  Seedance] ; écrire tout en anglais.

---

## 2. Gabarit générique

### 2.1 Texte à trous

```
[SUBJECT: who/what, 1–2 concrete attributes] [ACTION: single verb chain with a
physical consequence] in [SETTING: place, time of day, weather, fore/background].
[LIGHTING: source, direction, temperature, visible atmosphere].
[CAMERA: shot size, angle, lens; video: one primary move, optionally its end state].
[STYLE: medium, grade, palette, era reference].
[SOUND — video with audio only: ambient bed, action-tied effects, music or "no music",
dialogue in quotes].
[CONSTRAINTS: elements to keep unchanged; on-screen text in quotes; exclusions
phrased positively].
```

### 2.2 Variante JSON (pour un générateur)

```json
{
  "target_model": "kling-3-pro",
  "surface": "video",
  "subject": "a woman in her 30s, dark hair, charcoal wool coat",
  "action": "walks past rain-wet storefronts, stops, and exhales visibly in the cold air",
  "setting": "night street after rain, neon reflections on the asphalt",
  "lighting": "cold neon key from the shop windows, warm sodium fill from a streetlamp",
  "camera": "slow push-in from a 45° angle, ending in a medium close-up",
  "style": "35mm photographic look, muted teal-and-amber grade, light grain",
  "sound": "light rain, distant traffic, muffled jazz from inside a shop, no music",
  "constraints": "keep her face consistent with the reference; no on-screen text"
}
```

Règle d'assemblage : concaténer dans l'ordre `subject action setting. lighting.
camera. style. sound. constraints.`, omettre les champs vides, ne jamais
réécrire un champ en liste de mots-clés. Les champs `sound` et `camera.move` ne
sont émis que pour `surface: video` ; `constraints` porte le texte à l'écran
entre guillemets.

Rendu de l'exemple ci-dessus (≈ 70 mots) :

> A woman in her 30s, dark hair, charcoal wool coat, walks past rain-wet
> storefronts, stops, and exhales visibly in the cold air. Night street after
> rain, neon reflections on the asphalt. Cold neon key from the shop windows,
> warm sodium fill from a streetlamp. Slow push-in from a 45° angle, ending in a
> medium close-up. 35mm photographic look, muted teal-and-amber grade, light
> grain. Light rain, distant traffic, muffled jazz from inside a shop, no music.

---

## 3. Variantes par modèle

Seules les différences réelles sont listées. Un modèle absent de cette section
suit le gabarit générique tel quel.

### 3.1 Soul 2 / Soul Standard (image)

- **Écoute** : le sujet, la pose, le contexte lifestyle et le « type de photo »
  (iPhone flash, éditorial, argentique). Higgsfield positionne Soul comme
  « no prompt engineering required » [OFF] : le style est censé venir des
  presets côté app Higgsfield ; via l'API, il faut donc l'écrire soi-même en
  une proposition courte (« shot on a phone with flash », « editorial 35mm »).
- **enhance_prompt** : réécrit et enrichit votre prompt côté serveur (défaut
  `true` sur Soul Standard dans l'API [OFF], `false` dans l'app). Laisser `on`
  pour un prompt court d'intention ; `off` quand le prompt est déjà précis et
  qu'on veut de la répétabilité.
- **Longueur** : 30–80 mots. Pas de bloc son, pas de mouvement.
- **Exemple** :
  > Woman in her late 20s, freckles, oversized cream knit, sitting on a kitchen
  > counter holding a mug, morning light from a side window, soft shadows,
  > candid phone-camera look with slight flash, muted warm palette, medium shot
  > slightly above eye level.
- **Pièges** : les mots « cinematic / masterpiece » n'apportent rien ; le batch
  de 4 sert à choisir, pas à varier le prompt.

### 3.2 Marketing Studio Image (image, génération + édition)

- **Écoute** : le produit, la surface, l'éclairage studio, les éléments de
  marque. Deux régimes documentés [OFF, API reference] : **direct** (celui de
  l'app, `enhance_prompt: false`) = prompt descriptif complet ; **enhanced**
  (preset + `preset_id`, non exposé) = prompt d'humeur en 3 mots. Ici, toujours
  le régime direct.
- **Avec références** (jusqu'à 16) : la première image est traitée comme le
  produit, une seconde comme référence de modèle/personnage [OFF, régime
  enhanced ; à vérifier en direct]. Nommer explicitement ce que chaque référence
  apporte : « the bottle from the first reference », « the logo from the second
  reference, unchanged ».
- **Structure** : `produit (matière, forme) + mise en scène (surface, props) +
  lumière studio + angle + palette de marque + contraintes (logo intact, no
  extra text)`. 50–100 mots.
- **Exemple (édition à partir d'un packshot + logo)** :
  > Campaign image for a premium skincare brand: the glass serum bottle from the
  > first reference standing on a sculptural sandstone block, a shallow pool of
  > water in front reflecting it, soft directional daylight from the upper left,
  > pale sand and warm ivory palette, three-quarter view slightly below eye
  > level, 50mm look. Place the logo from the second reference small in the
  > lower right corner, exactly as provided. No additional text, no people.
- **Pièges** : images d'entrée > ~4 000 px / dizaines de Mo font échouer la
  génération silencieusement (constaté) ; un prompt « vidéo » (séquence,
  caméra qui bouge) sur ce modèle image ne produit qu'une frame.

### 3.3 Ideogram 4.0 (image, texte dans l'image)

- **Écoute** : le texte entre guillemets, sa police, son placement. Règles
  [OFF] : texte **entre guillemets doubles**, mentionné **tôt** dans le prompt,
  **court** (plus c'est long, plus il y a de fautes), fond simple autour du
  texte, alphabet latin sans accents, descripteurs de police concrets
  (« bold sans-serif », « thin rounded bauhaus style », « formal script with
  flourishes »).
- **Structure** [OFF] : `[Image summary]. [Subject], [Pose], [Secondary
  elements], [Setting], [Lighting], [Framing]`, < 150 mots.
- **Exemple** :
  > A vintage travel poster with the words "RIDE FREE" in bold condensed
  > sans-serif across the top and "Coastal Route 1" in a small script line at
  > the bottom. A woman on a bicycle on a countryside road, rolling hills,
  > late-afternoon sun, flat retro color blocks in teal, mustard and cream,
  > centered composition with generous margins.
- **Pièges** : plusieurs blocs de texte longs ; texte accentué (« Été ») ;
  scènes chargées derrière le lettrage.

### 3.4 Recraft 4.1 (image, design / vectoriel)

- **Écoute** : le système graphique plus que la scène — type de graphisme,
  logique de formes, palette stricte, discipline de trait, mise en page,
  contraintes explicites [OFF].
- **Structure** [OFF] : `Style → scene → details` pour l'illustration ;
  pour un logo/icône : `graphic type + shape logic + strict palette + line
  discipline + layout + "no gradients, no shadows"`. Décrire un **système**
  (« logo with matching icon set ») plutôt qu'un asset isolé [OFF].
- **Longueur** : 3–6 mots pour explorer, 60–120 mots pour contrôler [OFF].
- **Exemple (vectoriel)** :
  > Minimal playful logo for a coffee roaster: a single-line cup with a rising
  > steam curl forming the letter R, flat colors only, deep muted green
  > background with warm off-white marks, thick uniform strokes, rounded
  > corners, centered on a square canvas, no gradients, no shadows, no texture.
- **Pièges** : vocabulaire de texture (« grain, bokeh ») en mode vectoriel ;
  empiler des adjectifs évaluatifs en photoréalisme.

### 3.5 Grok Imagine 2.0, Qwen Image 3, Z-Image Turbo (image)

- **Grok Imagine 2.0** : sujet en tête, ordre `Subject → style/medium →
  environment → lighting → mood → technical` [COM] ; répond bien au rendu
  contemporain saturé. 40–80 mots.
- **Qwen Image 3** : tolère et exploite les prompts longs et descriptifs à
  plusieurs éléments ; donner les relations spatiales explicitement
  (« to the left of », « in the foreground »). 80–150 mots.
- **Z-Image Turbo** : modèle rapide ; 20–50 mots, un sujet, un décor, une
  lumière. Ne pas sur-spécifier.

### 3.6 Seedance 2.5 / 2.0 (vidéo multi-références, audio)

- **Formule** [OFF ByteDance] : `Subject + Action + Setting + Visual style +
  Camera + Sound`, tout après l'action étant optionnel.
- **Références** [OFF] : citer `@Image1…@Image9`, `@Video1…@Video3`,
  `@Audio1…@Audio3` **accrochés à un nom** (« the hiker from @Image1 ») et
  assigner un rôle à chaque référence (« @Video1 for camera movement only »)
  [COM, évite le « bleeding »]. Dans l'app, l'index suit l'ordre des médias
  dans le plateau (références, puis clips, puis audios) — à vérifier sur un
  premier essai.
- **Multi-plans** [OFF] : étiquettes `Shot 1:`, `Shot 2:`, `Closing:` ; **pas**
  de plages de secondes (« 0–5s: ») qui produisent des sorties anormales
  [OFF, guide dialogue]. Le mot `cut to` est compris.
- **Audio / dialogue** [OFF] : ≈ 20 mots parlés par clip de 15 s, ≈ 10 mots
  par réplique, **une phrase par guillemets**, formule de retenue labiale
  (« realistic lip articulation, no exaggerated mouth opening, no head turns
  while speaking »). Une ligne de mixage (« Dialogue clean and prominent,
  ambient murmur subtle »). Pour couper la musique, la pile complète est
  nécessaire : « No music, no library audio, no voiceover narration, no
  on-screen text, no subtitles, no logo » — un simple « no music » laisse
  passer des nappes [OFF].
- **Longueur** : 60–100 mots par plan ; la durée longue (jusqu'à 30 s) sert à
  une progression, pas à empiler des lieux.
- **Exemple (2 plans, dialogue)** :
  > Shot 1: The barista from @Image1 slides a cup across a sunlit wooden bar,
  > medium close-up, locked camera, facing camera. Warm cheerful delivery,
  > realistic lip articulation, no exaggerated mouth opening. She says "One
  > flat white, extra warm." Espresso machine hissing behind her. Shot 2: She
  > smiles and says "Mornings start slow here." Closing: she rests both hands
  > on the counter in a held medium close-up for the final two seconds.
  > Dialogue clean and prominent, ambient cafe murmur subtle. No music, no
  > library audio, no voiceover narration, no on-screen text, no subtitles.
- **Pièges** : références « nues » sans rôle ; deux mouvements de caméra ;
  visages réels en référence à pleine force (« cardboard » look) [COM].

### 3.7 Seedance 2.5 Edit / Extend (vidéo à partir d'un clip)

- **Edit** : décrire **le changement**, pas la scène. Formule :
  `Change/Replace [élément du clip] with [élément de @Image1]. Keep [tout le
  reste : framing, timing, lighting, other people] unchanged.` 20–50 mots.
- **Extend** : décrire **ce qui se passe ensuite** en continuité (même
  lumière, même caméra), un seul nouvel événement. « Continue the shot: … »
  puis le beat suivant. 30–60 mots.
- Aucun guide officiel dédié n'a été trouvé pour Edit/Extend ; ces règles sont
  déduites de la doc API (entrées : 1 clip + références + audio) [COM].

### 3.8 Kling 3.0 Standard / Pro / 4K / Turbo (vidéo)

- **Formule** [OFF Kling] : `Subject + Movement + Scene + (Camera + Lighting +
  Atmosphere)` ; sujet en phrases courtes (coiffure, tenue, posture),
  mouvement « simple et adapté à 5 s », scène concise.
- **Start + End frame** (Std/Pro/4K) : le prompt décrit la **transition**
  (ce qui change entre les deux images et comment la caméra l'accompagne),
  pas les deux images.
- **Multi-shots** (réglage `multiShots`) [COM fal.ai] : `Shot 1:` / `Shot 2:`
  avec cadrage, sujet, mouvement pour chacun ; **étiquettes de personnages
  uniques et constantes**, pas de pronoms ; dialogue au format
  `[Name, voice quality]: "line"`, mot « Immediately » pour enchaîner deux
  locuteurs.
- **Son** (réglage `sound`) : décrire l'ambiance et les effets en une
  proposition ; une phrase par réplique.
- **cfg_scale** (0–1, défaut 0,5) : plus haut = plus fidèle au prompt et plus
  rigide ; baisser (0,3) pour laisser le modèle interpréter, monter (0,7) pour
  un brief précis [COM].
- **Turbo** : mêmes règles, pas de son ni de multi-shots ; itérer court.
- **Exemple (Pro, first→last)** :
  > A chef in a white jacket lifts a copper pan off the flame, tilts it, and a
  > wave of caramel folds over. Steel kitchen, single overhead tungsten lamp,
  > steam catching the light. Camera pushes in slowly from a medium shot to a
  > close-up on the pan, ending on the final frame. Sizzle and a soft gas
  > hiss, no music.
- **Pièges** : nombres exacts, physique complexe, plusieurs mouvements de
  caméra [OFF].

### 3.9 Kling 3.0 Motion Control · Genjutsu Motion Transfer / Object Swap

- **Principe** : le **clip fournit le mouvement, le timing et la caméra**
  [OFF Higgsfield]. Le prompt ne décrit pas le mouvement ; il **identifie le
  sujet** (Motion Transfer / Motion Control) ou **la cible du remplacement**
  (Object Swap).
- **Genjutsu** [OFF] : « no prompt needed, presets can do the whole job » ;
  activer le prompt « when there is more than one subject or when the exact
  target matters ». Donc : court (10–30 mots), nominal, aligné sur les
  références (« Image 1 », « Video 1 ») [COM Rundown].
- **Gabarits** :
  - Motion Transfer : `Apply the motion of the source video to [subject from
    the reference images: 1–2 attributes]. Keep the camera and timing.`
  - Object Swap [COM] : `Replace [the object in the source video] with [the
    object in the reference image]. Keep the rest of the shot the same.`
  - Kling Motion Control : `The character in the image performs the motion of
    the video.` + éventuellement décor/lumière en une proposition ; le réglage
    `characterOrientation` (video/image) décide de qui impose l'orientation.
- **Exemple (Object Swap)** :
  > Replace the golf ball in the source video with the dinosaur egg from the
  > first reference image, same size and position. Keep the golfer, the swing,
  > the lighting and the camera exactly the same.
- **Pièges** : redécrire la chorégraphie ; clip de plus de 30 s ; références
  qui montrent plusieurs objets sans dire lequel.

### 3.10 Kling 2.5 Turbo Standard / Pro (vidéo)

- Mêmes règles de formule que Kling 3.0, sans son ni multi-shots. Durée 5 ou
  10 s : écrire une action tenable en 5 s.
- L'API accepte un `negative_prompt` [OFF], **non exposé dans l'app** :
  formuler les exclusions en positif dans le prompt.
- Standard = image de départ obligatoire → prompt `Motion + Camera` (règle Wan
  image-to-video), 30–60 mots ; Pro en texte seul → gabarit complet.

### 3.11 MiniMax H3 / Hailuo 2.3 (vidéo)

- **Écoute** : la narration temporelle et les expressions. Le guide Hailuo
  [COM Akool] recommande des **phrases longues et fluides** avec connecteurs
  temporels (« then », « as », « while »), des verbes d'action et des
  adjectifs de mouvement ; éviter les boosters de qualité.
- **Caméra** : la syntaxe entre crochets `[Push in]`, `[Pan left]`, `[Tracking
  shot]` (jusqu'à 3 combinés) est documentée pour Hailuo 02 / Director [OFF
  MiniMax via fal.ai] ; sur Hailuo 2.3 et H3, la caméra en langage naturel
  fonctionne ; les crochets restent tolérés [COM].
- **Expressions** : écrire la séquence émotionnelle en actions visibles
  (« her eyes widen, then she bites her lip and looks away »).
- **H3** : sortie 2K, ratios larges (21:9) — penser composition
  cinémascope : sujet décentré, profondeur de champ décrite.
- **Exemple** :
  > A retired boxer in a grey hoodie sits on the edge of a locker-room bench;
  > he unwraps the tape from his hands slowly, then looks up as the door
  > opens and light floods in across his face. Slow push-in from a wide shot
  > to a medium close-up, warm tungsten key from the doorway, cool fluorescent
  > fill, 21:9 composition with the door on the right third.

### 3.12 Wan 3.0 / Prime / 2.7 / 2.6 (vidéo)

- **Formule** [OFF Alibaba] : `Entity + Scene + Motion (+ Aesthetic control +
  Stylization)` ; **image-to-video : `Motion + Camera movement` seulement**,
  ne pas décrire l'image.
- **Caméra** [OFF] : un seul mouvement principal, choisi pour son effet
  (push-in = intimité/tension, pull-out = échelle, tracking = accompagner,
  orbit = importance, fixed = calme).
- **Multi-plans** [OFF, 3.0/2.7/2.6] : `Overall description. Shot 1 [0–3 s]
  …, Shot 2 [4–6 s] …` — ici les plages de temps **sont** la syntaxe
  officielle (contrairement à Seedance).
- **Son** [OFF] : voix, effets et musique en trois mentions séparées ; écrire
  « no background music » explicitement, sinon Wan en ajoute.
- **Exemple (image-to-video)** :
  > The subject turns her head slowly to the left and smiles, strands of hair
  > lifting in a light breeze; steam rises from the cup in her hands. Camera
  > pushes in gently, fixed height. Soft ambient room tone, no background
  > music.

### 3.13 LTX 2.5 Fast / Pro (vidéo)

- **Formule** [OFF Lightricks] : six éléments **en un seul paragraphe au
  présent** — shot, scene, action, character, camera, audio ; réplique parlée
  entre guillemets ; le niveau de détail suit le cadrage (gros plan = matières
  nommées).
- **À éviter** [OFF] : texte à l'écran, mouvement chaotique, deux arcs
  d'action concurrents, sources lumineuses mixtes.
- **Fast** : même prompt, itérer ; **Pro** pour la version présentable.
- **Exemple** [OFF, Lightricks] :
  > A cinematic aerial shot at dawn over a wide misty valley, a cluster of
  > colorful hot-air balloons rising slowly through the golden morning haze.
  > The camera cranes gently upward and drifts back to reveal dozens of
  > balloons floating above a patchwork of fields and a winding river far
  > below, the low sun flaring through the mist. Warm golden light, a rich
  > cinematic grade. The audio is the occasional deep whoosh of a balloon
  > burner, a gentle high-altitude breeze, and distant birdsong, no music.

### 3.14 PixVerse 6, Happy Horse (vidéo)

- Gabarit générique ; PixVerse répond bien aux **styles nommés** (anime,
  cel-shaded, claymation) et aux formats verticaux : dire le style en tête,
  garder 40–80 mots, un mouvement de caméra. Pas de guide officiel exploité
  [COM].

### 3.15 Grok Imagine Video 1.5 (reference-to-video)

- **Principe** [OFF xAI] : les références « incorporent des personnes,
  objets, vêtements sans verrouiller la première image » ; le prompt décrit
  donc **la scène, l'action et la caméra** (contrairement à l'image-to-video),
  et dit **ce qui doit rester cohérent** avec les références.
- **Son obligatoire** [COM] : sans bloc « Sound: », audio aléatoire ou muet.
  Écrire des indices de matière et d'espace.
- **Action clé tôt** dans le prompt (rendu séquentiel) [COM].
- **Exemple** :
  > The woman from the reference images, same face, hair and green hooded
  > cloak, walks through a misty medieval market at dawn while traders set up
  > wooden stalls behind her; she glances at the camera, then ahead. Camera
  > tracks alongside at shoulder height. Sound: low market murmur, footsteps
  > on wet stone, a single bird call, no music.

### 3.16 Kling O1 / O3 (first-last frame)

- Le prompt décrit **la transition** entre les deux images et le mouvement de
  caméra qui la porte ; 30–60 mots ; ne pas redécrire les deux frames.
  > The paper crane on the desk unfolds itself flat, then the sheet lifts and
  > drifts out of the open window. Camera holds still, slight rack focus to
  > the window at the end.

---

## 4. Grille de génération (quoi demander à l'utilisateur)

| Modèle | Obligatoire | Optionnel | À proscrire |
| --- | --- | --- | --- |
| Soul 2 / Standard | sujet, pose/action, décor, lumière | type de photo, palette, cadrage | mouvement caméra, son, boosters |
| Marketing Studio Image | produit (matière/forme), mise en scène, lumière, contraintes logo/texte | rôle de chaque référence, angle, palette de marque | séquence vidéo, images > 4 000 px |
| Ideogram 4.0 | texte entre guillemets (tôt, court), sujet, style de police | placement, palette, cadrage | accents, texte long, fond chargé, négations |
| Recraft 4.1 | type de graphisme, palette, style de trait | système (icônes assortis), mise en page, interdits (« no gradients ») | vocabulaire de texture en vectoriel |
| Grok Imagine 2.0 | sujet, style, décor | lumière, mood | boosters |
| Qwen Image 3 | sujet, décor, relations spatiales | détails multiples | — |
| Z-Image Turbo | sujet, décor, lumière (court) | — | sur-spécification |
| Seedance 2.5 / 2.0 | sujet, action, décor, un mouvement caméra, son (ou pile « no music ») | `@Image/@Video/@Audio` avec rôle, `Shot n:`, dialogue court | plages de secondes, 2 mouvements caméra, > 100 mots/plan |
| Seedance 2.5 Edit | le changement + « keep the rest unchanged » | référence de l'élément | décrire toute la scène |
| Seedance 2.5 Extend | le beat suivant en continuité | son | changement de lieu/lumière |
| Kling 3.0 Std/Pro/4K | sujet, mouvement simple, scène | caméra, lumière, son, `Shot n:` + étiquettes personnages, cfg | nombres exacts, physique complexe, pronoms |
| Kling 3.0 Turbo | sujet, mouvement, scène | caméra, lumière | son, multi-shots |
| Kling 2.5 Turbo Std | mouvement + caméra (image fournie) | ambiance | description de l'image, ratio/résolution |
| Kling 2.5 Turbo Pro | gabarit complet (texte) ou mouvement + caméra (image) | ambiance | négations (pas de negative_prompt dans l'app) |
| Kling Motion Control | identification du personnage | décor/lumière en une proposition | description du mouvement |
| Genjutsu Motion Transfer | sujet (1–2 attributs) | « keep camera and timing » | chorégraphie |
| Genjutsu Object Swap | `Replace X with Y. Keep the rest the same.` | taille/position de l'objet | plusieurs cibles à la fois |
| MiniMax H3 | narration temporelle, expressions, composition large | caméra (naturelle ou crochets) | boosters |
| Hailuo 2.3 | narration temporelle, expressions | caméra | boosters |
| Wan 3.0 / Prime / 2.7 / 2.6 | entité, scène, mouvement ; i2v : mouvement + caméra seulement | esthétique, style, `Shot n [a–b s]`, « no background music » | plusieurs mouvements caméra |
| LTX 2.5 | shot, scene, action, character, camera, audio en un paragraphe | réplique entre guillemets | texte à l'écran, chaos, deux arcs |
| PixVerse 6 / Happy Horse | style nommé, sujet, action, décor | caméra | > 80 mots |
| Grok Imagine Video 1.5 | scène, action, caméra, « Sound: », ce qui reste cohérent avec les références | durée/ratio en fin | redécrire les références, action clé en fin |
| Kling O1 / O3 | la transition entre les deux frames | caméra | redécrire les frames |

---

## 5. Méta-prompt pour LLM (générateur)

À donner tel quel à un LLM, avec le brief de l'utilisateur et l'id du modèle
cible ; il peut aussi recevoir la ligne correspondante de la grille §4.

```
You are a prompt writer for the Higgsfield API. Given a creative brief and a
target model id, write ONE final prompt in English that the model will follow.

Rules:
1. Structure the prompt in this order, as flowing sentences (never keyword
   lists): SUBJECT (1–2 concrete attributes) → ACTION (video: one action arc;
   image: the pose/instant) → SETTING → LIGHTING → CAMERA (shot size, angle;
   video: exactly one primary camera move, in its own clause) → STYLE →
   SOUND (video with audio only) → CONSTRAINTS.
2. Length: image 40–120 words (Ideogram < 150); video 60–100 words per shot.
   Multi-shot prompts use "Shot 1:", "Shot 2:", "Closing:" labels — use
   time ranges only for Wan models, never for Seedance.
3. Write in the present tense. Show emotion through physical action. Phrase
   exclusions positively ("empty street", not "no people"); there is no
   negative_prompt field. Never add quality boosters ("8k", "masterpiece",
   "cinematic" alone). Avoid exact counts and complex physics.
4. Surface rules: for an IMAGE model, describe a single instant — no camera
   moves, no sequences, no sound. For an IMAGE-TO-VIDEO input (start frame
   provided), describe only what moves and the camera — do not restate the
   image. For MOTION TRANSFER / OBJECT SWAP models (genjutsu-*, kling-3-
   motion-*), do not describe motion: identify the subject or the element to
   replace and state what must stay unchanged. For EDIT/EXTEND models,
   describe only the change or the next beat.
5. Text to render on screen goes in double quotes, early, short, Latin
   letters only. References are cited as "the X from the first reference"
   (or @Image1/@Video1/@Audio1 for Seedance), each with an explicit role.
6. Audio: for Seedance/Kling 3/LTX/Wan/Grok Video, always state ambience,
   action-tied effects, and either the music or "no music" (Seedance: use the
   full suppressor stack "No music, no library audio, no voiceover narration,
   no on-screen text, no subtitles"). Dialogue: one sentence per quote, ≤10
   words, with a speaker label.
7. Apply the model-specific notes you are given. If the brief asks for
   something the target model cannot do (e.g. a video sequence on an image
   model, on-screen text on LTX), keep the closest achievable intent and add
   one line after the prompt starting with "NOTE:" explaining the change.

Output format: the prompt only, then an optional single "NOTE:" line. No
headings, no explanations.
```

---

## Sources

Officielles :
- Higgsfield — Cinema Studio prompt guide : https://higgsfield.ai/blog/cinema-studio-3.0
- Higgsfield — Soul (help center) : https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images
- Higgsfield — SOUL fashion shots : https://higgsfield.ai/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots
- Higgsfield — Genjutsu : https://higgsfield.ai/blog/higgsfield-genjutsu
- Higgsfield — Ecommerce ads 2026 : https://higgsfield.ai/blog/ai-ecommerce-ads-2026
- Higgsfield — API reference Marketing Studio Image : https://open.higgsfield.ai/models/marketing-studio/image/api-reference
- Kling — Text-to-video prompt guide : https://kling.ai/quickstart/text-to-video-prompt-guide
- Alibaba Cloud — Wan prompt guide : https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
- Lightricks — LTX-2.5 prompting (relayé par Runware, citant le guide officiel) : https://runware.ai/docs/models/lightricks-ltx-2-5-pro/guides/prompting
- Ideogram — Text & typography : https://docs.ideogram.ai/using-ideogram/getting-started/prompting-guide/2-prompting-fundamentals/text-and-typography
- Ideogram — In a nutshell : https://docs.ideogram.ai/using-ideogram/getting-started/prompting-guide/in-a-nutshell
- Recraft — Prompting with Recraft V4 : https://www.recraft.ai/docs/prompt-engineering-guide/prompting-with-recraft-v4
- MiniMax Hailuo 02 camera brackets (doc modèle sur fal.ai) : https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/image-to-video/api

Communautaires / tests tiers :
- fal.ai — Kling 3.0 prompting guide : https://blog.fal.ai/kling-3-0-prompting-guide/
- Seedance 2.0 failure modes (heyuan110) : https://www.heyuan110.com/posts/ai/2026-07-11-seedance-2-prompt-guide/
- Ambience AI — Seedance dialogue guide (cite le guide officiel ByteDance) : https://www.ambienceai.com/tutorials/seedance-prompting-guide
- Akool — Hailuo 2.3 prompt guide : https://akool.com/blog-posts/minimax-hailuo-video-prompt-guide
- thoxakihiko — Grok Imagine 1.5 guide (croisé avec docs.x.ai) : https://github.com/thoxakihiko/grok-imagine-prompt-1.5-guide
- The Rundown — Genjutsu Object Swap walkthrough : https://app.therundown.ai/guides/swap-the-product-and-keep-the-performance-with-higgsfield

Non consultables au moment de la rédaction : guide officiel ByteDance Seedance
2.0 (docs.byteplus.com, rendu client), ltx.io/blog (erreur serveur) — leurs
règles sont reprises via les relais cités ci-dessus.
