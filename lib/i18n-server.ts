import { cookies } from "next/headers";
import { KUKI_BAHASA, type Lang } from "./i18n";

/** Bahasa aktif dibaca dari cookie; default Indonesia. */
export async function bacaBahasa(): Promise<Lang> {
  const jar = await cookies();
  return jar.get(KUKI_BAHASA)?.value === "en" ? "en" : "id";
}
