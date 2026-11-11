"use client";

import { useEffect, useRef, useState } from "react";

type Pesan = { dari: "tamu" | "ai"; teks: string };

const SAPAAN: Pesan = {
  dari: "ai",
  teks: "Halo! Saya asisten RSU Mahkota Bidadari. Silakan tanya jadwal dokter, poliklinik, layanan, atau cara mendaftar.",
};

function idSesi() {
  const kunci = "chat_ai_sesi";
  let id = localStorage.getItem(kunci);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(kunci, id);
  }
  return id;
}

/** Tombol mengambang kanan bawah + panel tanya jawab ke n8n. */
export default function ChatAi() {
  const [buka, setBuka] = useState(false);
  const [isi, setIsi] = useState<Pesan[]>([SAPAAN]);
  const [tanya, setTanya] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const ujung = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ujung.current?.scrollIntoView({ behavior: "smooth" });
  }, [isi, buka]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    const teks = tanya.trim();
    if (!teks || sibuk) return;

    setIsi((k) => [...k, { dari: "tamu", teks }]);
    setTanya("");
    setSibuk(true);

    try {
      const r = await fetch("/api/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: teks, sesi: idSesi() }),
      });
      const j = await r.json().catch(() => ({}));
      setIsi((k) => [
        ...k,
        { dari: "ai", teks: j.jawaban || "Maaf, asisten sedang tidak bisa menjawab. Coba lagi sebentar." },
      ]);
    } catch {
      setIsi((k) => [...k, { dari: "ai", teks: "Koneksi terputus. Periksa jaringan lalu coba lagi." }]);
    } finally {
      setSibuk(false);
    }
  }

  return (
    <>
      {buka && (
        <div className="fixed inset-x-3 bottom-24 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]">
          <div className="flex items-center justify-between gap-2 bg-brand-800 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Tanya Asisten RS</p>
              <p className="text-[11px] text-white/70">Dijawab otomatis · 24 jam</p>
            </div>
            <button
              type="button"
              onClick={() => setBuka(false)}
              aria-label="Tutup obrolan"
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-3 py-3" style={{ minHeight: "14rem" }}>
            {isi.map((m, i) => (
              <div key={i} className={m.dari === "tamu" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.dari === "tamu"
                      ? "rounded-br-sm bg-brand-700 text-white"
                      : "rounded-bl-sm border border-black/5 bg-white text-ink shadow-sm"
                  }`}
                >
                  {m.teks}
                </p>
              </div>
            ))}
            {sibuk && <p className="text-[12px] italic text-muted">Asisten sedang mengetik…</p>}
            <div ref={ujung} />
          </div>

          <form onSubmit={kirim} className="flex items-end gap-2 border-t border-black/10 bg-white px-3 py-2.5">
            <label htmlFor="chat-ai-isi" className="sr-only">
              Tulis pertanyaan
            </label>
            <textarea
              id="chat-ai-isi"
              rows={1}
              value={tanya}
              onChange={(e) => setTanya(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  kirim(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Tulis pertanyaan…"
              maxLength={1000}
              className="max-h-24 flex-1 resize-none rounded-xl border border-black/10 px-3 py-2 text-[13px] text-ink outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              disabled={sibuk || !tanya.trim()}
              className="rounded-xl bg-brand-700 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        aria-label={buka ? "Tutup obrolan asisten" : "Buka obrolan asisten"}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-brand-800"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-3.5-.6L3 21l1.7-4.3A8.2 8.2 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
        </svg>
        <span className="hidden sm:inline">Tanya AI</span>
      </button>
    </>
  );
}
