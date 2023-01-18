import React, { useMemo, useCallback, useRef } from "react";
import { Group } from "@visx/group";
import { Circle } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { voronoi } from "@visx/voronoi";
import { GridColumns, GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { localPoint } from "@visx/event";
import { BasePoint, CompleteScatterPlotOptions, ScatterPlotOptions } from "../../utils/interfaces";
import { mergeDeep } from "../../utils/generic";
const x = (d: BasePoint) => d.x;
const y = (d: BasePoint) => d.y;

export type DotsProps = {
  width?: number;
  height?: number;
  options?: ScatterPlotOptions;
  data: BasePoint[];
};

const defaultMargin = { top: 10, right: 30, bottom: 40, left: 60 };

const defaultPlotOptions: ScatterPlotOptions = {
  x: { domain: { min: undefined, max: undefined }, label: "" },
  y: { domain: { min: undefined, max: undefined }, label: "" },
  points: { dotRadius: 2 },
};

const Scatter = withTooltip<DotsProps, BasePoint>(
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
  }: DotsProps & WithTooltipProvidedProps<BasePoint>) => {
    if (width < 10) return null;
    const svgRef = useRef<SVGSVGElement>(null);

    const neighborRadius = 4;

    const config: CompleteScatterPlotOptions = useMemo(() => {
      const newConfig = mergeDeep(defaultPlotOptions, options ?? {});

      const yValues = data.map((point) => point.y);
      const xValues = data.map((point) => point.x);

      newConfig.x.domain = {
        min: newConfig.x.domain.min ?? Math.min(...xValues),
        max: newConfig.x.domain.max ?? Math.max(...xValues),
      };

      newConfig.y.domain = {
        min: newConfig.y.domain.min ?? Math.min(...yValues),
        max: newConfig.y.domain.max ?? Math.max(...yValues),
      };

      return newConfig as CompleteScatterPlotOptions;
    }, [data, options]);

    const xMax = useMemo(() => {
      return width - defaultMargin.left - defaultMargin.right;
    }, [width]);

    const yMax = useMemo(() => {
      return height - defaultMargin.top - defaultMargin.bottom;
    }, [height]);

    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [config.x.domain.min, config.x.domain.max],
          range: [0, xMax],
        }),
      [xMax, config]
    );

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [config.y.domain.min, config.y.domain.max],
          range: [yMax, 0],
          nice: true,
        }),
      [yMax, config]
    );

    const voronoiLayout = useMemo(
      () =>
        voronoi<BasePoint>({
          x: (d) => xScale(x(d)),
          y: (d) => yScale(y(d)),
          width,
          height,
        })(data),
      [width, height, xScale, yScale, data]
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        clearTimeout(2);
        if (!svgRef.current) return;
        const point = localPoint(svgRef.current, event);
        if (!point) return;
        const closest = voronoiLayout.find(point.x - defaultMargin.left, point.y - defaultMargin.top, neighborRadius);
        if (closest) {
          showTooltip({
            tooltipLeft: xScale(x(closest.data)),
            tooltipTop: yScale(y(closest.data)),
            tooltipData: closest.data,
          });
        }
      },
      [xScale, yScale, showTooltip, voronoiLayout, neighborRadius]
    );

    const handleMouseLeave = useCallback(() => {
      window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);

    return (
      <div>
        <svg data-testid='graph-svg' width={width} height={height} ref={svgRef}>
          <rect
            width={xMax}
            height={yMax}
            rx={14}
            x={defaultMargin.left}
            y={defaultMargin.top}
            fill='var(--card-bg)'
            aria-label='graph'
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseLeave}
          />
          <Group pointerEvents='none' left={defaultMargin.left} top={defaultMargin.top}>
            <GridRows scale={yScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <GridColumns scale={xScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <AxisBottom label={config.x.label} top={yMax} scale={xScale} numTicks={5} />
            <AxisLeft label={config.y.label} scale={yScale} numTicks={5} />
            {data.map((point, i) => (
              <Circle
                aria-label='dot'
                key={`point-${data[0]}-${i}`}
                className='dot'
                cx={xScale(x(point))}
                cy={yScale(y(point))}
                r={config.points.dotRadius}
                fill={tooltipData === point ? "pink" : "#ff5733"}
              />
            ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
            <div aria-label='tooltip x'>
              <b>x:</b> {x(tooltipData)}
            </div>
            <div aria-label='tooltip y'>
              <b>y:</b> {y(tooltipData)}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);

export { Scatter };
