import {
  Text,
  Checkbox,
  VStack,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  Select,
  createStandaloneToast,
  Input,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FieldSet } from "components/form/fieldset";
import { Form } from "components/form/form";
import { FormItem, Options } from "components/form/input";
import { useForm, useWatch } from "react-hook-form";
import { client } from "utils/api/client";
import { baseToast } from "@diamondlightsource/ui-components";
import { components } from "schema/main";
import { required } from "utils/validation";
import { useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";

interface RelionProps {
  collectionId: number;
  defaultValues: Partial<components["schemas"]["SPAReprocessingParameters"]>;
  onClose: () => void;
}

const voltageValues = [
  { key: 300, value: "300" },
  { key: 200, value: "200" },
];

const sphericalAberrationValues = [{ key: 2.7, value: "2.7 (Talos/Krios)" }];

const motionCorrectionBinningValues = [
  { key: 1, value: "1" },
  { key: 2, value: "2" },
];

const requiredWhenNotStoppingAfterCTF = (
  value: number | null | undefined,
  formData: RelionProps["defaultValues"]
) => (!formData.stopAfterCtfEstimation && !value ? "Field is required" : true);

const RelionReprocessing = ({ collectionId, defaultValues, onClose }: RelionProps) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues });
  const { toast } = createStandaloneToast();
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();

  const particleSize = useWatch({ control, name: ["pixelSize", "maximumDiameter"] });
  const calculateAuto = useWatch({
    control,
    name: "performCalculation",
    defaultValue: !!defaultValues.performCalculation,
  });
  const stopAfterCTF = useWatch({
    control,
    name: "stopAfterCtfEstimation",
    defaultValue: !!defaultValues.stopAfterCtfEstimation,
  });

  useEffect(() => {
    const [pixelSize, maximumDiameter] = particleSize;

    if (maximumDiameter && calculateAuto) {
      // https://github.com/DiamondLightSource/cryoem-services/blob/main/src/cryoemservices/util/spa_relion_service_options.py#L10

      setValue("maskDiameter", parseFloat((1.1 * maximumDiameter).toFixed(3)));
      if (pixelSize && pixelSize > 0) {
        setValue("boxSize", 2 * Math.ceil((1.2 * (maximumDiameter / pixelSize)) / 2));
      }
    }
  }, [particleSize, setValue, calculateAuto]);

  useEffect(() => {
    if (stopAfterCTF) {
      clearErrors("maximumDiameter");
      clearErrors("minimumDiameter");
    }
  }, [clearErrors, stopAfterCTF]);
  const onSubmit = handleSubmit((formData) => {
    client.post(`dataCollections/${collectionId}/reprocessing/spa`, formData).then((response) => {
      if (response.status !== 202) {
        // Autopopulated fields get cleared on submission for some odd reason
        reset(formData);
        toast({
          ...baseToast,
          title: "Error while initiating pipeline",
          description: "Report this error to a local contact or developer",
          status: "error",
        });
      } else {
        toast({
          ...baseToast,
          title: "Reprocessing succesfully initiated!",
        });
        queryClient.removeQueries({ queryKey: ["spaAutoProc"] });
        revalidator.revalidate();

        if (onClose) {
          onClose();
        }
      }
    });
  });

  /*
   * TODO: Thought about moving this to a generator function, but there are so many edge cases,
   * behaviours and different fields that it wouldn't make much sense.
   * Possibly in the future?
   */
  return (
    <Form onSubmit={onSubmit}>
      <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
        <GridItem>
          <FieldSet title='Experiment'>
            <VStack spacing={4}>
              <Grid w='100%' py={2} templateColumns='repeat(2, 1fr)' gap={4}>
                <Checkbox {...register("phasePlateUsed")}>Phase Plate Used</Checkbox>
              </Grid>
              <FormItem label='Gain Reference File' error={errors.gainReferenceFile}>
                <Input size='sm' defaultValue='gain.mrc' {...register("gainReferenceFile")} />
              </FormItem>
              <FormItem label='Voltage' unit='kV' error={errors.voltage}>
                <Select size='sm' {...register("voltage", { valueAsNumber: true })}>
                  <Options values={voltageValues} />
                </Select>
              </FormItem>
              <FormItem label='Spherical Aberration' unit='mm' error={errors.sphericalAberration}>
                <Select size='sm' {...register("sphericalAberration", { valueAsNumber: true })}>
                  <Options values={sphericalAberrationValues} />
                </Select>
              </FormItem>
              <FormItem label='Motion Correction Binning' error={errors.motionCorrectionBinning}>
                <Select size='sm' {...register("motionCorrectionBinning", { valueAsNumber: true })}>
                  <Options values={motionCorrectionBinningValues}></Options>
                </Select>
              </FormItem>
              <FormItem label='Pixel Size' unit='Å/pixel' error={errors.pixelSize}>
                <NumberInput size='sm' precision={3}>
                  <NumberInputField {...register("pixelSize", { required })} />
                </NumberInput>
              </FormItem>
              <FormItem label='Dose per Frame' unit='e⁻/Å²' error={errors.dosePerFrame}>
                <NumberInput size='sm' precision={3}>
                  <NumberInputField {...register("dosePerFrame", { required })} />
                </NumberInput>
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Particle Picking' isDisabled={stopAfterCTF}>
            <VStack spacing={4}>
              <Grid w='100%' py={2} templateColumns='repeat(2, 1fr)' gap={4}>
                <VStack spacing='0'>
                  <Checkbox isDisabled={stopAfterCTF} w='100%' {...register("useCryolo")}>
                    Use crYOLO
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Academic users only. Not licensed for industry users.
                  </Text>
                </VStack>
                <VStack spacing='0'>
                  <Checkbox isDisabled={stopAfterCTF} w='100%' {...register("performCalculation")}>
                    Calculate for Me
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Calculate box sizes and mask diameter automatically.
                  </Text>
                </VStack>
              </Grid>
              <FormItem label='Minimum Diameter' unit='Å' error={errors.minimumDiameter}>
                <NumberInput size='sm'>
                  <NumberInputField
                    {...register("minimumDiameter", { validate: requiredWhenNotStoppingAfterCTF })}
                  />
                </NumberInput>
              </FormItem>
              <FormItem label='Maximum Diameter' unit='Å' error={errors.maximumDiameter}>
                <NumberInput size='sm'>
                  <NumberInputField
                    {...register("maximumDiameter", { validate: requiredWhenNotStoppingAfterCTF })}
                  />
                </NumberInput>
              </FormItem>
              <FormItem label='Mask Diameter' unit='Å' error={errors.maskDiameter}>
                <NumberInput size='sm'>
                  <NumberInputField readOnly={calculateAuto} {...register("maskDiameter")} />
                </NumberInput>
              </FormItem>
              <FormItem
                label='Box Size'
                helperText='Box size before binning'
                unit='Pixels'
                error={errors.boxSize}
              >
                <NumberInput size='sm'>
                  <NumberInputField readOnly={calculateAuto} {...register("boxSize")} />
                </NumberInput>
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Classification'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox isDisabled={stopAfterCTF} {...register("doClass2D")}>
                2D Classification
              </Checkbox>
              <Checkbox isDisabled={stopAfterCTF} {...register("doClass3D")}>
                3D Classification
              </Checkbox>
              <Checkbox isDisabled={stopAfterCTF} {...register("useFscCriterion")}>
                Best Initial Model from FSC
              </Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Miscellaneous'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox {...register("stopAfterCtfEstimation")}>Stop After CTF Estimation</Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
      </Grid>
    </Form>
  );
};

export { RelionReprocessing };
