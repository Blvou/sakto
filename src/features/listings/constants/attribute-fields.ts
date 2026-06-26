import {
  AVAILABILITY_OPTIONS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  CLOTHING_SIZE_OPTIONS,
  CONDITION_OPTIONS,
  EDITION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  FURNISHING_OPTIONS,
  GENDER_OPTIONS,
  HOME_MATERIAL_OPTIONS,
  LISTING_TYPE_OPTIONS,
  MATERIAL_OPTIONS,
  NETWORK_OPTIONS,
  PART_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  REMOTE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  STORAGE_OPTIONS,
  TRANSMISSION_OPTIONS,
} from './attribute-options';

export type AttributeFieldType = 'text' | 'number' | 'select';

export interface ListingAttributeFieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: AttributeFieldType;
  options?: readonly string[];
  filterable?: boolean;
  required?: boolean;
  keyboardType?: 'default' | 'numeric';
}

function selectField(
  key: string,
  label: string,
  options: readonly string[],
  opts: { required?: boolean; filterable?: boolean; placeholder?: string } = {}
): ListingAttributeFieldDef {
  return {
    key,
    label,
    type: 'select',
    options: [...options],
    placeholder: opts.placeholder ?? `Select ${label.toLowerCase()}`,
    required: opts.required,
    filterable: opts.filterable ?? true,
  };
}

function textField(
  key: string,
  label: string,
  placeholder: string,
  opts: { required?: boolean; keyboardType?: 'default' | 'numeric' } = {}
): ListingAttributeFieldDef {
  return {
    key,
    label,
    type: 'text',
    placeholder,
    required: opts.required,
    keyboardType: opts.keyboardType,
    filterable: false,
  };
}

function numberField(
  key: string,
  label: string,
  placeholder: string,
  opts: { required?: boolean } = {}
): ListingAttributeFieldDef {
  return {
    key,
    label,
    type: 'number',
    placeholder,
    required: opts.required,
    keyboardType: 'numeric',
    filterable: false,
  };
}

const CONDITION_FIELD = selectField('condition', 'Condition', CONDITION_OPTIONS, {
  required: true,
  filterable: true,
});

const VEHICLE_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  textField('brand', 'Brand', 'e.g. Toyota, Honda', { required: true }),
  textField('model', 'Model', 'e.g. Vios, Civic', { required: true }),
  numberField('year', 'Year', 'e.g. 2019'),
  textField('mileage', 'Mileage', 'e.g. 45,000 km'),
  selectField('transmission', 'Transmission', TRANSMISSION_OPTIONS, { filterable: true }),
  selectField('fuel_type', 'Fuel type', FUEL_TYPE_OPTIONS, { filterable: true }),
];

