import type { Context, Data, GroupedData, Item, GroupedItems } from "sassdoc";
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

/**
 * Processes a require item to add group information
 */
function processRequireItem(items: Map<string, string>, req: any) {
  const { item: _, ...plainReq } = req;

  if (!plainReq.external && plainReq.name) {
    const group = items.get(plainReq.name);
    if (group) {
      plainReq.group = group;
    }
  }

  return plainReq;
}

/**
 * Processes a usedBy item to add group information
 */
function processUsedByItem(items: Map<string, string>, usedByItem: any) {
  const { description, context } = usedByItem;
  const plainUsedBy = { description, context, group: "" };

  if (context?.name) {
    const group = items.get(context.name);
    if (group) {
      plainUsedBy.group = group;
    }
  }

  return plainUsedBy;
}

/**
 * Adds group information to cross-referenced items (require and usedBy)
 * to enable proper navigation between different groups in the documentation.
 *
 * @param ctx - The Context to process
 */
export function resolveGroupsForRequiredItems(ctx: Context): void {
  if (!ctx.data) return;

  const itemToGroup = new Map<string, string>();

  for (const item of ctx.data) {
    if (item.context?.name && Array.isArray(item.group)) {
      itemToGroup.set(item.context.name, item.group[0]);
    }
  }

  for (const item of ctx.data) {
    if (item.require && Array.isArray(item.require)) {
      item.require = item.require.map((item) =>
        processRequireItem(itemToGroup, item),
      );
    }

    if (item.usedBy && Array.isArray(item.usedBy)) {
      item.usedBy = item.usedBy.map((item) =>
        processUsedByItem(itemToGroup, item),
      );
    }
  }
}

/**
 * Groups items by their group and type
 */
function groupItems(data: Data): Record<string, Record<string, Item[]>> {
  const result: Record<string, Record<string, Item[]>> = Object.create(null);

  for (const item of data) {
    const group = item.group?.[0];
    const type = item.context?.type;

    if (group === undefined || type === undefined) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(result, group)) {
      result[group] = Object.create(null);
    }

    if (!Object.prototype.hasOwnProperty.call(result[group], type)) {
      result[group][type] = [];
    }

    result[group][type].push(item);
  }

  return result;
}

/**
 * Sorts grouped items by type according to specified order
 */
function sortByType(
  groupedData: Record<string, Record<string, Item[]>>,
): GroupedData {
  const typeOrder: Record<string, number> = {
    placeholder: 1,
    variable: 2,
    function: 3,
    mixin: 4,
  };

  const sortedResult: GroupedData = Object.create(null);

  for (const group in groupedData) {
    sortedResult[group] = {} as GroupedItems;

    const types = Object.keys(groupedData[group]);

    types.sort((a, b) => {
      const orderA = typeOrder[a] || Number.MAX_SAFE_INTEGER;
      const orderB = typeOrder[b] || Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    for (const type of types) {
      (sortedResult[group] as Record<string, Item[]>)[type] =
        groupedData[group][type];
    }
  }

  return sortedResult;
}

/**
 * Groups items by their group and type, then sorts the types
 * in order: placeholder, variable, function, mixin
 *
 * @param data - The SassDoc context data
 * @returns Grouped and sorted data
 */
export function byGroupAndType(data: Data): GroupedData {
  const grouped = groupItems(data);
  return sortByType(grouped);
}

/**
 * Adds a `display` property for each data item based on display configuration
 * (hide private items and aliases for example).
 *
 * @param ctx - The SassDoc context object
 */
export function display(ctx: Context): void {
  if (!ctx.display) {
    return;
  }

  ctx.data = ctx.data.filter((item: Item) => {
    const displayItemAccess = ctx.display?.access
      ? ctx.display.access.indexOf(item.access) !== -1
      : false;

    const isAlias = Boolean(item.alias);
    const displayAlias = Boolean(ctx.display?.alias);

    return displayItemAccess && !(isAlias && !displayAlias);
  });
}
