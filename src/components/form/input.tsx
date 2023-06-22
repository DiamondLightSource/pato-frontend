import { ReactNode } from "react";
import {
  Text,
  FormControl,
  FormLabel,
  Select,
  HStack,
  NumberIncrementStepper,
  NumberInputStepper,
  NumberDecrementStepper,
  FormHelperText,
  SelectProps,
  FormErrorMessage,
  FormControlProps,
  Spacer,
} from "@chakra-ui/react";

export interface Option {
  key: string | number;
  value: string;
}

export interface FormItemProps extends FormControlProps {
  unit?: string;
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
}

export interface DropDownProps extends SelectProps {
  values: Option[];
}

const FormItem = (props: FormItemProps) => (
  <FormControl isInvalid={!!props.error}>
    <FormLabel marginBottom={0}>
      <HStack>
        <Text>{props.label}</Text>
        {props.unit && (
          <Text fontSize={12} color='diamond.300'>
            ({props.unit})
          </Text>
        )}
        <Spacer />
      </HStack>
    </FormLabel>
    <FormErrorMessage fontWeight='600'>{props.error}</FormErrorMessage>
    {props.children}
    {props.helperText && <FormHelperText fontSize='sm'>{props.helperText}</FormHelperText>}
  </FormControl>
);

const Dropdown = (props: DropDownProps) => (
  <Select bg='white' size='sm' {...props}>
    {props.values.map((item) => (
      <option key={item.key}>{item.value}</option>
    ))}
  </Select>
);

const NumericStepper = () => (
  <NumberInputStepper>
    <NumberIncrementStepper />
    <NumberDecrementStepper />
  </NumberInputStepper>
);

export { FormItem, NumericStepper, Dropdown };
