import { DataConfig } from "schema/interfaces";
import { ClientResponse } from "./api/client";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Parses incoming raw data and processes it into labels and values for `InfoGroup` components, also returning raw values in the root of the returned object
 *
 * @param rawData Raw data to be processed
 * @param config Configuration for the processing, according to `DataConfig`
 *
 * @returns An object containing an array of `InfoGroup` labels and values, alongside raw values (when passed in the configuration)
 */
export const parseData = (rawData: Record<string, any>, config: DataConfig) => {
  const data: Record<string, any> = { info: [] };
  for (const item of config.include) {
    const unit = item.unit ?? "";
    if (Array.isArray(item.name)) {
      const values = item.name.map((key) => prettifyValue(rawData[key], unit)).join(" - ");
      data.info.push({
        label: item.label ?? pascalToSpace(item.name[0]),
        value: values,
      });
    } else {
      data.info.push({
        label: item.label ?? pascalToSpace(item.name),
        value: prettifyValue(rawData[item.name], unit),
      });
    }
  }

  if (config.root !== undefined) {
    for (const item of config.root) {
      data[item] = rawData[item];
    }
  }

  return data;
};

const prettifyValue = (value: number | string, unit: string) => (value ? `${value} ${unit}` : "?");

/**
 * Converts a pascal case string to a "human" space separated string
 *
 * @param input Input pascal-case string
 *
 * @returns Space separated string
 */
export const pascalToSpace = (input: string) => {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

/**
 * Rewrites ISO 8601 dates with timezones as regular GB localised date strings
 *
 * @param dateString Original date string
 *
 * @returns Shortened, GB localised date string
 */
export const parseDate = (dateString: string | undefined | null) => {
  const safeDate = dateString ?? "";
  const date = Date.parse(safeDate);

  if (isNaN(date)) {
    return safeDate;
  }

  return timeFormatter.format(date);
};

export const debounce = (fn: Function, ms = 300) => {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/**
 * Capitalises first letter of string
 *
 * @param originalString Original string
 * @returns Capitalised string
 */
export const capitalise = (originalString: string) =>
  originalString.charAt(0).toUpperCase() + originalString.slice(1);

/**
 * Get error message contained in HTTP response
 *
 * @param response HTTP response to parse
 * @returns Error message string or default error message
 */
export const getErrorMessage = (response: ClientResponse) => {
  let message = "Report this error to a local contact or developer";
  if (
    response.status !== 500 &&
    Array.isArray(response.data.detail) &&
    response.data.detail[0].msg
  ) {
    message = response.data.detail[0].msg;
  }

  return message;
};
