# 02 — Geographic Model

DemocratIA organizes itself in a geographic hierarchy that mirrors each country's real administrative structure. Every level has its own forum with its own dynamics.

## Hierarchy

| Level | Argentina example | USA example | Typical content |
|---|---|---|---|
| Neighborhood | Chinatown (CABA) | SoHo (NYC) | Plazas, streets, local shops, neighborhood safety |
| City / Municipality | Vicente López | Austin, TX | Transport, municipal budget, urbanism |
| Province / State | Province of Buenos Aires | Texas | Provincial education, health, taxes |
| Country | Argentina | United States | National politics, federal legislation |

Forums are created automatically from the country's administrative structure. The system uses open geographic data to generate the forum hierarchy without manual intervention. This is critical for scalability: a single country has thousands of neighborhoods and creation cannot depend on a manual process.

## Pilot cities (v1)

- **CABA (Buenos Aires, Argentina):** 48 official neighborhoods, sourced from [Buenos Aires Data](https://data.buenosaires.gob.ar/) (GeoJSON with polygons). Provinces/municipalities from INDEC + IGN (Shapefiles → GeoJSON).
- **San Francisco (California, USA):** 49 neighborhoods from [DataSF](https://data.sfgov.org/) (SF Planning Department GeoJSON). City/County from US Census Bureau TIGER/Line.

To add a new country or city, create a file in `packages/geo/sources/<country>.ts` and register it in the seed script.

## Residency weights

Every user has an assigned **primary neighborhood** where they reside and can add up to **two secondary neighborhoods** (e.g., where they work, study, or have family). Interactions receive differentiated weights based on the bond:

| Bond | Weight in reports | Visual label |
|---|---|---|
| Primary neighborhood (resident) | 1.0 (100%) | "Resident" badge |
| Secondary neighborhood 1 | 0.75 (75%) | "Non-resident" label |
| Secondary neighborhood 2 | 0.50 (50%) | "Non-resident" label |
| No bond | 0.0 (read-only) | Cannot interact |

**Weights apply exclusively to report and aggregate-statistic computation.** In open discussion (Layer 1), all bonded participants (primary and secondary) can comment, vote, and create posts with functional equality, differentiated only by the visual label.

The exact percentages (75%, 50%) are an initial proposal and must be validated empirically against real pilot data. The principle is the important part: decreasing priority by bond.

## Visibility vs. interaction

A fundamental platform principle: **visibility is universal, interaction is geographically bounded.**

- **All posts, forums, and reports are visible to anyone**, including unregistered visitors. Someone without an account can read the Palermo (CABA) debates.
- When an unauthenticated user tries to interact (vote, comment, create a thread), a modal appears: "To participate you need an account" with "Sign up" and "Log in" buttons. The reading experience is identical to a logged-in user's but every interaction button is disabled.
- Interaction is enabled for all registered users with a bond: primary residents and secondary-neighborhood users.
- A logged-in user with no bond to the forum can see everything but cannot participate. Tooltip: "You can't participate in this forum because you have no bond to this area."
- Higher-level forums (city, province, country) are accessible to all users within that jurisdiction. All residents of any neighborhood inside Vicente López can participate in the Vicente López forum.

## Primary-neighborhood change (moving)

**Decision:** Immediate change with frequency limit.

- The change is instantaneous (clean cut, no retroactive recomputation) but the user can change primary neighborhood **only once every 6 months.**
- Past votes and comments stay associated with the old neighborhood at their original weight.
- Historical reports are not recomputed.
- If the user tries to change before the 6 months elapse, the button is disabled with text indicating the next available change date.

**Flow:** Profile → "Change primary neighborhood" → hierarchical selector (Country → Province → City → Neighborhood) → confirmation dialog: "Are you sure? You can only change your primary neighborhood once every 6 months. Your next change will be available on [date]." → on accept, effective immediately.

## Forum mapping

Every `geo_zone` (neighborhood, city, province, country) has exactly one corresponding forum. The `forums` table has a 1:1 relationship with `geo_zones`.

A **closure table** `geo_zone_ancestors` precomputes the full ancestor hierarchy of each zone to allow efficient queries like "does this user belong to any neighborhood inside CABA?" without recursive joins. It is regenerated automatically when new zones are inserted.
