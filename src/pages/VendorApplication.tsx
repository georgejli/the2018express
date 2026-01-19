import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { events } from "@/data/events";

// Helper to format event date as "February 15, 2026"
const formatEventDate = (month: string, date: string, year: string): string => {
  const monthNames: Record<string, string> = {
    JAN: "January",
    FEB: "February",
    MAR: "March",
    APR: "April",
    MAY: "May",
    JUN: "June",
    JUL: "July",
    AUG: "August",
    SEP: "September",
    OCT: "October",
    NOV: "November",
    DEC: "December",
  };
  return `${monthNames[month] || month} ${date}, ${year}`;
};

const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  eventId: z.string().min(1, "Please select an event date"),
  tableTier: z.enum(["main_ballroom", "crystal_room", "2nd_floor"], {
    required_error: "Please select a table tier",
  }),
  tableQuantity: z.number().min(1, "At least 1 table required").max(20, "Maximum 20 tables"),
  vendorCount: z.number().min(1, "At least 1 vendor required").max(10, "Maximum 10 vendors"),
  merchandiseDescription: z.string().trim().min(10, "Please describe your merchandise (at least 10 characters)").max(1000, "Description must be less than 1000 characters"),
  specialRequests: z.string().max(500, "Special requests must be less than 500 characters").optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

const tierLabels: Record<string, { name: string; price: number }> = {
  main_ballroom: { name: "Main Ballroom (1st Floor)", price: 250 },
  crystal_room: { name: "Crystal Room (1st Floor)", price: 200 },
  "2nd_floor": { name: "2nd Floor (Every Room)", price: 150 },
};

const VendorApplication = () => {
  const [searchParams] = useSearchParams();
  const preselectedTier = searchParams.get("tier") as "main_ballroom" | "crystal_room" | "2nd_floor" | null;
  const preselectedEventId = searchParams.get("event") || (events.length > 0 ? events[0].id : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventId: preselectedEventId,
      tableTier: preselectedTier || undefined,
      tableQuantity: 1,
      vendorCount: 1,
      merchandiseDescription: "",
      specialRequests: "",
    },
  });

  const selectedTier = form.watch("tableTier");
  const selectedEventId = form.watch("eventId");
  const tableQuantity = form.watch("tableQuantity");
  const totalPrice = selectedTier ? tierLabels[selectedTier].price * tableQuantity : 0;

  // Get the selected event for the submission
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const onSubmit = async (data: VendorFormValues) => {
    const event = events.find((e) => e.id === data.eventId);
    if (!event) {
      toast.error("Please select a valid event");
      return;
    }

    const eventDate = formatEventDate(event.month, event.date, event.year);
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-vendor-application", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          eventId: data.eventId,
          tableTier: data.tableTier,
          tableTierLabel: tierLabels[data.tableTier].name,
          tableQuantity: data.tableQuantity,
          vendorCount: data.vendorCount,
          merchandiseDescription: data.merchandiseDescription,
          specialRequests: data.specialRequests,
          pricePerTable: tierLabels[data.tableTier].price,
          totalPrice,
          eventDate,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Application submitted successfully!", {
        description: "We'll be in touch soon.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 pt-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
              <Send className="h-10 w-10 text-accent" />
            </div>
            <h1 className="font-display text-4xl text-foreground">Application Submitted!</h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for your interest. We'll review your application and get back to you soon.
            </p>
            <Link
              to={preselectedEventId ? `/event/${preselectedEventId}` : "/"}
              className="mt-8 inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {preselectedEventId ? "Back to Event" : "Back to Home"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 px-4 pb-16 pt-24">
        <div className="container mx-auto max-w-2xl animate-fade-in">
          <Link
            to={preselectedEventId ? `/event/${preselectedEventId}` : "/"}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {preselectedEventId ? "Back to Event" : "Back to Home"}
          </Link>

          <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
            <span className="text-gradient-gold">Vendor</span> Application
          </h1>
          <p className="mt-4 text-muted-foreground">
            Reserve your table at the 34th St Card Show. Fill out the form below and we'll be in touch.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Event Selection */}
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {formatEventDate(event.month, event.date, event.year)} - {event.venue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
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

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="2015278332"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Table Tier */}
                <FormField
                  control={form.control}
                  name="tableTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a table tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main_ballroom">
                            Main Ballroom (1st Floor) - $250/table
                          </SelectItem>
                          <SelectItem value="crystal_room">
                            Crystal Room (1st Floor) - $200/table
                          </SelectItem>
                          <SelectItem value="2nd_floor">
                            2nd Floor (Every Room) - $150/table
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Table Quantity */}
                  <FormField
                    control={form.control}
                    name="tableQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Tables</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vendor Count */}
                  <FormField
                    control={form.control}
                    name="vendorCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Vendors</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Price Summary */}
                {selectedTier && (
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {tableQuantity} × {tierLabels[selectedTier].name}
                      </span>
                      <span className="font-display text-2xl text-accent">${totalPrice}</span>
                    </div>
                  </div>
                )}

                {/* Merchandise Description */}
                <FormField
                  control={form.control}
                  name="merchandiseDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe Your Merchandise</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sports cards, trading cards, memorabilia, etc."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Special Requests */}
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests/Needs (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Power outlets, corner spot, etc."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-accent to-gold-light text-accent-foreground hover:opacity-90"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorApplication;
