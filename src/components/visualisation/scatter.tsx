import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  useDisclosure,
} from "@chakra-ui/react";

import { ScatterPlotOptions, BasePoint } from "../../utils/interfaces";
import { ParentSize } from "@visx/responsive";
import { Scatter } from "../plots/scatter";
import { BaseCardProp } from "../../utils/interfaces";

interface ScatterProps extends BaseCardProp {
  /** Datapoints */
  data: BasePoint[];
  /** Plot configuration*/
  options?: ScatterPlotOptions;
}

const ScatterPlot = ({
  title,
  data,
  width = "100%",
  height = "100%",
  active = false,
  options,
  onClick,
}: ScatterProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Card aria-selected={active} w={width} h={height} onClick={onOpen}>
      <CardHeader>
        <Heading size='sm'>{title}</Heading>
      </CardHeader>
      {data && data.length > 0 ? (
        <CardBody px={2} py='0'>
          <ParentSize>
            {({ width, height }) => <Scatter width={width} height={height} data={data} options={options} />}
          </ParentSize>
          <Modal size='xl' isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent w='80vw' maxW='80vw' h={{ base: "90vh", md: "60vh" }}>
              <ModalHeader>{title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <ParentSize>
                  {({ width, height }) => <Scatter width={width} height={height} data={data} options={options} />}
                </ParentSize>
              </ModalBody>
              <ModalFooter></ModalFooter>
            </ModalContent>
          </Modal>
        </CardBody>
      ) : (
        <Skeleton w={width} h={height}></Skeleton>
      )}
    </Card>
  );
};

export { ScatterPlot };
