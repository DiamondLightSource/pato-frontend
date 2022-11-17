import { Button, HStack, InputRightAddon, InputGroup, Input } from "@chakra-ui/react";
import { FunctionComponent, useEffect, useState, FocusEvent as ReactFocusEvent } from "react";

type ChangeCallback = (page: number) => void;

interface MotionPaginationProp {
  total: number;
  onChange?: ChangeCallback;
}

const MotionPagination: FunctionComponent<MotionPaginationProp> = ({ total, onChange }): JSX.Element => {
  const [value, setValue] = useState("1");

  useEffect(() => {
    if (total !== undefined) {
      setValue(total.toString());
    }
  }, [total]);

  const editPage = (event: ReactFocusEvent<HTMLInputElement>) => {
    let newPage = parseInt(event.target.value);

    if (newPage > total) {
      newPage = total;
    }
    if (newPage < 1) {
      newPage = 1;
    }

    setPage(newPage);
  };

  const setPage = (page: number) => {
    setValue(page.toString());

    if (!isNaN(page) && onChange !== undefined) {
      onChange(page);
    }
  };

  return (
    <HStack py={1} maxW='210px'>
      <Button size='xs' onClick={() => setPage(1)}>
        &lt;&lt;
      </Button>
      <Button size='xs' isDisabled={parseInt(value) === 1} onClick={() => setPage(parseInt(value) - 1)}>
        &lt;
      </Button>
      <InputGroup size='xs'>
        <Input
          aria-label='Current Page'
          onChange={(event) => setValue(event.target.value)}
          value={value}
          onBlur={(event) => editPage(event)}
        />
        <InputRightAddon aria-label='Total Pages' children={total} />
      </InputGroup>
      <Button size='xs' isDisabled={parseInt(value) === total} onClick={() => setPage(parseInt(value) + 1)}>
        &gt;
      </Button>
      <Button size='xs' onClick={() => setPage(total)}>
        &gt;&gt;
      </Button>
    </HStack>
  );
};

export default MotionPagination;
