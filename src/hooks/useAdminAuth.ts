import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UseAdminAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

export const useAdminAuth = (): UseAdminAuthResult => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            navigate("/admin/login", { replace: true });
          }
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleError || !roleData) {
          // Not an admin, sign out and redirect
          await supabase.auth.signOut();
          if (mounted) {
            navigate("/admin/login", { replace: true });
          }
          return;
        }

        // User is authenticated and is an admin
        if (mounted) {
          setUserId(session.user.id);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          navigate("/admin/login", { replace: true });
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (mounted) {
          setIsAuthenticated(false);
          setUserId(null);
          navigate("/admin/login", { replace: true });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isAuthenticated, isLoading, userId };
};
