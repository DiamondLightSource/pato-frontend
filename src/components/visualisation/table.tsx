import { Box, Heading, Skeleton, Table, Tbody, Td, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { useCallback } from "react";

interface TableProps {
  /** Table data */
  data: Record<string, any>[] | null | undefined;
  /** Table headers and mapping to record keys */
  headers: { key: string; label: string }[];
  /** Callback when row is clicked */
  onClick?: (item: Record<string, any>) => void;
  /** Label to be used when displaying "no data available" message */
  label?: string;
}

const TableView = ({ data, headers, onClick, label = "data" }: TableProps) => {
  const handleClick = useCallback(
    (row: React.MouseEvent<HTMLTableRowElement>) => {
      if (onClick && data) {
        const target = (row.target as HTMLTableCellElement).dataset.id;
        if (target) {
          onClick(data[parseInt(target)]);
        }
      }
    },
    [data, onClick]
  );

  return (
    <Box overflow='scroll'>
      {data === null ? (
        <Heading py={10} w='100%' variant='notFound'>
          No {label.toLowerCase()} found
        </Heading>
      ) : (
        <>
          {data !== undefined && data.length > 0 ? (
            <Table size='sm' variant='diamondStriped'>
              <Thead>
                <Tr>
                  {headers.map((header) => (
                    <Th key={header.label}>{header.label}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody cursor='pointer'>
                {data.map((item, i) => (
                  <Tr h='2vh' key={i} onClick={handleClick}>
                    {headers.map((header) => (
                      <Td data-id={i} key={header.key}>
                        {item[header.key]}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <VStack>
              <Skeleton w='100%' h='2vh' />
              <Skeleton w='100%' h='3vh' />
              <Skeleton w='100%' h='3vh' />
              <Skeleton w='100%' h='3vh' />
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export { TableView as Table };
