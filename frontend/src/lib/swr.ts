import useSWR, { type SWRConfiguration, type SWRResponse } from "swr";

export function useApi<T>(
  key: string | null,
  options?: SWRConfiguration<T, Error>,
): SWRResponse<T, Error> {
  return useSWR<T, Error>(key, options);
}

export function apiKey(path: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