/** Per-category attribute fields shown on publish/edit, detail specs, and filters. */
export const CATEGORY_ATTRIBUTE_FIELDS: Record<string, ListingAttributeFieldDef[]> = {
  electronics: [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Apple, Samsung', { required: true }),
    textField('model', 'Model', 'e.g. iPhone 13 Pro, Galaxy A54', { required: true }),
    selectField('storage', 'Storage', STORAGE_OPTIONS, { filterable: true }),
    textField('color', 'Color', 'e.g. Space Gray'),
    selectField('network', 'Network', NETWORK_OPTIONS, { filterable: true }),
  ],
  clothing: [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Nike, Uniqlo'),
    selectField('size', 'Size', CLOTHING_SIZE_OPTIONS, { required: true, filterable: true }),
    textField('color', 'Color', 'e.g. Black, Navy'),
    selectField('material', 'Material', MATERIAL_OPTIONS, { filterable: true }),
    selectField('gender', 'Gender', GENDER_OPTIONS, { filterable: true }),
  ],
  home: [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. IKEA, Mandaue Foam'),
    selectField('material', 'Material', HOME_MATERIAL_OPTIONS, { filterable: true }),
    textField('dimensions', 'Dimensions', 'e.g. 120 x 60 x 75 cm'),
    textField('color', 'Color', 'e.g. White, Walnut'),
  ],
  games: [
    CONDITION_FIELD,
    selectField('platform', 'Platform', PLATFORM_OPTIONS, { required: true, filterable: true }),
    textField('brand', 'Publisher', 'e.g. Sony, Nintendo, EA'),
    textField('model', 'Title', 'e.g. DualSense, Elden Ring'),
    selectField('edition', 'Edition', EDITION_OPTIONS, { filterable: true }),
  ],
  auto: VEHICLE_FIELDS,
  'auto-buy': VEHICLE_FIELDS,
  'moto-buy': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Honda, Yamaha', { required: true }),
    textField('model', 'Model', 'e.g. Click 125i, NMAX', { required: true }),
    numberField('year', 'Year', 'e.g. 2022'),
    textField('mileage', 'Mileage', 'e.g. 8,000 km'),
    textField('engine_cc', 'Engine', 'e.g. 155 cc'),
  ],
  parts: [
    CONDITION_FIELD,
    selectField('part_type', 'Part type', PART_TYPE_OPTIONS, { required: true, filterable: true }),
    textField('brand', 'Brand', 'e.g. Bosch, Bridgestone'),
    textField('compatible_with', 'Compatible with', 'e.g. Toyota Vios 2018–2022'),
    textField('part_number', 'Part number', 'e.g. OEM or aftermarket code'),
  ],
  'real-estate': [
    selectField('listing_type', 'Listing type', LISTING_TYPE_OPTIONS, {
      required: true,
      filterable: true,
    }),
    selectField('property_type', 'Property type', PROPERTY_TYPE_OPTIONS, {
      required: true,
      filterable: true,
    }),
    selectField('bedrooms', 'Bedrooms', BEDROOM_OPTIONS, { filterable: true }),
    selectField('bathrooms', 'Bathrooms', BATHROOM_OPTIONS, { filterable: true }),
    textField('area', 'Floor area', 'e.g. 45 sqm', { required: true }),
    selectField('furnishing', 'Furnishing', FURNISHING_OPTIONS, { filterable: true }),
    textField('parking', 'Parking', 'e.g. 1 slot, Street parking'),
  ],
  services: [
    selectField('service_type', 'Service type', SERVICE_TYPE_OPTIONS, {
      required: true,
      filterable: true,
    }),
    selectField('availability', 'Availability', AVAILABILITY_OPTIONS, { filterable: true }),
    textField('experience', 'Experience', 'e.g. 5 years'),
    textField('service_area', 'Service area', 'e.g. Metro Manila, Cebu City'),
  ],
  jobs: [
    textField('job_title', 'Job title', 'e.g. Sales Associate, Driver', { required: true }),
    selectField('employment_type', 'Employment type', EMPLOYMENT_TYPE_OPTIONS, {
      required: true,
      filterable: true,
    }),
    textField('salary_range', 'Salary range', 'e.g. ₱18,000–₱22,000/month'),
    textField('experience_required', 'Experience required', 'e.g. 1 year, Fresh grad OK'),
    selectField('remote', 'Work setup', REMOTE_OPTIONS, { filterable: true }),
  ],
};

export const DEFAULT_ATTRIBUTE_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  textField('brand', 'Brand', 'e.g. Brand name'),
  textField('model', 'Model', 'e.g. Model or variant'),
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

export function getAttributeFieldsForCategory(
  categoryId: string | null | undefined
): ListingAttributeFieldDef[] {
  if (!categoryId || categoryId === 'marketplace' || categoryId === 'more' || categoryId === 'scooters') {
    return DEFAULT_ATTRIBUTE_FIELDS;
  }
  return CATEGORY_ATTRIBUTE_FIELDS[categoryId] ?? DEFAULT_ATTRIBUTE_FIELDS;
}

export function getFilterableFieldsForCategory(
  categoryId: string | null | undefined
): ListingAttributeFieldDef[] {
  return getAttributeFieldsForCategory(categoryId).filter(
    (field) => field.filterable && field.type === 'select' && field.options?.length
  );
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

export function isValidSelectValue(field: ListingAttributeFieldDef, value: string): boolean {
  if (field.type !== 'select' || !field.options?.length) return true;
  return field.options.includes(value);
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
    const raw = values[field.key]?.trim();
    if (field.required && !raw) {
      return `${field.label} is required`;
    }
    if (raw && field.type === 'select' && !isValidSelectValue(field, raw)) {
      return `${field.label} must be one of the allowed options`;
    }
  }
  return null;
}

/** @deprecated Use getAttributeFieldsForCategory instead. */
export const LISTING_ATTRIBUTE_FIELDS = DEFAULT_ATTRIBUTE_FIELDS;
