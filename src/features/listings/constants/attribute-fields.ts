import { getAttributeSchemaKey } from './category-tree';
import {
  AVAILABILITY_OPTIONS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  BODY_TYPE_OPTIONS,
  CLOTHING_SIZE_OPTIONS,
  CONDITION_OPTIONS,
  EDITION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  FURNISHING_OPTIONS,
  HOME_MATERIAL_OPTIONS,
  MATERIAL_OPTIONS,
  NETWORK_OPTIONS,
  PART_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  REMOTE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  STORAGE_OPTIONS,
  TRANSMISSION_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from './attribute-options';

export type AttributeFieldType = 'text' | 'number' | 'select';
export type FilterUI = 'select' | 'range' | 'multi';
export type FilterGroup = 'price' | 'details' | 'location';

export interface ListingAttributeFieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: AttributeFieldType;
  options?: readonly string[];
  filterable?: boolean;
  filterUI?: FilterUI;
  filterPriority?: number;
  filterGroup?: FilterGroup;
  required?: boolean;
  keyboardType?: 'default' | 'numeric';
}

interface FieldOpts {
  required?: boolean;
  filterable?: boolean;
  filterUI?: FilterUI;
  filterPriority?: number;
  filterGroup?: FilterGroup;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}

function selectField(
  key: string,
  label: string,
  options: readonly string[],
  opts: FieldOpts = {}
): ListingAttributeFieldDef {
  return {
    key,
    label,
    type: 'select',
    options: [...options],
    placeholder: opts.placeholder ?? `Select ${label.toLowerCase()}`,
    required: opts.required,
    filterable: opts.filterable ?? true,
    filterUI: opts.filterUI ?? 'select',
    filterPriority: opts.filterPriority,
    filterGroup: opts.filterGroup ?? 'details',
  };
}

function textField(
  key: string,
  label: string,
  placeholder: string,
  opts: FieldOpts = {}
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
  opts: FieldOpts = {}
): ListingAttributeFieldDef {
  return {
    key,
    label,
    type: 'number',
    placeholder,
    required: opts.required,
    keyboardType: 'numeric',
    filterable: opts.filterable ?? false,
    filterUI: opts.filterable ? (opts.filterUI ?? 'range') : undefined,
    filterPriority: opts.filterPriority,
    filterGroup: opts.filterGroup ?? 'details',
  };
}

const CONDITION_FIELD = selectField('condition', 'Condition', CONDITION_OPTIONS, {
  required: true,
  filterable: true,
  filterPriority: 1,
});

const AUTO_BUY_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  textField('brand', 'Brand', 'e.g. Toyota, Honda', { required: true }),
  textField('model', 'Model', 'e.g. Vios, Civic', { required: true }),
  numberField('year', 'Year', 'e.g. 2019', { filterable: true, filterPriority: 4 }),
  numberField('mileage', 'Mileage (km)', 'e.g. 45000', { filterable: true, filterPriority: 5 }),
  selectField('transmission', 'Transmission', TRANSMISSION_OPTIONS, {
    filterable: true,
    filterPriority: 2,
  }),
  selectField('fuel_type', 'Fuel type', FUEL_TYPE_OPTIONS, {
    filterable: true,
    filterPriority: 3,
  }),
  selectField('body_type', 'Body type', BODY_TYPE_OPTIONS, { filterable: true }),
  selectField('color', 'Color', VEHICLE_COLOR_OPTIONS, { filterable: true }),
];

const MOTO_BUY_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  textField('brand', 'Brand', 'e.g. Honda, Yamaha', { required: true }),
  textField('model', 'Model', 'e.g. Click 125i, NMAX', { required: true }),
  numberField('year', 'Year', 'e.g. 2022', { filterable: true, filterPriority: 3 }),
  numberField('mileage', 'Mileage (km)', 'e.g. 8000', { filterable: true, filterPriority: 4 }),
  textField('engine_cc', 'Engine', 'e.g. 155 cc'),
  selectField('transmission', 'Transmission', TRANSMISSION_OPTIONS, {
    filterable: true,
    filterPriority: 2,
  }),
  selectField('color', 'Color', VEHICLE_COLOR_OPTIONS, { filterable: true }),
];

const PARTS_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  selectField('part_type', 'Part type', PART_TYPE_OPTIONS, {
    required: true,
    filterable: true,
    filterPriority: 1,
  }),
  textField('brand', 'Brand', 'e.g. Bosch, Bridgestone'),
  textField('compatible_with', 'Compatible with', 'e.g. Toyota Vios 2018–2022'),
  textField('part_number', 'Part number', 'e.g. OEM or aftermarket code'),
];

