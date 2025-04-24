/**
 * Initializes a resize observer to track header and footer heights
 * @returns A cleanup function to remove the observer and event listeners
 */
export function initLayoutObserver(): () => void {
  const header = document.querySelector(".main-head") as HTMLElement;
  const footer = document.querySelector(".main-footer") as HTMLElement;

  if (!header || !footer) {
    console.error("Required elements not found");
    return () => {}; // Return empty cleanup function
  }

  let headerHeight: number = header.offsetHeight;
  let footerHeight: number = footer.offsetHeight;

  updateSpacing();

  const resizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[]) => {
      let shouldUpdate = false;

      for (const entry of entries) {
        if (entry.target === header && header.offsetHeight !== headerHeight) {
          headerHeight = header.offsetHeight;
          shouldUpdate = true;
        } else if (
          entry.target === footer &&
          footer.offsetHeight !== footerHeight
        ) {
          footerHeight = footer.offsetHeight;
          shouldUpdate = true;
        }
      }

      // Only update if dimensions actually changed
      if (shouldUpdate) {
        updateSpacing();
      }
    },
  );

  // Start observing
  resizeObserver.observe(header);
  resizeObserver.observe(footer);

  function updateSpacing(): void {
    // Update CSS variables or direct styles
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--footer-height",
      `${footerHeight}px`,
    );
  }

  // Cleanup function to remove observers and event listeners
  function cleanup(): void {
    // Disconnect the observer to prevent memory leaks
    resizeObserver.disconnect();

    // Remove event listeners
    window.removeEventListener("beforeunload", cleanup);
    document.removeEventListener("astro:before-swap", cleanup);
  }

  // Attach event listeners for cleanup
  window.addEventListener("beforeunload", cleanup);
  document.addEventListener("astro:before-swap", cleanup);

  // Return the cleanup function in case you need to call it manually
  return cleanup;
}
