import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedCelebrity {
  id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  website: string | null;
  display_order: number;
  is_active: boolean;
}

export const useFeaturedCelebrities = (activeOnly = true) => {
  return useQuery({
    queryKey: ["featured-celebrities", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("featured_celebrities")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeaturedCelebrity[];
    },
  });
};

export const useAddFeaturedCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (celebrity: Omit<FeaturedCelebrity, "id">) => {
      const { data, error } = await supabase
        .from("featured_celebrities")
        .insert(celebrity)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-celebrities"] });
    },
  });
};

export const useUpdateFeaturedCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeaturedCelebrity> & { id: string }) => {
      const { data, error } = await supabase
        .from("featured_celebrities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-celebrities"] });
    },
  });
};

export const useDeleteFeaturedCelebrity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("featured_celebrities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-celebrities"] });
    },
  });
};
