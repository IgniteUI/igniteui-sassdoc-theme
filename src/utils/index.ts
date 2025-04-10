import type { Context } from "sassdoc";
import extras from "sassdoc-extras";

/**
 * Processes group names in the Context.
 * First applies the standard extras.groupName function, then
 * replaces group slugs with their display names for each item.
 *
 * @param ctx - The Context to process
 */
export function groupName(ctx: Context): void {
  if (!ctx.data) return;

  extras.groupName(ctx);

  for (const item of ctx.data) {
    if (!item.group || item.group.length === 0) return;

    const groups = item.group
      .map((slug) => item.groupName[slug])
      .filter(Boolean);

    if (groups.length > 0) {
      item.group = groups;
    }
  }
}
