import type { Site, Departure } from '../types/sl';

const BASE_URL = '/api/sl';
const API_KEY = import.meta.env.VITE_SL_API_KEY as string | undefined;

function buildUrl(path: string): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (API_KEY) url.searchParams.set('key', API_KEY);
  return url.toString();
}

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch(buildUrl('/sites'));
  if (!res.ok) throw new Error(`Failed to fetch sites (${res.status})`);
  const data = await res.json() as Site[] | { sites: Site[] };
  return Array.isArray(data) ? data : data.sites;
}

export async function fetchDepartures(siteId: number): Promise<Departure[]> {
  const res = await fetch(buildUrl(`/sites/${siteId}/departures`));
  if (!res.ok) throw new Error(`Failed to fetch departures (${res.status})`);
  const data = await res.json() as Departure[] | { departures: Departure[] };
  return Array.isArray(data) ? data : data.departures;
}
