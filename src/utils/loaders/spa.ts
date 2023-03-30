import { Params } from "react-router-dom";
import { DataConfig, SpaCollectionData } from "schema/interfaces";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { buildEndpoint } from "utils/api/endpoint";
import { collectionConfig } from "utils/config/parse";
import { parseData } from "utils/generic";

type DataCollection = components["schemas"]["DataCollectionSummary"];

const spaCollectionConfig: DataConfig = {
  include: [
    ...collectionConfig.include,
    ...[
      { name: "totalExposedDose", label: "Total Dose", unit: "e⁻/Å²" },
      { name: "numberOfImages", label: "Number of Movies" },
      { name: "exposureTime", label: "Total Exposure Time", unit: "seconds" },
      { name: "frameLength", unit: "seconds" },
      { name: "phasePlate", label: "Phase Plate Used" },
      { name: "c2lens", label: "C2 Lens", unit: "%" },
      { name: "c2aperture", label: "C2 Aperture", unit: "μm" },
      { name: "magnification" },
      { name: ["beamSizeAtSampleX, beamSizeAtSampleY"], unit: "μm", label: "Illuminated Area" },
      { name: "frameDose", unit: "e⁻/Å²" },
      { name: "slitGapHorizontal", label: "Energy Filter / Slit Width", unit: "eV" },
      { name: "detectorMode" },
    ],
  ],
  root: [...(collectionConfig.root ?? []), "fileTemplate", "imageDirectory"],
};

const getAcquisitionSoftware = (fileTemplate: string) => {
  if (fileTemplate.includes("GridSquare_")) {
    return "EPU";
  }

  if (fileTemplate.includes("Frames/")) {
    return "SerialEM";
  }

  return "";
};

const getSpaData = async (params: Params) => {
  const response = await client.safeGet(buildEndpoint("dataCollections", params, 1, 1));
  const returnData = {
    collection: { info: [], comments: "", fileTemplate: "?", imageDirectory: "?" } as SpaCollectionData,
    jobs: null,
  };

  if (response.status === 200 && response.data.items && response.data.items[0].fileTemplate) {
    const data = response.data.items[0] as DataCollection;
    const parsedCollectionData = parseData(data, spaCollectionConfig) as SpaCollectionData;

    parsedCollectionData.info.unshift({
      label: "Acquisition Software",
      value: getAcquisitionSoftware(data.fileTemplate),
    });
    parsedCollectionData.info.push({
      label: "Comments",
      value: data.comments ?? "",
      wide: true,
    });

    returnData.collection = parsedCollectionData;

    if (parsedCollectionData.dataCollectionId) {
      const jobsResponse = await client.safeGet(
        buildEndpoint("processingJobs", { collectionId: parsedCollectionData.dataCollectionId.toString() }, 25, 1)
      );

      if (jobsResponse.status === 200 && jobsResponse.data.items) {
        return { collection: parsedCollectionData, jobs: jobsResponse.data.items };
      }
    }
  }

  return returnData;
};

export { getSpaData };
