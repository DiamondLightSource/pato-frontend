export const proposalHeaders = [
  { key: "proposalCode", label: "Code" },
  { key: "proposalNumber", label: "Number" },
  { key: "sessions", label: "sessions" },
  { key: "title", label: "Title" },
];

export const sessionHeaders = [
  { key: "visit_number", label: "Visit" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "microscopeName", label: "Microscope" },
  { key: "collectionGroups", label: "Collection Groups" },
];

export const groupsHeaders = [
  { key: "dataCollectionGroupId", label: "ID" },
  { key: "comments", label: "Comments" },
  { key: "collections", label: "Collections" },
  { key: "experimentTypeName", label: "Experiment Type" },
];

export const collectionHeaders = [
  { key: "comments", label: "Comments" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "runStatus", label: "Run Status" },
  { key: "tomograms", label: "Has Processed Tomogram?" },
];

export const beamlineToMicroscope: Record<string, string> = {
  m02: "Krios 1",
  m03: "Krios 2",
  m04: "Talos",
  m06: "Krios 3",
  m07: "Krios 4",
  m08: "Krios 5",
  m10: "Glacios 1",
  m12: "Glacios 2",
};
