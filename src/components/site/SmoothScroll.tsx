"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -90 } }}>
      {children}
    </ReactLenis>
  );
}
