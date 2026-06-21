# Data extraction sources — Geneva businesses

Where to collect publicly available information about a **specific** shop or business in **Geneva, Switzerland**. Sources are split into:

- **Generic sites** — cover almost any business regardless of type. Start here for every shop.
- **Specific sites** — listed under each business category; mostly relevant to that category (e.g. TripAdvisor for restaurants).

Each entry is annotated:

- **Coverage (Geneva/CH)** — how well it covers Geneva businesses of that type (strong / moderate / weak / none).
- **Data** — fields you can extract (name, address, geo, phone, hours, photos, ratings, reviews, services/menu, prices, social links, booking, …).
- **Access** — how to get the data: _Official API_ (with auth/cost/ToS), _Unofficial/3rd-party API_, _Open data / bulk download_, or _Scrape-only (HTML)_. Prefer official APIs and open data; scraping is generally restricted by each site's Terms of Service and robots.txt — check before automating.

---

## Information to extract (per shop)

The baseline set of fields we want to capture for each business. These are **desired** targets, not requirements: many shops won't expose all of them, so capture whatever is available rather than treating a missing field as an error. If a source yields other relevant information not listed here (e.g. founding year, payment methods, accessibility, booking links), keep it too.

- **Status** — operational, temporarily closed, permanently closed, etc.
- **Type(s)** — restaurant, florist, hairdresser, etc.; a shop may have more than one.
- **Name**
- **Website**
- **Email(s)** — may be more than one.
- **Address**
- **Coordinates** — latitude / longitude.
- **Phone(s)** — may be more than one.
- **Opening hours** — including special/holiday hours where published.
- **Rating** — aggregate score, kept per source (Google, TripAdvisor, …).
- **Reviews** — individual user reviews.
- **Services / Products / Menu**
- **Prices** — itemized prices for individual products/services (not an overall price level/range).
- **Logo**
- **Photos**
- **Social links** — Facebook, Instagram, X/Twitter, etc.

---

## Generic sites (any business)

These work as a first pass for essentially any shop. For most small Geneva businesses, the realistic core stack is **Google + local.ch/search.ch**.

### Global platforms

