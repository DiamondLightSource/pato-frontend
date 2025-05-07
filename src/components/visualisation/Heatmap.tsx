import { VStack, HStack, Spacer, Box, Text, StackProps } from "@chakra-ui/react";
import { ReactNode, useCallback, useMemo } from "react";
import { prependApiUrl } from "utils/api/client";
import "styles/atlas.css";
import { RequiredAndNonNullable } from "schema/interfaces";

const HEATMAP_PALETTE = ["#fde725", "#5ec962", "#21918c", "#3b528b", "#440154"];

export interface HeatmapOptions {
  label: string;
  min?: number;
  max?: number;
  type: "linear" | "log";
  binCount: number;
}

export interface HeatmapOverlayBaseItem {
  x: number;
  y: number;
  id: number | string;
  value: null | number;
  colour?: string;
}

interface HeatmapOverlaySquare extends HeatmapOverlayBaseItem {
  width: number;
  height: number;
  angle: number;
}

interface HeatmapOverlayCircle extends HeatmapOverlayBaseItem {
  diameter: number;
}

export type HeatmapOverlayItem = HeatmapOverlayCircle | HeatmapOverlaySquare;

export interface HeatmapOverlayProps extends StackProps {
  /** Callback for when a heatmap item is clicked */
  onItemClicked?: (id: number | string) => void;
  /** Heatmap items */
  items: HeatmapOverlayItem[];
  options: HeatmapOptions;
  /** Background image to draw heatmap over */
  image: string;
  /** Currently selected heatmap item */
  selectedItem: string | number | null;
  /** Hide items with null values in heatmap */
  hideNull?: boolean;
  /** Component to display next to the chart legend */
  children?: ReactNode;
}

export const HeatmapOverlay = ({
  items,
  options,
  image,
  selectedItem,
  onItemClicked,
  hideNull = false,
  children,
  ...props
}: HeatmapOverlayProps) => {
  const colouredItems = useMemo(() => {
    let heatmapOptions = structuredClone(options);

    let sortedItems = items
      .filter((i) => i.value !== null)
      .sort((a, b) => a.value! - b.value!) as RequiredAndNonNullable<HeatmapOverlayItem, "value">[];

    if (sortedItems.length < 1) {
      return { bins: [], items };
    }

    console.log(sortedItems);

    if (heatmapOptions.min === undefined) {
      heatmapOptions.min = sortedItems[0].value;
    }

    // In case min is greater than the supplied max, then the calculated max should take precedence
    if (heatmapOptions.max === undefined || heatmapOptions.min > heatmapOptions.max) {
      heatmapOptions.max = sortedItems[sortedItems.length - 1].value;
    }

    const range = heatmapOptions.max - heatmapOptions.min;

    // This is to make sure that the bin base value is always greater than one, otherwise we would get
    // decrementing values over the course of our exponentiations
    // We also base this value on the number of bins minus one because the first bin edge will always be
    // the minimum value we stipulated beforehand
    const binBase =
      heatmapOptions.type === "log"
        ? Math.pow(range + 1, 1 / (heatmapOptions.binCount - 1))
        : range / (heatmapOptions.binCount - 1);
    const bins: number[] = [heatmapOptions.min];

    for (let i = 1; i < 5; i++) {
      bins.push(
        heatmapOptions.type === "log" ? heatmapOptions.min + Math.pow(binBase, i) - 1 : binBase * i
      );
    }
    if (heatmapOptions.type === "log") {
      // Since items are already sorted, we can assume that any item being checked is already greater than
      // the previous bin, so we only check the upper boundary of the bin
      let intervalStart = 0;
      for (const [i, item] of sortedItems.entries()) {
        if (item.value > bins[intervalStart + 1] && intervalStart < heatmapOptions.binCount - 1) {
          intervalStart++;
        }

        sortedItems[i].colour = HEATMAP_PALETTE[intervalStart];
      }
    } else {
      for (const [i, item] of sortedItems.entries()) {
        const index = Math.floor(item.value / binBase);
        sortedItems[i].colour =
          HEATMAP_PALETTE[index >= HEATMAP_PALETTE.length ? HEATMAP_PALETTE.length - 1 : index];
      }
    }

    const allItems = [...sortedItems, ...items.filter((item) => item.value === null)];

    return { bins, items: allItems };
  }, [items, options]);

  const getItemProps = useCallback(
    (item: HeatmapOverlayBaseItem) => {
      const isSelected = selectedItem === item.id;
      return item.value === null
        ? hideNull
          ? {
              visibility: "hidden",
            }
          : {
              stroke: "red",
              strokeOpacity: "0.4",
              fill: "black",
              fillOpacity: "0.2",
            }
        : {
            role: "button",
            stroke: isSelected ? "white" : item.colour,
            fill: item.colour,
            fillOpacity: isSelected ? "0.8" : "0.6",
            cursor: "pointer",
          };
    },
    [hideNull, selectedItem]
  );

  const handleItemClicked = useCallback(
    (item: HeatmapOverlayBaseItem) => {
      if (onItemClicked && item.id !== null) {
        onItemClicked(item.id);
      }
    },
    [onItemClicked]
  );

  return (
    <VStack w='100%'>
      <div style={{ width: "100%" }} className='img-wrapper'>
        <img src={prependApiUrl(image)} alt='Grid Square' />
        <svg viewBox={"0 0 512 512"}>
          {colouredItems.items.map((item, i) =>
            "diameter" in item ? (
              <circle
                key={i}
                data-testid={`item-${i}`}
                cx={item.x}
                cy={item.y}
                r={item.diameter / 2}
                onClick={() => handleItemClicked(item)}
                {...getItemProps(item)}
              />
            ) : (
              <rect
                data-testid={`item-${i}`}
                key={i}
                x={item.x - item.width / 2}
                y={item.y - item.height / 2}
                width={item.width}
                height={item.height}
                transform={`rotate(${(180 / Math.PI) * item.angle} ${item.x} ${item.y})`}
                onClick={() => handleItemClicked(item)}
                {...getItemProps(item)}
              />
            )
          )}
        </svg>
      </div>
      <HStack zIndex={2} w='100%' flexWrap='wrap'>
        {colouredItems.bins.length > 0 && (
          <VStack gap='2px'>
            <HStack gap='1px'>
              {colouredItems.bins.map((bin, i) => (
                <VStack alignItems='left' key={i}>
                  <Box bg={HEATMAP_PALETTE[i]} key={i} h='12px' w='60px'></Box>
                  <Text fontSize='12px'>{bin.toFixed(1)}</Text>
                </VStack>
              ))}
            </HStack>

            <Text fontSize='12px'>{options.label}</Text>
          </VStack>
        )}
        <Spacer />
        {children}
      </HStack>
    </VStack>
  );
};
