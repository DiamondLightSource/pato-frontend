import { Info } from "@diamondlightsource/ui-components";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { parseData } from "utils/generic";

export type MotionQueryKeys = [
  "motion",
  {
    parentType: "tomograms" | "dataCollections" | "autoProc";
    parentId: number;
    innerPage: number | undefined;
  },
];

export interface MotionData {
  /** Total number of motion correction images available (including tilt alignment) */
  total: number;
  /** Total number of tilt alignment images available */
  alignedTotal: number;
  /** Motion correction comments */
  comments_MotionCorrection?: string;
  /** CTF comments */
  comments_CTF?: string;
  /** Refined tilt axis */
  refinedTiltAxis?: number;
  info: Info[];
}

export interface ParsedMotionData {
  data: MotionData | null;
  total: number | null;
  page?: number;
  movieId?: number;
}

// The order actually matters, outputs should be closer to the top
const motionConfig = {
  include: [
    { name: "createdTimeStamp", label: "Movie Timestamp" },
    { name: "dosePerFrame", unit: "e⁻/Å²" },
    { name: "estimatedResolution", unit: "Å" },
    { name: "estimatedDefocus", unit: "μm" },
    { name: "ccValue", label: "CC Value" },
    { name: "astigmatismAngle", unit: "°" },
    { name: "totalMotion", unit: "Å" },
    { name: "averageMotionPerFrame", label: "Average Motion/Frame", unit: "Å" },
    { name: "imageNumber" },
    { name: ["patchesUsedX", "patchesUsedY"], label: "Patches Used" },
    { name: ["boxSizeX", "boxSizeY"], label: "Box Size", unit: "px" },
    { name: ["minResolution", "maxResolution"], label: "Resolution", unit: "Å" },
    { name: ["minDefocus", "maxDefocus"], label: "Defocus", unit: "Å" },
    { name: "amplitudeContrast" },
    { name: "defocusStepSize", unit: "Å" },
    { name: "astigmatism", unit: "nm" },
  ],
  root: [
    "tomogramId",
    "movieId",
    "drift",
    "total",
    "alignedTotal",
    "refinedTiltAxis",
    "comments_CTF",
    "comments_MotionCorrection",
  ],
};

const flattenMovieData = (rawData: Record<string, any>) => {
  let flattenedData: Record<string, string> = {
    alignedTotal: rawData.alignedTotal,
    total: rawData.total,
  };
  const items = rawData.items[0];

  for (let type in items) {
    if (items[type] !== null) {
      for (let [key, value] of Object.entries(items[type])) {
        if (key !== "comments") {
          flattenedData[key] = value as string;
        } else {
          flattenedData[`${key}_${type}`] = value as string;
        }
      }
    }
  }

  return flattenedData;
};

/**
 * Fetch motion correction data
 * @param queryKey Query keys
 * @returns Motion correction data
 */
export const fetchMotionData = async ({
  queryKey,
}: {
  queryKey: MotionQueryKeys;
}): Promise<ParsedMotionData | null> => {
  const { parentType, parentId, innerPage } = queryKey[1];
  let fullEndpoint = `dataCollections/${parentId}/${parentType === "tomograms" ? "tomogram-" : ""}motion?limit=1`;

  if (parentType === "tomograms" && innerPage === undefined) {
    fullEndpoint += "&getMiddle=true";
  } else {
    fullEndpoint += `&page=${innerPage ? innerPage - 1 : -1}`;
  }

  const response = await client.safeGet(fullEndpoint);

  if (response.status !== 200) {
    return null;
  }

  // Refined tilt angle is irrelevant to SPA
  const extendedMotionConfig =
    parentType === "tomograms"
      ? {
          ...motionConfig,
          include: [...motionConfig.include, { name: "refinedTiltAngle", unit: "°" }],
        }
      : motionConfig;

  const responseData:
    | components["schemas"]["Paged_FullMovie_"]
    | components["schemas"]["FullMovieWithTilt"] = response.data;

  if (responseData.items[0].CTF.estimatedDefocus) {
    // Estimated defocus is provided in angstroms
    responseData.items[0].CTF.estimatedDefocus = parseFloat(
      (responseData.items[0].CTF.estimatedDefocus * 0.0001).toFixed(3)
    );
  }

  if (responseData.items[0].CTF.astigmatism) {
    // Astigmatism is provided in angstroms, we want it in nm
    responseData.items[0].CTF.astigmatism = parseFloat(
      (responseData.items[0].CTF.astigmatism * 0.1).toFixed(3)
    );
  }

  return {
    data: parseData(flattenMovieData(responseData), extendedMotionConfig) as MotionData,
    movieId: responseData.items[0].Movie.movieId,
    page: responseData.page + 1,
    total: responseData.total,
  };
};

export const countDarkImages = (motion: ParsedMotionData) => {
  if (!motion || !motion.data || !motion.total || motion.data.alignedTotal === undefined) {
    return null;
  }

  if (isNaN(motion.data.alignedTotal - motion.total)) {
    return undefined;
  }

  return motion.total - motion.data.alignedTotal;
};
