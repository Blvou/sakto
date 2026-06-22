import { z } from 'zod';
import { sanitizeListingAttributes } from './utils/sanitize-attributes';
import { LISTING_REPORT_REASONS } from './types';

export const listingAttributesSchema = z
  .record(z.string(), z.string())
  .optional()
  .transform((value) => sanitizeListingAttributes(value));

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.coerce.number().positive('Price must be greater than 0'),
  location: z.string().min(2, 'Location is required').max(100),
  category: z.string().min(1).max(50).optional(),
  attributes: listingAttributesSchema,
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const listingPhotoDraftSchema = z.object({
  uri: z.string().min(1),
  mediaId: z.string().uuid().optional(),
});

export const createListingMutationSchema = createListingSchema.omit({ imageUrl: true }).extend({
  photos: z.array(listingPhotoDraftSchema).min(1, 'Add at least one photo').max(10),
});

export type CreateListingMutationInput = z.infer<typeof createListingMutationSchema>;

export const updateListingSchema = createListingSchema.extend({
  status: z.enum(['active', 'sold', 'archived']).optional(),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;

export const updateListingMutationSchema = updateListingSchema.omit({ imageUrl: true }).extend({
  photos: z.array(listingPhotoDraftSchema).min(1, 'Add at least one photo').max(10),
  previousPhotoUrls: z.array(z.string().url()).optional(),
});

export type UpdateListingMutationInput = z.infer<typeof updateListingMutationSchema>;

const reportReasonIds = LISTING_REPORT_REASONS.map((item) => item.id) as [
  (typeof LISTING_REPORT_REASONS)[number]['id'],
  ...(typeof LISTING_REPORT_REASONS)[number]['id'][],
];

export const reportListingSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(reportReasonIds),
  details: z.string().max(500).optional(),
});

export type ReportListingInput = z.infer<typeof reportListingSchema>;
