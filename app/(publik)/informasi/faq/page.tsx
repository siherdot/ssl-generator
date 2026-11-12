import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getCompany, getPenjamin } from "@/lib/data";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Pertanyaan Umum (FAQ)") };
}

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const lang = await bacaBahasa();
  const [company, penjamin] = await Promise.all([getCompany(), getPenjamin()]);

  const alamat = company?.alamat || site.address;
  const telepon = company?.phone || site.phone;
  const igd = company?.igd_phone || site.igd;

  const faqId = [
    {
      q: "Apakah IGD buka 24 jam?",
      a: `Ya. Instalasi Gawat Darurat ${site.name} melayani 24 jam setiap hari. Untuk kondisi darurat, datang langsung ke IGD.`,
    },
    {
      q: "Bagaimana cara mendaftar berobat?",
      a: "Pendaftaran rawat jalan dilakukan melalui aplikasi Mobile JKN milik BPJS Kesehatan. Unduh aplikasinya, pilih Pendaftaran Pelayanan (Antrean Online), lalu cari nama rumah sakit ini. Datang langsung ke loket juga tetap bisa.",
    },
    {
      q: "Bagaimana cara mengetahui jadwal dokter?",
      a: "Buka halaman Cari Dokter. Anda bisa memfilter berdasarkan poliklinik, hari praktik, atau mengetik nama dokter. Setiap dokter punya halaman profil dengan jadwal lengkap.",
    },
    {
      q: "Apakah menerima asuransi?",
      a: `Kami bekerja sama dengan ${penjamin.length} rekanan asuransi, TPA, dan korporat. Daftarnya ada di halaman Asuransi & Penjamin. Sebaiknya konfirmasi ke kantor penjamin sebelum datang.`,
    },
    {
      q: "Kelas rawat inap apa saja yang tersedia?",
      a: "Kelas III, II, I, dan VIP, serta perawatan intensif ICU, NICU & Baby. Ketersediaan kamar berubah setiap hari — konfirmasi ke pendaftaran.",
    },
    {
      q: "Di mana alamat rumah sakit?",
      a: `${alamat}.`,
    },
    {
      q: "Nomor apa yang bisa dihubungi?",
      a: `Telepon ${telepon}. Untuk darurat gunakan nomor IGD ${igd}.`,
    },
    {
      q: "Apakah bisa memilih dokter saat mendaftar?",
      a: "Bisa. Pilih poliklinik lebih dulu di aplikasi Mobile JKN, lalu pilih dokter yang praktik di poliklinik tersebut. Dokter juga bisa ditentukan nanti di loket.",
    },
  ];

  const faqEn = [
    {
      q: "Is the emergency department open 24 hours?",
      a: `Yes. The Emergency Department at ${site.name} is open 24 hours a day. For emergencies, come directly to the ED.`,
    },
    {
      q: "How do I register for treatment?",
      a: "Outpatient registration is handled through BPJS Kesehatan's Mobile JKN app. Install the app, choose Pendaftaran Pelayanan (online queue), then search for this hospital. You can also register at our counter.",
    },
    {
      q: "How can I find out doctor schedules?",
      a: "Open the Find a Doctor page. You can filter by clinic, practice day, or type a doctor's name. Every doctor has a profile page with the full schedule.",
    },
    {
      q: "Do you accept insurance?",
      a: `We work with ${penjamin.length} insurance partners, TPAs, and corporate clients. The list is on the Insurance & Guarantors page. Please confirm with your insurer before arriving.`,
    },
    {
      q: "Which inpatient room classes are available?",
      a: "Classes III, II, I, and VIP, plus ICU, NICU & Baby intensive care. Room availability changes daily — please confirm with our registration desk.",
    },
    {
      q: "Where is the hospital located?",
      a: `${alamat}.`,
    },
    {
      q: "Which numbers can I call?",
      a: `Phone ${telepon}. For emergencies, use the ED number ${igd}.`,
    },
    {
      q: "Can I choose a doctor when registering?",
      a: "Yes. Pick the clinic first in the Mobile JKN app, then choose a doctor practising in that clinic. You can also be assigned a doctor at the counter.",
    },
  ];

  const faq = lang === "en" ? faqEn : faqId;

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Pertanyaan Umum (FAQ)")}
        description={tx(lang, "Jawaban singkat untuk pertanyaan yang sering muncul.")}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: tx(lang, "Pertanyaan Umum") },
        ]}
      />

      <section className="container-page py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-[var(--radius-card)] border border-line bg-white p-4 open:shadow-[var(--shadow-card)]"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-brand-900 marker:hidden">
                <span className="flex items-start justify-between gap-3">
                  {f.q}
                  <span className="mt-0.5 shrink-0 text-brand-700 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}

          <p className="pt-4 text-sm text-muted">
            {tx(lang, "Belum menemukan jawaban?")}{" "}
            <Link href="/kontak" className="font-semibold text-brand-800 underline">
              {tx(lang, "Hubungi kami")}
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
