import { Box, HStack, Select, Button, Text, Spacer, Divider, Stack } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";

type PageChangeCallback = (page: number) => void;
type ItemChangeCallback = (items: number) => void;

export interface PaginationProps {
  /** Total number of items to paginate */
  total: number;
  /** Array with all available "items per page" amounts */
  possibleItemsPerPage?: Array<number>;
  /** Preselected item index */
  preselected?: number;
  /** External bind for current page */
  value?: number;
  /** Callback for page change events */
  onPageChange?: PageChangeCallback;
  /** Callback for item count change event */
  onItemCountChange?: ItemChangeCallback;
}

const Pagination = ({
  total,
  possibleItemsPerPage = [5, 10, 15, 20, 30, 50, 100],
  preselected = 3,
  value,
  onPageChange,
  onItemCountChange,
}: PaginationProps) => {
  const [page, setPage] = useState(value || 1);
  const [itemsPerPage, setItemsPerPage] = useState(possibleItemsPerPage[preselected]);
  const [pageAmount, setPageAmount] = useState(1);

  useEffect(() => {
    if (value) {
      setPage(value);
    }
  }, [value]);

  useEffect(() => {
    if (onPageChange !== undefined) {
      onPageChange(page);
    }
  }, [page, onPageChange]);

  useEffect(() => {
    if (onItemCountChange !== undefined) {
      onItemCountChange(itemsPerPage);
    }
  }, [itemsPerPage, onItemCountChange]);

  const updateItemsPerPage = (event: ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value);
    const newPage = Math.ceil((page * itemsPerPage) / newItemsPerPage);
    setPage(newPage > pageAmount ? 1 : newPage);
    setItemsPerPage(newItemsPerPage);
  };

  useEffect(() => {
    const newPageAmount = Math.ceil(total / itemsPerPage);
    setPage((prevPage) => (prevPage > newPageAmount ? 1 : prevPage));
    setPageAmount(newPageAmount);
  }, [total, itemsPerPage, setPage]);

  return (
    <Box py={2}>
      <Stack w="100%" direction={{base: 'column', md: "row"}}>
        <HStack>
          <Button aria-label='First Page' size='sm' variant='pgNotSelected' onClick={() => setPage(1)}>
            &lt;&lt;
          </Button>
          <Button
            aria-label='Previous Page'
            size='sm'
            variant='pgNotSelected'
            isDisabled={page === 1}
            onClick={() => setPage(page - 1)}
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
                  onClick={() => setPage(pageDisplay)}
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
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </Button>
          <Button aria-label='Last Page' size='sm' variant='pgNotSelected' onClick={() => setPage(pageAmount)}>
            &gt;&gt;
          </Button>
        </HStack>
        <Divider display={{base: "none", md: "initial"}} orientation='vertical' h='30px' />
        <HStack flexGrow="1">
          <Text id='item-count-label'>
            <b>Items per Page:</b>
          </Text>
          <Select
            aria-labelledby='item-count-label'
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
          <Spacer />
          <Text color='gray.600'>
            Page {page} out of {pageAmount}
          </Text>
        </HStack>
      </Stack>
    </Box>
  );
};

export { Pagination };
