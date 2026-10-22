"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Paw } from "@/components/brand/Paw";

type Step = { x: number; y: number; angle: number; left: boolean; at: number; color: string };

const STEP_GAP = 120; // px de recorrido entre huellas
const COLORS = ["text-navy", "text-navy", "text-navy", "text-tangerine", "text-navy", "text-sky", "text-navy", "text-bubble"];

/**
 * Rastro de huellas que "camina" por toda la página: cada huella se estampa
 * cuando el scroll la alcanza y el recorrido sigue una curva serpenteante.
 */
export function PawTrail() {
  const ref = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 75%"] });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const build = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      if (!W || !H) return;
      const mobile = W < 768;
      const amp = W * (mobile ? 0.36 : 0.4);
      const wave = mobile ? 520 : 760;
      const startY = mobile ? 520 : 680;
      // Curva x(y) = centro + amp·sin(y/wave). Avanzamos por longitud de arco.
      const xAt = (y: number) => W / 2 + amp * Math.sin(y / wave);
      const result: Step[] = [];
      let y = startY;
      let i = 0;
      while (y < H - 200) {
        const dxdy = (amp / wave) * Math.cos(y / wave);
        // Rotación CSS que lleva los dedos (hacia arriba en el SVG) al sentido de avance (dx, dy=1)
        const angle = (Math.atan2(dxdy, -1) * 180) / Math.PI;
        const left = i % 2 === 0;
        const norm = Math.hypot(1, dxdy);
        const off = mobile ? 11 : 16;
        // Desplaza cada pata perpendicularmente a la dirección de avance
        const px = (left ? -1 : 1) * off * (1 / norm);
        const py = (left ? 1 : -1) * off * (dxdy / norm);
        result.push({
          x: xAt(y) + px,
          y: y + py,
          angle,
          left,
          at: y / H,
          color: COLORS[Math.floor(i / 2) % COLORS.length],
        });
        y += STEP_GAP / norm;
        i++;
      }
      setSteps(result);
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {steps.map((s, i) => (
        <PawStep key={i} step={s} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function PawStep({ step, progress }: { step: Step; progress: MotionValue<number> }) {
  const t = step.at;
  const opacity = useTransform(progress, [t - 0.012, t, t + 0.25, t + 0.6], [0, 0.32, 0.22, 0.12]);
  const scale = useTransform(progress, [t - 0.012, t], [1.8, 1]);
  const blur = useTransform(progress, [t - 0.012, t], ["blur(6px)", "blur(0px)"]);
  return (
    <motion.div
      className={`absolute ${step.color} mix-blend-multiply`}
      style={{
        left: step.x,
        top: step.y,
        opacity,
        scale,
        filter: blur,
        rotate: step.angle + (step.left ? -8 : 8),
        x: "-50%",
        y: "-50%",
      }}
    >
      <Paw className="size-7 md:size-9" />
    </motion.div>
  );
}

/** Indicador fijo: huellas que se llenan según el avance de la página. */
export function PawProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const total = 9;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 lg:flex"
    >
      {Array.from({ length: total }, (_, i) => (
        <ProgressPaw key={i} index={i} total={total} progress={smooth} />
      ))}
    </div>
  );
}

function ProgressPaw({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
  const at = index / (total - 1);
  const fill = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);
  const color = useTransform(fill, [0, 1], ["rgba(19,33,74,0.15)", "rgba(19,33,74,1)"]);
  const scale = useTransform(fill, [0, 0.5, 1], [0.85, 1.25, 1]);
  return (
    <motion.div style={{ color, scale, rotate: index % 2 ? 12 : -12, x: index % 2 ? 5 : -5 }}>
      <Paw className="size-4" />
    </motion.div>
  );
}
