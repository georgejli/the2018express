import { Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="font-display text-3xl tracking-tight">
            <span className="text-gradient-gold">34TH ST</span>
            <span className="text-foreground"> CARD SHOW</span>
          </span>
          
          <p className="max-w-md text-sm text-muted-foreground">
            NYC's premier trading card event bringing together collectors, 
            dealers, and enthusiasts from across the tri-state area.
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="mailto:info@34thstcardshow.com" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} 34th St Card Show. All rights reserved.</span>
            <Link 
              to="/admin/login" 
              className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
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
