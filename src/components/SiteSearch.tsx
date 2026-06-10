import { useState, useEffect, useRef } from 'react';
import { fetchSites } from '../api/sl';
import type { Site } from '../types/sl';

interface Props {
  onAdd: (site: Site) => void;
  addedIds: number[];
}

export function SiteSearch({ onAdd, addedIds }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : 'Failed to load sites')
      );
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results =
    query.length >= 2
      ? sites
          .filter(
            (s) =>
              s.name.toLowerCase().includes(query.toLowerCase()) &&
              !addedIds.includes(s.id)
          )
          .slice(0, 8)
      : [];

  function handleSelect(site: Site) {
    onAdd(site);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="site-search" ref={containerRef}>
      <input
        className="site-search__input"
        type="text"
        placeholder="Add a stop or station…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {loadError && <p className="site-search__error">{loadError}</p>}
      {open && results.length > 0 && (
        <ul className="site-search__results">
          {results.map((site) => (
            <li key={site.id}>
              <button onClick={() => handleSelect(site)}>{site.name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
