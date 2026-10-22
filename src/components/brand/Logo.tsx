import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo oficial (cuadro azul marino con el wordmark FIDO&FELIX). */
export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Fido&Felix"
      width={size}
      height={size}
      priority
      className={cn("rounded-[10px] shadow-sm", className)}
    />
  );
}

/** Wordmark tipográfico que replica el logo para fondos claros u oscuros. */
export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-start leading-none tracking-tight",
        light ? "text-white" : "text-navy",
        className,
      )}
    >
      FIDO<span className="-mt-[0.15em] text-[0.55em] rotate-12">&amp;</span>FELIX
    </span>
  );
}
