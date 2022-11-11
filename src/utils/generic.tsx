interface DataConfig {
  include: { name: string | string[]; unit?: string; label?: string }[];
  root?: string[];
}

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

export { parseData };
