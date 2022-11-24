import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Spacer,
  HStack,
  Divider,
  Grid,
  Button,
  Heading,
  Skeleton,
} from "@chakra-ui/react";
import Image from "./image";
import InfoGroup, { Info } from "./infogroup";
import Scatter from "./scatter";
import Motion from "./motion/motion";
import { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { client } from "../utils/api/client";
import { ScatterDataPoint } from "chart.js";
import { driftPlotOptions } from "../utils/plot";
import { CtfData } from "../utils/interfaces";

interface TomogramProp {
  tomogram: Record<string, any>;
  title: string | null;
}

const astigmatismPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "nm" } } },
};

const defocusPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "μm" } } },
};

const resolutionPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "Å" } } },
};

const Tomogram: FunctionComponent<TomogramProp> = ({ tomogram, title }): JSX.Element => {
  const [sliceImage, setSliceImage] = useState("");
  const [shiftData, setShiftData] = useState<ScatterDataPoint[]>([]);
  const [ctfData, setCtfData] = useState<CtfData>();
  const [tomogramInfo, setTomogramInfo] = useState<Info[]>(tomogram.info);

  const handleMotionChange = useCallback((data: Record<string, any>) => {
    if (data.refinedTiltAxis) {
      setTomogramInfo((oldInfo) =>
        oldInfo.map((t) => {
          return { label: t.label, value: t.label === "Refined Tilt Axis" ? data.refinedTiltAxis : t.value };
        })
      );
    }
  }, []);

  const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string>>) => {
    client.safe_get(endpoint).then((response) => {
      if (response.status === 200) {
        setState(URL.createObjectURL(response.data));
      }
    });
  };

  useEffect(() => {
    setImage(`image/slice/${tomogram.tomogramId}`, setSliceImage);

    const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
    client.safe_get(`ctf/${tomogram.tomogramId}`).then((response) => {
      if (Array.isArray(response.data.items)) {
        for (const ctf of response.data.items) {
          ctfData.resolution.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedResolution });
          ctfData.astigmatism.push({ x: ctf.refinedTiltAngle, y: ctf.astigmatism });
          ctfData.defocus.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedDefocus });
        }
        setCtfData(ctfData);
      }
    });

    client.safe_get(`shiftPlot/${tomogram.tomogramId}`).then((response) => {
      if (response.status === 200) {
        setShiftData(response.data.items);
      }
    });
  }, [tomogram]);

  return (
    <AccordionItem>
      <HStack py={1.5} px={3} bg='diamond.100'>
        <h2>{title ?? "No Title Provided"}</h2>
        <Spacer />
        <Button>
          <MdSettings />
        </Button>
        <AccordionButton flex='0 1'>
          <AccordionIcon />
        </AccordionButton>
      </HStack>
      <AccordionPanel p={4}>
        <Motion onMotionChanged={handleMotionChange} parentId={tomogram.tomogramId} />
        <Heading marginTop={6} variant='collection'>
          Alignment
        </Heading>
        <Divider />
        <Grid py={2} templateColumns='repeat(3, 1fr)' h='33vh' gap={2}>
          <InfoGroup info={tomogramInfo} />
          <Image title='Central Slice' src={sliceImage} height='100%' />
          <Scatter title='Shift Plot' scatterData={shiftData} height='32vh' />
        </Grid>
        <Heading variant='collection'>Summary</Heading>
        <Divider />
        {ctfData === undefined ? (
          <Skeleton h='20vh' />
        ) : (
          <Grid py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
            <Scatter
              height='20vh'
              title='Astigmatism'
              scatterData={ctfData.astigmatism}
              options={astigmatismPlotOptions}
            />
            <Scatter height='20vh' title='Defocus' scatterData={ctfData.defocus} options={defocusPlotOptions} />
            <Scatter
              height='20vh'
              title='Resolution'
              scatterData={ctfData.resolution}
              options={resolutionPlotOptions}
            />
          </Grid>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default Tomogram;
