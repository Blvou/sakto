# Marketplace attribute catalog

Per-category fields for publish, detail specs, and filters.  
Types: `text` | `number` | `select`. Select fields with `filterable: true` appear in browse filters.

## Shared

| Key | Label | Type | Required | Filterable | Options |
|-----|-------|------|----------|------------|---------|
| condition | Condition | select | yes | yes | New, Used — like new, Used — good, Used — fair, For parts |

## electronics

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| brand | text | yes | no | — |
| model | text | yes | no | — |
| storage | select | no | yes | 32 GB, 64 GB, 128 GB, 256 GB, 512 GB, 1 TB |
| color | text | no | no | — |
| network | select | no | yes | 5G, LTE, Wi‑Fi only |

## clothing

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| brand | text | no | no | — |
| size | select | yes | yes | XS, S, M, L, XL, XXL, 28, 30, 32, 34, 36, 38, 40, 42 |
| color | text | no | no | — |
| material | select | no | yes | Cotton, Denim, Polyester, Leather, Wool, Mixed |
| gender | select | no | yes | Men, Women, Unisex, Kids |

## home

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| brand | text | no | no | — |
| material | select | no | yes | Wood, Metal, Fabric, Plastic, Glass, Mixed |
| dimensions | text | no | no | — |
| color | text | no | no | — |

## games

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| platform | select | yes | yes | PS5, PS4, Xbox Series, Xbox One, Nintendo Switch, PC |
| brand | text | no | no | — |
| model | text | no | no | — |
| edition | select | no | yes | Standard, Deluxe, Collector's |

## auto / auto-buy

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| condition | select | yes | yes | (shared) |
| brand | text | yes | no | — |
| model | text | yes | no | — |
| year | number | no | no | — |
| mileage | text | no | no | — |
| transmission | select | no | yes | Automatic, Manual, CVT |
| fuel_type | select | no | yes | Gasoline, Diesel, Hybrid, Electric |

## moto-buy

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| condition | select | yes | yes | (shared) |
| brand | text | yes | no | — |
| model | text | yes | no | — |
| year | number | no | no | — |
| mileage | text | no | no | — |
| engine_cc | text | no | no | — |

## parts

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| condition | select | yes | yes | (shared) |
| part_type | select | yes | yes | Tires, Battery, Headlight, Engine, Body, Electronics, Other |
| brand | text | no | no | — |
| compatible_with | text | no | no | — |
| part_number | text | no | no | — |

## real-estate

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| listing_type | select | yes | yes | For rent, For sale |
| property_type | select | yes | yes | Condo, House, Apartment, Lot, Commercial, Townhouse |
| bedrooms | select | no | yes | Studio, 1, 2, 3, 4+ |
| bathrooms | select | no | yes | 1, 2, 3+ |
| area | text | yes | no | — |
| furnishing | select | no | yes | Fully furnished, Semi-furnished, Unfurnished |
| parking | text | no | no | — |

## services

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| service_type | select | yes | yes | Plumbing, Cleaning, Tutoring, Repair, Delivery, Beauty, Other |
| availability | select | no | yes | Weekdays, Weekends, On call, By appointment |
| experience | text | no | no | — |
| service_area | text | no | no | — |

## jobs

| Key | Type | Required | Filterable | Options |
|-----|------|----------|------------|---------|
| job_title | text | yes | no | — |
| employment_type | select | yes | yes | Full-time, Part-time, Contract, Freelance, Internship |
| salary_range | text | no | no | — |
| experience_required | text | no | no | — |
| remote | select | no | yes | On-site, Hybrid, Remote |

## Default (marketplace / more)

| Key | Type | Required | Filterable |
|-----|------|----------|------------|
| condition | select | yes | yes |
| brand | text | no | no |
| model | text | no | no |
