declare module "sassdoc" {
  export type Line = {
    start: number;
    end: number;
  };

  export type ItemContext = {
    type: string;
    name: string;
    value?: string;
    code?: string;
    scope?: string;
    line: Line;
  };

  export type ItemType = "variable" | "mixin" | "function";

  export type ItemParameter = {
    type: ItemType;
    name: string;
    description: string;
    default?: string;
  };

  export type ItemExample = {
    type: string;
    code: string;
    description: string;
  };

  export type ItemFile = {
    path: string;
    name: string;
  };

  export type Item = {
    description: string;
    commentRange: Line;
    context: ItemContext;
    access: string;
    parameter?: ItemParameter[];
    example?: ItemExample[];
    require?: any[];
    group: string[];
    file: ItemFile;
    groupName: { [key: string]: string };
    alias?: string;
    author?: string[];
    deprecated?: string;
    [key: string]: any;
  };

  export type Data = Item[];

  export interface GroupedItems {
    [key: any]: Data;
  }

  export interface GroupedData {
    [key: string]: GroupedItems;
  }

  export interface Context {
    data: Data;
    display?: SassdocDisplayConfig;
    groups?: SassdocGroupsConfig;
    groupedData?: GroupedData;
    plugins?: PluginConfig[];
    [key: string]: any;
  }

  export interface Plugin {
    name: string;
    beforeProcess?: (
      ctx: Context,
    ) => void | Promise<void> | boolean | Promise<boolean>;
    afterProcess?: (ctx: Context) => void | Promise<void>;
    beforeBuild?: (ctx: Context) => void | Promise<void>;
    afterBuild?: (ctx: Context) => void | Promise<void>;
  }

  export interface PluginConfig {
    name: string;
    path: string;
    options?: Record<string, any>;
  }

  /**
   * Takes the annotation content as parameter and returns
   * the parsed data. It will be available in the theme
   * as item.<annotationName>, as an array if multiple is true.
   *
   *  @param value - The content of the annotation
   */
  export function parse(value: T): T | T[];

  /**
   * Called after the raw data is generated,
   * where the whole SassDoc data is being passed.
   *
   * @param data - The SassDoc context data
   */
  export function resolve(data: Data): void;

  /**
   * Returns a default value when the annotation is not present.
   *
   * @param data - The SassDoc context data
   */
  export function defaultValue(): T;

  /**
   * Takes a parsed annotation object. You can modify this object
   * reference as you want while having access to the whole parsed
   * content of the current annotation.
   * @param annotation - The SassDoc context data
   */
  export function autofill(annotation: object): void;

  export interface Annotation {
    name: string;
    parse: typeof parse;
    resolve?: typeof resolve;
    default?: typeof defaultValue;
    autofill?: typeof autofill;
    multiple: boolean;
    ailas?: string[];
  }

  type AnnotationCallback = () => Annotation;
}
