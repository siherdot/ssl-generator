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
      <ChatAi />
    </>
  );
}
