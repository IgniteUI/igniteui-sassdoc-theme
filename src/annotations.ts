import type { AnnotationCallback, Item, Data } from "./content/sassdoc-schema";

const packageAnnotation: AnnotationCallback = () => ({
  name: "package",
  parse: function (text: string) {
    return {
      name: text.trim(),
    };
  },
  resolve: function (data: Data) {
    data.forEach((item: Item) => {
      if (item.package && item.package.name === "auto") {
        item.package.name = "default";
      }
    });
  },
  default: function () {
    return {
      name: "auto",
    };
  },
  multiple: false,
});

export const annotations: AnnotationCallback[] = [packageAnnotation];
