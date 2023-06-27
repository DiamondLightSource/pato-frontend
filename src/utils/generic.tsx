import { DataConfig } from "schema/interfaces";

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

const pascalToSpace = (input: string) => {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const mergeDeep = (target: Record<string, any>, source: Record<string, any>) => {
  let output = structuredClone(target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

export const parseDate = (dateString: string | undefined) => {
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
