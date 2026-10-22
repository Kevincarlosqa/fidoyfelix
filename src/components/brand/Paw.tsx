import type { SVGProps } from "react";

/** Huella de perro (almohadilla + 4 dedos). */
export function Paw(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden {...props}>
      <ellipse cx="14" cy="26" rx="6.5" ry="8.5" transform="rotate(-18 14 26)" />
      <ellipse cx="25" cy="14" rx="6.5" ry="9" transform="rotate(-6 25 14)" />
      <ellipse cx="39" cy="14" rx="6.5" ry="9" transform="rotate(6 39 14)" />
      <ellipse cx="50" cy="26" rx="6.5" ry="8.5" transform="rotate(18 50 26)" />
      <path d="M32 30c-8.5 0-17 9.5-17 17.5 0 5 3.6 8 8.4 8 3.6 0 5.6-1.8 8.6-1.8s5 1.8 8.6 1.8c4.8 0 8.4-3 8.4-8C49 39.5 40.5 30 32 30Z" />
    </svg>
  );
}

export function Bone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" aria-hidden {...props}>
      <path d="M12 4a7 7 0 0 0-6.6 9.3A7 7 0 1 0 14 24l1.5-1.5h33L50 24a7 7 0 1 0 8.6-10.7A7 7 0 1 0 50 8l-1.5 1.5h-33L14 8a7 7 0 0 0-2-4Z" />
    </svg>
  );
}

export function Heart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.7 4.3 7.2C19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1c.2.2 2.1 3.2 5 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.8-.7 2-1.4s.3-1.3.2-1.4l-.4-.5ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  );
}
