import { Text, Checkbox, VStack, Grid, GridItem } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FieldSet } from "../form/fieldset";
import { Form } from "../form/form";
import { Dropdown, FormItem, NumericInput } from "../form/input";

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
  const [calculateAuto, setCalculateAuto] = useState(false);

  const handleSubmit = useCallback((formData: Record<string, any>) => {
    console.log(formData);
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
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
                <Dropdown name='sphericalAberration' values={sphericalAberrationValues} />
              </FormItem>
              <FormItem label='Motion Correction Binning'>
                <Dropdown name='motionCorBinning' values={motionCorrectionBinningValues} />
              </FormItem>
              <FormItem label='Pixel Size' unit='Å/pixel'>
                <NumericInput name='pixelSize' precision={3} defaultValue={0.831} />
              </FormItem>
              <FormItem label='Dose per Frame' unit='e⁻/Å²'>
                <NumericInput name='pixelSize' precision={3} defaultValue={1} />
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Particle Picking'>
            <VStack spacing={4}>
              <Grid w='100%' py={2} templateColumns='repeat(2, 1fr)' gap={4}>
                <VStack spacing='0'>
                  <Checkbox w='100%' name='gainRef'>
                    Use crYOLO
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Academic users only. Not licensed for industry users.
                  </Text>
                </VStack>
                <VStack spacing='0'>
                  <Checkbox w='100%' onChange={() => setCalculateAuto(!calculateAuto)} name='phasePlate'>
                    Calculate for Me
                  </Checkbox>
                  <Text paddingLeft='2.1em' fontSize='xs' color='diamond.300'>
                    Calculate box sizes and mask diameter automatically.
                  </Text>
                </VStack>
              </Grid>
              <FormItem label='Minimum Diameter' unit='Å'>
                <NumericInput name='minimumDiameter' defaultValue={100} />
              </FormItem>
              <FormItem label='Maximum Diameter' unit='Å'>
                <NumericInput name='maximumDiameter' defaultValue={140} />
              </FormItem>
              <FormItem label='Mask Diameter' unit='Å'>
                <NumericInput disabled={calculateAuto} name='maskDiameter' defaultValue={154} />
              </FormItem>
              <FormItem label='Box Size' helperText='Box size before binning' unit='Pixels'>
                <NumericInput disabled={calculateAuto} name='boxSize' defaultValue={204} />
              </FormItem>
              <FormItem label='Downsample Box Size' helperText='Box size after binning' unit='Pixels'>
                <NumericInput disabled={calculateAuto} name='downBoxSize' defaultValue={48} />
              </FormItem>
            </VStack>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Classification'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox defaultChecked={true} name='2dClassification'>
                Do 2D Classification
              </Checkbox>
              <Checkbox defaultChecked={true} name='3dClassification'>
                Do 3D Classification
              </Checkbox>
              <Checkbox name='bestFSC'>Best Initial Model from FSC</Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
        <GridItem>
          <FieldSet title='Miscellaneous'>
            <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
              <Checkbox name='secondPass'>Do Second Pass</Checkbox>
              <Checkbox name='stopAfterCTF'>Stop After CTF Estimation</Checkbox>
            </Grid>
          </FieldSet>
        </GridItem>
      </Grid>
    </Form>
  );
};

export { RelionReprocessing };
