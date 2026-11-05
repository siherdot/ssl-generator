"use client";

export default function TombolHapus({
  label = "Hapus",
  pesan = "Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.",
}: {
  label?: string;
  pesan?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(pesan)) e.preventDefault();
      }}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
    >
      {label}
    </button>
  );
}
