declare module "sassdoc-plugin-localization" {
  import type { Data, PluginConfig } from "sassdoc";
  /**
   * Builds a structure of json files which represents the retrieved comments per every sass declaration.
   */
  export function convert(data: Data, dir: string): void;

  /**
   * Compares and replaces the applied translations from the jsons structure.
   */
  export function render(data: Data, dir: string): void;
}
