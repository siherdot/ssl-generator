import Topbar from "@/components/topbar";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatAi from "@/components/chat-ai";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Langsung ke konten
      </a>
      <Topbar />
      <Navbar />
      <main id="konten">{children}</main>
      <Footer />
      {/* pola identitas RS: dua ornamen samar seperti kop surat */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 bg-no-repeat"
        style={{
          backgroundImage:
            'url("/images/pattern/mandala-hijau.png"), url("/images/pattern/mandala-hijau.png")',
          backgroundPosition: "left -170px bottom -210px, right -70px top 110px",
          backgroundSize: "740px auto, 310px auto",
        }}
      />
      <ChatAi />
    </>
  );
}
