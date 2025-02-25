import { ReactNode } from "react";
import {
  Text,
  FormControl,
  FormLabel,
  HStack,
  NumberIncrementStepper,
  NumberInputStepper,
  NumberDecrementStepper,
  FormHelperText,
  FormErrorMessage,
  FormControlProps,
  Spacer,
} from "@chakra-ui/react";
import { FieldError } from "react-hook-form";

export interface Option {
  key: string | number;
  value: string;
}

export interface FormItemProps extends FormControlProps {
  unit?: string;
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: FieldError;
}

export interface DropDownProps {
  values: Option[];
}

const FormItem = ({ unit, label, children, helperText, error, ...props }: FormItemProps) => (
  <FormControl isInvalid={!!error} {...props}>
    <FormLabel marginBottom={0}>
      <HStack>
        <Text fontWeight='600'>{label}</Text>
        {unit && (
          <Text fontSize={12} color='diamond.300'>
            ({unit})
          </Text>
        )}
        <Spacer />
      </HStack>
    </FormLabel>
    <FormErrorMessage fontWeight='600'>{error && error.message}</FormErrorMessage>
    {helperText && (
      <FormHelperText mt='0' fontSize='sm'>
        {helperText}
      </FormHelperText>
    )}
    {children}
  </FormControl>
);

const Options = ({ values }: DropDownProps) => (
  <>
    {values.map((item) => (
      <option key={item.key} value={item.key}>
        {item.value}
      </option>
    ))}
  </>
);

const NumericStepper = () => (
  <NumberInputStepper>
    <NumberIncrementStepper />
    <NumberDecrementStepper />
  </NumberInputStepper>
);

export { FormItem, NumericStepper, Options };
