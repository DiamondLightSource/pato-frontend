import { DataConfig } from "../interfaces";

const collectionConfig: DataConfig = {
  include: [
    { name: "pixelSizeOnImage", unit: "μm" },
    { name: "voltage", unit: "kV" },
    { name: ["imageSizeX", "imageSizeY"], unit: "pixels", label: "Image Size" },
  ],
  root: ["comments", "dataCollectionId"],
};

const classificationConfig: DataConfig = {
  include: [
    { name: "type" },
    { name: "batchNumber" },
    { name: "classesPerBatch" },
    { name: "particlesPerBatch" },
    { name: "symmetry" },
    { name: "classNumber" },
    { name: "classDistribution" },
    { name: "particlesPerClass" },
    { name: "rotationAccuracy" },
    { name: "translationAccuracy", unit: "Å" },
    { name: "estimatedResolution" },
    { name: "overallFourierCompleteness" },
    { name: "resolution" },
    { name: "numberOfParticles" },
  ],
};

export { collectionConfig, classificationConfig };