const REAL_ESTATE_BASE: ListingAttributeFieldDef[] = [
  selectField('property_type', 'Property type', PROPERTY_TYPE_OPTIONS, {
    required: true,
    filterable: true,
    filterPriority: 1,
  }),
  selectField('bedrooms', 'Bedrooms', BEDROOM_OPTIONS, {
    filterable: true,
    filterPriority: 2,
  }),
  selectField('bathrooms', 'Bathrooms', BATHROOM_OPTIONS, { filterable: true, filterPriority: 3 }),
  textField('area', 'Floor area', 'e.g. 45 sqm', { required: true }),
  textField('parking', 'Parking', 'e.g. 1 slot, Street parking'),
];

const REAL_ESTATE_RENT_FIELDS: ListingAttributeFieldDef[] = [
  ...REAL_ESTATE_BASE,
  selectField('furnishing', 'Furnishing', FURNISHING_OPTIONS, {
    filterable: true,
    filterPriority: 4,
  }),
];

const REAL_ESTATE_SALE_FIELDS: ListingAttributeFieldDef[] = [...REAL_ESTATE_BASE];

const ELECTRONICS_FIELDS: ListingAttributeFieldDef[] = [
  CONDITION_FIELD,
  textField('brand', 'Brand', 'e.g. Apple, Samsung', { required: true }),
  textField('model', 'Model', 'e.g. iPhone 13 Pro, Galaxy A54', { required: true }),
  selectField('storage', 'Storage', STORAGE_OPTIONS, { filterable: true, filterPriority: 2 }),
  textField('color', 'Color', 'e.g. Space Gray'),
  selectField('network', 'Network', NETWORK_OPTIONS, { filterable: true, filterPriority: 3 }),
];

function clothingFields(genderDefault?: string): ListingAttributeFieldDef[] {
  const fields: ListingAttributeFieldDef[] = [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Nike, Uniqlo'),
    selectField('size', 'Size', CLOTHING_SIZE_OPTIONS, {
      required: true,
      filterable: true,
      filterPriority: 2,
    }),
    textField('color', 'Color', 'e.g. Black, Navy'),
    selectField('material', 'Material', MATERIAL_OPTIONS, { filterable: true, filterPriority: 3 }),
  ];
  if (genderDefault) {
    fields.push(textField('gender', 'Gender', genderDefault, { required: false }));
  }
  return fields;
}

