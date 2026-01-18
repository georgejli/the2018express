import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wider">
            <span className="text-gradient-gold">34TH ST</span>
            <span className="text-foreground"> CARD SHOW</span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Events
          </Link>
          <a 
            href="#about" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>
          <a 
            href="https://forms.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 hover:glow-gold"
          >
            Become a Vendor
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
