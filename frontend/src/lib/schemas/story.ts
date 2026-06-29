import { z } from "zod"

export const generateSchema = z.object({
  theme: z
    .string()
    .min(3, "Theme must be at least 3 characters")
    .max(100, "Theme must be at most 100 characters"),
})

export type GenerateSchema = z.infer<typeof generateSchema>