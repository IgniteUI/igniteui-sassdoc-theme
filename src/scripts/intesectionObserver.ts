/**
 * Initializes intersection observer to track active sections while scrolling
 * @returns A cleanup function to remove event listeners
 */
export function initIntersectionObserver(): () => void {
  const sections = document.querySelectorAll(
    ".items > .item",
  ) as NodeListOf<HTMLElement>;
  const navLinks = document.querySelectorAll(
    ".nav-link",
  ) as NodeListOf<HTMLAnchorElement>;

  const intersectingSections = new Set<HTMLElement>();

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          intersectingSections.add(entry.target as HTMLElement);
        } else {
          intersectingSections.delete(entry.target as HTMLElement);
        }
      }

      updateActiveSection();
    },
    {
      threshold: [0, 0.1, 0.5, 0.9, 1.0],
    },
  );

  const updateActiveSection = (): void => {
    if (intersectingSections.size === 0) return;

    const visibleSections = Array.from(intersectingSections).sort((a, b) => {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });

    let activeSection: HTMLElement | null = null;

    // If we're near the bottom of the page, activate the last section
    const scrollBottom = window.scrollY + window.innerHeight;
    const pageBottom = document.body.scrollHeight;
    const isNearBottom = pageBottom - scrollBottom < 50; // 50px from bottom

    if (isNearBottom) {
      activeSection = sections[sections.length - 1];
    } else {
      for (const section of visibleSections) {
        const rect = section.getBoundingClientRect();

        if (rect.top >= 0) {
          activeSection = section;
          break;
        }
      }

      // If no section was found (all are above), take the last visible one
      if (!activeSection && visibleSections.length > 0) {
        activeSection = visibleSections[visibleSections.length - 1];
      }
    }

    if (activeSection) {
      const heading = activeSection.querySelector("h2");
      const id = heading?.id;

      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }
  };

  sections.forEach((section) => {
    intersectionObserver.observe(section);
  });

  // Add a very lightweight scroll listener that only activates near page bottom
  const handleScroll = () => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const pageBottom = document.body.scrollHeight;
    const isNearBottom = pageBottom - scrollBottom < 50;

    // Only update if we're near the bottom of the page
    if (isNearBottom) {
      window.requestAnimationFrame(updateActiveSection);
    }
  };

  let scrollTimeout: number | null = null;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTimeout === null) {
        scrollTimeout = window.setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 100);
      }
    },
    { passive: true },
  );

  updateActiveSection();

  function cleanup(): void {
    intersectionObserver.disconnect();
    window.removeEventListener("scroll", handleScroll);

    if (scrollTimeout !== null) {
      window.clearTimeout(scrollTimeout);
    }

    window.removeEventListener("beforeunload", cleanup);
    document.removeEventListener("astro:before-swap", cleanup);
  }

  window.addEventListener("beforeunload", cleanup);
  document.addEventListener("astro:before-swap", cleanup);

  return cleanup;
}
