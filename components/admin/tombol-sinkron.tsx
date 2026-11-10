"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Tombol tarik data dari SIMRS untuk satu jenis konten di dashboard admin. */
export default function TombolSinkron({ jenis }: { jenis: "jadwal" | "kasur" }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  async function jalan() {
    setSibuk(true);
    setPesan(null);
    try {
      const res = await fetch(`/admin/sinkron?jenis=${jenis}`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; pesan?: string };
      setPesan((res.ok ? "✔ " : "✖ ") + (data.pesan ?? `HTTP ${res.status}`));
      if (res.ok) router.refresh();
    } catch (e) {
      setPesan(`✖ ${e instanceof Error ? e.message : "gagal menghubungi server"}`);
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={jalan}
        disabled={sibuk}
        className="rounded-lg border border-brand-800 px-4 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist disabled:opacity-60"
      >
        {sibuk ? "Menyinkronkan…" : "Sinkron dari SIMRS"}
      </button>
      {pesan && <span className="max-w-sm text-right text-xs text-muted">{pesan}</span>}
    </div>
  );
}
