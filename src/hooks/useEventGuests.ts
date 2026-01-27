import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventCelebrity {
  id: string;
  event_id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  website: string | null;
  display_order: number;
}

export interface EventSponsor {
  id: string;
  event_id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  website: string;
  display_order: number;
}

export const useEventCelebrities = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["event-celebrities", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from("event_celebrities")
        .select("*")
        .eq("event_id", eventId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as EventCelebrity[];
    },
    enabled: !!eventId,
  });
};

export const useEventSponsors = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["event-sponsors", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from("event_sponsors")
        .select("*")
        .eq("event_id", eventId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as EventSponsor[];
    },
    enabled: !!eventId,
  });
};

export const useAddCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (celebrity: Omit<EventCelebrity, "id">) => {
      const { data, error } = await supabase
        .from("event_celebrities")
        .insert(celebrity)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities", variables.event_id] });
    },
  });
};

export const useUpdateCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventCelebrity> & { id: string }) => {
      const { data, error } = await supabase
        .from("event_celebrities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities", data.event_id] });
    },
  });
};

export const useDeleteCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from("event_celebrities").delete().eq("id", id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event-celebrities", eventId] });
    },
  });
};

export const useAddSponsor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sponsor: Omit<EventSponsor, "id">) => {
      const { data, error } = await supabase
        .from("event_sponsors")
        .insert(sponsor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsors", variables.event_id] });
    },
  });
};

export const useUpdateSponsor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventSponsor> & { id: string }) => {
      const { data, error } = await supabase
        .from("event_sponsors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsors", data.event_id] });
    },
  });
};

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from("event_sponsors").delete().eq("id", id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsors", eventId] });
    },
  });
};
