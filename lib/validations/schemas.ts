import { z } from 'zod';

// --- Shared ID validators ---
export const uuidSchema = z.string().uuid('Invalid ID format');

// --- Video schemas ---
export const videoOrientationEnum = z.enum(['STRAIGHT', 'GAY', 'LESBIAN', 'TRANS']);
export const videoStatusEnum = z.enum(['PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED']);

export const videoUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  orientation: videoOrientationEnum.optional(),
  isPremium: z.boolean().optional(),
  modelIds: z.array(uuidSchema).optional(),
  newModelNames: z.array(z.string().min(1).max(100)).optional(),
  categoryIds: z.array(uuidSchema).optional(),
  tags: z.array(z.string().min(1).max(50)).max(30).optional(),
});

export type VideoUpdateData = z.infer<typeof videoUpdateSchema>;

export const finalizeUploadSchema = z.object({
  bunnyVideoId: z.string().min(1, 'Video ID is required'),
  metadata: videoUpdateSchema.optional(),
});

export const updateVideoStatusSchema = z.object({
  videoId: uuidSchema,
  status: videoStatusEnum,
});

// --- Admin schemas ---
export const modelGenderEnum = z.enum(['MALE', 'FEMALE', 'TRANS_MALE', 'TRANS_FEMALE', 'NON_BINARY']);

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').trim(),
  slug: z.string().max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').trim(),
});

export const createModelSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required').max(100, 'Name too long').trim(),
  gender: modelGenderEnum.default('FEMALE'),
});

// --- Upload schemas ---
export const uploadSignatureSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
});
