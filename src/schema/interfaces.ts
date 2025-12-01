import { Info, BasePoint } from "@diamondlightsource/ui-components";
import { components, paths } from "schema/main";

export type AutoProcSchema = components["schemas"]["AutoProcProgramResponse"];
export type ProcessingJobSchema = components["schemas"]["ProcessingJob"];
export type SessionResponse = components["schemas"]["SessionResponse"];

declare global {
  interface Window {
    ENV: {
      API_URL: string;
      AUTH_URL: string;
      DEV_CONTACT: string;
      ENVIRONMENT: "demo" | "staging" | "production";
      FEEDBACK_URL?: string;
    };
  }
}

export interface ParsedSessionReponse extends SessionResponse {
  microscopeName: string;
}

export interface DataConfig {
  include: { name: string | string[]; unit?: string; label?: string }[];
  root?: string[];
}

export interface CollectionData {
  info: Info[];
  comments: string | null;
  dataCollectionId?: number;
  pixelSizeOnImage?: number;
}

export interface CtfData {
  resolution: BasePoint[];
  astigmatism: BasePoint[];
  defocus: BasePoint[];
  particleCount?: BasePoint[];
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

export interface ClassificationProps extends SpaProps {
  /* Classification type (2D or 3D) */
  type?: "2d" | "3d";
}

export interface BaseProcessingJobProps {
  autoProc: AutoProcSchema | null;
  procJob: ProcessingJobSchema;
  status: string;
  active: boolean;
}

export interface SpaCollectionData extends CollectionData {
  fileTemplate: string;
  imageDirectory: string;
}

export type SortTypes = NonNullable<
  NonNullable<
    paths["/autoProc/{autoProcId}/classification"]["get"]["parameters"]["query"]
  >["sortBy"]
>;

export type RequiredAndNonNullable<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };

export type TomogramMovieTypes = "denoised" | "segmented" | "picked" | "alignment" | "stack";
export type FoilHoleMetricTypes = "astigmatism" | "particleCount" | "resolution";
