# Patch — sources

Every fact in Patch, where it came from, and when it was checked. The test
suite (`scripts/test/patch.mjs`) fails if a claim's evidence link isn't listed
here, so a new claim can't ship without its sources being written down.

Checked on 20 and 24 November 2026 unless a line says otherwise.

## Claims (`games/patch/claims.json`)

### Retinol for breakouts (`retinol-acne`)

| Evidence item | What we took from it | Link |
|---|---|---|
| AAD acne guideline, JAAD 90(5), May 2024 | Strong recommendations for benzoyl peroxide, topical retinoids and topical antibiotics; retinoids graded "strong" on "moderate" evidence (MDedge summary). | https://doi.org/10.1016/j.jaad.2023.12.017 — summaries read: https://pure.psu.edu/en/publications/guidelines-of-care-for-the-management-of-acne-vulgaris-2/ and https://mdedge.com/content/inside-2024-aad-acne-guidelines-new-therapies-join-old-standbys |
| Kolli et al., Am J Clin Dermatol 2019 | 54 trials; topical retinoids beat vehicle; best with benzoyl peroxide; adapalene best tolerated. Covers adapalene, tretinoin, tazarotene only. | https://pubmed.ncbi.nlm.nih.gov/30674002/ |
| Adapalene 0.1% vs tretinoin 0.025% gel, JAAD 1996 | 323 patients, investigator-masked, 12 weeks; total lesions down 49% vs 37%. | https://pubmed.ncbi.nlm.nih.gov/8609263/ |
| Adapalene 0.3%/BPO 2.5% vs vehicle, Am J Clin Dermatol 2016 | 503 randomized; week 12 inflammatory lesions down 68.7% vs 39.2% with vehicle. | https://pmc.ncbi.nlm.nih.gov/articles/PMC4863916 |
| FDA press release, 2016 | Differin Gel 0.1% approved over the counter, 12 and older; first OTC retinoid; prescription since 1996. | https://www.fda.gov/newsevents/newsroom/pressannouncements/ucm510362.htm |
| The missing retinol trial | Our own search found no vehicle-controlled trial of retinol alone for acne. A secondary source describes one small trial of a retinol cosmeceutical against adapalene (Lee et al.); we could not open it, so it isn't used. | https://pubmed.ncbi.nlm.nih.gov/?term=retinol+acne+randomized |

Other facts in this claim: retinol is unstable in light and air; skin converts
retinol in steps to retinoic acid; retinol is small and oil-soluble (about 286
Da); topical retinoids barely change sebum output, oral isotretinoin does.
Textbook pharmacology, not re-checked this session. Skin-of-color data are
thin: https://pmc.ncbi.nlm.nih.gov/articles/PMC9651155 (checked 24 Nov 2026).

### Collagen drinks (`collagen-drinks`)

| Evidence item | What we took from it | Link |
|---|---|---|
| Nutrients 2023 meta-analysis | 26 RCTs, 1,721 people; hydration and elasticity improved vs placebo; biases noted. | https://pubmed.ncbi.nlm.nih.gov/37432180/ |
| Myung and Park, Am J Med 2025 | 23 RCTs, 1,474 people; pooled benefit gone in non-industry-funded and in higher-quality trials. Read via CosmeticsDesign's report. | https://www.cosmeticsdesign.com/Article/2025/08/26/industry-reacts-to-meta-analysis-concluding-collagen-supplements-show-no-proven-benefit-for-skin-aging |
| Industry reply, Aug 2025 | BioCell, Collagen Stewardship Alliance, GROW: funding misclassified, unlike products pooled, 17 of 23 trials in Asia at about 3 g/day. Same article as above. | https://www.cosmeticsdesign.com/Article/2025/08/26/industry-reacts-to-meta-analysis-concluding-collagen-supplements-show-no-proven-benefit-for-skin-aging |
| Batool et al., J Cosmet Dermatol 25(7) 2026, e71041 | Hydration SMD 0.44, elasticity 0.62, TEWL −0.39; wrinkles −0.02 in the multilevel model; dermal density likely a type I error; publication bias present; duration mattered more than dose. Read via Dermatology Times. | https://www.dermatologytimes.com/view/oral-collagen-improves-skin-hydration-and-elasticity-but-benefits-for-wrinkles-remain-unproven |

The "67th out of 100" line is our arithmetic: a standardized difference of 0.44
moves the average person to the 67th percentile (normal distribution). Cohen's
rough sizes (0.2 small, 0.5 medium, 0.8 large) are the usual convention.

