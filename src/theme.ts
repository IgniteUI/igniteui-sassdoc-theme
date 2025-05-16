import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import {
  byGroupAndType,
  groupName,
  display,
  enrichCrossReferences,
  fetchNavigation,
  fetchVersions,
} from "./utils";
import type {
  Context,
  AnnotationCallback,
  Plugin,
  PluginConfig,
} from "./content/sassdoc-schema";
import { log } from "../scripts/logger";

export interface SassDoc {
  (dest: string, ctx: Context): Promise<Context>;
  annotations: AnnotationCallback[];
  registerPlugin: (plugin: Plugin) => void;
  registerAnnotation: (callback: AnnotationCallback) => void;
}

class SassDocTheme implements Omit<SassDoc, keyof Function> {
  private static DEFAULT_CONFIG = {
    display: {
      access: ["public", "private"],
      alias: true,
      watermark: false,
    },
    groups: {
      undefined: "utilities",
    },
    plugins: [] as PluginConfig[],
  };

  private _annotations: AnnotationCallback[] = [];
  private _plugins: Plugin[] = [];
  private _shouldTerminate = false;

  registerAnnotation(callback: AnnotationCallback): void {
    this._annotations.push(callback);
  }

  get annotations(): AnnotationCallback[] {
    return this._annotations;
  }

  registerPlugin(plugin: Plugin): void {
    this._plugins.push(plugin);
    log("plugin", `Plugin registered: ${plugin.name}`);
  }

  private async loadConfigPlugins(ctx: Context): Promise<void> {
    if (!ctx.plugins || !Array.isArray(ctx.plugins)) {
      return;
    }

    for (const pluginConfig of ctx.plugins) {
      try {
        if (!pluginConfig.path) {
          console.warn(
            `Plugin ${pluginConfig.name || "unnamed"} has no path specified, skipping`,
          );
          continue;
        }

        const pluginPath = path.resolve(process.cwd(), pluginConfig.path);
        const pluginModule = await import(pluginPath);
        const pluginFactory = pluginModule.default || pluginModule;
        const plugin =
          typeof pluginFactory === "function"
            ? pluginFactory(pluginConfig.options || {})
            : pluginFactory;

        if (!plugin.name) {
          plugin.name =
            pluginConfig.name ||
            path.basename(pluginPath, path.extname(pluginPath));
        }

        this.registerPlugin(plugin);
      } catch (error) {
        console.error(
          `Failed to load plugin ${pluginConfig.name || pluginConfig.path}:`,
          error,
        );
      }
    }
  }

  private async executePluginHooks(
    hookName: keyof Omit<Plugin, "name">,
    ctx: Context,
  ): Promise<boolean> {
    for (const plugin of this._plugins) {
      const hook = plugin[hookName];

      if (typeof hook === "function") {
        try {
          const result = await hook.call(plugin, ctx);

          if (hookName === "beforeProcess" && result) {
            log(
              "plugin",
              `Plugin ${plugin.name} requested to terminate processing`,
            );

            return true;
          }
        } catch (error) {
          console.error(
            `Error in plugin ${plugin.name} at ${hookName}:`,
            error,
          );
        }
      }
    }

    return false;
  }

  private async processData(ctx: Context): Promise<void> {
    ctx.display = {
      ...SassDocTheme.DEFAULT_CONFIG.display,
      ...structuredClone(ctx.display),
    };

    ctx.groups = {
      ...SassDocTheme.DEFAULT_CONFIG.groups,
      ...structuredClone(ctx.groups),
    };

    ctx.language ??= "en";
    ctx.environment ??= "production";

    await this.loadConfigPlugins(ctx);

    const terminate = await this.executePluginHooks("beforeProcess", ctx);

    if (terminate) {
      this._shouldTerminate = true;
      return;
    }

    // Apply display configuration
    display(ctx);

    // Apply group names mapping
    groupName(ctx);

    // Enrich data with cross-references
    enrichCrossReferences(ctx);

    // Transform data by group and type
    ctx.groupedData = byGroupAndType(ctx.data);

    // Execute afterProcess plugin hooks
    await this.executePluginHooks("afterProcess", ctx);
  }

  async generate(dest: string, ctx: Context): Promise<Context> {
    try {
      fs.ensureDirSync(dest);

      await this.processData(ctx);

      if (this._shouldTerminate) {
        log("sassdoc", "Generation stopped by plugin after data processing");
        return ctx;
      }

      const { build } = await import("astro");
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const projectRoot = path.resolve(__dirname);

      const srcDataPath = path.join(
        projectRoot,
        "data",
        "sassdoc-data.json",
      );
      fs.ensureDir(path.dirname(srcDataPath));
      fs.writeJsonSync(srcDataPath, ctx.groupedData);

      await fetchNavigation(ctx);
      await fetchVersions(ctx);

      await this.executePluginHooks("beforeBuild", ctx);

      process.env.PUBLIC_LANG = ctx.language;

      await build({
        logLevel: "error",
        mode: ctx.environment,
        root: projectRoot,
      });

      fs.copySync(path.join(projectRoot, "site"), dest);
      log("sassdoc", "Site generated");

      await this.executePluginHooks("afterBuild", ctx);

      return ctx;
    } catch (error) {
      console.error("Error generating Sassdoc site:", error);
      throw error;
    }
  }
}

export function createTheme(): SassDoc {
  const theme = new SassDocTheme();

  const themeFunction = function (dest: string, ctx: Context) {
    return theme.generate(dest, ctx);
  } as SassDoc;

  Object.defineProperty(themeFunction, "annotations", {
    get: function () {
      return theme.annotations;
    },
  });

  themeFunction.registerAnnotation = function (callback: AnnotationCallback) {
    theme.registerAnnotation(callback);
  };

  themeFunction.registerPlugin = function (plugin: Plugin) {
    theme.registerPlugin(plugin);
  };

  return themeFunction;
}
