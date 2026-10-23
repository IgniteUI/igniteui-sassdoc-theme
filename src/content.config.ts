import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { SassDocSchema, SourceSchema } from "./content/sassdoc-schema";

const sassdoc = defineCollection({
  loader: file("data/sassdoc-data.json", {
    parser: (content) => {
      const data = Object.entries(JSON.parse(content));

      return data.map(([group, items]) => ({
        id: group,
        group,
        items,
      }));
    },
  }),
  schema: SassDocSchema,
});

const sources = defineCollection({
  loader: async () => {
    return [
      {
        id: "default",
        url: "https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/core/src/core/styles/",
      },
      {
        id: "theming",
        url: "https://github.com/IgniteUI/igniteui-theming/blob/master/packages/theming/sass/",
      },
    ];
  },
  schema: SourceSchema,
});

export const collections = {
  sassdoc,
  sources,
};
