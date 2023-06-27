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

const FormItem = ({ unit, label, children, helperText, error, ...props }: FormItemProps) => (
  <FormControl isInvalid={!!error} {...props}>
    <FormLabel marginBottom={0}>
      <HStack>
        <Text>{label}</Text>
        {unit && (
          <Text fontSize={12} color='diamond.300'>
            ({unit})
          </Text>
        )}
        <Spacer />
      </HStack>
    </FormLabel>
    <FormErrorMessage fontWeight='600'>{error}</FormErrorMessage>
    {children}
    {helperText && <FormHelperText fontSize='sm'>{helperText}</FormHelperText>}
  </FormControl>
);

const Dropdown = ({ values, ...props }: DropDownProps) => (
  <Select bg='white' size='sm' {...props}>
    {values.map((item) => (
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
