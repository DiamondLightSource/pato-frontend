import { Box, Heading } from "@chakra-ui/react";
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

  const options = {
    maintainAspectRatio: !(width !== "100%" || height !== "100%"),
    plugins: { legend: { display: false } },
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
    >
      <Heading size='sm'>{title}</Heading>
      <Scatter data={data} options={options} />
    </Box>
  );
};

export default ScatterWrapper;
