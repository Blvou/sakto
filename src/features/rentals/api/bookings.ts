import { supabase } from '@/src/lib/supabase';
import type { CreateBookingInput, UpdateBookingStatusInput } from '../schemas';
import type { BookingItem, BookingRow, VehiclePhotoRow, VehicleRow } from '../types';

const SERVICE_FEE = 50;

type BookingJoinRow = BookingRow & {
  vehicle: Pick<VehicleRow, 'id' | 'title' | 'price_per_day' | 'location'> & {
    photos: Pick<VehiclePhotoRow, 'storage_path' | 'sort_order'>[];
  };
  owner?: { id: string; display_name: string; avatar_url: string | null };
  renter?: { id: string; display_name: string; avatar_url: string | null };
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapBooking(row: BookingJoinRow): BookingItem {
  return {
    ...row,
    vehicle: {
      ...row.vehicle,
      photos: [...row.vehicle.photos].sort((a, b) => a.sort_order - b.sort_order),
    },
    owner: row.owner,
    renter: row.renter,
  };
}

export async function createBooking(
  renterId: string,
  input: CreateBookingInput
): Promise<string> {
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, owner_id, price_per_day, status')
    .eq('id', input.vehicleId)
    .eq('status', 'active')
    .maybeSingle();

  if (vehicleError) throw vehicleError;
  if (!vehicle) throw new Error('Vehicle is not available');
  if (vehicle.owner_id === renterId) throw new Error('You cannot book your own bike');

  const startDate = input.startDate;
  const endDate = toDateOnly(addDays(new Date(`${startDate}T00:00:00.000Z`), input.days - 1));

  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('id')
    .eq('vehicle_id', input.vehicleId)
    .in('status', ['pending', 'confirmed'])
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .limit(1);

  if (conflictError) throw conflictError;
  if ((conflicts ?? []).length > 0) {
    throw new Error('This bike already has a request for those dates');
  }

  const pricePerDay = Number(vehicle.price_per_day);
  const totalAmount = pricePerDay * input.days + SERVICE_FEE;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      vehicle_id: input.vehicleId,
      renter_id: renterId,
      owner_id: vehicle.owner_id,
      start_date: startDate,
      end_date: endDate,
      days: input.days,
      price_per_day: pricePerDay,
      service_fee: SERVICE_FEE,
      total_amount: totalAmount,
      status: 'pending',
      message: input.message || null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function fetchRenterBookings(renterId: string): Promise<BookingItem[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      vehicle_id,
      renter_id,
      owner_id,
      start_date,
      end_date,
      days,
      price_per_day,
      service_fee,
      total_amount,
      status,
      message,
      created_at,
      updated_at,
      vehicle:vehicles!vehicle_id (
        id,
        title,
        price_per_day,
        location,
        photos:vehicle_photos ( storage_path, sort_order )
      ),
      owner:profiles!owner_id ( id, display_name, avatar_url )
    `
    )
    .eq('renter_id', renterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as BookingJoinRow[]).map(mapBooking);
}

export async function fetchOwnerBookings(ownerId: string): Promise<BookingItem[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      vehicle_id,
      renter_id,
      owner_id,
      start_date,
      end_date,
      days,
      price_per_day,
      service_fee,
      total_amount,
      status,
      message,
      created_at,
      updated_at,
      vehicle:vehicles!vehicle_id (
        id,
        title,
        price_per_day,
        location,
        photos:vehicle_photos ( storage_path, sort_order )
      ),
      renter:profiles!renter_id ( id, display_name, avatar_url )
    `
    )
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as BookingJoinRow[]).map(mapBooking);
}

export async function updateBookingStatus(
  userId: string,
  input: UpdateBookingStatusInput
): Promise<void> {
  let query = supabase
    .from('bookings')
    .update({ status: input.status })
    .eq('id', input.bookingId);

  if (input.status === 'cancelled') {
    query = query.eq('renter_id', userId);
  } else {
    query = query.eq('owner_id', userId);
  }

  const { error } = await query;
  if (error) throw error;
}
