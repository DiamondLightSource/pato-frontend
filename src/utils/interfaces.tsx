import { ResponsiveValue } from "@chakra-ui/react";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type DeepRequired<T> = { [K in keyof T]: DeepRequired<T[K]> } & Required<T>;

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
  resolution: BasePoint[];
  astigmatism: BasePoint[];
  defocus: BasePoint[];
}

export interface TomogramData {
  info: Info[];
  tomogramId: number;
}

export interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

export interface Info {
  /** Label/description (title) for a display value */
  label: string;
  /** Value to accompany label */
  value?: string;
  /** Whether or not the given information element should span all columns */
  wide?: boolean;
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
  onClick?: () => void;
  /** Whether or not current item is active */
  active?: boolean;
}

export interface BasePoint {
  x: number;
  y: number;
}

interface PlotAxisOptions {
  /** Domain (lower and upper bounds) of the axis */
  domain: { min?: number; max?: number };
  /** Label for the axis */
  label: string;
}

interface PlotOptions {
  x: PlotAxisOptions;
  y: PlotAxisOptions;
  tooltip: { display: boolean };
}

export interface CompleteScatterPlotOptions extends DeepRequired<PlotOptions> {
  points: {
    /** Radius to use when rendering datapoints */
    dotRadius: number;
  };
}

export interface ScatterPlotOptions extends DeepPartial<CompleteScatterPlotOptions> {}
