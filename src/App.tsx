import { useState } from 'react';
import { SiteSearch } from './components/SiteSearch';
import { DepartureBox } from './components/DepartureBox';
import type { Site, Thresholds } from './types/sl';
import './App.css';

const DEFAULT_THRESHOLDS: Thresholds = { red: 5, yellow: 10 };

export default function App() {
  const [sites, setSites] = useState<Site[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function addSite(site: Site) {
    setSites((prev) => (prev.some((s) => s.id === site.id) ? prev : [...prev, site]));
  }

  function removeSite(id: number) {
    setSites((prev) => prev.filter((s) => s.id !== id));
  }

  function handleThresholdChange(key: keyof Thresholds, raw: string) {
    const value = parseInt(raw, 10);
    if (isNaN(value) || value < 1) return;
    setThresholds((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">SL Avgångar</h1>
        <SiteSearch onAdd={addSite} addedIds={sites.map((s) => s.id)} />
        <button
          className={`settings-btn${settingsOpen ? ' settings-btn--active' : ''}`}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label="Inställningar"
        >
          ⚙
        </button>
      </header>

      {settingsOpen && (
        <div className="settings-bar">
          <span className="settings-bar__label">Färgtrösklar:</span>
          <ThresholdInput
            color="red"
            label="Röd under"
            value={thresholds.red}
            max={thresholds.yellow - 1}
            onChange={(v) => handleThresholdChange('red', v)}
          />
          <ThresholdInput
            color="yellow"
            label="Gul under"
            value={thresholds.yellow}
            min={thresholds.red + 1}
            onChange={(v) => handleThresholdChange('yellow', v)}
          />
          <span className="settings-bar__hint">Grön om ≥ {thresholds.yellow} min</span>
        </div>
      )}

      <main className="app__board">
        {sites.length === 0 ? (
          <p className="app__empty">Sök efter en hållplats ovan för att lägga till den.</p>
        ) : (
          sites.map((site) => (
            <DepartureBox key={site.id} site={site} onRemove={removeSite} thresholds={thresholds} />
          ))
        )}
      </main>
    </div>
  );
}

interface ThresholdInputProps {
  color: 'red' | 'yellow';
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: string) => void;
}

function ThresholdInput({ color, label, value, min = 1, max, onChange }: ThresholdInputProps) {
  return (
    <label className={`threshold-input threshold-input--${color}`}>
      <span className="threshold-input__dot" />
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
      min
    </label>
  );
}
