import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Scatter } from "react-chartjs-2";

import { FunctionComponent, useEffect, useState } from "react";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterProp {
  title: string;
  scatterData: { x: number; y: number }[];
  width?: string;
  height?: string;
}

const preloadedData = {
  datasets: [
    {
      data: [{ x: 1, y: 1 }],
      backgroundColor: "rgba(255, 99, 132, 1)",
    },
  ],
};

const ScatterWrapper: FunctionComponent<ScatterProp> = ({
  title,
  scatterData,
  width = "100%",
  height = "100%",
}): JSX.Element => {
  const [data, setData] = useState(preloadedData);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const options = {
    maintainAspectRatio: width === "100%" && height === "100%",
    plugins: { legend: { display: false } },
  };

  const modalOptions = {
    ...options,
    maintainAspectRatio: true,
  };

  useEffect(() => {
    setData({
      datasets: [
        {
          data: scatterData,
          backgroundColor: "rgba(255, 99, 132, 1)",
        },
      ],
    });
  }, [scatterData]);

  return (
    <Box
      p={3}
      paddingBottom={height === "100%" ? 3 : 8}
      height='100%'
      borderWidth='1px'
      borderRadius='lg'
      w={width}
      h={height}
      onClick={onOpen}
    >
      <Heading size='sm'>{title}</Heading>
      <Scatter data={data} options={options} />
      <Modal size='xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW='90vw'>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Scatter data={data} options={modalOptions} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScatterWrapper;
