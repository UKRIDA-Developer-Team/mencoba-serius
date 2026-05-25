/**
 * Helper function to get JWT token from localStorage
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("admin_token");
}

/**
 * Helper function to make authenticated API calls
 * Automatically adds Bearer token to Authorization header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAdminToken();

  if (!token) {
    throw new Error("No admin token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
