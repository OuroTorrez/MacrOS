"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const icons = {
  home: <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 21v-8h6v8" />,
  train: <path d="M6.5 6.5v11m11-11v11M3 9v6m18-6v6M6.5 12h11" />,
  splits: <path d="M5 4h14M5 10h14M5 16h9M3 4h.01M3 10h.01M3 16h.01" />,
  profile: <path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />,
};

const links = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/registro", label: "Train", icon: "train" },
  { href: "/splits", label: "Splits", icon: "splits" },
  { href: "/profile", label: "Perfil", icon: "profile" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = Math.max(links.findIndex(({ href }) => href === pathname), 0);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const movementRef = useRef({ position: activeIndex, time: 0 });
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerNavigation = useRef(false);

  function moveBubble(position: number, fluid = false) {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    const now = performance.now();
    const delta = position - movementRef.current.position;
    const elapsed = Math.max(now - movementRef.current.time, 16);
    const stretch = fluid ? Math.min(0.28, Math.abs(delta) * 1.4 + Math.abs(delta / elapsed) * 2) : 0;

    bubble.style.setProperty("--bubble-x", String(position));
    bubble.style.setProperty("--bubble-stretch", String(stretch));
    bubble.style.setProperty("--bubble-tilt", String(Math.sign(delta) * stretch * 7));
    movementRef.current = { position, time: now };

    if (settleTimer.current) clearTimeout(settleTimer.current);
    if (fluid) {
      settleTimer.current = setTimeout(() => {
        bubble.style.setProperty("--bubble-stretch", "0");
        bubble.style.setProperty("--bubble-tilt", "0");
      }, 70);
    }
  }

  useEffect(() => {
    moveBubble(activeIndex);
    return () => { if (settleTimer.current) clearTimeout(settleTimer.current); };
  }, [activeIndex]);

  if (pathname === "/login" || pathname.startsWith("/auth/") || pathname === "/onboarding") {
    return null;
  }

  const getBubblePosition = (clientX: number, nav: HTMLElement) => {
    const { left, width } = nav.getBoundingClientRect();
    return Math.min(links.length - 1, Math.max(0, ((clientX - left) / width) * links.length - 0.5));
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    moveBubble(getBubblePosition(event.clientX, event.currentTarget), true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.currentTarget.hasPointerCapture(event.pointerId)) {
      moveBubble(getBubblePosition(event.clientX, event.currentTarget), true);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    const index = Math.round(getBubblePosition(event.clientX, event.currentTarget));
    moveBubble(index);
    pointerNavigation.current = true;
    router.push(links[index].href);
  };

  return (
    <nav
      className={styles.nav}
      aria-label="Navegación principal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => moveBubble(activeIndex)}
      onMouseLeave={() => moveBubble(activeIndex)}
    >
      <ul className={styles.list}>
        {links.map(({ href, label, icon }, index) => (
          <li key={href}>
            <button
              type="button"
              className={`${styles.link} ${index === activeIndex ? styles.active : ""}`}
              aria-current={index === activeIndex ? "page" : undefined}
              onMouseEnter={() => moveBubble(index, true)}
              onClick={() => {
                if (pointerNavigation.current) {
                  pointerNavigation.current = false;
                  return;
                }
                router.push(href);
              }}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                {icons[icon]}
              </svg>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <span
        ref={bubbleRef}
        className={styles.bubble}
        aria-hidden="true"
        style={{ "--bubble-x": activeIndex, "--bubble-stretch": 0, "--bubble-tilt": 0 } as React.CSSProperties}
      />
    </nav>
  );
}
