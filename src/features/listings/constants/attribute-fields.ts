export interface ListingAttributeFieldDef {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric';
}

const CONDITION_FIELD: ListingAttributeFieldDef = {
  key: 'condition',
  label: 'Condition',
  placeholder: 'e.g. New, Used — good, For parts',
  required: true,
};

const VEHICLE_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  { key: 'brand', label: 'Brand', placeholder: 'e.g. Toyota, Honda', required: true },
  { key: 'model', label: 'Model', placeholder: 'e.g. Vios, Civic', required: true },
  { key: 'year', label: 'Year', placeholder: 'e.g. 2019', keyboardType: 'numeric' },
  { key: 'mileage', label: 'Mileage', placeholder: 'e.g. 45,000 km' },
  { key: 'transmission', label: 'Transmission', placeholder: 'e.g. Automatic, Manual' },
  { key: 'fuel_type', label: 'Fuel type', placeholder: 'e.g. Gasoline, Diesel, Hybrid' },
];

/** Per-category attribute fields shown on publish/edit and detail specs. */
export const CATEGORY_ATTRIBUTE_FIELDS: Record<string, ListingAttributeFieldDef[]> = {
  electronics: [
    CONDITION_FIELD,
    { key: 'brand', label: 'Brand', placeholder: 'e.g. Apple, Samsung', required: true },
    { key: 'model', label: 'Model', placeholder: 'e.g. iPhone 13 Pro, Galaxy A54', required: true },
    { key: 'storage', label: 'Storage', placeholder: 'e.g. 128 GB' },
    { key: 'color', label: 'Color', placeholder: 'e.g. Space Gray' },
    { key: 'network', label: 'Network', placeholder: 'e.g. 5G, LTE, Wi‑Fi only' },
  ],
  clothing: [
    CONDITION_FIELD,
    { key: 'brand', label: 'Brand', placeholder: 'e.g. Nike, Uniqlo' },
    { key: 'size', label: 'Size', placeholder: 'e.g. M, 42, 28', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Black, Navy' },
    { key: 'material', label: 'Material', placeholder: 'e.g. Cotton, Denim, Polyester' },
    { key: 'gender', label: 'Gender', placeholder: 'e.g. Men, Women, Unisex' },
  ],
  home: [
    CONDITION_FIELD,
    { key: 'brand', label: 'Brand', placeholder: 'e.g. IKEA, Mandaue Foam' },
    { key: 'material', label: 'Material', placeholder: 'e.g. Wood, Metal, Fabric' },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 120 x 60 x 75 cm' },
    { key: 'color', label: 'Color', placeholder: 'e.g. White, Walnut' },
  ],
  games: [
    CONDITION_FIELD,
    { key: 'platform', label: 'Platform', placeholder: 'e.g. PS5, Xbox, Nintendo Switch', required: true },
    { key: 'brand', label: 'Publisher', placeholder: 'e.g. Sony, Nintendo, EA' },
    { key: 'model', label: 'Title', placeholder: 'e.g. DualSense, Elden Ring' },
    { key: 'edition', label: 'Edition', placeholder: 'e.g. Standard, Deluxe, Collector’s' },
  ],
  auto: VEHICLE_FIELDS,
  'auto-buy': VEHICLE_FIELDS,
  'moto-buy': [
    CONDITION_FIELD,
    { key: 'brand', label: 'Brand', placeholder: 'e.g. Honda, Yamaha', required: true },
    { key: 'model', label: 'Model', placeholder: 'e.g. Click 125i, NMAX', required: true },
    { key: 'year', label: 'Year', placeholder: 'e.g. 2022', keyboardType: 'numeric' },
    { key: 'mileage', label: 'Mileage', placeholder: 'e.g. 8,000 km' },
    { key: 'engine_cc', label: 'Engine', placeholder: 'e.g. 155 cc' },
  ],
  parts: [
    CONDITION_FIELD,
    { key: 'part_type', label: 'Part type', placeholder: 'e.g. Tires, Battery, Headlight', required: true },
    { key: 'brand', label: 'Brand', placeholder: 'e.g. Bosch, Bridgestone' },
    { key: 'compatible_with', label: 'Compatible with', placeholder: 'e.g. Toyota Vios 2018–2022' },
    { key: 'part_number', label: 'Part number', placeholder: 'e.g. OEM or aftermarket code' },
  ],
  'real-estate': [
    {
      key: 'property_type',
      label: 'Property type',
      placeholder: 'e.g. Condo, House, Lot, Commercial',
      required: true,
    },
    { key: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g. 2', keyboardType: 'numeric' },
    { key: 'bathrooms', label: 'Bathrooms', placeholder: 'e.g. 1', keyboardType: 'numeric' },
    { key: 'area', label: 'Floor area', placeholder: 'e.g. 45 sqm', required: true },
    { key: 'furnishing', label: 'Furnishing', placeholder: 'e.g. Fully furnished, Semi, Unfurnished' },
    { key: 'parking', label: 'Parking', placeholder: 'e.g. 1 slot, Street parking' },
  ],
  services: [
    {
      key: 'service_type',
      label: 'Service type',
      placeholder: 'e.g. Plumbing, Cleaning, Tutoring',
      required: true,
    },
    { key: 'availability', label: 'Availability', placeholder: 'e.g. Weekdays, On call' },
    { key: 'experience', label: 'Experience', placeholder: 'e.g. 5 years' },
    { key: 'service_area', label: 'Service area', placeholder: 'e.g. Metro Manila, Cebu City' },
  ],
  jobs: [
    { key: 'job_title', label: 'Job title', placeholder: 'e.g. Sales Associate, Driver', required: true },
    {
      key: 'employment_type',
      label: 'Employment type',
      placeholder: 'e.g. Full-time, Part-time, Contract',
      required: true,
    },
    { key: 'salary_range', label: 'Salary range', placeholder: 'e.g. ₱18,000–₱22,000/month' },
    { key: 'experience_required', label: 'Experience required', placeholder: 'e.g. 1 year, Fresh grad OK' },
    { key: 'remote', label: 'Work setup', placeholder: 'e.g. On-site, Hybrid, Remote' },
  ],
};

export const DEFAULT_ATTRIBUTE_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  { key: 'brand', label: 'Brand', placeholder: 'e.g. Brand name' },
  { key: 'model', label: 'Model', placeholder: 'e.g. Model or variant' },
];

const ALL_FIELD_DEFS = new Map<string, ListingAttributeFieldDef>();

for (const fields of Object.values(CATEGORY_ATTRIBUTE_FIELDS)) {
  for (const field of fields) {
    ALL_FIELD_DEFS.set(field.key, field);
  }
}
for (const field of DEFAULT_ATTRIBUTE_FIELDS) {
  if (!ALL_FIELD_DEFS.has(field.key)) {
    ALL_FIELD_DEFS.set(field.key, field);
  }
}

export function getAttributeFieldsForCategory(categoryId: string | null | undefined): ListingAttributeFieldDef[] {
  if (!categoryId || categoryId === 'marketplace' || categoryId === 'more' || categoryId === 'scooters') {
    return DEFAULT_ATTRIBUTE_FIELDS;
  }
  return CATEGORY_ATTRIBUTE_FIELDS[categoryId] ?? DEFAULT_ATTRIBUTE_FIELDS;
}

export function getAttributeFieldLabel(key: string, categoryId?: string | null): string {
  const categoryFields = getAttributeFieldsForCategory(categoryId);
  const fromCategory = categoryFields.find((field) => field.key === key);
  if (fromCategory) return fromCategory.label;

  const fromAll = ALL_FIELD_DEFS.get(key);
  if (fromAll) return fromAll.label;

  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function pruneAttributesForCategory(
  attributes: Record<string, string>,
  categoryId: string | null | undefined
): Record<string, string> {
  const allowedKeys = new Set(getAttributeFieldsForCategory(categoryId).map((field) => field.key));
  return Object.fromEntries(Object.entries(attributes).filter(([key]) => allowedKeys.has(key)));
}

export function getCategoryAttributesValidationError(
  categoryId: string | null | undefined,
  attributes: Record<string, string> | undefined
): string | null {
  const values = attributes ?? {};
  for (const field of getAttributeFieldsForCategory(categoryId)) {
    if (field.required && !values[field.key]?.trim()) {
      return `${field.label} is required`;
    }
  }
  return null;
}

/** @deprecated Use getAttributeFieldsForCategory instead. */
export const LISTING_ATTRIBUTE_FIELDS = DEFAULT_ATTRIBUTE_FIELDS;
