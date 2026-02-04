import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { events } from "@/data/events";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get the first upcoming event for the vendor application link
  const firstEvent = events[0];
  const vendorLink = firstEvent ? `/vendor-application?event=${firstEvent.id}` : "/vendor-application";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header 
        className="fixed left-4 right-4 top-4 z-50 scoreboard-nav-floating rounded-2xl transition-all duration-300"
      >
        {/* Corner Rivets */}
        <div className="nav-rivet top-2 left-2" />
        <div className="nav-rivet top-2 right-2" />
        <div className="nav-rivet bottom-2 left-2" />
        <div className="nav-rivet bottom-2 right-2" />
        
        <div className="container relative z-10 mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            {/* Live Indicator */}
            <div className="live-indicator hidden sm:block" />
            
            <span className="font-display text-2xl tracking-tight nav-logo-glow">
              <span className="text-accent drop-shadow-[0_0_10px_hsl(27_91%_55%/0.5)]">34TH ST</span>
              <span className="text-primary-foreground"> CARD SHOW</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link 
              to="/" 
              className="nav-link-scoreboard"
            >
              Events
            </Link>
            <a 
              href="#about" 
              className="nav-link-scoreboard"
            >
              About
            </a>
            <Link
              to={vendorLink}
              className="group relative ml-2 overflow-hidden rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:shadow-[0_0_20px_hsl(27_91%_55%/0.5)]"
            >
              {/* Button glow effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" 
                style={{ transform: 'skewX(-20deg)' }} 
              />
              <span className="relative">Become a Vendor</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground transition-colors hover:bg-primary-foreground/10 md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`relative z-10 overflow-hidden border-t border-primary-foreground/10 bg-primary/95 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Mobile menu rivets */}
          <div className="nav-rivet bottom-2 left-2" />
          <div className="nav-rivet bottom-2 right-2" />
          
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="nav-link-scoreboard rounded-lg px-4 py-3"
            >
              Events
            </Link>
            <a 
              href="#about" 
              onClick={closeMobileMenu}
              className="nav-link-scoreboard rounded-lg px-4 py-3"
            >
              About
            </a>
            <Link
              to={vendorLink}
              onClick={closeMobileMenu}
              className="mt-2 rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_20px_hsl(27_91%_55%/0.5)]"
            >
              Become a Vendor
            </Link>
          </nav>
        </div>

      </header>
    </>
  );
};

export default Header;
