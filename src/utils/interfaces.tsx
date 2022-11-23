import { ScatterDataPoint } from "chart.js";
import { Info } from "../components/infogroup";

export interface DataConfig {
  include: { name: string | string[]; unit?: string; label?: string }[];
  root?: string[];
}

export interface CollectionData {
  info: Info[];
  comments: string;
}

export interface CtfData {
  resolution: ScatterDataPoint[];
  astigmatism: ScatterDataPoint[];
  defocus: ScatterDataPoint[];
}
