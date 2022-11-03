const parseData = (rawData: Record<string, any>, ignore: string[]) => {
  const data: Record<string, any> = { info: [] };
  for (const [key, value] of Object.entries(rawData)) {
    if ((typeof value === "string" || typeof value === "number") && !ignore.includes(key)) {
      data.info.push({ label: key, value: value.toString() });
    } else if (value === undefined || value === null) {
      data.info.push({ label: key, value: "?" });
    } else {
      data[key] = value;
    }
  }
  return data;
};

export { parseData };
