import { useState, useEffect } from 'react';
import { fetchDepartures } from '../api/sl';
import type { Departure } from '../types/sl';

interface UseDeparturesResult {
  departures: Departure[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useDepartures(siteId: number): UseDeparturesResult {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchDepartures(siteId);
        if (!cancelled) {
          setDepartures(data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();
    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [siteId]);

  return { departures, loading, error, lastUpdated };
}
