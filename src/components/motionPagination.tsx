import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Input,
  NumberInputField,
  NumberInput,
  Text,
  useNumberInput,
} from "@chakra-ui/react";
import { FunctionComponent, useEffect, useState, FocusEvent as ReactFocusEvent } from "react";

type ChangeCallback = (page: number) => void;

interface MotionPaginationProp {
  total: number;
  onChange?: ChangeCallback;
}

const MotionPagination: FunctionComponent<MotionPaginationProp> = ({ total, onChange }): JSX.Element => {
  const [value, setValue] = useState("1");

  useEffect(() => {
    setValue(total.toString());
  }, [total]);

  const updatePage = (event: ReactFocusEvent<HTMLInputElement>) => {
    let newPage = parseInt(event.target.value);

    if (newPage > total) {
      newPage = total;
    }
    if (newPage < 1) {
      newPage = 1;
    }

    setValue(newPage.toString());

    if (!isNaN(newPage) && onChange !== undefined) {
      onChange(newPage);
    }
  };

  return (
    <HStack paddingTop={2} maxW='190px'>
      <Button size='xs' onClick={() => setValue("1")}>
        &lt;&lt;
      </Button>
      <Button size='xs' isDisabled={parseInt(value) === 1} onClick={() => setValue((parseInt(value) - 1).toString())}>
        &lt;
      </Button>
      <NumberInput size='xs' min={1} max={total} value={value} onChange={(text) => setValue(text)}>
        <NumberInputField onBlur={(event) => updatePage(event)}></NumberInputField>
      </NumberInput>
      <Button
        size='xs'
        isDisabled={parseInt(value) === total}
        onClick={() => setValue((parseInt(value) + 1).toString())}
      >
        &gt;
      </Button>
      <Button size='xs' onClick={() => setValue(total.toString())}>
        &gt;&gt;
      </Button>
    </HStack>
  );
};

export default MotionPagination;
