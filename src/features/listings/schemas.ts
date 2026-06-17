import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.coerce.number().positive('Price must be greater than 0'),
  location: z.string().min(2, 'Location is required').max(100),
  category: z.string().min(1).max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.extend({
  status: z.enum(['active', 'sold', 'archived']).optional(),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;
