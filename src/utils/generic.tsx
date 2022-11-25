import { useEffect } from "react";
import { DataConfig } from "./interfaces";
/**
 * Parses incoming raw data and processes it into labels and values for `InfoGroup` components, also returning raw values in the root of the returned object
 *
 * @param rawData Raw data to be processed
 * @param config Configuration for the processing, according to `DataConfig`
 *
 * @returns An object containing an array of `InfoGroup` labels and values, alongside raw values (when passed in the configuration)
 */
const parseData = (rawData: Record<string, any>, config: DataConfig) => {
  const data: Record<string, any> = { info: [] };
  for (const item of config.include) {
    const unit = item.unit ?? "";
    if (Array.isArray(item.name)) {
      const values = item.name.map((key) => prettifyValue(rawData[key], unit)).join(" - ");
      data.info.push({ label: item.label ?? pascalToSpace(item.name[0]), value: values });
    } else {
      data.info.push({ label: item.label ?? pascalToSpace(item.name), value: prettifyValue(rawData[item.name], unit) });
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

const pascalToSpace = (input: string) => {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

const useTitle = (title: string) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  });
};

export { parseData, useTitle };
