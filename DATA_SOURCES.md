# Data and calculation provenance

## Recipe data

The two user-supplied recipe archives are the authoritative catalog inputs:

- `Recipe_Atlas_250_Dishes_Complete(1).zip`, SHA256 `1087cac44629249c454cb57adf99fb245930840aee45cf25f664fcf39fd3a237`
- `Dessert_Snack_Fruit_200_Complete(1).zip`, SHA256 `67f24db836a9b02c2f7d03e7b3ee6f82813a469cb7bf9a6334870fa1923112d7`

Their JSON nutrition records were merged, preserving all raw quantities, edible masses, liquid-density conversions, counts, servings, per-ingredient values, totals and per-serving values. Sixteen exact duplicate version records were merged; each retains both original source IDs. The `source_recipe_map` maps all 900 original version records to the 884 canonical recipes. There are also 40 complete-plate versions (20 traditional/healthy pairs).

Ingredient records are deduplicated by their USDA NDB identifiers. The same ingredient uses the same per-100-g coefficient throughout. USDA Standard Reference Release 28, revised May 2016, is the source identified by the supplied archives. The new application preserves those data; it does not claim a new clinical validation or a latest-USDA re-extraction. Published source descriptions and NDB IDs are available in ingredient details and the bundled source data.

https://fdc.nal.usda.gov/download-datasets/

Two ingredients have unverified nutrient values: dry freekeh and lamb caul membrane/fat. They remain N/A. This affects `M-D104-T`, `M-D104-H`, `M-D109-T`, `M-D109-H`. An incomplete macro remains N/A in totals, scaling, planned entries and actual entries. Null is never converted to zero. Known ingredient values remain visible independently.

Fifteen recipe versions are flagged because source kcal differ from protein ×4 + carbs ×4 + fat ×9 by more than 10%, using source kcal as the comparison denominator. Ingredient and fruit flags are also shown. Source energy is not replaced with calculated energy: published energy can use food-specific factors and carbohydrate/fiber conventions. Rounding is for display only (whole kcal, one-decimal macro grams); internal calculations retain source precision.

All original Arabic preparation notes were retained. English summaries were added for the 684 recipe versions with source preparation notes; 200 variants have no supplied instructions and say so explicitly. These are formulated recipe specifications, not claimed kitchen-tested instructions. Descriptors Healthy/Traditional are inherited catalog tags. They are not personalized health assessments. All quantities are before recipe cooking, with dry grains/legumes and manufactured staples as supplied; fruits use edible portions. Count equivalents are inherited edible-weight estimates.

Fruit references are 80 distinct source records including cultivars and dried forms, not 80 species. Verified date records cover Medjool and Deglet Noor. No unsupported cultivar, maturity-stage or branded nutrition values were added.

User-added foods are explicitly marked as user-entered. Their source/basis note and reference amount are required. Custom foods may be raw, as supplied or ready to eat, as stated by the user; their weights are never relabeled as raw. Personal recipes can combine verified ingredients with such foods; they remain user recipes. Source records are not changed when a personal food or recipe is created.

## Target engine

Formula reference: user-supplied `Nutrition_Macro_Profiles.xlsx`. Approved coefficients and goal speeds were provided explicitly by the user in this conversation. Personal body data, historical workbook rows and account identifiers are excluded from the public app bundle.

- Mifflin–St Jeor: `10 × current kg + 6.25 × height cm − 5 × age years + (male 5 / female −161)`.
- Work factors: Office Accountant 1.20; Office + Walking 1.30; Standing Job 1.40; Active Job 1.50; Manual/Very Active 1.60.
- Step add-on: <3000 =0; <5000 =.03; <8000 =.07; <12000 =.12; ≥12000 =.17.
- Training add-on: days/week × .02. Total activity capped at 1.95. Theoretical TDEE = BMR × activity.
- Goal deficits: Slow 15%; Moderate 20%; Aggressive 25%; Very Aggressive 32%; Maintenance 0%.
- LBM = weight × (1 − body fat % /100). Protein = LBM × coefficient, rounded to whole grams. Gym protein adds 5 g; Low Fat High Protein adds 10 g, matching the source workbook increment.

| Macro profile | IR Yes protein g/kg LBM | IR No protein g/kg LBM | Rest fat % kcal | Gym fat % kcal |
|---|---:|---:|---:|---:|
| High Protein Controlled Carb | 3.0 | 2.7 | 33 | 30 |
| Balanced Cut | 2.5 | 2.4 | 30 | 28 |
| Higher Carb Gym Performance | 2.5 | 2.3 | 25 | 23 |
| Lower Carb Rest Day Focus | 2.7 | 2.5 | 32 | 30 |
| Low Fat High Protein | 3.0 | 2.7 | 28 | 20 |
| High Protein Low Carb | 3.0 | 2.7 | 35 | 32 |

Explicit protein/fat overrides take priority over profile values; blank fields use the profile. Fat override inputs are entered in percentage points (33 means 33%). Manual Custom is removed from the profile list. Inactive Protein Mode and superseded legacy fat inputs are not exposed.

