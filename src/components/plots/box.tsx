import React, { useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { GridRows } from "@visx/grid";
import { AxisLeft } from "@visx/axis";
import { BoxPlotStats, CompleteScatterPlotOptions, ScatterPlotOptions } from "../../utils/interfaces";
import { mergeDeep } from "../../utils/generic";
import { BoxPlot } from "@visx/stats";

const label = (d: BoxPlotStats) => d.label;
const min = (d: BoxPlotStats) => d.min;
const max = (d: BoxPlotStats) => d.max;
const q1 = (d: BoxPlotStats) => d.q1;
const q3 = (d: BoxPlotStats) => d.q3;
const median = (d: BoxPlotStats) => d.median;

export type DotsProps = {
  width?: number;
  height?: number;
  options?: ScatterPlotOptions;
  data: BoxPlotStats[];
};

const defaultMargin = { top: 10, right: 30, bottom: 40, left: 60 };

const defaultPlotOptions: ScatterPlotOptions = {
  x: { domain: { min: undefined, max: undefined }, label: "" },
  y: { domain: { min: undefined, max: undefined }, label: "" },
  points: { dotRadius: 2 },
};

const Box = withTooltip<DotsProps, BoxPlotStats>(
  ({
    width = 100,
    height = 100,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    options,
    data,
  }: DotsProps & WithTooltipProvidedProps<BoxPlotStats>) => {
    if (width < 10) return null;
    const svgRef = useRef<SVGSVGElement>(null);

    const config: CompleteScatterPlotOptions = useMemo(() => {
      const newConfig = mergeDeep(defaultPlotOptions, options ?? {});

      newConfig.y.domain = {
        min: newConfig.y.domain.min ?? Math.min(...data.map(min)),
        max: newConfig.y.domain.max ?? Math.max(...data.map(max)),
      };

      return newConfig as CompleteScatterPlotOptions;
    }, [data, options]);

    const xMax = useMemo(() => {
      return width - defaultMargin.left - defaultMargin.right;
    }, [width]);

    const yMax = useMemo(() => {
      return height - defaultMargin.top - defaultMargin.bottom;
    }, [height]);

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [config.y.domain.min, config.y.domain.max],
          range: [yMax, 0],
          nice: true,
        }),
      [yMax, config]
    );

    const xScale = scaleBand<string>({
      range: [0, xMax],
      round: true,
      domain: data.map(label),
      padding: 0.4,
    });

    const boxWidth = xScale.bandwidth();
    const constrainedWidth = Math.min(40, boxWidth);

    return (
      <div>
        <svg data-testid='graph-svg' width={width} height={height} ref={svgRef}>
          <rect
            width={xMax}
            height={yMax}
            rx={14}
            x={defaultMargin.left}
            y={defaultMargin.top}
            fill='url(#dots-pink)'
            aria-label='graph'
          />
          <Group pointerEvents='none' left={defaultMargin.left} top={defaultMargin.top}>
            <GridRows scale={yScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <AxisLeft label={config.y.label} scale={yScale} numTicks={5} />
            {data.map((d: BoxPlotStats, i) => (
              <BoxPlot
                valueScale={yScale}
                min={min(d)}
                max={max(d)}
                left={xScale(label(d))! + 0.3 * constrainedWidth}
                firstQuartile={q1(d)}
                thirdQuartile={q3(d)}
                median={median(d)}
                boxProps={{
                  onMouseOver: () => {
                    showTooltip({
                      tooltipTop: yScale(median(d)) ?? 0 + 40,
                      tooltipLeft: xScale(label(d))! + constrainedWidth + 5,
                      tooltipData: {
                        ...d,
                      },
                    });
                  },
                  onMouseLeave: () => {
                    hideTooltip();
                  },
                }}
              />
            ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
            <div>
              <strong>{tooltipData.label}</strong>
            </div>
            <div style={{ marginTop: "5px", fontSize: "12px" }}>
              {tooltipData.max && <div>max: {tooltipData.max}</div>}
              {tooltipData.q3 && <div>third quartile: {tooltipData.q3}</div>}
              {tooltipData.median && <div>median: {tooltipData.median}</div>}
              {tooltipData.q1 && <div>first quartile: {tooltipData.q1}</div>}
              {tooltipData.min && <div>min: {tooltipData.min}</div>}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);

export { Box };
