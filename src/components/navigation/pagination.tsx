import { Box, HStack, Select, Button, Text, Spacer } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";

type ChangeCallback = (page: number, itemsPerPage: number) => void;

interface PaginationProps {
  /** Total number of items to paginate */
  total: number;
  /** Array with all available "items per page" amounts */
  possibleItemsPerPage?: Array<number>;
  /** Preselected item index */
  preselected?: number;
  /** Callback for page change events */
  onChange?: ChangeCallback;
}

const Pagination = ({
  total,
  possibleItemsPerPage = [5, 10, 15, 20, 30, 50, 100],
  preselected = 3,
  onChange,
}: PaginationProps) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(possibleItemsPerPage[preselected]);
  const [pageAmount, setPageAmount] = useState(1);

  const updatePage = (page: number) => {
    if (onChange !== undefined) {
      onChange(page, itemsPerPage);
    }

    setPage(page);
  };

  const updateItemsPerPage = (event: ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value);
    setPage(Math.ceil((page * itemsPerPage) / newItemsPerPage));
    setItemsPerPage(newItemsPerPage);

    if (onChange !== undefined) {
      onChange(page, newItemsPerPage);
    }
  };

  useEffect(() => {
    setPageAmount(Math.ceil(total / itemsPerPage));
  }, [total, itemsPerPage]);

  return (
    <Box py={2}>
      <HStack>
        <Select
          bg='diamond.50'
          w='max-content'
          size='sm'
          defaultValue={possibleItemsPerPage[preselected]}
          onChange={updateItemsPerPage}
          flexShrink='1'
        >
          {possibleItemsPerPage.map((perPage, i) => {
            return <option key={`option${perPage}`}>{perPage}</option>;
          })}
        </Select>
        <Button aria-label='First Page' size='sm' variant='pgNotSelected' onClick={() => updatePage(1)}>
          &lt;&lt;
        </Button>
        <Button
          aria-label='Previous Page'
          size='sm'
          variant='pgNotSelected'
          isDisabled={page === 1}
          onClick={() => updatePage(page - 1)}
        >
          &lt;
        </Button>
        <div>
          {Array.from({ length: pageAmount >= 5 ? 5 : pageAmount }, (_, idx) => {
            let pageDisplay = idx + 1;
            if (pageAmount > 4) {
              pageDisplay = page + idx - (page < 3 ? page - 1 : 2);
              if (pageAmount - page < 2) {
                pageDisplay -= 2 - (pageAmount - page);
              }
            }
            return (
              <Button
                size='sm'
                key={pageDisplay}
                mx={0.5}
                variant={pageDisplay === page ? "pgSelected" : "pgNotSelected"}
                onClick={() => updatePage(pageDisplay)}
              >
                {pageDisplay}
              </Button>
            );
          })}
        </div>
        <Button
          aria-label='Next Page'
          size='sm'
          variant='pgNotSelected'
          isDisabled={page === pageAmount}
          onClick={() => updatePage(page + 1)}
        >
          &gt;
        </Button>
        <Button aria-label='Last Page' size='sm' variant='pgNotSelected' onClick={() => updatePage(pageAmount)}>
          &gt;&gt;
        </Button>
        <Spacer />
        <Text color='gray.600'>
          Page {page} out of {pageAmount}
        </Text>
      </HStack>
    </Box>
  );
};

export { Pagination };
