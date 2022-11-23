const driftPlotOptions = {
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
    spanGaps: true,
    showLine: false,
  };

export {driftPlotOptions}