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
      className={`relative overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-0.5 ${
        isVIP 
          ? "border-accent/40 bg-card" 
          : "border-border bg-card"
      }`}
    >
      {isVIP && (
        <div className="absolute right-0 top-0 rounded-bl-md bg-accent px-3 py-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent-foreground text-accent-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground">
              VIP
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <h3 className="font-display text-2xl text-foreground">
          {isVIP ? "VIP Access" : "General Admission"}
        </h3>
        
        <div className="mt-3 flex items-baseline gap-1">
          <span className={`font-display text-4xl ${isVIP ? "text-accent" : "text-foreground"}`}>
            ${price}
          </span>
          <span className="text-sm text-muted-foreground">/ person</span>
        </div>
        
        <ul className="mt-5 space-y-2.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isVIP ? "text-accent" : "text-primary"}`} />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={onSelect}
          className={`mt-6 w-full py-5 font-semibold ${
            isVIP 
              ? "bg-accent text-accent-foreground hover:bg-accent/90" 
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
