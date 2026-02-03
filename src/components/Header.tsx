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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-primary/20 bg-primary/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className="font-display text-2xl tracking-tight">
            <span className="text-accent">34TH ST</span>
            <span className="text-primary-foreground"> CARD SHOW</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link 
            to="/" 
            className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
          >
            Events
          </Link>
          <a 
            href="#about" 
            className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
          >
            About
          </a>
          <Link
            to={vendorLink}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 hover:glow-gold"
          >
            Become a Vendor
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
        className={`overflow-hidden border-t border-border/50 bg-background transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
          <Link 
            to="/" 
            onClick={closeMobileMenu}
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Events
          </Link>
          <a 
            href="#about" 
            onClick={closeMobileMenu}
            className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            About
          </a>
          <Link
            to={vendorLink}
            onClick={closeMobileMenu}
            className="mt-2 rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground transition-all hover:opacity-90"
          >
            Become a Vendor
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
