// src/content/sassdoc-schema.ts
import { z } from "astro:content";
import { string } from "astro:schema";

export const ItemContext = z.object({
  type: z.string(),
  name: z.string(),
  value: z.string().optional(),
  code: z.string().optional(),
  scope: z.string().optional(),
  line: z.object({
    start: z.number(),
    end: z.number(),
  }),
});

export const FileSchema = z.object({
  path: z.string(),
  name: z.string(),
});

export const ExampleSchema = z.object({
  type: z.string(),
  code: z.string(),
  description: z.string().optional(),
});

export const ParameterSchema = z.object({
  type: z.string(),
  name: z.string(),
  default: z.string().optional(),
  description: z.string(),
});

export const ReturnSchema = z.object({
  type: z.string(),
  description: z.string(),
});

export const RequireSchema = z.object({
  type: z.string(),
  name: z.string(),
  external: z.boolean().optional(),
});

export const UsedBySchema = z.object({
  description: z.string(),
  context: ItemContext,
});

export const LinkSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

export const ItemSchema = z.object({
  description: z.string(),
  access: z.string(),
  group: z.array(z.string()),
  groupName: z.record(z.string()),
  context: ItemContext,
  file: FileSchema,
  commentRange: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
  example: z.array(ExampleSchema).optional(),
  parameter: z.array(ParameterSchema).optional(),
  return: ReturnSchema.optional(),
  require: z.array(RequireSchema).optional(),
  usedBy: z.array(UsedBySchema).optional(),
  throw: z.array(z.string()).optional(),
  link: z.array(LinkSchema).optional(),
});

export const GroupedItemsSchema = z.record(z.string(), z.array(ItemSchema));

export const SassdocGroupSchema = z.object({
  group: z.string(),
  items: GroupedItemsSchema,
});
