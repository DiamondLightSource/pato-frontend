import { useMemo } from "react";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { withTooltip, Tooltip } from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { BarStats, BoxPlotOptions, CompleteScatterPlotOptions } from "schema/interfaces";
import { mergeDeep } from "utils/generic";
import { Bar } from "@visx/shape";
import { getFillColour } from "styles/colours";
import { defaultMargin } from "utils/config/plot";
import { NoData } from "components/visualisation/noData";

const label = (d: BarStats) => d.label;
const y = (d: BarStats) => d.y;

export type BarProps = {
  width?: number;
  height?: number;
  /** Padding (as a ratio of the calculated width of each bar group) */
  padding?: number;
  options?: BoxPlotOptions;
  data: BarStats[][];
};

const defaultPlotOptions: BoxPlotOptions = {
  y: { domain: { min: undefined, max: undefined }, label: "" },
  x: { label: "" },
};

const BarChart = withTooltip<BarProps, BarStats>(
  ({
    width = 100,
    height = 100,
    padding = 0.3,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    options,
    data,
  }: BarProps & WithTooltipProvidedProps<BarStats>) => {
    if (data.length === 0) {
      return <NoData />;
    }

    const config: CompleteScatterPlotOptions = useMemo(() => {
      const newConfig = mergeDeep(defaultPlotOptions, options ?? {});
      const yValues = data.map((bars) => bars.map(y)).flat();

      newConfig.y.domain = {
        min: newConfig.y.domain.min ?? Math.min(...yValues),
        max: newConfig.y.domain.max ?? Math.max(...yValues),
      };

      return newConfig as CompleteScatterPlotOptions;
    }, [data, options]);

    const xMax = useMemo(() => width - defaultMargin.left - defaultMargin.right, [width]);

    const yMax = useMemo(() => height - defaultMargin.top - defaultMargin.bottom, [height]);

    const groupWidth = useMemo(() => xMax / data.length, [xMax, data]);

    const widestBarGroup = useMemo(() => data.sort((d) => d.length)[0], [data]);

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [config.y.domain.min, config.y.domain.max],
          range: [yMax, 0],
          nice: true,
        }),
      [yMax, config]
    );

    const lateralPadding = useMemo(
      () => (groupWidth * padding) / data.length,
      [data, groupWidth, padding]
    );

    const xScale = useMemo(
      () =>
        scaleBand<string>({
          range: [0, groupWidth - lateralPadding * 2],
          round: true,
          domain: widestBarGroup.map(label),
          padding: 0,
        }),
      [widestBarGroup, groupWidth, lateralPadding]
    );

    return (
      <div>
        <svg data-testid='graph-svg' width={width} height={height}>
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
            {data.map((d: BarStats[], i) => {
              const leftPos = groupWidth * i + lateralPadding;
              return (
                <Group left={leftPos} key={i}>
                  <AxisBottom
                    label={config.x.label}
                    top={yMax}
                    left={0}
                    scale={xScale}
                    tickValues={d.map(label)}
                  />
                  {d.map((bar: BarStats, j) => {
                    const barWidth = xScale.bandwidth();
                    const barHeight = config.y.domain.max < y(bar) ? yMax : yMax - yScale(y(bar));
                    return (
                      <Bar
                        data-testid={`${i}-${label(bar)}`}
                        key={label(bar)}
                        fill={getFillColour(i)}
                        stroke='#FFF'
                        height={barHeight}
                        width={barWidth}
                        y={yMax - barHeight}
                        x={j * barWidth}
                        onMouseOver={() => {
                          showTooltip({
                            tooltipLeft: leftPos + j * barWidth,
                            tooltipTop: yScale(y(bar) * 0.8),
                            tooltipData: { ...bar },
                          });
                        }}
                        onMouseLeave={hideTooltip}
                      />
                    );
                  })}
                </Group>
              );
            })}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft} top={tooltipTop}>
            <div aria-label='Box Title'>
              <b style={{ color: "var(--chakra-colors-diamond-700)" }}>{tooltipData.label}</b>
            </div>
            <div style={{ marginTop: "5px", fontSize: "12px" }}>
              {tooltipData.y && (
                <div aria-label='Y Value'>
                  <b>value:</b> {tooltipData.y}
                </div>
              )}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);

export { BarChart };
