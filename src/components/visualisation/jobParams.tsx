import {
  Text,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { components } from "schema/main";
import { client } from "utils/api/client";

export interface JobParamDrawerProps {
  procJobId: number;
  onClose: DrawerProps["onClose"];
}

const fetchCtfData = async (procJobId: number) => {
  const response = await client.safeGet(`processingJob/${procJobId}/parameters`);
  return response.data.items as components["schemas"]["ProcessingJobParameters"]["items"];
};

const JobParamsDrawer = ({ procJobId, onClose }: JobParamDrawerProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["procJobParams", procJobId],
    queryFn: async () => await fetchCtfData(procJobId),
  });

  return (
    <Drawer isOpen={true} placement='right' onClose={onClose} size='md'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Processing Parameters</DrawerHeader>
        <DrawerBody>
          {isLoading ? null : (
            <VStack gap='0.2em' alignItems='start' divider={<Divider my='0' />}>
              {Object.entries(data!).map(([key, value]) => (
                <Text w='100%' key={key}>
                  <b>{key}:</b> {value}
                </Text>
              ))}
            </VStack>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export { JobParamsDrawer };