Source calorie floor retained: `ROUND(LBM ×30) −100`; optional floor override. Source fat floor retained: male 60 g, female 45 g. These values are user-model settings, not universal medical minimums. The app reproduces the approved model, rather than certifying its suitability for every person. Inputs are restricted to adults. User IR selection is a model switch, not a diagnosis or treatment recommendation.

Base = max(floor, selected TDEE × (1 − deficit)). Rest = max(floor, base + rest offset); Gym = max(floor, base + gym offset + carb boost grams ×4). Final kcal round to nearest 10, then are kept at/above the floor (ceiling floor if needed); this last safeguard prevents downward rounding below the source minimum. Fat = max(round(kcal × fat % /9), sex-specific fat floor). Carbs = round((kcal − protein ×4 − fat ×9)/4). Impossible negative-carb targets are shown for review and cannot be applied to a day. Zero-carb targets are allowed. Macro rounding can leave ≤2 kcal difference from calorie targets.

### Corrected real-TDEE behavior

The source weekly rows store positive weight loss but the original formula subtracts it. The app consistently defines loss = previous average − current average, then **adds** loss × kcal/kg /7 to actual average intake. A 0.5 kg loss with 2000 kcal/day and coefficient 7700 produces 2550 kcal/day, not 1450.

Weekly interval dates must be exactly seven days apart, with positive average weights and recorded average daily intake for that interval. Overlapping intervals are rejected. The original quality rule is retained: 1800 < real TDEE <4500 and average intake >1200. Failed rows stay visible but do not affect target selection. These thresholds can exclude some adults' true maintenance needs; they are workbook quality gates, not population-wide physiological limits. Theoretical/manual modes remain available.

The smoothing input now controls the last N valid intervals sorted by end date; it does not average every historical week. All-time mean is displayed separately for reference. Hybrid switches after the configured minimum valid-week count; Real uses available smoothed real values and falls back to theoretical if none; Manual uses the override or falls back to theoretical with a visible note. No weekly record is silently inferred from incomplete daily logs. Current weight must still be updated explicitly in Inputs.

## State, privacy and snapshots

Local storage key: `amgNutrition.v1`. It does not access AMG Core storage. Shared catalogs and logo are bundled in HTML; profile data is stored separately in the user's browser. A new profile starts without personal body measurements. Day targets, planned/actual macros and composite ingredients are snapshots. Editing source foods or inputs does not rewrite history. Planned entries count toward actual intake only after a separate actual action. Rest/Gym selection or explicit refresh updates the selected day's target snapshot. Other days remain unchanged.

Personal backups contain all profiles, inputs, days, weekly records, favorites and custom foods. The JSON schema and numeric values are validated before an explicit replace confirmation. Backups are not synced or uploaded by this app. The app no longer exposes library database exports. Personal backups contain private profile state and should not be shared. The app has no telemetry, advertisements, remote fonts, external scripts or required runtime API requests.

## Week Planner, version 1.1

The planner accepts exactly seven calendar days, inclusive of start and end. Gym day selections are saved per profile and used to set the training-days activity input at generation time. Each day saves its type, Targets Engine macro snapshot, four planned food portions and their raw shopping-ingredient snapshot. Existing actual entries are preserved verbatim. Regenerating an existing plan asks before replacing its planned entries.

Four slots: breakfast, lunch, dinner and snack. Candidates honor the selected cuisine and Healthy/Traditional/Both filter. Incomplete or energy-flagged recipes are excluded from automatic selection. Optional custom foods are eligible only when their entered macros pass the same 10% energy check. Bounded coordinate-descent fits 450 candidate combinations with per-reference portions between 0.25 and 3, rounded to two decimals. A small repeat penalty encourages variety. There is no guarantee of an exact solution or globally optimal menu; actual planned totals and differences are always displayed. A match badge means calories within max(50 kcal, 5%) and each macro within max(5 g, 10%) of its saved target. Users may adjust portions or swap foods in Command Center.

Grocery totals come from planned portions only. Built-in recipes are decomposed using their original raw ingredient quantities and original servings. Canonical ingredient IDs combine repeated ingredients. Known density converts solid-mass liquid references to ml; totals of at least 1000 ml display as liters. Volumes with no published density keep their original ml units, without assuming a mass conversion; separate mass and volume records stay separate when no conversion is verifiable. Solids display in grams. Optional piece units divide by the source edible-portion piece weight and may be fractional. Personal recipes preserve component shopping snapshots; custom foods without ingredient details appear as ready-made line items. Missing component breakdowns are never guessed. Historical v1 custom entries without component snapshots remain ready-made items in shopping. Adjusting a plan portion rescales its ingredient snapshot; recording actual food does not change groceries.

Week plans and selected ranges are included in private backups and remain separate per profile. Existing schema-v1 backups with no week fields load with empty week-plan history. Source nutrition data and the target coefficients have not changed in this release.
