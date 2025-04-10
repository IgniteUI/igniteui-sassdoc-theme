import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { SassdocGroupSchema } from "./sassdoc-schema";

const sassdocCollection = defineCollection({
  loader: file("src/data/sassdoc-data.json", {
    parser: (content) => {
      const data = JSON.parse(content);

      return Object.entries(data).map(([group, items]) => ({
        id: group,
        group,
        items,
      }));
    },
  }),
  schema: SassdocGroupSchema,
});

export const collections = {
  sassdoc: sassdocCollection,
};
