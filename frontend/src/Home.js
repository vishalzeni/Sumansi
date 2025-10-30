import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ClothingGallery from "./components/ClothingGallery.jsx";
import NewArrivalsCarousel from "./components/NewArrivalsCarousel.jsx";
import CustomerReviews from "./components/CustomerReviews.jsx";
import Footer from "./components/Footer.jsx";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Check if URL has hash for new arrivals
    if (window.location.hash === "#new-arrivals") {
      const newArrivalsSection = document.getElementById("new-arrivals");
      if (newArrivalsSection) {
        // Small timeout to ensure DOM is fully rendered
        setTimeout(() => {
          newArrivalsSection.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <AnnouncementBar />
      <Header />
      <Hero />
      <ClothingGallery />
      <NewArrivalsCarousel />
      <CustomerReviews />
      <Footer />
    </>
  );
}
