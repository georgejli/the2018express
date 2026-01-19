import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { events as staticEvents, Event } from "@/data/events";

export interface DbEvent {
  id: string;
  event_id: string;
  date: string;
  month: string;
  year: string;
  day_of_week: string;
  time: string;
  early_bird_time: string | null;
  venue: string;
  address: string;
  ga_price: number;
  vip_price: number;
  ga_features: string[];
  vip_features: string[];
  poster: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Convert DB event to frontend Event format
function dbEventToEvent(dbEvent: DbEvent): Event & { description?: string; dbId?: string } {
  return {
    id: dbEvent.event_id,
    dbId: dbEvent.id,
    date: dbEvent.date,
    month: dbEvent.month,
    year: dbEvent.year,
    dayOfWeek: dbEvent.day_of_week,
    time: dbEvent.time,
    earlyBirdTime: dbEvent.early_bird_time || undefined,
    venue: dbEvent.venue,
    address: dbEvent.address,
    gaPrice: dbEvent.ga_price,
    vipPrice: dbEvent.vip_price,
    gaFeatures: dbEvent.ga_features,
    vipFeatures: dbEvent.vip_features,
    poster: dbEvent.poster || undefined,
    description: dbEvent.description || undefined,
  };
}

export function useEvents() {
  const [events, setEvents] = useState<(Event & { description?: string; dbId?: string })[]>(staticEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .order("year", { ascending: true })
        .order("month", { ascending: true })
        .order("date", { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        // Use database events
        setEvents(data.map(dbEventToEvent));
      } else {
        // Fall back to static events if DB is empty
        setEvents(staticEvents);
      }
    } catch (err: any) {
      setError(err.message);
      // Fall back to static events on error
      setEvents(staticEvents);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (dbId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", dbId);

      if (deleteError) throw deleteError;
      
      // Refresh events after deletion
      await fetchEvents();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents, deleteEvent };
}

export function useEvent(eventId: string | undefined) {
  const { events, loading, error, refetch } = useEvents();
  const event = events.find((e) => e.id === eventId);
  
  return { event, loading, error, refetch };
}