## The skin model (NODES in `index.html`)

| Fact | Source |
|---|---|
| Three layers; dermis has vessels, follicles, sweat glands | StatPearls, Anatomy, Skin: https://www.ncbi.nlm.nih.gov/books/NBK441980/ |
| Dermis is about 90% of skin thickness | NCI SEER training, Layers of the skin: https://www.training.seer.cancer.gov/melanoma/anatomy/layers.html |
| Epidermis has no blood vessels; keratinocytes arise in the basal layer | StatPearls, Epidermis: https://www.ncbi.nlm.nih.gov/books/NBK470464/ |
| Basal layer to shedding takes about four weeks (26–28 days), slower with age | Weinstein and Van Scott 1965, via BioNumbers: https://bionumbers.hms.harvard.edu/bionumber.aspx?id=109215 |
| Melanocyte numbers are similar across skin colors; melanin amount differs | Leeds histology: https://www.histology.leeds.ac.uk/skin/pigmentation.php ; Photochem Photobiol 2008: https://pmc.ncbi.nlm.nih.gov/articles/PMC2671032/figure/F1 |
| Molecules over about 500 daltons rarely cross healthy skin | Bos and Meinardi, Exp Dermatol 2000: https://pubmed.ncbi.nlm.nih.gov/10839713/ |
| Collagen type I is about 300 kDa; collagen turns over slowly | Textbook biochemistry, not re-checked this session |
| Drop test weights: niacinamide 122 Da (C6H6N2O), retinol 286 Da (C20H30O) | Molecular formulas; standard values, as in PubChem |
| The diagram's layout | Traced by eye from the NCI's public-domain "Anatomy of the skin" (Don Bliss): https://commons.wikimedia.org/wiki/File:Layers_of_the_skin.jpg |

Not used, on purpose: the SEER page says sweat glands sit "in the epidermis";
StatPearls and every histology text put them in the dermis, which is what Patch
draws. A good example of why each fact gets a second source.

## Status labels

"Well established", "Established, details still being worked out" and
"Emerging" are our judgement, set per node. Fibroblast signalling and the acne
model get the middle label; the skin microbiome gets "Emerging".

## The ingredient guide and product database (`games/patch/products.json`, 24 Nov 2026)

The guide explains common ingredients one at a time; the database lists products with
their ingredients exactly as on the label. The suite fails if any link below is missing.

