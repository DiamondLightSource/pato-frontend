
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { ReactNode, useEffect, useRef, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Tooltip,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Md3dRotation, MdCamera, MdYoutubeSearchedFor } from "react-icons/md";
import { client } from "utils/api/client";
import { Volume } from "molstar/lib/mol-model/volume";
import { ColorNames } from "molstar/lib/mol-util/color/names";
import { TomogramFeature } from "schema/interfaces";
import { Color } from "molstar/lib/mol-util/color";
import { Default3DSpec, resetCameraOrientation } from "utils/molstar";

let molstar: PluginContext | null = null;

const COLOURS: Record<TomogramFeature, Color> = {
  microtubule: ColorNames.blue,
  ribosome: ColorNames.red,
  membrane: ColorNames.gray,
  tric: ColorNames.orange,
};

interface MolstarTomogramWrapperProps {
  /* Additional custom controls */
  children?: ReactNode;
  tomogramId: number;
}

interface VolumeData {
  volume: Volume;
  repr: StateObjectSelector<PluginStateObject.Volume.Representation3D>;
  feature: TomogramFeature;
}

/* c8 ignore start */
const resetOrientation = (isSlice = false) => resetCameraOrientation(molstar!, isSlice);
/* c8 ignore end */

const MolstarTomogramWrapper = ({ children, tomogramId }: MolstarTomogramWrapperProps) => {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState<boolean | undefined>(false);
  const [isoSurfaceValue, setIsoSurfaceValue] = useState(1);
  const [data, setData] = useState<VolumeData[]>([]);

  useEffect(() => {
    for (const volData of data) {
      if (molstar) {
        molstar
          ?.build()
          .to(volData.repr)
          .update(
            createVolumeRepresentationParams(molstar, volData.volume, {
              type: "isosurface",
              typeParams: { isoValue: { kind: "relative", relativeValue: isoSurfaceValue } },
              color: "uniform",
              colorParams: { value: COLOURS[volData.feature] },
            })
          )
          .commit();
      }
    }
  }, [isoSurfaceValue, data]);

  useEffect(() => {
    const init = async () => {
      setIsRendered(true);
      molstar = new PluginContext(Default3DSpec);

      await molstar.init();
      await molstar.mountAsync(viewerDiv.current!);

      const newData: VolumeData[] = [];

      const featureResp = await client.safeGet(`tomograms/${tomogramId}/features`);

      if (featureResp.status !== 200 || featureResp.data.features.length < 1) {
        setIsRendered(false);
        return;
      }

      const features: TomogramFeature[] = featureResp.data.features;

      features.map(async (feature, i) => {
        const mrcFile = await client.safeGet(`tomograms/${tomogramId}/features/${feature}`);

        if (mrcFile.status !== 200 || !molstar) {
          setIsRendered(false);
          return;
        }

        const rawData = mrcFile.data;
        const data = await molstar.builders.data.rawData(
          { data: rawData! },
          { state: { isGhost: false } }
        );
        const parsed = await molstar.dataFormats.get("ccp4")!.parse(molstar, data);
        const volume: StateObjectSelector<PluginStateObject.Volume.Data> =
          parsed.volumes?.[0] ?? parsed.volume;

        // Generate initial representation before rerendering with default isosurface value
        const newRepr = molstar
          .build()
          .to(volume)
          .apply(
            StateTransforms.Representation.VolumeRepresentation3D,
            createVolumeRepresentationParams(molstar, volume.data!, {
              type: "isosurface",
              typeParams: {
                isoValue: {
                  kind: "relative",
                  relativeValue: 1,
                },
                tryUseGpu: true,
                sizeFactor: 1,
                visuals: ["solid"],
              },
              color: "uniform",
              colorParams: { value: COLOURS[feature] },
            })
          );

        await newRepr.commit();
        newData.push({ volume: volume!.data!, repr: newRepr.selector, feature });
      });
      setData(newData);
    };

    setIsRendered(undefined);

    init();

    return () => {
      molstar?.dispose();
      molstar = null;
    };
  }, [viewerDiv, tomogramId]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
        <Tooltip label='Reset Zoom'>
          <Button
            aria-label='Reset Zoom'
            isDisabled={!isRendered}
            onClick={() => molstar!.managers.camera.reset()}
          >
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
        <Tooltip label='Reset Original Orientation'>
          <Button
            aria-label='Reset Original Orientation'
            isDisabled={!isRendered}
            onClick={() => resetOrientation()}
          >
            <Icon as={Md3dRotation} />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' />
        <Tooltip label='Take Screenshot'>
          <Button
            aria-label='Take Screenshot'
            isDisabled={!isRendered}
            onClick={() => molstar?.helpers.viewportScreenshot?.download()}
          >
            <Icon as={MdCamera} />
          </Button>
        </Tooltip>
        <Spacer />
        {children}
      </HStack>
      <HStack h='90%' w='100%'>
        <Box
          bg='diamond.75'
          position='relative'
          display='flex'
          flexGrow={5}
          h='100%'
          ref={viewerDiv}
        >
          {isRendered ? null : isRendered === undefined ? (
            <Skeleton h='100%' w='100%' />
          ) : (
            <Heading
              display='flex'
              justifyContent='center'
              alignSelf='center'
              w='100%'
              variant='notFound'
            >
              No Valid Volume File
            </Heading>
          )}
        </Box>
        <>
          <Text style={{ writingMode: "sideways-lr" }} color='diamond.300' fontWeight='600'>
            Isosurface Value
          </Text>
          <Slider
            orientation='vertical'
            aria-label='Isosurface Slider'
            onChange={(v) => setIsoSurfaceValue(v)}
            value={isoSurfaceValue}
            step={0.001}
            max={3}
            min={0}
          >
            <SliderTrack bg='diamond.200'>
              <SliderFilledTrack bg='diamond.600' />
            </SliderTrack>
            <SliderThumb borderColor='diamond.300' />
          </Slider>
        </>
      </HStack>
      <Spacer />
    </VStack>
  );
};

export default MolstarTomogramWrapper;
