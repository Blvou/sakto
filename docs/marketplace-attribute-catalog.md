# Marketplace attribute catalog

Per **attribute schema key** (from `category-tree.ts` → `attributeSchemaKey`).  
Field types: `text` | `number` | `select`.  
Filter UI: `select` (chips) | `range` (min/max for numbers).

Quick filters = top 4 select fields by `filterPriority`.

## Shared condition

| Key | Label | Type | Required | Filter | filterUI | Options |
|-----|-------|------|----------|--------|----------|---------|
| condition | Condition | select | yes | yes | select | New, Used — like new, Used — good, Used — fair, For parts |

## moto-buy

| Key | Type | Required | Filter | filterUI | filterPriority |
|-----|------|----------|--------|----------|----------------|
| condition | select | yes | yes | select | 1 |
| brand | text | yes | no | — | — |
| model | text | yes | no | — | — |
| year | number | no | yes | range | 3 |
| mileage | number | no | yes | range | 4 |
| engine_cc | text | no | no | — | — |
| transmission | select | no | yes | select | 2 |
| color | select | no | yes | select | — |

## auto-buy

| Key | Type | Required | Filter | filterUI | filterPriority |
|-----|------|----------|--------|----------|----------------|
| condition | select | yes | yes | select | 1 |
| brand / model | text | yes | no | — | — |
| year | number | no | yes | range | 4 |
| mileage | number | no | yes | range | 5 |
| transmission | select | no | yes | select | 2 |
| fuel_type | select | no | yes | select | 3 |
| body_type | select | no | yes | select | — |
| color | select | no | yes | select | — |

## parts (parts-moto, parts-auto, parts-accessories)

| Key | Type | Required | Filter | filterUI | filterPriority |
|-----|------|----------|--------|----------|----------------|
| condition | select | yes | yes | select | — |
| part_type | select | yes | yes | select | 1 |
| brand | text | no | no | — | — |
| compatible_with | text | no | no | — | — |
| part_number | text | no | no | — | — |

## real-estate-rent

| Key | Type | Required | Filter | filterPriority |
|-----|------|----------|--------|----------------|
| property_type | select | yes | yes | 1 |
| bedrooms | select | no | yes | 2 |
| bathrooms | select | no | yes | 3 |
| area | text | yes | no | — |
| furnishing | select | no | yes | 4 |
| parking | text | no | no | — |

## real-estate-sale

Same as rent except no `furnishing` filter priority (furnishing field omitted).

## electronics (phones, laptops, tablets)

| Key | Type | Required | Filter | filterPriority |
|-----|------|----------|--------|----------------|
| condition | select | yes | yes | — |
| brand / model | text | yes | no | — |
| storage | select | no | yes | 2 |
| network | select | no | yes | 3 |

## clothing-* / clothing-shoes

| Key | Type | Required | Filter | filterPriority |
|-----|------|----------|--------|----------------|
| condition | select | yes | yes | — |
| size | select | yes* | yes | 1–2 |
| material | select | no | yes | 3 |

## home / home-appliances / home-decor / home-kitchen

Furniture uses `material` filter; appliances use brand/model/power.

## games / games-board / hobbies-*

Video games: `platform` (filter 1), `edition` (filter 2).

## services

| Key | Filter | filterPriority |
|-----|--------|----------------|
| service_type | yes | 1 |
| availability | yes | 2 |

## jobs

| Key | Filter | filterPriority |
|-----|--------|----------------|
| employment_type | yes | 1 |
| remote | yes | 2 |

## default (marketplace catch-all)

| Key | Required | Filter |
|-----|----------|--------|
| condition | yes | yes |
| brand | no | no |
| model | no | no |

## Leaf category slugs

Full list in `LISTING_BROWSE_SLUGS` inside `category-tree.ts` (~30 leaves).

Legacy slug mapping handled by `normalizeCategoryId()` and SQL migration `20250629120000_marketplace_category_slugs.sql`.
