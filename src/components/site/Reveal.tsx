"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Aparece al entrar en pantalla. */
export function Reveal({ delay = 0, y = 40, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const word: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3 };

/**
 * Título que entra palabra por palabra. El disparo se observa en el título
 * completo: las palabras están recortadas por su máscara y el observer no las ve.
 */
export function SplitHeading({
  text,
  className,
  as = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const Tag = TAGS[as];
  const words = text.split(" ");
  return (
    <Tag
      className={className}
      aria-label={text}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] pt-[0.12em] align-bottom" aria-hidden>
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
