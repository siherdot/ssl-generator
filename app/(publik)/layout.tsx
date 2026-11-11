import Topbar from "@/components/topbar";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatAi from "@/components/chat-ai";
import { getIdentitas } from "@/lib/data";

export default async function PublikLayout({ children }: { children: React.ReactNode }) {
  const identitas = await getIdentitas();
  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Langsung ke konten
      </a>
      <Topbar />
      <Navbar logo={identitas.logo} />
      <main id="konten">{children}</main>
      <Footer />
      {/* pola identitas RS: di belakang seluruh konten, jadi foto/kartu menutupinya */}
      <div aria-hidden="true" className="pola-latar pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden="true" className="pola-pojok pointer-events-none fixed inset-0 -z-10" />
      <ChatAi />
    </>
  );
}
