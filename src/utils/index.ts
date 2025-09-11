import type {
  Context,
  Data,
  Item,
  GroupedData,
  GroupedItems,
} from "../content/sassdoc-schema";

/**
 * Processes group names in the Context.
 * First applies the standard extras.groupName function, then
 * replaces group slugs with their display names for each item.
 *
 * @param ctx - The Context to process
 */
export function groupName(ctx: Context): void {
  if (!ctx.data) return;

  ctx.groups = ctx.groups || {};
  ctx.groupDescriptions = ctx.groupDescriptions || {};

  for (const slug of Object.keys(ctx.groups)) {
    if (ctx.groups) {
      ctx.groups[slug.toLowerCase()] = ctx.groups[slug];
    }
  }

  for (const item of ctx.data) {
    if (!item.group || item.group.length === 0) continue;

    const group: Record<string, string> = {};
    const processedGroups: string[] = [];

    for (const slug of item.group) {
      const lowerSlug = slug.toLowerCase();

      if (ctx.groups && lowerSlug in ctx.groups) {
        group[lowerSlug] = ctx.groups[lowerSlug];
      } else if (ctx.groups) {
        group[lowerSlug] = ctx.groups[lowerSlug] = lowerSlug;
      }

      const displayName = group[lowerSlug];

      if (displayName) {
        processedGroups.push(displayName);
      }
    }

    if (item.groupDescriptions && ctx.groupDescriptions) {
      Object.assign(ctx.groupDescriptions, item.groupDescriptions);
    }

    item.groupName = group;

    if (processedGroups.length > 0) {
      item.group = processedGroups;
    }
  }
}

/**
 * Processes a require item to add group and name information
 */
function processRequireItem(items: Map<string, string>, req: any) {
  const { item, ...plainReq } = req;

  if (!plainReq.external && plainReq.name) {
    const group = items.get(plainReq.name);

    if (group) {
      plainReq.group = group;
      plainReq.name = item.name ?? plainReq.name;
    }
  }

  return plainReq;
}

/**
 * Processes a referecne item to add group and name information
 */
function processReferenceItem(
  items: Map<string, string>,
  item: Pick<Item, "context" | "description" | "name">,
) {
  const { context, description, name } = item;
  const plainItem = { description, context, group: "", name: "" };

  if (context?.name) {
    const group = items.get(context.name);

    if (group) {
      plainItem.group = group;
      plainItem.name = name ?? context.name;
    }
  }

  return plainItem;
}

/**
 * Processes a reference to a group with an alias, returning the aliased item if found.
 * If the aliased item exists in the context data, returns an object with its name and the provided group.
 * Otherwise, returns the original reference.
 *
 * @param ctx - The context containing data to search for the aliased item.
 * @param ref - An object containing the name to search for and the group array.
 * @returns An object with the resolved name and group.
 */
function processAliasedGroup(
  ctx: Context,
  ref: { name: string; group: string[] },
) {
  const aliasedItem = ctx.data.find((item) => item.context.name === ref.name);

  if (aliasedItem) {
    return {
      name: aliasedItem.name ?? aliasedItem.context.name,
      group: ref.group,
    };
  }

  return ref;
}

/**
 * Resolves an alias to its corresponding item's name within the context data.
 * If the alias is found, returns the item's name; otherwise, returns the alias itself.
 *
 * @param ctx - The context containing the data array.
 * @param alias - The alias string to resolve.
 * @returns The resolved name or the original alias if not found.
 */
function processAliased(ctx: Context, alias: string) {
  const aliasedItem = ctx.data.find((item) => item.context.name === alias);

  return aliasedItem?.name ?? alias;
}

/**
 * Resolves the name of the item that the given item is an alias of.
 * If the referenced item is found, returns its name; otherwise, returns the alias value.
 *
 * @param ctx - The context containing the data array.
 * @param item - The item whose alias is to be resolved.
 * @returns The resolved name or the original alias if not found.
 */
function processAliasOf(ctx: Context, item: Item) {
  const itemAlias = ctx.data.find((_item) => {
    return _item.context.name === item.alias;
  });

  return (itemAlias && itemAlias.name) ?? item.alias;
}

/**
 * Enriches cross-references between items with group information.
 * Processes various types of references (require, usedBy, see, aliased) to ensure
 * they contain appropriate group data for navigation and display.
 *
 * @param ctx - The context containing the data to process.
 */
export function enrichCrossReferences(ctx: Context): void {
  if (!ctx.data) return;

  const itemToGroup = new Map<string, string>();

  for (const item of ctx.data) {
    if (item.context?.name && Array.isArray(item.group)) {
      itemToGroup.set(item.context.name, item.group[0]);
    }
  }

  for (const item of ctx.data) {
    if (item.require && Array.isArray(item.require)) {
      item.require = item.require.map((_item) =>
        processRequireItem(itemToGroup, _item),
      );
    }

    if (item.usedBy && Array.isArray(item.usedBy)) {
      item.usedBy = item.usedBy.map((_item) =>
        processReferenceItem(itemToGroup, _item),
      );
    }

    if (item.see && Array.isArray(item.see)) {
      item.see = item.see.map((_item) =>
        processReferenceItem(itemToGroup, _item),
      );
    }

    if (item.aliased && Array.isArray(item.aliased)) {
      item.aliased = item.aliased.map((alias) => processAliased(ctx, alias));
    }

    if (item.aliasedGroup && Array.isArray(item.aliasedGroup)) {
      item.aliasedGroup = item.aliasedGroup.map((_item) =>
        processAliasedGroup(ctx, _item),
      );
    }

    if (item.alias) {
      item.alias = processAliasOf(ctx, item);
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

export * from "./navigation";
export * from "./config";
