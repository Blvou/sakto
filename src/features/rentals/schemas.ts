import { z } from 'zod';

export const createVehicleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  brand: z.string().min(2, 'Brand is required').max(80),
  model: z.string().min(1, 'Model is required').max(80),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  pricePerDay: z.coerce.number().positive('Price per day must be greater than 0'),
  location: z.string().min(2, 'Location is required').max(120),
  city: z.string().min(2).max(80).optional().or(z.literal('')),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  instantBooking: z.boolean().default(false),
  photoPaths: z.array(z.string().min(1)).min(1, 'Add at least one photo').max(10),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const createVehicleMutationSchema = createVehicleSchema.omit({ photoPaths: true }).extend({
  photoUris: z.array(z.string().min(1)).min(1, 'Add at least one photo').max(10),
});

export type CreateVehicleMutationInput = z.infer<typeof createVehicleMutationSchema>;

export const createBookingSchema = z.object({
  vehicleId: z.uuid(),
  startDate: z.iso.date(),
  days: z.coerce.number().int().min(1).max(30),
  message: z.string().max(500).optional().or(z.literal('')),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  bookingId: z.uuid(),
  status: z.enum(['confirmed', 'declined', 'cancelled', 'completed']),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
