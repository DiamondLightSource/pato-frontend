import { ResponsiveValue } from "@chakra-ui/react";
import { components } from "./main";

type AutoProcSchema = components["schemas"]["AutoProcProgram"];
type ProcessingJobSchema = components["schemas"]["ProcessingJob"];

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
  dataCollectionId: number;
}

export interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

export interface BaseProcessingJobProps {
  autoProc: AutoProcSchema;
  procJob: ProcessingJobSchema;
  status: string;
  onReprocessingClicked?: (procJobId: number) => void;
  active: boolean;
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

export interface BoxPlotStats {
  /** Name for the box */
  label: string;
  min: number;
  max: number;
  /** First quartile */
  q1: number;
  /** Third quartile */
  q3: number;
  median: number;
}

export interface BarStats {
  /** Y Value */
  y: number;
  /** Label (X axis) */
  label: string;
}

interface PlotAxisOptions {
  /** Domain (lower and upper bounds) of the axis */
  domain: { min?: number; max?: number };
  /** Label for the axis */
  label: string;
}

export interface CompleteScatterPlotOptions {
  x: DeepRequired<PlotAxisOptions>;
  y: DeepRequired<PlotAxisOptions>;
  points: {
    /** Radius to use when rendering datapoints */
    dotRadius: number;
  };
}

export interface ScatterPlotOptions extends DeepPartial<CompleteScatterPlotOptions> {}

export interface CompleteBoxOptions {
  y: PlotAxisOptions;
  x: { label: string };
}

export interface BoxPlotOptions extends DeepPartial<CompleteBoxOptions> {}

export interface AuthState {
  fedid: string;
  name: string;
}

export interface SpaCollectionData extends CollectionData {
  fileTemplate: string;
  imageDirectory: string;
}
