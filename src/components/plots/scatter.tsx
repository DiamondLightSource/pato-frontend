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
import { BasePoint, CompleteScatterPlotOptions, ScatterPlotOptions } from "schema/interfaces";
import { mergeDeep } from "utils/generic";
import { Heading, VStack } from "@chakra-ui/react";
import { defaultMargin } from "utils/config/plot";

const x = (d: BasePoint) => d.x;
const y = (d: BasePoint) => d.y;

export type DotsProps = {
  width?: number;
  height?: number;
  options?: ScatterPlotOptions;
  data: BasePoint[];
  onPointClicked?: (x: number, y: number) => void;
};

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
    onPointClicked,
    data,
  }: DotsProps & WithTooltipProvidedProps<BasePoint>) => {
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

    const checkBoundaries = useCallback(
      (d: BasePoint) => {
        return (
          config.x.domain.min <= x(d) &&
          config.x.domain.max >= x(d) &&
          config.y.domain.min <= y(d) &&
          config.y.domain.max >= y(d)
        );
      },
      [config]
    );

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

    const findClosest = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return;
        const point = localPoint(svgRef.current, event);
        if (!point) return;
        return voronoiLayout.find(point.x - defaultMargin.left, point.y - defaultMargin.top, neighborRadius);
      },
      [voronoiLayout]
    );

    const handleMouseClick = useCallback(
      (event: React.MouseEvent) => {
        const closest = findClosest(event);
        if (closest && onPointClicked) {
          onPointClicked(x(closest.data), y(closest.data));
        }
      },
      [findClosest, onPointClicked]
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        clearTimeout(2);
        const closest = findClosest(event);
        if (closest) {
          showTooltip({
            tooltipLeft: xScale(x(closest.data)),
            tooltipTop: yScale(y(closest.data)),
            tooltipData: closest.data,
          });
        }
      },
      [xScale, yScale, showTooltip, findClosest]
    );

    const handleMouseLeave = useCallback(() => {
      window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);

    if (data.length === 0) {
      return (
        <VStack width={width} height={height}>
          <Heading variant='notFound'>
            No Data Available
          </Heading>
        </VStack>
      );
    }

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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseLeave}
            onClick={handleMouseClick}
          />
          <Group pointerEvents='none' left={defaultMargin.left} top={defaultMargin.top}>
            <GridRows scale={yScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <GridColumns scale={xScale} width={xMax} height={yMax} stroke='#e0e0e0' />
            <AxisBottom label={config.x.label} top={yMax} scale={xScale} numTicks={5} />
            <AxisLeft label={config.y.label} scale={yScale} numTicks={5} />
            {data.map(
              (point, i) =>
                checkBoundaries(point) && (
                  <Circle
                    data-testid='dot'
                    key={`point-${data[0]}-${i}`}
                    className='dot'
                    cx={xScale(x(point))}
                    cy={yScale(y(point))}
                    r={config.points.dotRadius}
                    fill={tooltipData === point ? "pink" : "#ff5733"}
                  />
                )
            )}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
            <div aria-label='X'>
              <b>x:</b> {x(tooltipData)}
            </div>
            <div aria-label='Y'>
              <b>y:</b> {y(tooltipData)}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);

export { Scatter };
