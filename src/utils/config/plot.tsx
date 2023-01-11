export const driftPlotOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      min: -20,
      max: 20,
      title: { display: true, text: "δx Å" },
    },
    y: {
      min: -20,
      max: 20,
      title: { display: true, text: "δy Å" },
    },
  },
  elements: {
    point: {
      radius: 1.2,
    },
  },
  spanGaps: true,
  showLine: false,
};

export const astigmatismPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "nm" } } },
};

export const defocusPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "μm" } } },
};

export const resolutionPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { max: 50, title: { display: true, text: "Å" } } },
};

export const resolutionSpaPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { max: 10, title: { display: true, text: "Å" } } },
};
