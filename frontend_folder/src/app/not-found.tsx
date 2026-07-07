import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/PageHeader";

// Custom 404 (Section 7.9) — matches the design system, links back home.

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-4 px-6 py-24">
      <PageHeader
        eyebrow="404 — route_not_found"
        title="This page doesn’t exist"
        lede="The address may be mistyped, or the page may have moved. Everything on this site is reachable from the home page."
      />
      <div className="mt-2">
        <Button variant="primary" href="/">
          <ArrowLeft aria-hidden size={18} /> Back to home
        </Button>
      </div>
    </main>
  );
}
