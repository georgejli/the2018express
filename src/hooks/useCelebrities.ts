import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Celebrity {
  id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  website: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventCelebrityLink {
  id: string;
  event_id: string;
  celebrity_id: string;
  display_order: number;
  created_at: string;
  celebrity?: Celebrity;
}

// Fetch all celebrities (optionally filter by featured status)
export const useCelebrities = (featuredOnly?: boolean) => {
  return useQuery({
    queryKey: ["celebrities", featuredOnly],
    queryFn: async () => {
      let query = supabase
        .from("celebrities")
        .select("*")
        .order("featured_order", { ascending: true });

      if (featuredOnly) {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Celebrity[];
    },
  });
};

// Fetch celebrities linked to a specific event
export const useEventCelebrities = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["event-celebrities-unified", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from("event_celebrity_links")
        .select(`
          id,
          event_id,
          celebrity_id,
          display_order,
          created_at,
          celebrity:celebrities(*)
        `)
        .eq("event_id", eventId)
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Transform the data to include flattened celebrity info
      return (data || []).map((link) => ({
        ...link,
        celebrity: link.celebrity as Celebrity,
      })) as EventCelebrityLink[];
    },
    enabled: !!eventId,
  });
};

// Add a new celebrity
export const useAddCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (celebrity: Omit<Celebrity, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("celebrities")
        .insert(celebrity)
        .select()
        .single();
      if (error) throw error;
      return data as Celebrity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebrities"] });
    },
  });
};

// Update an existing celebrity
export const useUpdateCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Celebrity> & { id: string }) => {
      const { data, error } = await supabase
        .from("celebrities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Celebrity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["event-celebrities-unified"] });
    },
  });
};

// Delete a celebrity
export const useDeleteCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("celebrities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["event-celebrities-unified"] });
    },
  });
};

// Link a celebrity to an event
export const useLinkCelebrityToEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, celebrityId, displayOrder }: { eventId: string; celebrityId: string; displayOrder: number }) => {
      const { data, error } = await supabase
        .from("event_celebrity_links")
        .insert({
          event_id: eventId,
          celebrity_id: celebrityId,
          display_order: displayOrder,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities-unified", variables.eventId] });
    },
  });
};

// Unlink a celebrity from an event
export const useUnlinkCelebrityFromEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ linkId, eventId }: { linkId: string; eventId: string }) => {
      const { error } = await supabase.from("event_celebrity_links").delete().eq("id", linkId);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities-unified", eventId] });
    },
  });
};

// Reorder celebrities (update featured_order for multiple celebrities)
export const useReorderCelebrities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; featured_order: number }[]) => {
      const promises = updates.map(({ id, featured_order }) =>
        supabase.from("celebrities").update({ featured_order }).eq("id", id)
      );
      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebrities"] });
    },
  });
};

// Reorder event celebrity links
export const useReorderEventCelebrities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: { id: string; display_order: number }[] }) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase.from("event_celebrity_links").update({ display_order }).eq("id", id)
      );
      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities-unified", eventId] });
    },
  });
};
