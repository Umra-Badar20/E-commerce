const API_URL = import.meta.env.VITE_API_URL||"https://e-commerce-fl9n.vercel.app/" || "http://localhost:3000";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}
