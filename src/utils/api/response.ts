import { Dispatch, SetStateAction } from "react";
import { BarStats } from "@diamondlightsource/ui-components";
import { client } from "utils/api/client";
import { parseDate } from "utils/generic";
import { beamlineToMicroscope } from "utils/config/table";
import { ParsedSessionReponse, SessionResponse } from "schema/interfaces";

import { spaReprocessingFieldConfig } from "utils/config/parse";

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

const parseSessionData = (item: SessionResponse): ParsedSessionReponse => {
  let newItem = Object.assign({}, item, {
    startDate: parseDate(item.startDate as string),
    endDate: parseDate(item.endDate as string),
    microscopeName: item.beamLineName ?? "",
  });
  const beamLineName = item.beamLineName as string;
  const humanName = beamlineToMicroscope[beamLineName];

  if (humanName) {
    newItem["microscopeName"] = `${humanName} (${beamLineName})`;
  }

  return newItem;
};

/**
 * Parse object, and return 'human' name for each parameter key when possible,
 * and convert boolean fields to boolean types
 *
 * @param jobParams Initial job parameters
 * @returns Modified job parameters
 */
const parseJobParameters = (jobParams: Record<string, string | boolean>) => {
  const legibleParameters: Record<string, string | boolean> = {};

  for (const [key, value] of Object.entries(jobParams)) {
    const config = spaReprocessingFieldConfig[key];
    if (config) {
      let newValue: string | boolean = value;

      if (config.alias === "gainReferenceFile") {
        newValue = (value as string).split("/").pop()!;
      } else {
        newValue = config.isBool ? value === "1" : value;
      }

      legibleParameters[config.alias] = newValue;
    } else {
      legibleParameters[key] = value;
    }
  }

  return legibleParameters;
};

export { setHistogram, parseJobParameters, parseSessionData };
