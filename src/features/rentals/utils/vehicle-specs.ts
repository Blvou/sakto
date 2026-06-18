export type VehicleFuelType = 'gasoline' | 'electric';
export type VehicleTransmission = 'automatic' | 'manual';

export interface VehicleSpecItem {
  label: string;
  value: string;
}

export interface VehicleSpecsSource {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  title?: string | null;
  instant?: boolean;
  fuelType?: VehicleFuelType | null;
  engineCc?: number | null;
  transmission?: VehicleTransmission | null;
  city?: string | null;
}

function inferFuelType(title?: string | null, fuelType?: VehicleFuelType | null): VehicleFuelType {
  if (fuelType) return fuelType;
  if (title?.toLowerCase().includes('electric')) return 'electric';
  return 'gasoline';
}

export function resolveVehicleSpecs(source: VehicleSpecsSource): VehicleSpecItem[] {
  const fuel = inferFuelType(source.title, source.fuelType);
  const transmission =
    source.transmission ?? (source.title?.toLowerCase().includes('manual') ? 'manual' : 'automatic');

  const specs: VehicleSpecItem[] = [
    { label: 'Brand', value: source.brand ?? '—' },
    { label: 'Model', value: source.model ?? '—' },
    { label: 'Year', value: source.year ? String(source.year) : '—' },
    { label: 'Engine', value: fuel === 'electric' ? 'Electric motor' : `${source.engineCc ?? 125} cc` },
    { label: 'Fuel', value: fuel === 'electric' ? 'Electric' : 'Gasoline' },
    { label: 'Transmission', value: transmission === 'manual' ? 'Manual' : 'Automatic (CVT)' },
    { label: 'Booking', value: source.instant ? 'Instant confirm' : 'Host approval' },
  ];

  if (source.city) {
    specs.push({ label: 'City', value: source.city });
  }

  return specs;
}
