import { ScatterDataPoint } from "chart.js";
import { Info } from "../components/infogroup";

export interface DataConfig {
  include: { name: string | string[]; unit?: string; label?: string }[];
  root?: string[];
}

export interface CollectionData {
  info: Info[];
  comments: string | null;
}

export interface CtfData {
  resolution: ScatterDataPoint[];
  astigmatism: ScatterDataPoint[];
  defocus: ScatterDataPoint[];
}

export interface TomogramData {
  info: Info[],
  tomogramId: number
}