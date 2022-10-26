import { Box, HStack, Select, Button } from "@chakra-ui/react";
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";

type ChangeCallback = (page: number, itemsPerPage: number) => void;

interface PaginationProp {
  total: number;
  possibleItemsPerPage?: Array<number>;
  preselected?: number;
  onChange?: ChangeCallback;
}

const Pagination: FunctionComponent<PaginationProp> = ({
  total,
  possibleItemsPerPage = [5, 10, 15, 20, 30, 50, 100],
  preselected = 3,
  onChange,
}): JSX.Element => {
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
        <Select w='max-content' size='sm' onChange={updateItemsPerPage} flexShrink='1'>
          {possibleItemsPerPage.map((perPage, i) => {
            return (
              <option selected={i === preselected} key={`option${perPage}`}>
                {perPage}
              </option>
            );
          })}
        </Select>
        <Button size='sm' variant='pgNotSelected' onClick={() => updatePage(1)}>
          &lt;&lt;
        </Button>
        <Button size='sm' variant='pgNotSelected' isDisabled={page === 1} onClick={() => updatePage(page - 1)}>
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
        <Button size='sm' variant='pgNotSelected' isDisabled={page === pageAmount} onClick={() => updatePage(page + 1)}>
          &gt;
        </Button>
        <Button size='sm' variant='pgNotSelected' onClick={() => updatePage(pageAmount)}>
          &gt;&gt;
        </Button>
      </HStack>
    </Box>
  );
};

export default Pagination;
