import { Chrome } from "@/components/Chrome";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";

export default function SiteLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-accent-teal focus:px-4 focus:py-2 focus:text-bg-base"
      >
        Skip to content
      </a>
      <Chrome />
      {children}
      {modal}
      <Footer />
      <Analytics />
    </>
  );
}
