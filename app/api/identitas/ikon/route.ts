import { NextResponse } from "next/server";
import { getIdentitas } from "@/lib/data";

/**
 * Ikon tab browser. Dialihkan ke berkas yang dipilih di dashboard
 * (Pengaturan → Profil Rumah Sakit), jadi mengganti ikon tak perlu deploy.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { favicon } = await getIdentitas();
  // redirect relatif: alamat internal container (0.0.0.0:3000) tidak boleh bocor ke browser
  return new Response(null, {
    status: 307,
    headers: { Location: favicon, "Cache-Control": "public, max-age=3600" },
  });
}
