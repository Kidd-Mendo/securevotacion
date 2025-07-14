import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
    refetchInterval: 1000 * 5, // Check every 5 seconds for role changes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch, // Expose refetch function
  };
}
