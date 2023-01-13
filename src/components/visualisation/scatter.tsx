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
import { BaseCardProp } from "../../utils/interfaces";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterProps extends BaseCardProp {
  /** Datapoints */
  scatterData: ScatterDataPoint[];
  /** Chart options */
  options?: ScatterControllerChartOptions;
  /** Chart width */
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

const ScatterPlot = ({
  title,
  scatterData,
  options = defaultOptions,
  width = "100%",
  height = "100%",
  active = false,
  onClick,
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
    <Card aria-selected={active} w={width} h={height} onClick={onOpen}>
      <CardHeader>
        <Heading size='sm'>{title}</Heading>
      </CardHeader>
      <CardBody px={2} py='0'>
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
      </CardBody>
    </Card>
  );
};

export { ScatterPlot };
