export type TransportMode = 'BUS' | 'METRO' | 'TRAIN' | 'TRAM' | 'SHIP' | 'FERRY';

export interface Thresholds {
  red: number;
  yellow: number;
}

export interface Site {
  id: number;
  name: string;
  lat?: number;
  lon?: number;
}

export interface DepartureLine {
  id: number;
  designation: string;
  transport_mode: TransportMode;
  group_of_lines?: string;
  name?: string;
}

export interface StopArea {
  id: number;
  name: string;
  type?: string;
}

export interface StopPoint {
  id: number;
  name: string;
  designation?: string;
}

export interface Departure {
  direction: string;
  direction_code: number;
  destination?: string;
  state: string;
  scheduled: string;
  expected: string | null;
  display: string;
  line: DepartureLine;
  stop_area: StopArea;
  stop_point: StopPoint;
  deviations: unknown[];
}
