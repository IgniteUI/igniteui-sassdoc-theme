import type { APIRoute } from "astro";
import { getConfig } from "../../utils/config";
import { getLangFromEnv } from "../../i18n";
import type { Mode } from "../../content/sassdoc-schema";

export const GET: APIRoute = async () => {
  const lang = getLangFromEnv();
  const mode = import.meta.env.MODE as Mode;

  const { url: baseUrl, versions: versionsURL } = getConfig(lang, mode);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(versionsURL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();

    const versions = payload.folders
      .map((version: string) => ({
        version: version,
        url: `${baseUrl}/products/ignite-ui-angular/docs/${version}/sass/`,
      }))
      .reverse();

    return new Response(JSON.stringify({ versions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to fetch versions:", error);

    return new Response(
      JSON.stringify({
        versions: [
          {
            version: "0.0.0",
            url: "#",
          },
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
