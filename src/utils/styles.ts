/**
 * Helper function to import style modules conditionally based on environment
 * In development: uses SCSS files with igniteui-theming
 * In production: uses pre-compiled CSS files (no igniteui-theming dependency)
 */
export async function importStyles(path: string) {
  const isProd = import.meta.env.PROD;
  
  // In production, use the pre-compiled CSS files
  if (isProd) {
    const cssPath = path.replace('.scss', '.css');
    try {
      return await import(cssPath);
    } catch (error) {
      console.error(`Failed to import CSS: ${cssPath}`, error);
      // Fallback to SCSS if CSS import fails
      return await import(path);
    }
  }
  
  // In development, use the SCSS files
  return await import(path);
}