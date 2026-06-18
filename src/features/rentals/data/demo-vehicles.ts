export type DemoVehicleImageKey = 's1' | 's2' | 's3';
export type VehicleFuelType = 'gasoline' | 'electric';
export type VehicleTransmission = 'automatic' | 'manual';

export interface DemoVehicle {
  mockId: string;
  supabaseId: string;
  title: string;
  model: string;
  brand: string;
  description: string;
  year: number;
  pricePerDay: number;
  location: string;
  city: string;
  lat: number;
  lng: number;
  instant: boolean;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  imageKey: DemoVehicleImageKey;
  fuelType: VehicleFuelType;
  engineCc: number;
  transmission: VehicleTransmission;
}

/** Curated demo fleet for Manila — used by mock catalog and Supabase seed script. */
export const DEMO_VEHICLES: DemoVehicle[] = [
  {
    mockId: 's1',
    supabaseId: 'b0000000-0000-4000-8000-000000000001',
    title: 'Honda Beat 2022',
    model: 'Beat',
    brand: 'Honda',
    description:
      'Well-maintained Honda Beat for daily city rides around Manila. Helmet included on request.',
    year: 2022,
    pricePerDay: 350,
    location: 'Ermita, Manila',
    city: 'Manila',
    lat: 14.5784,
    lng: 120.9832,
    instant: true,
    rating: 4.8,
    reviewCount: 120,
    distanceKm: 1.2,
    imageKey: 's1',
    fuelType: 'gasoline',
    engineCc: 110,
    transmission: 'automatic',
  },
  {
    mockId: 's2',
    supabaseId: 'b0000000-0000-4000-8000-000000000002',
    title: 'Yamaha Mio i125',
    model: 'Mio i125',
    brand: 'Yamaha',
    description: 'Fuel-efficient Yamaha Mio for short commutes and errands in Metro Manila.',
    year: 2021,
    pricePerDay: 300,
    location: 'Malate, Manila',
    city: 'Manila',
    lat: 14.5635,
    lng: 120.9985,
    instant: true,
    rating: 4.6,
    reviewCount: 89,
    distanceKm: 0.8,
    imageKey: 's2',
    fuelType: 'gasoline',
    engineCc: 125,
    transmission: 'automatic',
  },
  {
    mockId: 's3',
    supabaseId: 'b0000000-0000-4000-8000-000000000003',
    title: 'Honda Click 160',
    model: 'Click 160',
    brand: 'Honda',
    description:
      'Comfortable Honda Click with enough power for longer rides. Great for tourists and locals.',
    year: 2023,
    pricePerDay: 400,
    location: 'Makati, Metro Manila',
    city: 'Makati',
    lat: 14.5547,
    lng: 121.0244,
    instant: false,
    rating: 4.9,
    reviewCount: 203,
    distanceKm: 2.1,
    imageKey: 's3',
    fuelType: 'gasoline',
    engineCc: 160,
    transmission: 'automatic',
  },
  {
    mockId: 's4',
    supabaseId: 'b0000000-0000-4000-8000-000000000004',
    title: 'Suzuki Smash 115',
    model: 'Smash 115',
    brand: 'Suzuki',
    description: 'Budget-friendly manual scooter — ideal for students and quick errands around BGC.',
    year: 2020,
    pricePerDay: 280,
    location: 'BGC, Taguig',
    city: 'Taguig',
    lat: 14.5515,
    lng: 121.047,
    instant: true,
    rating: 4.5,
    reviewCount: 64,
    distanceKm: 3.4,
    imageKey: 's1',
    fuelType: 'gasoline',
    engineCc: 115,
    transmission: 'manual',
  },
  {
    mockId: 's5',
    supabaseId: 'b0000000-0000-4000-8000-000000000005',
    title: 'Honda PCX 160 Electric',
    model: 'PCX Electric',
    brand: 'Honda',
    description: 'Quiet electric scooter for eco-friendly rides. Charger adapter included.',
    year: 2024,
    pricePerDay: 550,
    location: 'Quezon City',
    city: 'Quezon City',
    lat: 14.676,
    lng: 121.0437,
    instant: false,
    rating: 4.7,
    reviewCount: 41,
    distanceKm: 5.2,
    imageKey: 's2',
    fuelType: 'electric',
    engineCc: 0,
    transmission: 'automatic',
  },
  {
    mockId: 's6',
    supabaseId: 'b0000000-0000-4000-8000-000000000006',
    title: 'Yamaha NMAX 155',
    model: 'NMAX 155',
    brand: 'Yamaha',
    description: 'Premium maxi-scooter with storage under seat. Popular for airport and mall runs.',
    year: 2023,
    pricePerDay: 500,
    location: 'Pasay, Metro Manila',
    city: 'Pasay',
    lat: 14.5378,
    lng: 120.9986,
    instant: true,
    rating: 4.8,
    reviewCount: 156,
    distanceKm: 1.9,
    imageKey: 's3',
    fuelType: 'gasoline',
    engineCc: 155,
    transmission: 'automatic',
  },
];

export const DEMO_VEHICLE_IMAGES: Record<DemoVehicleImageKey, number> = {
  s1: require('../../../../assets/scooters/s1.png'),
  s2: require('../../../../assets/scooters/s2.png'),
  s3: require('../../../../assets/scooters/s3.png'),
};

/** Stable HTTPS URLs for demo fleet when served from Supabase (web + native). */
export const DEMO_VEHICLE_REMOTE_URLS: Record<DemoVehicleImageKey, string> = {
  s1: 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s1.png',
  s2: 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s2.png',
  s3: 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s3.png',
};

export const DEMO_VEHICLE_SUPABASE_IMAGE_KEY: Record<string, DemoVehicleImageKey> = {
  'b0000000-0000-4000-8000-000000000001': 's1',
  'b0000000-0000-4000-8000-000000000002': 's2',
  'b0000000-0000-4000-8000-000000000003': 's3',
  'b0000000-0000-4000-8000-000000000004': 's1',
  'b0000000-0000-4000-8000-000000000005': 's2',
  'b0000000-0000-4000-8000-000000000006': 's3',
};
