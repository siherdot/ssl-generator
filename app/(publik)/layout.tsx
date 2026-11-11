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
      {/* pola identitas RS: motif diulang rapat + dua ornamen pojok */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 bg-repeat"
        style={{
          backgroundImage: 'url("/images/pattern/pola-ubin.png")',
          backgroundSize: "210px auto",
          backgroundPosition: "0 0",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 bg-no-repeat"
        style={{
          backgroundImage:
            'url("/images/pattern/pola-besar.png"), url("/images/pattern/pola-besar.png")',
          backgroundPosition: "left -190px bottom -230px, right -80px top 120px",
          backgroundSize: "760px auto, 300px auto",
        }}
      />
      <ChatAi />
    </>
  );
}
