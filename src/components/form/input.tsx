import { ReactNode } from "react";
import {
  Text,
  FormControl,
  FormLabel,
  Select,
  HStack,
  NumberIncrementStepper,
  NumberInputStepper,
  NumberInputField,
  NumberInput,
  NumberDecrementStepper,
  FormHelperText,
} from "@chakra-ui/react";

export interface Option {
  key: string | number;
  value: string;
}

export interface FormItemProps {
  unit?: string;
  label: string;
  children: ReactNode;
  helperText?: string;
}

export interface DropDownProps {
  values: Option[];
  name: string;
}

export interface NumberInputProps {
  name: string;
  precision?: number;
  defaultValue: number;
  disabled?: boolean;
}

const FormItem = (props: FormItemProps) => (
  <FormControl>
    <FormLabel marginBottom={0}>
      <HStack>
        <Text>{props.label}</Text>
        {props.unit && (
          <Text fontSize={12} color='diamond.300'>
            ({props.unit})
          </Text>
        )}
      </HStack>
    </FormLabel>
    {props.children}
    {props.helperText && <FormHelperText fontSize='xs'>{props.helperText}</FormHelperText>}
  </FormControl>
);

const Dropdown = ({ values, name }: DropDownProps) => (
  <Select bg='white' size='sm' name={name}>
    {values.map((item) => (
      <option key={item.key}>{item.value}</option>
    ))}
  </Select>
);

const NumericInput = ({
  name,
  precision = 0,
  disabled = false,
  defaultValue,
}: NumberInputProps) => (
  <NumberInput isDisabled={disabled} size='sm' precision={precision} defaultValue={defaultValue}>
    <NumberInputField bg='white' name={name} />
    <NumberInputStepper>
      <NumberIncrementStepper />
      <NumberDecrementStepper />
    </NumberInputStepper>
  </NumberInput>
);

export { FormItem, NumericInput, Dropdown };
