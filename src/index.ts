import { createTheme } from "./theme";
import { annotations } from "./annotations";

const theme = createTheme();

for (const annotation of annotations) {
  theme.registerAnnotation(annotation);
}

export default theme;
