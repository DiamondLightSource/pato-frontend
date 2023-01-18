import { ScatterPlotOptions } from "../interfaces";

export const driftPlotOptions: ScatterPlotOptions = {
  x: {
    domain: { min: -20, max: 20 },
    label: "δx Å",
  },
  y: {
    domain: { min: -20, max: 20 },
    label: "δy Å",
  },
  points: { dotRadius: 2 },
};

export const astigmatismPlotOptions = {
  points: { dotRadius: 2 },
  y: { label: "nm" },
};

export const defocusPlotOptions = {
  points: { dotRadius: 2 },
  y: { label: "μm" },
};

export const resolutionPlotOptions = {
  points: { dotRadius: 2 },
  y: { label: "Å", domain: { min: 0, max: 50 } },
};

export const resolutionSpaPlotOptions = {
  points: { dotRadius: 2 },
  y: { label: "Å", domain: { min: 0, max: 10 } },
};