/** Attribute schemas keyed by attributeSchemaKey from category-tree. */
export const CATEGORY_ATTRIBUTE_FIELDS: Record<string, ListingAttributeFieldDef[]> = {
  default: [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Brand name'),
    textField('model', 'Model', 'e.g. Model or variant'),
  ],
  'moto-buy': MOTO_BUY_FIELDS,
  'auto-buy': AUTO_BUY_FIELDS,
  parts: PARTS_FIELDS,
  'real-estate-rent': REAL_ESTATE_RENT_FIELDS,
  'real-estate-sale': REAL_ESTATE_SALE_FIELDS,
  electronics: ELECTRONICS_FIELDS,
  'electronics-appliances': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Samsung, LG', { required: true }),
    textField('model', 'Model', 'e.g. Inverter AC 1.5HP', { required: true }),
    textField('power', 'Power / capacity', 'e.g. 1.5 HP, 7 kg'),
  ],
  'electronics-accessories': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Anker, Baseus'),
    textField('model', 'Model', 'e.g. USB-C cable 2m'),
    selectField('network', 'Network', NETWORK_OPTIONS, { filterable: true, filterPriority: 1 }),
  ],
  home: [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. IKEA, Mandaue Foam'),
    selectField('material', 'Material', HOME_MATERIAL_OPTIONS, {
      filterable: true,
      filterPriority: 1,
    }),
    textField('dimensions', 'Dimensions', 'e.g. 120 x 60 x 75 cm'),
    textField('color', 'Color', 'e.g. White, Walnut'),
  ],
  'home-appliances': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Panasonic, Sharp', { required: true }),
    textField('model', 'Model', 'e.g. 7 kg washing machine', { required: true }),
    textField('power', 'Power / capacity', 'e.g. 1200W'),
  ],
  'home-decor': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. IKEA'),
    selectField('material', 'Material', HOME_MATERIAL_OPTIONS, { filterable: true, filterPriority: 1 }),
    textField('color', 'Color', 'e.g. Beige, Gold'),
  ],
  'home-kitchen': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Tefal, Lock&Lock'),
    textField('material', 'Material', 'e.g. Stainless steel'),
    textField('dimensions', 'Dimensions', 'e.g. 28 cm pan'),
  ],
  'clothing-men': clothingFields('Men'),
  'clothing-women': clothingFields('Women'),
  'clothing-kids': clothingFields('Kids'),
  'clothing-shoes': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Nike, Adidas'),
    selectField('size', 'Size', CLOTHING_SIZE_OPTIONS, {
      required: true,
      filterable: true,
      filterPriority: 1,
    }),
    textField('color', 'Color', 'e.g. White/Red'),
    selectField('material', 'Material', MATERIAL_OPTIONS, { filterable: true, filterPriority: 2 }),
  ],
  games: [
    CONDITION_FIELD,
    selectField('platform', 'Platform', PLATFORM_OPTIONS, {
      required: true,
      filterable: true,
      filterPriority: 1,
    }),
    textField('brand', 'Publisher', 'e.g. Sony, Nintendo, EA'),
    textField('model', 'Title', 'e.g. DualSense, Elden Ring'),
    selectField('edition', 'Edition', EDITION_OPTIONS, { filterable: true, filterPriority: 2 }),
  ],
  'games-board': [
    CONDITION_FIELD,
    textField('brand', 'Publisher', 'e.g. Hasbro'),
    textField('model', 'Title', 'e.g. Monopoly, Catan', { required: true }),
    textField('players', 'Players', 'e.g. 2–6'),
  ],
  'hobbies-sports': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Wilson, Yonex'),
    textField('model', 'Item', 'e.g. Tennis racket', { required: true }),
    textField('size', 'Size', 'e.g. L, 27 inch'),
  ],
  'hobbies-music': [
    CONDITION_FIELD,
    textField('brand', 'Brand', 'e.g. Yamaha, Fender', { required: true }),
    textField('model', 'Model', 'e.g. FG800 acoustic guitar', { required: true }),
    textField('condition_notes', 'Condition notes', 'e.g. Includes case'),
  ],
  services: [
    selectField('service_type', 'Service type', SERVICE_TYPE_OPTIONS, {
      required: true,
      filterable: true,
      filterPriority: 1,
    }),
    selectField('availability', 'Availability', AVAILABILITY_OPTIONS, {
      filterable: true,
      filterPriority: 2,
    }),
    textField('experience', 'Experience', 'e.g. 5 years'),
    textField('service_area', 'Service area', 'e.g. Metro Manila, Cebu City'),
  ],
  jobs: [
    textField('job_title', 'Job title', 'e.g. Sales Associate, Driver', { required: true }),
    selectField('employment_type', 'Employment type', EMPLOYMENT_TYPE_OPTIONS, {
      required: true,
      filterable: true,
      filterPriority: 1,
    }),
    textField('salary_range', 'Salary range', 'e.g. ₱18,000–₱22,000/month'),
    textField('experience_required', 'Experience required', 'e.g. 1 year, Fresh grad OK'),
    selectField('remote', 'Work setup', REMOTE_OPTIONS, { filterable: true, filterPriority: 2 }),
  ],

  // Legacy schema keys (backward compat)
  auto: AUTO_BUY_FIELDS,
  clothing: clothingFields(),
  'real-estate': REAL_ESTATE_RENT_FIELDS,
};

export const DEFAULT_ATTRIBUTE_FIELDS = CATEGORY_ATTRIBUTE_FIELDS.default;

const ALL_FIELD_DEFS = new Map<string, ListingAttributeFieldDef>();

for (const fields of Object.values(CATEGORY_ATTRIBUTE_FIELDS)) {
  for (const field of fields) {
    ALL_FIELD_DEFS.set(field.key, field);
  }
}

export function getAttributeFieldsForCategory(
  categoryId: string | null | undefined
): ListingAttributeFieldDef[] {
  if (!categoryId || categoryId === 'marketplace' || categoryId === 'more' || categoryId === 'scooters') {
    return DEFAULT_ATTRIBUTE_FIELDS;
  }

  const schemaKey = getAttributeSchemaKey(categoryId);
  return CATEGORY_ATTRIBUTE_FIELDS[schemaKey] ?? DEFAULT_ATTRIBUTE_FIELDS;
}

export function getFilterableFieldsForCategory(
  categoryId: string | null | undefined
): ListingAttributeFieldDef[] {
  return getAttributeFieldsForCategory(categoryId).filter((field) => field.filterable);
}

export function getQuickFilterFieldsForCategory(
  categoryId: string | null | undefined,
  limit = 4
): ListingAttributeFieldDef[] {
  return getFilterableFieldsForCategory(categoryId)
    .filter((field) => field.filterUI === 'select' && field.options?.length)
    .sort((a, b) => (a.filterPriority ?? 99) - (b.filterPriority ?? 99))
    .slice(0, limit);
}

export function getRangeFilterFieldsForCategory(
  categoryId: string | null | undefined
): ListingAttributeFieldDef[] {
  return getFilterableFieldsForCategory(categoryId).filter(
    (field) => field.filterUI === 'range' && field.type === 'number'
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
