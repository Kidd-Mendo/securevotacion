import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 30, // 30 seconds - frequent updates for role changes
    refetchInterval: 1000 * 60, // Check every minute
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
