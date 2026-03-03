import { Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="font-display text-2xl tracking-wide">
            <span className="text-accent">34TH ST</span>
            <span className="text-foreground"> CARD SHOW</span>
          </span>
          
          <p className="max-w-md text-sm text-muted-foreground">
            NYC's premier trading card event bringing together collectors, 
            dealers, and enthusiasts from across the tri-state area.
          </p>
          
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a 
              href="#" 
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="mailto:info@34thstcardshow.com" 
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} 34th St Card Show. All rights reserved.</span>
            <Link 
              to="/admin/login" 
              className="text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
