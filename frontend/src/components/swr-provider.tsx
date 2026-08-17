"use client";

import { SWRConfig } from "swr";

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to load data");
  }

  return data;
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10_000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
