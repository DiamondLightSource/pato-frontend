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
  ResponsiveValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ScatterControllerChartOptions,
  ScatterDataPoint,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

import { useEffect, useState } from "react";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterProps {
  /** Title for the scatter plot */
  title: string;
  /** Datapoints */
  scatterData: ScatterDataPoint[];
  /** Chart options */
  options?: ScatterControllerChartOptions;
  /** Chart width */
  width?: ResponsiveValue<string | number | "auto">;
  /** Chart height */
  height?: ResponsiveValue<string | number | "auto">;
}

const preloadedData = {
  datasets: [
    {
      data: [{ x: 1, y: 1 }],
      backgroundColor: "rgba(255, 99, 132, 1)",
    },
  ],
};

const defaultOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  spanGaps: true,
  showLine: false,
};

const ScatterWrapper = ({
  title,
  scatterData,
  options = defaultOptions,
  width = "100%",
  height = "100%",
}: ScatterProps) => {
  const [data, setData] = useState(preloadedData);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      borderWidth='1px'
      borderRadius='lg'
      w={width}
      h={height}
      onClick={onOpen}
    >
      <Heading size='sm'>{title}</Heading>
      <Scatter style={{ paddingBottom: "10px" }} data={data} options={options} />
      <Modal size='xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW='90vw'>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Scatter data={data} options={{ ...options, maintainAspectRatio: true }} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScatterWrapper;
