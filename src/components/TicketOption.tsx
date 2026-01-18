import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketOptionProps {
  type: "GA" | "VIP";
  price: number;
  features: string[];
  onSelect: () => void;
}

const TicketOption = ({ type, price, features, onSelect }: TicketOptionProps) => {
  const isVIP = type === "VIP";
  
  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
        isVIP 
          ? "border-accent/50 bg-gradient-to-br from-card via-card to-accent/10" 
          : "border-border bg-card"
      }`}
    >
      {isVIP && (
        <div className="absolute right-0 top-0 bg-gradient-to-r from-accent to-gold-light px-4 py-1.5">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent-foreground text-accent-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground">
              VIP
            </span>
          </div>
        </div>
      )}
      
      <div className="p-8">
        <h3 className="font-display text-3xl text-foreground">
          {isVIP ? "VIP Access" : "General Admission"}
        </h3>
        
        <div className="mt-4 flex items-baseline gap-1">
          <span className={`font-display text-5xl ${isVIP ? "text-gradient-gold" : "text-foreground"}`}>
            ${price}
          </span>
          <span className="text-muted-foreground">/ person</span>
        </div>
        
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isVIP ? "text-accent" : "text-primary"}`} />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={onSelect}
          className={`mt-8 w-full py-6 font-semibold ${
            isVIP 
              ? "bg-gradient-to-r from-accent to-gold-light text-accent-foreground hover:opacity-90" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          Get {type} Tickets
        </Button>
      </div>
    </div>
  );
};

export default TicketOption;
