import { useDepartures } from '../hooks/useDepartures';
import type { Site, Departure, TransportMode, Thresholds } from '../types/sl';

interface Props {
  site: Site;
  onRemove: (id: number) => void;
  thresholds: Thresholds;
}

const MODE_LABELS: Record<TransportMode, string> = {
  BUS: 'Buss',
  TRAM: 'Spårvagn',
  METRO: 'Tunnelbana',
  TRAIN: 'Pendeltåg',
  SHIP: 'Båt',
  FERRY: 'Färja',
};

const MODE_ORDER: TransportMode[] = ['BUS', 'TRAM', 'METRO', 'TRAIN', 'SHIP', 'FERRY'];

function minutesUntil(departure: Departure): number {
  const timeStr = departure.expected ?? departure.scheduled;
  return (new Date(timeStr).getTime() - Date.now()) / 60_000;
}

type BoxColor = 'green' | 'yellow' | 'red' | 'gray';

function boxColor(departures: Departure[], thresholds: Thresholds): BoxColor {
  if (departures.length === 0) return 'gray';
  const mins = Math.min(...departures.map(minutesUntil));
  if (mins <= thresholds.red) return 'red';
  if (mins <= thresholds.yellow) return 'yellow';
  return 'green';
}

function groupByMode(departures: Departure[]): Map<TransportMode, Departure[]> {
  const map = new Map<TransportMode, Departure[]>();
  for (const d of departures) {
    const mode = d.line.transport_mode;
    const list = map.get(mode) ?? [];
    list.push(d);
    map.set(mode, list);
  }
  for (const [mode, list] of map) {
    map.set(
      mode,
      list.sort((a, b) => minutesUntil(a) - minutesUntil(b)).slice(0, 2)
    );
  }
  return map;
}

export function DepartureBox({ site, onRemove, thresholds }: Props) {
  const { departures, loading, error, lastUpdated } = useDepartures(site.id);
  const color = boxColor(departures, thresholds);
  const grouped = groupByMode(departures);
  const presentModes = MODE_ORDER.filter((m) => grouped.has(m));

  return (
    <div className={`departure-box departure-box--${color}`}>
      <div className="departure-box__header">
        <h2 className="departure-box__title">{site.name}</h2>
        <button className="remove-btn" onClick={() => onRemove(site.id)} aria-label="Remove">
          ✕
        </button>
      </div>

      {loading && <p className="departure-box__status">Hämtar avgångar…</p>}
      {error && <p className="departure-box__status departure-box__status--error">{error}</p>}

      {!loading && !error && presentModes.length === 0 && (
        <p className="departure-box__status">Inga avgångar hittades.</p>
      )}

      {presentModes.map((mode) => (
        <DepartureSection
          key={mode}
          title={MODE_LABELS[mode]}
          departures={grouped.get(mode)!}
        />
      ))}

      {lastUpdated && (
        <p className="departure-box__updated">
          Uppdaterad {lastUpdated.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

function DepartureSection({ title, departures }: { title: string; departures: Departure[] }) {
  return (
    <div className="departure-section">
      <h3 className="departure-section__title">{title}</h3>
      <ul className="departure-list">
        {departures.map((d, i) => (
          <li key={i} className="departure-row">
            <span className="departure-row__badge">{d.line.designation}</span>
            <span className="departure-row__destination">{d.destination ?? d.direction}</span>
            <span className="departure-row__time">{d.display}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
