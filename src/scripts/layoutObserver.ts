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

  resizeObserver.observe(header);
  resizeObserver.observe(footer);

  function updateSpacing(): void {
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--footer-height",
      `${footerHeight}px`,
    );
  }

  function cleanup(): void {
    resizeObserver.disconnect();

    window.removeEventListener("beforeunload", cleanup);
    document.removeEventListener("astro:before-swap", cleanup);
  }

  window.addEventListener("beforeunload", cleanup);
  document.addEventListener("astro:before-swap", cleanup);

  return cleanup;
}
