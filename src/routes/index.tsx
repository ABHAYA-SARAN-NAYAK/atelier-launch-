import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { CollectionsGrid } from "@/components/site/CollectionsGrid";
import { HowItWorks } from "@/components/site/HowItWorks";
import { DesignerSpotlight } from "@/components/site/DesignerSpotlight";
import { Testimonials } from "@/components/site/Testimonials";
import { DesignerCTA } from "@/components/site/DesignerCTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <CollectionsGrid />
        <HowItWorks />
        <DesignerSpotlight />
        <Testimonials />
        <DesignerCTA />
      </main>
      <Footer />
    </div>
  );
}
