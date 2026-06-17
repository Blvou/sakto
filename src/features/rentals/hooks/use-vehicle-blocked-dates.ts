import { useQuery } from '@tanstack/react-query';
import { fetchVehicleBlockedDates } from '../api/vehicles';
import { rentalQueryKeys } from '../types';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function useVehicleBlockedDates(vehicleId: string | undefined, horizonDays = 30) {
  const from = toDateOnly(new Date());
  const to = toDateOnly(addDays(new Date(), horizonDays - 1));

  return useQuery({
    queryKey: rentalQueryKeys.vehicleBlockedDates(vehicleId ?? '', from, to),
    queryFn: () => fetchVehicleBlockedDates(vehicleId!, from, to),
    enabled: !!vehicleId,
    staleTime: 60_000,
  });
}