- **[Google Business Profile / Google Maps](https://www.google.com/maps)** — _Coverage (Geneva/CH):_ strong — nearly every Geneva business has a listing; the single richest source. _Data:_ name, address, geo, phone, website, opening hours (+ special hours), category & attributes, photos, rating & review count, individual reviews, popular times, price level, business description. _Access:_ Official API: Places API (New) for reads (Text/Nearby Search, Place Details) — API key with per-SKU free monthly caps; returns max 5 reviews/place. Google Business Profile API (OAuth) edits only listings you own/manage. Knowledge Panel is rendered HTML (no API).

### Maps & local directories

- **[OpenStreetMap](https://www.openstreetmap.org)** — _Coverage (Geneva/CH):_ moderate — good for cafes/shops/amenities the community has mapped; many small shops missing or partial. _Data:_ name, address tags, geo, phone, website, email, opening*hours, shop/amenity/cuisine type, wheelchair & other attributes (no ratings/reviews/photos). \_Access:* Open data (ODbL — attribution + share-alike). Official APIs: Overpass API (free, fair-use) for tag/area queries; Nominatim (free, max 1 req/s, User-Agent required, no systematic/bulk scraping) for geocoding. Bulk via Geofabrik Switzerland extracts.

### Swiss directories

- **[local.ch](https://www.local.ch)** — _Coverage (Geneva/CH):_ strong — flagship CH directory (Swisscom Directories/localsearch), 500k+ profiles incl. Geneva; also a booking platform. _Data:_ name, address, geo, phone, website, opening hours, category, photos, services, online booking, some ratings. _Access:_ Shares data infra with search.ch; programmatic access via the tel.search.ch API (key on request; ~1,000 req/month, ≤20 results/req; mandatory "Swisscom Directories AG" attribution).
- **[search.ch / tel.search.ch](https://tel.search.ch)** — _Coverage (Geneva/CH):_ strong — second flagship CH directory (same owner as local.ch). _Data:_ name, address, geo, phone, category, website; structured records. _Access:_ Official API: tel.search.ch REST API — free API key by application to localsearch; without key ≤10 results, with key ≤200; Atom/OpenSearch (+JSON) responses; "Swisscom Directories AG" attribution required; ~1,000 req/month quota. Also a map/route API.

### Geneva-specific directories

- **[Esprit de Genève](https://espritdegeneve.ch/)** — _Coverage (Geneva):_ moderate — Geneva-only showcase/directory of local artisans & merchants (retail, gastronomy, services) + lifestyle/tourism blog; opt-in registration, so coverage is partial/self-selected. _Data:_ business name, category, description, address/contact on profile pages; light structured data (no consistent hours/ratings). _Access:_ Scrape-only (HTML); no API.

---

# Specific sites by category

## Beauty & Grooming

Business types: hair_salon, hair_care, barber_shop, beauty_salon, nail_salon, beautician, makeup_artist, body_art_service, tanning_studio, foot_care

**Specific sites for this category:**

- **[Treatwell](https://www.treatwell.ch)** — _(Hairdressers, Beauty Salon, Barber Shop, Nail salons, Massage Spa)_ _Coverage (Geneva/CH):_ moderate — runs treatwell.ch (5,000+ salons across DE/AT/CH) and has Geneva listings, but density is thinner in French-speaking CH than Planity/Salonkee/Fresha. _Data:_ name, address, phone, hours, photos, ratings & reviews, services & prices, staff, online booking/availability. _Access:_ a partner/booking integration exists (Treatwell Connect / Booking Connect for salon software) but no public data API — public listings are Scrape-only (HTML).
- **[Fresha](https://www.fresha.com)** — _(Hairdressers, Beauty Salon, Barber Shop, Nail salons, Massage Spa)_ _Coverage (Geneva/CH):_ strong — dedicated Geneva pages (e.g. `/lp/en/bt/hair-salons/in/ch-genève`) for hair, beauty, nails, massage, barber. _Data:_ name, address, phone, hours, photos, ratings & reviews, services & prices, staff, online booking. _Access:_ no official public data API (only BI data connectors for a business's own data); a 3rd-party Apify scraper ("Fresha Local Beauty & Wellness Leads Extractor") exists = Unofficial/3rd-party API — otherwise Scrape-only (HTML).
- **[Planity](https://www.planity.com)** — _(Hairdressers, Barber Shop, Beauty Salon, Nail salons)_ _Coverage (Geneva/CH):_ strong (Geneva) — many Geneva salons live (postal codes 1201/1204/1207), hair/barber-centric French-market platform. _Data:_ name, address, phone, hours, photos, ratings & reviews, services & prices, staff, real-time online booking. _Access:_ no public API; Scrape-only (HTML).
- **[Salonkee](https://salonkee.ch)** — _(Hairdressers, Barber Shop, Beauty Salon, Nail salons, Massage Spa)_ _Coverage (Geneva/CH):_ strong — Swiss platform with dedicated Geneva pages (`/search/.../genf-geneve`) for hairdressers, barbershops, beauty and massage. _Data:_ name, address, phone, hours, photos, verified ratings & reviews, services & prices, staff, online booking. _Access:_ no public data API; Scrape-only (HTML).
- **[Coiffure Suisse — Section Genève](https://ge.coiffuresuisse.ch/section-geneve/membres-de-la-section)** — _(Hairdressers, Barber Shop)_ _Coverage (Geneva):_ strong — official Geneva-section member roster of the national hairdressers' association, with street addresses. _Data:_ salon name, address. _Access:_ Scrape-only (HTML); small association site; no API.
- **[agenda.ch](https://agenda.ch/fr/s/institut-de-beaute/geneve)** — _(Beauty Salon, Nail salons, Massage Spa; also osteo/wellness)_ _Coverage (Geneva):_ strong — multi-vertical online-booking directory; 18+ Geneva-area beauty institutes (incl. Carouge, Cointrin, Vésenaz) with ratings, services, live bookable slots. _Data:_ provider name, address, services, ratings, availability. _Access:_ Scrape-only (HTML); no public API.
- **[Tattoodo](https://www.tattoodo.com)** — _(Tattoo Shop)_ _Coverage (Geneva/CH):_ moderate — Geneva studios listed (True World Tattoo, Crazy Geneva Ink, Fredson Tattoo). _Data:_ studio/artist name, address, portfolio photos, styles, bio, contact, some booking. _Access:_ no current public data API (legacy API deprecated); Scrape-only (HTML).

_No dedicated platform for **Tanning Salon** — only generic salon-booking sites (Salonkee/Treatwell/Fresha occasionally list solariums) or generic directories apply._

_No dedicated CH/Geneva platform for beauticians, make-up artists or foot care (pedicure / podology) — they surface via agenda.ch and the salon-booking sites above plus the generic directories._

## Wellness & Fitness

Business types: massage_spa, massage, spa, gym, fitness_center, yoga_studio

**Specific sites for this category:**

- **[Eversports](https://www.eversports.ch)** — _(Gym, Yoga Studio; also Fitness/Pilates)_ _Coverage (Geneva/CH):_ moderate in Geneva (e.g. Yoga Lab, 1205 Genève), strong across German-speaking CH. _Data:_ name, address, class schedule, prices/memberships, online booking, photos, ratings & reviews. _Access:_ partner booking-widget API (Eversports Manager) for studios, not open public-data; public listings Scrape-only (HTML).
- **[EGYM Wellpass](https://egym-wellpass.com)** — _(Gym, Yoga Studio — corporate fitness network)_ _Coverage (Geneva/CH):_ moderate — active in CH (alongside DE/AT/NL/ES); partner-facility network includes Geneva-area gyms/studios. _Data:_ partner facility name, location, activity types — limited public detail. _Access:_ B2B corporate; no public data API; Scrape-only (HTML) for the partner finder.
- **[ClassPass](https://classpass.com)** — _(Gym, Yoga Studio, Fitness/Pilates/HIIT, some Massage Spa)_ _Coverage (Geneva/CH):_ moderate — Geneva CH studios listed (Plainpalais, Champel, etc.). _Data:_ studio name, address, class schedule, photos, ratings & reviews, class types, credit-based online booking. _Access:_ no public data API (B2B partner integrations only); Scrape-only (HTML).
- **[Mindbody](https://www.mindbodyonline.com)** — _(Gym, Yoga Studio, Fitness/Pilates/Barre; some Spa/Salon)_ _Coverage (Geneva/CH):_ moderate — explore directory for "Geneva, GE, CH" (`/explore/fitness/studios-geneva-ge-ch`). _Data:_ business name, address, phone, class/appointment schedule, services & prices, staff, photos, ratings & reviews, online booking. _Access:_ Official API: **Mindbody Public/Consumer API** (Developer Portal, OAuth 2.0, Partner Program, sandbox) — but requires per-business activation + partner agreement (connects to a business's own account, not bulk public-data harvest). Public explore listings otherwise Scrape-only.

_For massage and spa providers, the salon-booking platforms under **Beauty & Grooming** (Treatwell, Fresha, Salonkee, agenda.ch) also list them._

## Drink

Business types: bar, pub, brewery, brewpub, irish_pub, gastropub, beer_garden, cocktail_bar, wine_bar, sports_bar, lounge_bar, hookah_bar, night_club, winery, coffee_shop, coffee_stand, coffee_roastery, tea_house, juice_shop

**Specific sites for this category:**

- **[Untappd](https://untappd.com/)** — _(Brewery, Bar/Pub, beer-serving Restaurant)_ _Coverage (Geneva/CH):_ moderate — global check-in data covers Geneva bars/taprooms and their tap lists. _Data:_ venue name, address, geo, beer/tap menu, beer ratings, check-in counts, photos. _Access:_ Scrape-only (HTML) — public venue/beer pages.
- **[Resident Advisor (RA)](https://ra.co/clubs/ch/geneva)** — _(Night Club, electronic-music venues, some Bars)_ _Coverage (Geneva/CH):_ strong (for the niche) — dedicated Geneva club directory + RA Guide (Motel Campo, Audio Club, Wunderbar) and event listings. _Data:_ venue name, address, geo, event lineups/dates, ticket links, photos, descriptions. _Access:_ No official public API — undocumented GraphQL endpoint (ra.co/graphql) used by 3rd-party scrapers (unofficial); officially scrape-only.
- **[Bandsintown](https://www.bandsintown.com/)** — _(live-music venues — Night Club/Bar hosting concerts)_ _Coverage (Geneva/CH):_ moderate — covers Geneva concert/club venues via artist event data. _Data:_ venue name, location, event listings, artist lineups, ticket links. _Access:_ Scrape-only (HTML) — public venue/event pages.
- **[petzi.ch](https://www.petzi.ch/fr/)** — _(Night Club / live-music venues, festivals)_ _Coverage (Geneva/CH):_ strong CH incl. Geneva/Romandie — federation of 210+ non-profit music clubs/festivals, with member-venue agenda + ticketing. _Data:_ event name/date/venue, venue name & links (address via member pages), ticket price/availability. _Access:_ Scrape-only (HTML); no documented public API.
- **[La Décadanse](https://www.ladecadanse.ch/)** — _(Night Club, Bar/Pub)_ _Coverage (Geneva):_ strong Grand Genève + Romandie nightlife agenda (Geneva, Nyon, Lausanne, Pays de Gex, Annemasse). _Data:_ party/event listings, venue & bar names, dates, links. _Access:_ Scrape-only (HTML); no public API.
- **[Genève Terroir](https://www.geneveterroir.ch/en/)** — _(Liquor Store: wine producers w/ direct sales; Butcher Shop: meat producers)_ _Coverage (Geneva/CH):_ strong — the canton's official terroir portal; ~130 wine estates plus meat/dairy/market-garden GRTA-certified producers. _Data:_ producer name, town, product categories, direct-sales points, contact (email/phone on detail pages), interactive map, mobile app. _Access:_ Scrape-only (HTML); no public API despite the app backend.
- **[Swiss Wine — Winemakers Directory](https://www.swisswine.com/en/winemakers)** — _(Liquor Store: wineries w/ direct sales, not retail shops)_ _Coverage (Geneva/CH):_ moderate — ~130 Geneva-region producers, filterable by region; growers/wineries only. _Data:_ winery name, street address, postal code, phone, email, website (no hours/inventory). _Access:_ Scrape-only (HTML) — Swiss Wine Promotion site; no API.
- **[AGVEI — Vignerons-Encaveurs Indépendants de Genève](https://agvei.ch/)** — _(Liquor Store — independent Geneva winegrowers with direct/cave sales)_ _Coverage (Geneva):_ strong (cantonal) — "Nos membres" roster of local independent producers. _Data:_ producer name, address, contact. _Access:_ Scrape-only (HTML); no API; distinct from Genève Terroir/Swiss Wine.

_General food-and-drink directories (TripAdvisor, Genève Tourisme — Eat & Drink, gvafoodie / Time Out, Just-Tag, Restaurant Guru, resto-rang.ch, ACCESS) list bars, pubs and cafés too — see **Food**._

_Coffee shops, tea houses and juice / smoothie bars have no dedicated CH/Geneva platform — they surface via the general food-and-drink directories (see **Food**) and the generic listings (Google, local.ch)._

## Food

Business types: restaurant, cafe, bistro, diner, deli, food_court, cafeteria, steak_house, snack_bar, kebab_shop, sandwich_shop, noodle_shop, salad_shop, meal_takeaway, meal_delivery, pizza_delivery, bakery, pastry_shop, cake_shop, donut_shop, bagel_shop, dessert_shop, ice_cream_shop, chocolate_shop, confectionery, acai_shop, butcher_shop

**Specific sites for this category:**

- **[TripAdvisor](https://www.tripadvisor.com/Restaurants-g188057-Geneva.html)** — _(Restaurant, Bar/Pub, Coffee Shop, Bakery, Ice Cream — all)_ _Coverage (Geneva/CH):_ strong — ~2,000 Geneva restaurants listed. _Data:_ name, address, geo, phone, hours, photos, ratings & review count, reviews, price level, cuisine. _Access:_ Official API: Tripadvisor Content API — free up to 5,000 calls/mo, mandatory logo/rating attribution.
- **[MICHELIN Guide](https://guide.michelin.com/us/en/geneve-region/geneve/restaurants)** — _(Restaurant — fine dining + Bib Gourmand)_ _Coverage (Geneva/CH):_ strong — official Geneva selection (Stars, Bib Gourmand; e.g. Domaine de Châteauvieux, L'Atelier Robuchon, Le Dorian). _Data:_ name, address, geo, phone, cuisine, price range, editorial description, distinction (stars/Bib), booking link. _Access:_ No public data API — scrape-only (HTML).
- **[GaultMillau Suisse](https://www.gaultmillau.ch/)** — _(Restaurant, some Bar/hotel dining)_ _Coverage (Geneva/CH):_ strong — major Swiss guide with dedicated Geneva-canton coverage (11 new entries in the 2025 guide, e.g. Domaine de Châteauvieux at 19 pts). _Data:_ name, address, points score (/20), cuisine, chef, editorial description, price. _Access:_ No public API — scrape-only (HTML).
- **[HappyCow](https://www.happycow.net/europe/switzerland/geneva/)** — _(Restaurant, Coffee Shop, Bakery — vegan/vegetarian only)_ _Coverage (Geneva/CH):_ moderate — dedicated Geneva listings of veg/vegan & veg-friendly venues. _Data:_ name, address, geo, hours, ratings, reviews, photos, diet tags, price band. _Access:_ No open public API — scrape-only (HTML).
- **[Too Good To Go](https://www.toogoodtogo.com/en-ch)** — _(Bakery, Restaurant, Coffee Shop, Ice Cream Shop, Donut Shop — surplus food)_ _Coverage (Geneva/CH):_ strong — 7,300+ CH partners incl. Geneva bakeries, restaurants, and even a donut maker; the best single source for the Bakery/Donut/Ice-Cream sub-types. _Data:_ business name, address, geo, "Surprise Bag" price & retail value, category, daily pickup window, rating. _Access:_ No public API — B2B partner onboarding only; consumer data scrape-only.
- **[Genève Tourisme — Eat & Drink](https://www.geneve.com/en/eat-drink)** — _(Restaurant, Bar/Pub, Coffee Shop — curated)_ _Coverage (Geneva/CH):_ strong (Geneva-specific) — official city tourism listings plus the "Geneva Food Guide" (60 curated addresses), terrace bars and street-food halls. _Data:_ name, address, short description, cuisine/category, curated themed lists; little structured/geo data. _Access:_ No API — scrape-only.
- **[gvafoodie / Geneva Foodie + Time Out Geneva](https://www.gvafoodie.com/)** — _(Restaurant, Bar/Pub, Coffee Shop)_ _Coverage (Geneva/CH):_ moderate (Geneva-specific, editorial) — independent local reviews (gvafoodie.com) and the Time Out Geneva city guide. _Data:_ editorial reviews, venue names, addresses, photos, opinion ratings. _Access:_ No API — scrape-only (HTML); editorial content.
- **[Just-Tag](https://just-tag.app/en)** — _(Restaurant, Bar/Pub, Coffee Shop)_ _Coverage (Geneva/CH):_ strong (Suisse romande) — manually-verified restaurant directory covering 7 cantons, **2,251 Geneva listings**. _Data:_ name, address/location, cuisine, ambiance, menus, photos, verified reviews. _Access:_ Scrape-only (HTML); no API; manually curated.
- **[Restaurant Guru](https://restaurantguru.com/Geneva-Switzerland)** — _(Restaurant, Bar/Pub, Coffee Shop)_ _Coverage (Geneva/CH):_ strong but **aggregator** — re-publishes name/address/hours/menu/photos/ratings/reviews compiled from Google, Facebook, OpenStreetMap etc. _Data:_ name, address, phone, hours, cuisine, price range, photos, multi-source ratings, reviews, menu. _Access:_ Scrape-only (HTML); no public API; derivative of sources already listed — lower primacy.
- **[resto-rang.ch](https://www.resto-rang.ch/restaurants-a-geneve.html)** — _(Restaurant, Coffee Shop, Bar/Pub)_ _Coverage (Geneva/CH):_ strong Geneva/Romandie — community directory (~150k Geneva visits/month), classified by budget, district, cuisine. _Data:_ name, address, phone, hours, cuisine, price/budget, menus, user ratings & reviews. _Access:_ Scrape-only (HTML); reachable to a plain fetch; no API.
- **[ACCESS (access.sb)](https://www.access.sb/en/geneva/restaurants/)** — _(Restaurant, Bar/Pub, Night Club)_ _Coverage (Geneva):_ curated, not exhaustive — hand-picked "Top 30 Restaurants" and "Bars & Clubs" lists, premium/VIP angle. _Data:_ name, address, phone, hours, geo, photos, videos, menu, price, 24/7 booking. _Access:_ Scrape-only (HTML); no API.
- **[SFF Member Register](https://sff.ch/de/mitglieder-und-regionalverbaende)** — _(Butcher Shop)_ _Coverage (Geneva/CH):_ strong — all cantons; Geneva butchers via the regional association (SPBCG); members only, so non-member shops may be absent. _Data:_ company/owner name, street address, postal code, email, phone, website, apprenticeship flag, certifications; searchable by canton/city/name. _Access:_ Scrape-only (HTML) — JS-rendered search form; no API.
- **[Foodspotters.ch — Butcher Category](https://foodspotters.ch/places/category/butcher-boucher-metzgerei/)** — _(Butcher Shop)_ _Coverage (Geneva/CH):_ moderate — 30+ boucherie/Metzgerei listings across CH, Geneva canton in the index. _Data:_ shop name, category tags, description, product lists, photos; address/phone on individual listing pages. _Access:_ Scrape-only (HTML) — WordPress directory; no API.
- **[Boucherie Suisse](https://boucheriesuisse.com/c/geneve-ge/)** — _(Butcher Shop)_ _Coverage (Geneva/CH):_ moderate — Swiss butcher-address directory; Geneva, Carouge, Bernex pages live. _Data:_ business name, street address, phone. _Access:_ Scrape-only (HTML).
- **[MagicTomato Geneva](https://geneve.magictomato.ch/en/stores)** — _(Butcher Shop; Seafood Market — partial)_ _Coverage (Geneva/CH):_ weak breadth — Geneva-only artisan delivery platform; ~10 suppliers incl. a butcher (Boucherie Bula) and a fishmonger (Poissonnerie Lucas). _Data:_ supplier name, full address, phone, Mon–Sun hours; product pages add origin, weight, price, allergens, storage notes. _Access:_ Scrape-only (HTML) — no API.
- **[Chocosuisse Member Directory](https://www.chocosuisse.ch/en/%C3%BCber-uns/members)** — _(Candy Store: industrial chocolate manufacturers only)_ _Coverage (Geneva/CH):_ weak for retail use — ~15 national industrial members (Lindt, Läderach, Sprüngli, etc.); some run Geneva boutiques but the directory is manufacturer-level, not shop-level. _Data:_ company name, street address, phone, fax, email, website; static list, no map. _Access:_ Scrape-only (HTML) — public static page; no API.

_Sub-type note: **Donut Shop**, **Ice Cream Shop** and **Coffee Shop** have no dedicated CH/Geneva platform — they surface only via generic listings (TripAdvisor, the delivery apps, Too Good To Go). **Bakery** likewise has no specialist directory but is well covered by Too Good To Go and the delivery apps._

_**Butcher** shops are covered by the SFF register, Foodspotters, Boucherie Suisse and MagicTomato above (plus meat producers on Genève Terroir, listed under **Drink**); **chocolate and confectionery** by Chocosuisse. No specialty directory exists for seafood or delicatessens — Google Maps/Business, TripAdvisor and local.ch are the realistic primary sources (MagicTomato is the only partial structured exception for seafood, via its delivery-partner pages)._

## Auto Repair

Business types: car_repair, car_wash, car_dealer, car_rental, tire_shop, bicycle_store, auto_parts_store, ebike_charging_station

**Specific sites for this category:**

- **[AutoScout24.ch — Händler/Garagen directory](https://www.autoscout24.ch/de/)** — _(Auto Repair Shop, Mechanic)_ _Coverage (Geneva/CH):_ strong CH, dealer/garage search filterable by location (e.g. 1200 Genève) — but sales-oriented (lists garages/dealers that sell cars; many are also full-service workshops). _Data:_ garage/dealer name, address, phone, opening hours, brands handled, inventory; ratings sparse. _Access:_ Scrape-only (HTML); SMG Swiss Marketplace Group property — dealer-facing inventory feeds exist but no public/open directory API.
- **[Garage-Vergleich.ch](https://www.garage-vergleich.ch/)** — _(Auto Repair Shop, Mechanic, Tire Shop)_ _Coverage (Geneva/CH):_ moderate (CH-wide comparison/booking portal; Geneva density unverified, likely thinner than Zürich). _Data:_ shop name, address, services, prices, ratings, online booking. _Access:_ Scrape-only (HTML); no public API.
- **[reifen.com — CH garage finder](https://www.reifen.com/en-ch/garage)** — _(Tire Shop)_ _Coverage (Geneva/CH):_ strong (~420 partner fitting garages across all postal-code areas incl. Geneva, 1xxx). _Data:_ partner garage name, address, fitting/installation services (full details load after search). _Access:_ Scrape-only (HTML, SmartMaps-powered); no public API.
- **[RVS Swisspneu — Liste aller Anbieter](https://www.swisspneu.ch/pneuhaeuser/liste-aller-anbieter)** — _(Tire Shop)_ _Coverage (Geneva/CH):_ CH-wide tire-trade association member directory (Pneuhäuser). _Data:_ company name, address, contact, member status. _Access:_ Scrape-only (HTML); association site, no public API.
- **[carrosserie suisse (vsci.ch) member finder](https://www.vsci.ch/)** — _(Car Paint Shop)_ _Coverage (Geneva/CH):_ strong (national body/paint-shop association, ~800 member firms incl. Geneva). _Data:_ member shop name, address, contact, specialties. _Access:_ Scrape-only (HTML) member database; no public API.
- **[MotoScout24 — Händler & Garage search](https://www.motoscout24.ch/de/moto-haendler-garage/suche)** — _(Motorcycle Repair Shop)_ _Coverage (Geneva/CH):_ strong CH, radius search by location. _Data:_ dealer/garage name, address, phone, inventory. _Access:_ Scrape-only (HTML); SMG Swiss Marketplace Group, no public directory API.
- **[ProCycles.ch](https://www.procycles.ch/)** — _(Bicycle Repair Shop)_ _Coverage (Geneva/CH):_ moderate — dedicated CH bike/e-bike shop & service directory launched Nov 2025, claims all cantons but Geneva density unverified (Veloplus chain has no Geneva store; Bosch eBike dealer finder also lists Geneva e-bike service points). _Data:_ shop name, location/region, service type, brands. _Access:_ Scrape-only (HTML); new directory, no public API.

_Car dealers are covered by AutoScout24 / MotoScout24 above; car rental, auto-parts and e-bike-charging points have no dedicated CH directory — use the generic listings (Google, local.ch)._

## Pet Care

Business types: veterinary_care, pet_care, pet_store, pet_boarding_service

**Specific sites for this category:**

- **[GST-SVS Tierarzt-Finder / Praxissuche](https://www.gstsvs.ch/de/tierarzt-finder/praxissuche)** — _(Veterinarian)_ _Coverage (Geneva/CH):_ strong (national vet association, ~3,000 vets; covers Geneva; FR/IT site = SVS). _Data:_ practice/clinic name, address, phone, specialties/diploma certifications, region; specialty sections (e.g. CAMVET for complementary medicine) filterable. _Access:_ Scrape-only (HTML) association directory; no public API.
- **[Société Genevoise des Vétérinaires (SGV)](http://sgv.name/)** — _(Veterinarian)_ _Coverage (Geneva):_ strong per search (alphabetical + by-clinic Geneva vet lists). _Data:_ vet name, clinic, address, phone. _Access:_ Scrape-only (HTML); no API; distinct from the national GST-SVS.
- **[Chien.com — Annuaire](https://www.chien.com/adresse/19-0-0-203-203008-toiletteur-canin-geneve-1.php)** — _(Pet Groomer, Veterinarian, boarding, trainers)_ _Coverage (Geneva):_ moderate — live French portal listing ~12 Geneva grooming salons plus vets/boarding/trainers. _Data:_ business name, commune/postal code, contact via profile. _Access:_ Scrape-only (HTML); no API. The best structured source found for the **Pet Groomer** gap.

## Services & Trades

Business types: tailor, locksmith, plumber, electrician, painter, laundry, art_studio

**Specific sites for this category:**

- **[Renovero.ch](https://www.renovero.ch/)** — _(Plumber, Electrician, Painter, Locksmith)_ _Coverage (Geneva/CH):_ strong (largest CH tradesperson platform, run by localsearch/Swisscom Directories). _Data:_ trade categories/services, region, reviews/ratings — note it's a reverse marketplace (clients post jobs, pros bid), so public per-business contact/profile data is limited. _Access:_ Scrape-only (HTML); no public API.
- **[Ofri.ch](https://www.ofri.ch/suche)** — _(Plumber, Electrician, Painter, Locksmith)_ _Coverage (Geneva/CH):_ strong (CH-wide, ~15 yrs, manually verified pros). _Data:_ company profile, services, region, 100%-verified ratings/reviews. _Access:_ Scrape-only (HTML); no public API.
- **[FMB — Fédération Genevoise des Métiers du Bâtiment, Annuaire](https://www.fmb-ge.ch/annuaire-2/)** — _(Electrician [AIEG], Plumber/sanitaire [AMFIS], Locksmith/serrurerie & construction métallique)_ _Coverage (Geneva/CH):_ strong for Geneva specifically (cantonal guild, ~1,400 member firms; vetted/insured). _Data:_ company name, trade category, association membership, compliance/certifications (online searchable + downloadable PDF). _Access:_ Scrape-only (HTML, free browse) + PDF; no API.
- **[Houzz (Switzerland pros)](https://www.houzz.com/professionals)** — _(Painter; renovation/interior contractors)_ _Coverage (Geneva/CH):_ weak–moderate, design/renovation-leaning; thin for Locksmith/Plumber/Electrician/Dry Cleaner/Laundromat. _Data:_ pro profile, portfolio photos, reviews/ratings, services, location. _Access:_ Scrape-only (HTML); partner APIs exist but no open public pro-directory API.
- **[pressingsuisse.com](https://pressingsuisse.com/)** — _(Dry Cleaner)_ _Coverage (Geneva/CH):_ moderate — dedicated CH pressing/dry-cleaner directory with Geneva pages (geneve-ge, etc.); community-editable so completeness varies. _Data:_ name, address, services, user reviews. _Access:_ Scrape-only (HTML); no API.
- **[laveriesuisse.com](https://laveriesuisse.com/)** — _(Laundromat)_ _Coverage (Geneva/CH):_ moderate — dedicated CH laundromat/laverie directory with Geneva pages (Meyrin, Versoix, Geneva); community-editable. _Data:_ name, address, services, user reviews. _Access:_ Scrape-only (HTML); no API.
- **[MBG — Métiers du Bâtiment Genève](https://www.mbg.ch/)** — _(Locksmith/metalwork, Plumber, Electrician — multiple cantonal guilds)_ _Coverage (Geneva):_ strong — umbrella hub hosting per-trade Geneva associations: **Metaltec Genève** (metalwork/serrurerie, ~45 firms with full contacts), **suissetec/AMFIS** (sanitaire/plumbing, heating, roofing/sheet-metal) and **EIT.genève/AIEG** (electrical). _Data:_ company name, address, phone, email, website. _Access:_ Scrape-only (HTML); no API; richest new Geneva home-trades source.
- **[GPG — Gypserie-Peinture Genève](https://www.gpg.ch/)** — _(Painter, plasterer/decorator)_ _Coverage (Geneva):_ strong — Geneva painters' syndicate (since 1891), ~100 member companies, dedicated members page. _Data:_ company name, contact. _Access:_ Scrape-only (HTML); no API.

_Tailors, alteration ateliers and art studios have no dedicated CH/Geneva platform — the realistic primary sources are Google Maps/Business and local.ch._

## Shops & Retail

Business types: florist, garden_center, jewelry_store, hardware_store, book_store, shoe_store, cell_phone_store, electronics_store, clothing_store, womens_clothing_store, cosmetics_store, furniture_store, home_goods_store, thrift_store, sporting_goods_store, sportswear_store, toy_store, tea_store, candy_store, liquor_store

**Specific sites for this category:**

- **[Fleurop.ch Partner Locator](https://www.fleurop.ch/en/map/fleurop-shops)** — _(Florist)_ _Coverage (Geneva/CH):_ strong — ~300 CH partner florists (this is also the Interflora network in CH), Geneva members confirmed (e.g. Simeoni Fleurs). _Data:_ name, address (map pin), partial phone via partner pages; hours/photos vary by profile; no platform-level ratings. _Access:_ Scrape-only (HTML) — pins render via Google Maps; name/address extractable from JS markers; no official API.
- **[Discogs Record Store Directory](https://www.discogs.com/record-stores/)** — _(Record Store)_ _Coverage (Geneva/CH):_ strong — absorbed VinylHub (vinylhub.com now 301-redirects to vinylhub.discogs.com); Geneva stores confirmed (Bongo Joe, Dig It, Moi J'Connais, Harmonia Mundi). _Data:_ name, full address, hours, genres/formats, photos, description, link to marketplace shop. _Access:_ Scrape-only (HTML).
- **[buchbon.ch Bookstore Finder](https://buchbon.ch/en/bookstores)** — _(Bookstore)_ _Coverage (Geneva/CH):_ strong — 400+ participating CH bookstores with canton filter; Geneva entries confirmed (Payot Genève, Fahrenheit 451, Librairie du Boulevard); official acceptance directory for the Swiss national book voucher, so the broadest cross-brand independent-bookstore directory. _Data:_ name, street address, postal code/city, phone, email, website (hours not consistently shown). _Access:_ Scrape-only (HTML) — no API.
- **[ASHB / VSGU](https://vsgu-ashb.ch/fr)** — _(Jewelry Store — watch/jewelry retail shops & ateliers)_ _Coverage (CH incl. Geneva):_ moderate — Switzerland-wide retailer roster (not GE-filtered). _Data:_ shop name, address, contact (via Pages jaunes). _Access:_ Scrape-only (HTML); no API.
- **[JardinSuisse Genève](https://www.jardinsuisse-geneve.ch/)** — _(Florist, garden/plant retail; also landscapers — Home Trades overlap)_ _Coverage (Geneva):_ strong — cantonal section publishes an annuaire of floriculteurs, pépiniéristes & paysagistes genevois (PDF). _Data:_ company name, address, contact (HTML + PDF). _Access:_ Scrape-only (HTML) + PDF; no API.

_No dedicated CH/Geneva platform exists for vape shops, cell phone & computer repair, hardware stores, or shoe stores — primary sources are generic (Google Maps/Business, local.ch, search.ch); **jewelry** is partly covered by ASHB-VSGU and **florists** by JardinSuisse (above). Notably, uBreakiFix operates only in US/Canada (no CH presence), iFixit's retailer page finds tool resellers rather than repair shops, Euroflorist has no Swiss florist network (CH excluded), and Interflora in CH exists only as Fleurop-Interflora (no separate interflora.ch directory)._

_Board-game, hobby and craft / sewing / art-supply shops are covered by BoardGameGeek and Etsy above; **liquor stores** (wine & spirits retailers) by Wine-Searcher. Tea shops, candy stores, cosmetics, clothing, shoe, furniture, home-goods and toy stores have no dedicated CH directory — use the generic listings._
