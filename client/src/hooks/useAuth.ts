import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: false, // Disable automatic refetch to prevent reloads
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch, // Expose refetch function for manual refresh
  };
}
