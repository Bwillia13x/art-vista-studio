import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background" role="main">
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
