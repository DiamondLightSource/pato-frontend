import {
  Spacer,
  HStack,
  Divider,
  Grid,
  Button,
  Heading,
  Circle,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Code,
} from "@chakra-ui/react";
import Image from "../image";
import InfoGroup from "../infogroup";
import Scatter from "../scatter";
import MotionPagination from "./pagination";
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../../features/uiSlice";
import { client } from "../../utils/api/client";
import { parseData } from "../../utils/generic";
import { driftPlotOptions } from "../../utils/plot";

interface MotionProp {
  parentId: number;
  onMotionChanged?: (motion: Record<string, any>) => void;
}

const motionConfig = {
  include: [
    { name: "refinedTiltAngle" },
    { name: "createdTimeStamp", label: "movieTimeStamp" },
    { name: "firstFrame" },
    { name: "lastFrame" },
    { name: "refinedMagnification" },
    { name: "dosePerFrame", unit: "e⁻/Å²" },
    { name: "doseWeight" },
    { name: "totalMotion", unit: "Å" },
    { name: "averageMotionPerFrame", label: "Average Motion/Frame", unit: "Å" },
    { name: "imageNumber" },
    { name: ["patchesUsedX", "patchesUsedY"], label: "patchesUsed" },
    { name: ["boxSizeX", "boxSizeY"], label: "boxSize", unit: "μm" },
    { name: ["minResolution", "maxResolution"], label: "Resolution", unit: "Å" },
    { name: ["minDefocus", "maxDefocus"], label: "Defocus", unit: "Å" },
    { name: "amplitudeContrast" },
    { name: "defocusStepSize", unit: "Å" },
    { name: "astigmatism", unit: "nm" },
    { name: "astigmatismAngle", unit: "°" },
    { name: "estimatedResolution", unit: "Å" },
    { name: "estimatedDefocus", unit: "μm" },
    { name: "ccValue", label: "CC Value" },
  ],
  root: ["tomogramId", "movieId", "total", "rawTotal", "comments_MotionCorrection", "comments_CTF", "refinedTiltAxis"],
};

const calcDarkImages = (total: number, rawTotal: number) => {
  if (isNaN(rawTotal - total)) {
    return "?";
  }

  if (total === 0 && rawTotal > 0) {
    return "No tilt alignment data available";
  }

  return `Dark Images: ${rawTotal - total}`;
};

const Tomogram: FunctionComponent<MotionProp> = ({ parentId, onMotionChanged }): JSX.Element => {
  const [page, setPage] = useState(-1);
  const [motion, setMotion] = useState<Record<string, any>>({ drift: [], total: 0, info: [] });
  const [mgImage, setMgImage] = useState("");
  const [fftImage, setFftImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string>>) => {
    client.safe_get(endpoint).then((response) => {
      if (response.status === 200) {
        setState(URL.createObjectURL(response.data));
      }
    });
  };

  useEffect(() => {
    dispatch(setLoading(true));

    client.safe_get(`motion/${parentId}${page === -1 ? " " : `?nth=${page}`}`).then((response) => {
      setMotion(parseData(response.data, motionConfig));
      if (response.data.movieId !== undefined) {
        setImage(`image/micrograph/${response.data.movieId}`, setMgImage);
        setImage(`image/fft/${response.data.movieId}`, setFftImage);
      }

      if (onMotionChanged !== undefined) {
        onMotionChanged(response.data);
      }
    });

    dispatch(setLoading(false));
  }, [page, parentId, dispatch, navigate, onMotionChanged]);

  return (
    <div>
      <HStack marginTop={2}>
        <Heading variant='collection'>Motion Correction/CTF</Heading>
        <Heading size='sm' color='diamond.300'>
          {calcDarkImages(motion.total, motion.rawTotal)}
        </Heading>
        <Spacer />
        <Button
          data-testid='comment'
          disabled={!(motion.comments_CTF || motion.comments_MotionCorrection)}
          size='xs'
          onClick={onOpen}
        >
          <MdComment />
          {(motion.comments_CTF || motion.comments_MotionCorrection) && (
            <Circle size='3' position='absolute' top='-1' left='-1' bg='red'></Circle>
          )}
        </Button>
        <MotionPagination total={motion.total || motion.rawTotal} onChange={(page) => setPage(page)} />
      </HStack>
      <Divider />
      <Grid py={2} templateColumns='repeat(4, 1fr)' h='25vh' gap={2}>
        <InfoGroup info={motion.info} />
        <Image src={mgImage} title='Micrograph Snapshot' height='100%' />
        <Image src={fftImage} title='FFT Theoretical' height='100%' />
        <Scatter title='Drift' options={driftPlotOptions} scatterData={motion.drift} height='25vh' />
      </Grid>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Comments</DrawerHeader>
          <DrawerBody>
            <Heading size='sm'>CTF</Heading>
            <Code>{motion.comments_CTF}</Code>
            <Divider marginY={3} />
            <Heading size='sm'>Motion Correction</Heading>
            <Code>{motion.comments_MotionCorrection}</Code>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Tomogram;
