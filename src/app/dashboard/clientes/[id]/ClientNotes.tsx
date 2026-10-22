"use client";

import { useState, useTransition } from "react";
import { updateClientNotes } from "../../actions";
import { inputCls, btnPrimary } from "@/components/dashboard/ui";

export function ClientNotes({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-2">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Alergias, carácter, preferencias…"
        className={inputCls}
      />
      <button
        type="button"
        disabled={pending || value === initial}
        onClick={() => start(async () => { await updateClientNotes(id, value); setSaved(true); })}
        className={btnPrimary}
      >
        {saved ? "Guardado ✓" : "Guardar notas"}
      </button>
    </div>
  );
}
