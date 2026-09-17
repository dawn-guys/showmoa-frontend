import { useQuery } from "@tanstack/react-query";
import { MOCK_AUTH_STATE, MOCK_USER } from "@/shared/mocks/auth";

export function useAuth() {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    // MOCK: replace queryFn with the real session request in Phase 2.
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_AUTH_STATE === "user" ? MOCK_USER : null;
    },
  });

  return { user, isLoggedIn: user !== null, isLoading };
}
