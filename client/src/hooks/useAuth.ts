import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
    refetchInterval: 1000 * 10, // Check every 10 seconds
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
