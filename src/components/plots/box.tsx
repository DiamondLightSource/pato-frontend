import React, { useCallback, useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { BoxPlotStats, CompleteScatterPlotOptions, ScatterPlotOptions } from "../../utils/interfaces";
import { mergeDeep } from "../../utils/generic";
import { BoxPlot } from "@visx/stats";

const label = (d: BoxPlotStats) => d.label;
const min = (d: BoxPlotStats) => d.min;
const max = (d: BoxPlotStats) => d.max;
const q1 = (d: BoxPlotStats) => d.q1;
const q3 = (d: BoxPlotStats) => d.q3;
const median = (d: BoxPlotStats) => d.median;

export type BoxPlotProps = {
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

const fillColours = ["#ff5733", "#669bbc", "#c1121f"];

const Box = withTooltip<BoxPlotProps, BoxPlotStats>(
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
  }: BoxPlotProps & WithTooltipProvidedProps<BoxPlotStats>) => {
    if (width < 10) return null;
    const svgRef = useRef<SVGSVGElement>(null);

    const config: CompleteScatterPlotOptions = useMemo(() => {
      const newConfig = mergeDeep(defaultPlotOptions, options ?? {});

      newConfig.y.domain = {
        min: newConfig.y.domain.min ?? Math.min(...data.map(min)) - 1,
        max: newConfig.y.domain.max ?? Math.max(...data.map(max)) + 1,
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

    const checkBoundaries = useCallback(
      (d: BoxPlotStats) => {
        return config.y.domain.min < min(d) && config.y.domain.max > max(d);
      },
      [config]
    );

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
            fill='white'
            aria-label='Graph'
          />
          <Group left={defaultMargin.left} top={defaultMargin.top}>
            <GridRows scale={yScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <AxisLeft label={config.y.label} scale={yScale} numTicks={5} />
            <AxisBottom top={yMax} scale={xScale} tickValues={data.map(label)} />
            {data.map(
              (d: BoxPlotStats, i) =>
                checkBoundaries(d) && (
                  <g key={i} data-testid='box-item'>
                    <BoxPlot
                      valueScale={yScale}
                      min={min(d)}
                      max={max(d)}
                      left={xScale(label(d))! + boxWidth / 2 - constrainedWidth * 0.2}
                      firstQuartile={q1(d)}
                      thirdQuartile={q3(d)}
                      boxWidth={constrainedWidth * 0.4}
                      stroke='var(--chakra-colors-diamond-800)'
                      fill={fillColours[i % fillColours.length]}
                      median={median(d)}
                      boxProps={{
                        "aria-label": "Box",
                        "onMouseOver": () => {
                          showTooltip({
                            tooltipTop: yScale(median(d)),
                            tooltipLeft: xScale(label(d))!,
                            tooltipData: {
                              ...d,
                            },
                          });
                        },
                        "onMouseLeave": () => {
                          hideTooltip();
                        },
                      }}
                      medianProps={{
                        style: {
                          stroke: "#FFF",
                        },
                      }}
                    />
                  </g>
                )
            )}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft} top={tooltipTop}>
            <div aria-label='Box Title'>
              <b style={{ color: "var(--chakra-colors-diamond-700)" }}>{tooltipData.label}</b>
            </div>
            <div style={{ marginTop: "5px", fontSize: "12px" }}>
              {tooltipData.max && (
                <div aria-label='Maximum'>
                  <b>max:</b> {tooltipData.max}
                </div>
              )}
              {tooltipData.q3 && (
                <div aria-label='Third Quartile'>
                  <b>third quartile:</b> {tooltipData.q3}
                </div>
              )}
              {tooltipData.median && (
                <div aria-label='Median'>
                  <b>median:</b> {tooltipData.median}
                </div>
              )}
              {tooltipData.q1 && (
                <div aria-label='First Quartile'>
                  <b>first quartile:</b> {tooltipData.q1}
                </div>
              )}
              {tooltipData.min && (
                <div aria-label='Minimum'>
                  <b>min:</b> {tooltipData.min}
                </div>
              )}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);

export { Box };
