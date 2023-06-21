import { Text, Checkbox, VStack, Grid, GridItem, NumberInput, NumberInputField } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FieldSet } from "components/form/fieldset";
import { Form } from "components/form/form";
import { Dropdown, FormItem, NumericStepper } from "components/form/input";
import { useForm } from "react-hook-form";

interface RelionProps {
  procJobId: number;
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

const RelionReprocessing = ({ procJobId }: RelionProps) => {
  // WIP, do not use yet!
  const [calculateAuto, setCalculateAuto] = useState(false);

  const { handleSubmit, register } = useForm();

  const onSubmit = useCallback((formData: Record<string, any>) => {
    console.log(formData);
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
        <GridItem>
          <FieldSet title='Experiment'>
            <VStack spacing={4}>
              <Grid w='100%' py={2} templateColumns='repeat(2, 1fr)' gap={4}>
                <Checkbox name='gainRef'>Gain Reference File</Checkbox>
                <Checkbox name='phasePlate'>Phase Plate Used</Checkbox>
              </Grid>
              <FormItem label='Voltage' unit='kV'>
                <Dropdown name='voltage' values={voltageValues} />
              </FormItem>
              <FormItem label='Spherical Aberration' unit='mm'>
                <Dropdown {...register("sphericalAberration")} values={sphericalAberrationValues} />
              </FormItem>
              <FormItem label='Motion Correction Binning'>
                <Dropdown {...register("motionCorBinning")} values={motionCorrectionBinningValues} />
              </FormItem>
              <FormItem label='Pixel Size' unit='Å/pixel'>
                <NumberInput size='sm' precision={3} defaultValue={0.831}>
                  <NumberInputField bg='white' {...register("pixelSize", { required: true })} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
              <FormItem label='Dose per Frame' unit='e⁻/Å²'>
                <NumberInput size='sm' precision={3} defaultValue={1}>
                  <NumberInputField bg='white' {...register("dosePerFrame", { required: true })} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Particle Picking'>
            <VStack spacing={4}>
              <Grid w='100%' py={2} templateColumns='repeat(2, 1fr)' gap={4}>
                <VStack spacing='0'>
                  <Checkbox w='100%' {...register("gainRef")}>
                    Use crYOLO
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Academic users only. Not licensed for industry users.
                  </Text>
                </VStack>
                <VStack spacing='0'>
                  <Checkbox w='100%' {...register("phasePlate")}>
                    Calculate for Me
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Calculate box sizes and mask diameter automatically.
                  </Text>
                </VStack>
              </Grid>
              <FormItem label='Minimum Diameter' unit='Å'>
                <NumberInput size='sm' isDisabled={calculateAuto} defaultValue={100}>
                  <NumberInputField bg='white' {...register("minimumDiameter")} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
              <FormItem label='Maximum Diameter' unit='Å'>
                <NumberInput size='sm' isDisabled={calculateAuto} defaultValue={140}>
                  <NumberInputField bg='white' {...register("maximumDiameter")} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
              <FormItem label='Mask Diameter' unit='Å'>
                <NumberInput size='sm' isDisabled={calculateAuto} defaultValue={154}>
                  <NumberInputField bg='white' {...register("maskDiameter")} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
              <FormItem label='Box Size' helperText='Box size before binning' unit='Pixels'>
                <NumberInput size='sm' isDisabled={calculateAuto} defaultValue={204}>
                  <NumberInputField bg='white' {...register("boxSize")} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
              <FormItem label='Downsample Box Size' helperText='Box size after binning' unit='Pixels'>
                <NumberInput size='sm' isDisabled={calculateAuto} defaultValue={48}>
                  <NumberInputField bg='white' {...register("downBoxSize")} />
                  <NumericStepper />
                </NumberInput>
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Classification'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox defaultChecked={true} {...register("2dClassification")}>
                Do 2D Classification
              </Checkbox>
              <Checkbox defaultChecked={true} {...register("3dClassification")}>
                Do 3D Classification
              </Checkbox>
              <Checkbox {...register("bestFSC")}>Best Initial Model from FSC</Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Miscellaneous'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox {...register("secondPass")}>Do Second Pass</Checkbox>
              <Checkbox {...register("stopAfterCTF")}>Stop After CTF Estimation</Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
      </Grid>
    </Form>
  );
};

export { RelionReprocessing };
