import type { AnnotationCallback } from "sassdoc";

const packageAnnotation: AnnotationCallback = () => ({
  name: "package",
  parse: function (text) {
    return {
      name: text.trim(),
    };
  },
  resolve: function (data) {
    data.forEach((item) => {
      if (item.package.name === "auto") {
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
