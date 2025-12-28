"use client";

import { useState, useEffect } from "react";
import {
  FloatingParticles,
  Navbar,
  HeroSection,
  ChatMockup,
  FeaturesSection,
  CtaSection,
  Footer,
  landingAnimations,
} from "@/components/landing";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

/**
 * Main page component
 *
 * Manages load state and composes all landing page sections.
 */
export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // State for fade-in animation on mount
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirecting to /chat if user is already logged in
  useEffect(() => {
    if (!isPending && session) {
      router.push("/chat");
    }
  }, [session, isPending, router]);
  /**
   * Initialize load state
   * Runs once on mount
   */
  useEffect(() => {
    // Trigger fade-in animation
    setIsLoaded(true);
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Custom CSS animations */}
      <style jsx>{landingAnimations}</style>

      {/* Floating particle effects */}
      <FloatingParticles />

      {/* Fixed navigation bar */}
      <Navbar />

      {/* Main hero section with headline and CTAs */}
      <HeroSection isLoaded={isLoaded} />

      {/* Animated chat mockup demonstrating the product */}
      <ChatMockup isLoaded={isLoaded} />

      {/* Features section with product highlights */}
      <FeaturesSection />

      {/* Call-to-action section */}
      <CtaSection />

      {/* Footer with copyright */}
      <Footer />
    </div>
  );
}
