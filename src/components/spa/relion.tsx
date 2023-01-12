import {
  Divider,
  Box,
  Text,
  FormControl,
  Checkbox,
  FormLabel,
  Select,
  Button,
  VStack,
  HStack,
  Spacer,
  NumberIncrementStepper,
  NumberInputStepper,
  NumberInputField,
  NumberInput,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FormEvent, ReactNode, useCallback } from "react";
import FieldSet from "../fieldset";

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

interface Option {
  key: string | number;
  value: string;
}

interface FormItemProps {
  unit?: string;
  label: string;
  children: ReactNode;
}

interface DropDownProps {
  values: Option[];
  name: string;
}

interface NumberInputProps {
  name: string;
  precision: number;
  defaultValue: number;
}

const FormItem = ({ unit, label, children }: FormItemProps) => (
  <FormControl>
    <FormLabel marginBottom={0}>
      <HStack>
        <Text>{label}</Text>
        {unit && (
          <Text fontSize={12} color='diamond.300'>
            ({unit})
          </Text>
        )}
      </HStack>
    </FormLabel>
    {children}
  </FormControl>
);

const DropDown = ({ values, name }: DropDownProps) => (
  <Select size='sm' name={name}>
    {values.map((item) => (
      <option key={item.key}>{item.value}</option>
    ))}
  </Select>
);

const FormNumberInput = ({ name, precision, defaultValue }: NumberInputProps) => (
  <NumberInput size='sm' precision={precision} defaultValue={defaultValue}>
    <NumberInputField name={name} />
    <NumberInputStepper>
      <NumberIncrementStepper />
      <NumberDecrementStepper />
    </NumberInputStepper>
  </NumberInput>
);

const RelionReprocessing = ({ procJobId }: RelionProps) => {
  const handleSubmit = useCallback((formData: FormEvent<HTMLFormElement>) => {
    formData.preventDefault();
    console.log(formData.target);
  }, []);

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box p={3}>
          <FieldSet title='Experiment'>
            <VStack spacing={4}>
              <HStack w='100%'>
                <Checkbox name='gainRef'>Gain Reference File</Checkbox>
                <Spacer />
                <Checkbox name='phasePlate'>Phase Plate Used</Checkbox>
              </HStack>

              <FormItem label='Voltage' unit='kV'>
                <DropDown name='voltage' values={voltageValues} />
              </FormItem>
              <FormItem label='Spherical Aberration' unit='mm'>
                <DropDown name='sphericalAberration' values={sphericalAberrationValues} />
              </FormItem>
              <FormItem label='Motion Correction Binning'>
                <DropDown name='motionCorBinning' values={motionCorrectionBinningValues} />
              </FormItem>
              <FormItem label='Pixel Size' unit='Å/pixel'>
                <FormNumberInput name='pixelSize' precision={3} defaultValue={0.831} />
              </FormItem>
              <FormItem label='Dose per Frame' unit='e⁻/Å²'>
                <FormNumberInput name='pixelSize' precision={3} defaultValue={1} />
              </FormItem>
            </VStack>
          </FieldSet>
        </Box>
        <Divider marginTop={2} />
        <HStack px={4} py={2} spacing={3}>
          <Spacer />
          <Button variant='outline'>Cancel</Button>
          <Button type='submit'>Submit</Button>
        </HStack>
      </form>
    </Box>
  );
};

export default RelionReprocessing;
