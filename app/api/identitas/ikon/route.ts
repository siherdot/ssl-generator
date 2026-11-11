import { NextResponse } from "next/server";
import { getIdentitas } from "@/lib/data";

/**
 * Ikon tab browser. Dialihkan ke berkas yang dipilih di dashboard
 * (Pengaturan → Profil Rumah Sakit), jadi mengganti ikon tak perlu deploy.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { favicon } = await getIdentitas();
  const tujuan = new URL(favicon, req.url);
  return NextResponse.redirect(tujuan, {
    status: 307,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
