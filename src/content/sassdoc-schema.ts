import { z } from "astro:content";

export const AuthorSchema = z.array(z.string().optional());

export const ObjectTypeEnum = z.enum([
  "variable",
  "function",
  "mixin",
  "placeholder",
  "css",
]);

export const LineSchema = z.object({
  start: z.number(),
  end: z.number(),
});

export const FileSchema = z.object({
  path: z.string(),
  name: z.string(),
});

export const PackageSchema = z.object({
  name: z.string(),
});

export const SourceSchema = z.object({
  id: z.string(),
  url: z.string(),
});

export const SinceSchema = z.array(
  z.object({
    version: z.string().optional(),
    description: z.string().optional(),
  }),
);

export const AliasedGroupSchema = z.array(
  z.object({
    group: z.array(z.string()),
    name: z.string(),
  }),
);

export const ItemContext = z.object({
  type: ObjectTypeEnum,
  name: z.string(),
  value: z.string().optional(),
  code: z.string().optional(),
  scope: z.string().optional(),
  line: LineSchema,
});

export const SeeSchema = z.array(
  z.object({
    description: z.string(),
    context: ItemContext,
    group: z.array(z.string()),
  }),
);

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
  group: z.string().optional(),
  external: z.boolean().optional(),
});

export const UsedBySchema = z.object({
  description: z.string(),
  context: ItemContext,
  group: z.string(),
});

export const LinkSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

export const ItemSchema = z.object({
  description: z.string(),
  type: z.string().optional(),
  access: z.string(),
  group: z.array(z.string()),
  deprecated: z.string().optional(),
  see: SeeSchema.optional(),
  since: SinceSchema.optional(),
  author: AuthorSchema.optional(),
  groupName: z.record(z.string()),
  alias: z.string().optional(),
  aliased: z.array(z.string()).optional(),
  aliasedGroup: AliasedGroupSchema.optional(),
  context: ItemContext,
  file: FileSchema,
  commentRange: LineSchema.optional(),
  example: z.array(ExampleSchema).optional(),
  parameter: z.array(ParameterSchema).optional(),
  package: PackageSchema.optional(),
  return: ReturnSchema.optional(),
  require: z.array(RequireSchema).optional(),
  usedBy: z.array(UsedBySchema).optional(),
  throw: z.array(z.string()).optional(),
  link: z.array(LinkSchema).optional(),
});

export const ByGroupSchema = z.record(z.string(), z.array(ItemSchema));

export const ByTypeSchema = z.array(
  z.tuple([ObjectTypeEnum, z.array(ItemSchema)]),
);

export const SassDocSchema = z.object({
  group: z.string(),
  items: ByGroupSchema,
});

export type Item = z.infer<typeof ItemSchema>;
export type ObjectType = z.infer<typeof ObjectTypeEnum>;
export type DocGroup = z.infer<typeof ByGroupSchema>;
export type TypeGroup = z.infer<typeof ByTypeSchema>;
