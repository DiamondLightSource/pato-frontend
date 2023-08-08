import { Dispatch, SetStateAction } from "react";
import { BarStats } from "@diamondlightsource/ui-components";
import { client } from "utils/api/client";

const setHistogram = (
  endpoint: string,
  setState: Dispatch<SetStateAction<BarStats[] | null | undefined>>,
  div: number = 1
) => {
  client.safeGet(endpoint).then((response) => {
    if (response.status === 200 && response.data.items) {
      const histogram: BarStats[] = [];
      for (const bin of response.data.items) {
        const label = isNaN(bin.x)
          ? `${bin.x.charAt(0)}${parseFloat(bin.x.substring(1)) / div}`
          : bin.x / div;
        histogram.push({
          label: label.toString(),
          y: bin.y,
        });
      }

      setState(histogram);
    } else {
      setState(null);
    }
  });
};

export { setHistogram };
