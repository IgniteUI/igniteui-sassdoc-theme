import { z } from "astro:content";

export const AuthorSchema = z.array(z.string());

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

export const ExampleSchema = z.object({
  type: z.string(),
  code: z.string(),
  description: z.string().default(""),
});

// Define string union type for parameter types
export const ItemTypeEnum = z.enum(["variable", "mixin", "function"]);
export type ItemType = z.infer<typeof ItemTypeEnum>;

export const ParameterSchema = z.object({
  type: z.string(), // Allow any string for parameter types
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

export const ReferenceSchema = z.object({
  description: z.string(),
  context: ItemContext,
  group: z.string(),
  name: z.string(),
});

export const LinkSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

export const ItemSchema = z
  .object({
    description: z.string(),
    access: z.string(),
    context: ItemContext,
    name: z.string().optional(),
    file: FileSchema,
    type: z.string().optional(),
    group: z.array(z.string()),
    deprecated: z.string().optional(),
    see: z.array(ReferenceSchema).optional(),
    since: SinceSchema.optional(),
    author: AuthorSchema.optional(),
    groupName: z.record(z.string()),
    alias: z.string().optional(),
    aliased: z.array(z.string()).optional(),
    aliasedGroup: AliasedGroupSchema.optional(),
    commentRange: LineSchema.optional().default(() => ({ start: 0, end: 0 })),
    example: z.array(ExampleSchema).optional(),
    parameter: z.array(ParameterSchema).optional(),
    package: PackageSchema.optional(),
    return: ReturnSchema.optional(),
    require: z.array(RequireSchema).optional(),
    usedBy: z.array(ReferenceSchema).optional(),
    throw: z.array(z.string()).optional(),
    link: z.array(LinkSchema).optional(),
  })
  .catchall(z.any());

// The actual structure is { function: Item[], mixin: Item[], ... }
export const GroupedItemsSchema = z.record(z.string(), z.array(ItemSchema));
// And for ByGroupSchema it's { groupName: { function: Item[], mixin: Item[], ... } }
export const ByGroupSchema = z.record(z.string(), GroupedItemsSchema);

export const ByTypeSchema = z.array(
  z.tuple([ObjectTypeEnum, z.array(ItemSchema)]),
);

// This represents the structure expected by Astro content collection
export const SassDocSchema = z.object({
  id: z.string(),
  group: z.string(),
  items: z.record(z.string(), z.array(ItemSchema)),
});

export const ConfigSchema = z.object({
  id: z.string(),
  url: z.string(),
  gaID: z.string(),
  versions: z.string(),
  sassdoc_default_url: z.string(),
});

export const VersionItemSchema = z.object({
  version: z.string(),
  url: z.string(),
});

export const VersionSchema = z.object({
  versions: z.array(VersionItemSchema),
});

export const Modes = z.enum(["development", "staging", "production"]);

export const PluginConfigSchema = z.object({
  name: z.string(),
  path: z.string(),
  options: z.record(z.string(), z.any()).optional(),
});

export const ContextSchema = z
  .object({
    data: z.array(ItemSchema),
    display: z
      .object({
        access: z.array(z.string()).optional(),
        alias: z.boolean().optional(),
        watermark: z.boolean().optional(),
      })
      .optional(),
    language: z.enum(["en", "ja"]).default("en"),
    environment: Modes.default("production"),
    groups: z.record(z.string()).optional(),
    groupedData: ByGroupSchema.optional(),
    plugins: z.array(PluginConfigSchema).optional(),
  })
  .catchall(z.any());

export const PluginSchema = z.object({
  name: z.string(),
  beforeProcess: z
    .function()
    .args(ContextSchema)
    .returns(
      z.union([
        z.void(),
        z.boolean(),
        z.promise(z.void()),
        z.promise(z.boolean()),
      ]),
    )
    .optional(),
  afterProcess: z
    .function()
    .args(ContextSchema)
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
  beforeBuild: z
    .function()
    .args(ContextSchema)
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
  afterBuild: z
    .function()
    .args(ContextSchema)
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
});

export const NavigationSchema = z.object({
  header: z.string().nullable(),
  footer: z.string().nullable(),
  copyright: z.string().nullable(),
});

export const AnnotationResultSchema = z.object({
  name: z.string(),
  parse: z.function().args(z.any()).returns(z.any()),
  resolve: z.function().args(z.any()).returns(z.any()).optional(),
  default: z.function().returns(z.any()).optional(),
  autofill: z.function().args(z.object({})).optional(),
  multiple: z.boolean(),
  alias: z.array(z.string()).optional(),
});

export const AnnotationCallbackSchema = z
  .function()
  .returns(AnnotationResultSchema);

export type Line = z.infer<typeof LineSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ObjectType = z.infer<typeof ObjectTypeEnum>;
export type DocGroup = z.infer<typeof GroupedItemsSchema>;
export type TypeGroup = z.infer<typeof ByTypeSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type Mode = z.infer<typeof Modes>;
export type Context = z.infer<typeof ContextSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type AnnotationResult = z.infer<typeof AnnotationResultSchema>;
export type AnnotationCallback = z.infer<typeof AnnotationCallbackSchema>;
export type Plugin = z.infer<typeof PluginSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;

export interface GroupedItems {
  [key: string]: Item[];
}

export interface GroupedData {
  [key: string]: GroupedItems;
}
export type Data = Item[];
export type ItemParameter = z.infer<typeof ParameterSchema>;
