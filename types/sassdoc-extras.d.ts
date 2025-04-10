declare module "sassdoc-extras" {
  import type { Data, GroupedData, PluginConfig, Context } from "sassdoc";

  export interface SassdocDisplayConfig {
    access?: string[];
    alias?: boolean;
    watermark?: boolean;
  }

  export interface SassdocGroupsConfig {
    [groupSlug: string]: string;
  }

  /**
   * Sorts items by group and type.
   *
   * @param data - The SassDoc context data
   */
  export function byGroupAndType(data: Data): GroupedData;

  /**
   * Sorts by type.
   *
   * @param ctx - The SassDoc context object
   */
  export function byType(ctx: Context): void;

  /**
   * Resolve and load a `descriptionPath` key from config.
   *
   * @param ctx - The SassDoc context object
   */
  export function description(ctx: Context): void;

  /**
   * Adds a `display` property for each data item based on display configuration
   * (hide private items and aliases for example).
   *
   * @param ctx - The SassDoc context object
   */
  export function display(ctx: Context): void;

  /**
   * Maps group slugs to readable names based on configuration.
   *
   * @param ctx - The SassDoc context object
   */
  export function groupName(ctx: Context): void;

  /**
   * Wrapper for `marked` that produces html from markdown.
   * For example, This is some `code`. becomes This is some <code>code</code>.
   *
   * @param ctx - The SassDoc context object
   */
  export function markdown(ctx: Context): void;

  /**
   * Resolve variables aliases.
   *
   * @param ctx - The SassDoc context object
   */
  export function resolveVariables(ctx: Context): void;

  /**
   * Sort the SassDoc data by given criteria. configuration.
   *
   * @param ctx - The SassDoc context object
   */
  export function sort(ctx: Context): void;

  /**
   * Figure out a shortcut icon, and whether it is external or a local
   * file to copy.
   *
   * You can specify a local or external URL in `ctx.shortcutIcon`.
   *
   * For a local file, it will be relative to `ctx.dir`.
   *
   * A `ctx.shortcutIcon` property is then created and will look like
   * this:
   *
   *     {
   *       "type": "external|internal",
   *       "url": "external URL or file base name",
   *       "path": "only for internal, file absolute path"
   *     }
   * @param ctx - The SassDoc context object
   */
  export function shortcutIcon(ctx: Context): void;

  const extras: {
    byGroupAndType: typeof byGroupAndType;
    byType: typeof byType;
    description: typeof description;
    display: typeof display;
    groupName: typeof groupName;
    markdown: typeof markdown;
    resolveVariables: typeof resolveVariables;
    shortcutIcon: typeof shortcutIcon;
    sort: typeof sort;
  };

  export default extras;
}
