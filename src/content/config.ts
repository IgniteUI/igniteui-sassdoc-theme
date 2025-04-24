import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { SassDocSchema, SourceSchema } from "./sassdoc-schema";

const sassdoc = defineCollection({
  loader: file("src/data/sassdoc-data.json", {
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
        url: "https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/core/styles/",
      },
      {
        id: "theming",
        url: "https://github.com/IgniteUI/igniteui-theming/tree/master/sass/",
      },
    ];
  },
  schema: SourceSchema,
});

export const collections = {
  sassdoc,
  sources,
};
