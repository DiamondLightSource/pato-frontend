import { Button, HStack, InputRightAddon, InputGroup, Input, Skeleton } from "@chakra-ui/react";
import { useEffect, useState, FocusEvent as ReactFocusEvent, useCallback } from "react";

type ChangeCallback = (page: number) => void;

interface MotionPaginationProps {
  total: number;
  size?: "xs" | "md";
  defaultPage?: number;
  onChange?: ChangeCallback;
  startFrom?: "start" | "middle" | "end";
  disabled?: boolean;
}

const MotionPagination = ({
  total,
  onChange,
  size = "xs",
  defaultPage,
  startFrom = "end",
  disabled = false,
}: MotionPaginationProps) => {
  const [value, setValue] = useState<string | undefined>();

  const setPage = useCallback(
    (page: number) => {
      setValue(page.toString());
      if (!isNaN(page) && onChange !== undefined) {
        onChange(page);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (defaultPage && defaultPage > 0) {
      setValue(defaultPage.toString());
    }
  }, [defaultPage]);

  useEffect(() => {
    if (value !== undefined || total === 0) {
      return;
    }

    if (total !== undefined && defaultPage === undefined) {
      switch (startFrom) {
        case "end":
          setValue(total.toString());
          break;
        case "middle":
          if (total !== 0) {
            setPage(Math.round(total / 2));
          }
          break;
        case "start":
          setValue("1");
          break;
      }
    }
  }, [total, startFrom, defaultPage, setPage, value]);

  const editPage = useCallback((event: ReactFocusEvent<HTMLInputElement>) => {
    let newPage = parseInt(event.target.value);

    if (newPage > total) {
      newPage = total;
    }
    if (newPage < 1) {
      newPage = 1;
    }

    if (!isNaN(newPage)) {
      setPage(newPage);
    }
  },[setPage, total]);

  if (value === undefined) {
    return <Skeleton h='20px' w={size === "xs" ? "210px" : "295px"} />;
  }

  return (
    <HStack py={size === "xs" ? 1 : 0} maxW={size === "xs" ? "230px" : "295px"}>
      <Button aria-label='First Page' isDisabled={disabled} size={size} onClick={() => setPage(1)}>
        &lt;&lt;
      </Button>
      <Button
        aria-label='Previous Page'
        size={size}
        isDisabled={parseInt(value) === 1 || disabled}
        onClick={() => setPage(parseInt(value) - 1)}
      >
        &lt;
      </Button>
      <InputGroup size={size}>
        <Input
          isDisabled={disabled}
          bg='white'
          aria-label='Current Page'
          onChange={(event) => setValue(event.target.value)}
          value={value}
          onBlur={editPage}
        />
        <InputRightAddon aria-label='Total Pages' children={total} />
      </InputGroup>
      <Button
        size={size}
        isDisabled={parseInt(value) === total || disabled}
        onClick={() => setPage(parseInt(value) + 1)}
        aria-label='Next Page'
      >
        &gt;
      </Button>
      <Button aria-label='Last Page' size={size} isDisabled={disabled} onClick={() => setPage(total)}>
        &gt;&gt;
      </Button>
    </HStack>
  );
};

export { MotionPagination };
