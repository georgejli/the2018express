import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { events } from "@/data/events";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const firstEvent = events[0];
  const vendorLink = firstEvent ? `/vendor-application?event=${firstEvent.id}` : "/vendor-application";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    let lastScrollYRef = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
        lastScrollYRef = currentScrollY;
        return;
      }
      
      if (currentScrollY < lastScrollYRef - 5) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef + 5) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      }
      
      lastScrollYRef = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed left-0 right-0 top-0 z-50 bg-background transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <span className="font-display text-2xl tracking-wide">
              <span className="text-accent">34TH ST</span>
              <span className="text-foreground/90"> CARD</span>
              <span className="font-bold italic text-foreground"> SHOW</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Events
            </Link>
            <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              About
            </a>
            <Link
              to={vendorLink}
              className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Become a Vendor
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden border-t border-border bg-background transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            <Link to="/" onClick={closeMobileMenu} className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              Events
            </Link>
            <a href="#about" onClick={closeMobileMenu} className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              About
            </a>
            <Link
              to={vendorLink}
              onClick={closeMobileMenu}
              className="mt-1 rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
            >
              Become a Vendor
            </Link>
          </nav>
        </div>

        {/* Bottom accent line */}
        <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-primary" />
      </header>
    </>
  );
};

export default Header;
