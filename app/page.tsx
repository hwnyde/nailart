import { Hero } from "@/components/main/hero";
import { Navbar } from "@/components/main/navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero
        title="AI-Powered YouTube Thumbnails That Get Clicks."
        subtitle="Generate scroll-stopping thumbnails in seconds. Just describe your video and let Nailart AI craft the perfect thumbnail to maximize your views."
        ctaLabel="Get Started"
        ctaHref="#"
        secondaryCtaLabel="Learn More"
        secondaryCtaHref="#features"
      />
    </main>
  );
}
