"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function GlobalRouteLoader(): React.ReactElement | null {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(false);
  }, [pathname]);

  React.useEffect(() => {
    const startLoading = (): void => setLoading(true);

    const handleClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) return;

      startLoading();
    };

    const handlePopState = (): void => startLoading();

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes global-route-loader-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-5%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden"
      >
        <div
          className="h-full w-[38%] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.55)]"
          style={{ animation: "global-route-loader-slide 1.1s ease-in-out infinite" }}
        />
      </div>
    </>
  );
}
