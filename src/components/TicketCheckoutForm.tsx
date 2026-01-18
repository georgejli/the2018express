import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Ticket, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  customerEmail: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  customerPhone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long"),
  quantity: z.number().min(1, "At least 1 ticket required").max(10, "Maximum 10 tickets"),
  subscribeToUpdates: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface TicketCheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: "GA" | "VIP";
  price: number;
  eventId: string;
  eventDate: string;
  eventName: string;
}

const TicketCheckoutForm = ({
  isOpen,
  onClose,
  ticketType,
  price,
  eventId,
  eventDate,
  eventName,
}: TicketCheckoutFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      quantity: 1,
      subscribeToUpdates: false,
    },
  });

  const quantity = form.watch("quantity");
  const totalPrice = price * quantity;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          eventId,
          eventDate,
          eventName,
          ticketType,
          quantity: values.quantity,
          unitPrice: price,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          subscribeToUpdates: values.subscribeToUpdates,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Ticket className={ticketType === "VIP" ? "text-accent" : "text-primary"} />
            {ticketType === "VIP" ? "VIP Access" : "General Admission"}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 rounded-lg bg-secondary/50 p-4">
          <p className="text-sm text-muted-foreground">{eventName}</p>
          <p className="text-sm text-muted-foreground">{eventDate}</p>
          <p className="mt-2 font-display text-2xl text-foreground">
            ${price} <span className="text-sm font-normal text-muted-foreground">per ticket</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "ticket" : "tickets"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscribeToUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Sign me up for event updates
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Get notified about future events and special offers
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {quantity} × ${price}
                </span>
                <span className="font-display text-2xl text-accent">
                  ${totalPrice}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-6 font-semibold ${
                ticketType === "VIP"
                  ? "bg-gradient-to-r from-accent to-gold-light text-accent-foreground hover:opacity-90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed to Payment - $${totalPrice}`
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketCheckoutForm;
