import { DataConfig } from "schema/interfaces";

export const collectionConfig: DataConfig = {
  include: [
    { name: "pixelSizeOnImage", unit: "Å" },
    { name: "voltage", unit: "kV" },
    { name: ["imageSizeX", "imageSizeY"], unit: "pixels", label: "Image Size" },
  ],
  root: ["comments", "dataCollectionId", "pixelSizeOnImage"],
};

export const classificationConfig: DataConfig = {
  include: [
    { name: "type" },
    { name: "batchNumber" },
    { name: "numberOfClassesPerBatch", label: "Classes per Batch" },
    { name: "numberOfParticlesPerBatch", label: "Particles per Batch" },
    { name: "symmetry" },
    { name: "classNumber" },
    { name: "classDistribution" },
    { name: "particlesPerClass" },
    { name: "rotationAccuracy" },
    { name: "translationAccuracy", unit: "Å" },
    { name: "estimatedResolution" },
    { name: "overallFourierCompleteness" },
  ],
  root: ["particleClassificationId"],
};

export const recipeTagMap: Record<string, string> = {
  "em-spa-preprocess": "Preprocessing",
  "em-spa-class2d": "2D Classification",
  "em-spa-class3d": "3D Classification",
};

interface FieldEntry {
  alias: string;
  isBool?: boolean;
}

export const spaReprocessingFieldConfig: Record<string, FieldEntry> = {
  Cs: { alias: "sphericalAberration" },
  ctffind_do_phaseshift: { alias: "phasePlateUsed" },
  angpix: { alias: "pixelSize" },
  motioncor_binning: { alias: "motionCorrectionBinning" },
  motioncor_doseperframe: { alias: "dosePerFrame" },
  stop_after_ctf_estimation: { alias: "stopAfterCtfEstimation", isBool: true },
  autopick_do_cryolo: { alias: "useCryolo", isBool: true },
  do_class3d: { alias: "doClass3D", isBool: true },
  do_class2d: { alias: "doClass2D", isBool: true },
  mask_diameter: { alias: "maskDiameter" },
  extract_boxsize: { alias: "boxSize" },
  extract_small_boxsize: { alias: "downsampleBoxSize" },
  use_fsc_criterion: { alias: "useFSCCriterion", isBool: true },
  do_class2d_pass2: { alias: "perform2DSecondPass", isBool: true },
  do_class3d_pass2: { alias: "perform3DSecondPass", isBool: true },
  autopick_LoG_diam_min: { alias: "minimumDiameter" },
  autopick_LoG_diam_max: { alias: "maximumDiameter" },
  motioncor_gainreference: { alias: "gainReferenceFile" },
};
