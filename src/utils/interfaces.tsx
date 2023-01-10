import { ResponsiveValue } from "@chakra-ui/react";
import { ScatterDataPoint } from "chart.js";
import { Info } from "../components/infogroup";

export interface DataConfig {
  include: { name: string | string[]; unit?: string; label?: string }[];
  root?: string[];
}

export interface CollectionData {
  info: Info[];
  comments: string | null;
  dataCollectionId?: number;
}

export interface CtfData {
  resolution: ScatterDataPoint[];
  astigmatism: ScatterDataPoint[];
  defocus: ScatterDataPoint[];
}

export interface TomogramData {
  info: Info[];
  tomogramId: number;
}

export interface BaseCardProp {
  /** Image width */
  width?: ResponsiveValue<string | number | "auto">;
  /** Image height */
  height?: ResponsiveValue<string | number | "auto">;
  /** Display pop-up modal with full size image */
  showModal?: boolean;
  /** Title for the card */
  title: string;
  /** Event fired when container is clicked. Does not fire if showModal is set */
  onClick?: () => void
  /** Whether or not current item is active */
  active?: boolean
}