| Ingredient | What we took from the sources | Sources |
|---|---|---|
| Retinol | Retinoid medicines have strong evidence for acne and sun-aged skin. Cosmetic retinol has much less: see the "Retinol for breakouts" claim. | [Review of 54 retinoid acne trials, 2019 (none of them retinol)](https://pubmed.ncbi.nlm.nih.gov/30674002/); [GoodRx Health: When to use retinol](https://www.goodrx.com/health-topic/dermatology/when-to-use-retinol) |
| Adapalene | Dermatologists strongly recommend topical retinoids for acne. Adapalene 0.1% was the first retinoid the FDA approved over the counter, for ages 12 and up. | [Differin Gel 0.1%, FDA-approved Drug Facts label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020380Orig1s011lbl.pdf); [FDA: Differin Gel 0.1% approved over the counter, 2016](https://www.fda.gov/newsevents/newsroom/pressannouncements/ucm510362.htm); [AAD acne guidelines, 2024](https://doi.org/10.1016/j.jaad.2023.12.017) |
| Benzoyl peroxide | One of the treatments America's dermatologists strongly recommend for acne. | [AAD acne guidelines, 2024 (summary)](https://pure.psu.edu/en/publications/guidelines-of-care-for-the-management-of-acne-vulgaris-2/); [Mayo Clinic: Nonprescription acne treatment](https://www.mayoclinic.org/diseases-conditions/acne/in-depth/acne-treatments/art-20045814); [AAD: Acne diagnosis and treatment](https://aad.org/acne-treatment) |
| Salicylic acid | Dermatologists' 2024 guideline gives it a conditional recommendation: it helps, but the evidence is weaker than for benzoyl peroxide or retinoids. Works best on blackheads and whiteheads. | [Mayo Clinic: Nonprescription acne treatment](https://www.mayoclinic.org/diseases-conditions/acne/in-depth/acne-treatments/art-20045814); [AAD: Adult acne treatment dermatologists recommend](https://www.aad.org/public/diseases/acne-and-rosacea/how-to-treat-different-types-of-acne); [Dermatology Times: AAD's 2024 acne guidelines](https://dermatologytimes.com/view/AAD-releases-updated-guidelines-for-the-management-of-acne-vulgaris) |
| Glycolic acid | It does exfoliate. The FDA found that AHAs make skin more sensitive to the sun while you use them and for up to a week after. | [FDA: Alpha hydroxy acids](https://www.fda.gov/cosmetics/ingredients/alpha-hydroxy-acids); [FDA guidance: labelling cosmetics that contain AHAs](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-labeling-cosmetics-containing-alpha-hydroxy-acids) |
| Niacinamide | Some trials support barrier and oil benefits. For acne, a review found the evidence unclear because there are few good studies. Usually well tolerated. | [DermNet: Nicotinamide](https://dermnetnz.org/treatments/nicotinamide.html); [Review: Nicotinic acid/niacinamide and the skin, 2004](https://pubmed.ncbi.nlm.nih.gov/17147561/); [Review: The role of nicotinamide in acne treatment, 2017](https://pubmed.ncbi.nlm.nih.gov/28220628/) |
| Vitamin C | Some studies show benefits for sun-aged skin and dark spots, but the versions in products differ a lot and many are less studied. | [Review: Topical vitamin C and the skin, 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5605218/); [Linus Pauling Institute: Vitamin C and skin health](https://lpi.oregonstate.edu/mic/health-disease/skin-health/vitamin-C) |
| Hyaluronic acid | It does hydrate the surface. It doesn't refill the hyaluronic acid deep in the dermis. | [Harvard Health: The hype on hyaluronic acid](https://www.health.harvard.edu/blog/the-hype-on-hyaluronic-acid-2020012318653); [Study: skin penetration of hyaluronic acid by size, 2016](https://pubmed.ncbi.nlm.nih.gov/25877232/) |
| Ceramides | Moisturizers work by hydrating skin and helping restore its barrier. Ceramides are one of the barrier's own ingredients. | [StatPearls: Moisturizers](https://ncbi.nlm.nih.gov/books/NBK545171); [StatPearls: The skin barrier and moisturizers](https://www.statpearls.com/ArticleLibrary/viewarticle/25225) |
| Petrolatum | Well studied. It also slips into the gaps of the stratum corneum, and the barrier can recover normally underneath it. | [StatPearls: Moisturizers](https://ncbi.nlm.nih.gov/books/NBK545171); [Ghadially et al.: how petrolatum works in the stratum corneum, 1992](https://pubmed.ncbi.nlm.nih.gov/1564142) |
| Sunscreen filters | Sunscreen prevents sunburn and sun damage. The FDA lists zinc oxide, titanium dioxide and bemotrizinol as safe and effective, and has asked for more data on the others; it hasn't found them harmful. | [AAD: Sunscreen FAQs](https://www.aad.org/media/stats-sunscreen); [American Cancer Society: How to use sunscreen](https://www.cancer.org/cancer/risk-prevention/sun-and-uv/how-to-use-sunscreen.html) |
| Fragrance | Fragrances are the most common cause of allergic reactions to cosmetics. Up to about 4.5% of adults are allergic to fragrance ingredients. | [DermNet: Cosmetic allergy](https://pro.dermnetnz.org/dermatitis/cosmetics-allergy.html); [Review: Fragrances, contact allergy and other effects, 2020](https://pubmed.ncbi.nlm.nih.gov/31433384/) |

Patch test steps: AAD, "How to test skin care products" (Dr. Bruce Brod): twice a day for 7 to 10 days on a
quarter-sized spot; 5 minutes for wash-off products. https://www.aad.org/news/how-to-test-skin-care-products-before-use

| Product | Where the ingredient list came from | Checked |
|---|---|---|
| Differin (Galderma) Differin Gel 0.1% | [FDA-approved Drug Facts label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020380Orig1s011lbl.pdf) | 2026-11-24 |
| CeraVe Moisturizing Cream | [Ingredient list as sold in US stores (Skinsort, H-E-B)](https://skinsort.com/products/cerave/moisturizing-cream) | 2026-11-24 |
| The Ordinary Niacinamide 10% + Zinc 1% | [Retailer ingredient sheet (Next) and product description (John Lewis)](https://xcdn.next.co.uk/pdfs/ingredients/AF4859.pdf) | 2026-11-24 |

Left out on purpose: CeraVe Acne Foaming Cream Cleanser and The Ordinary Glycolic Acid 7% Toner, because
no page we could open showed their full ingredient lists. A product only goes in with its whole list.
