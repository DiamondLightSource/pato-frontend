import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Icon,
  Link,
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
import { Md3dRotation, MdCamera, MdFileDownload, MdYoutubeSearchedFor } from "react-icons/md";
import { client, prependApiUrl } from "utils/api/client";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { debounce } from "utils/generic";
import { Volume } from "molstar/lib/mol-model/volume";
import { ColorNames } from "molstar/lib/mol-util/color/names";

const Default3DSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

let molstar: PluginContext | null = null;

const COLOURS = [
  ColorNames.blue,
  ColorNames.red,
  ColorNames.gray,
  ColorNames.orange,
  ColorNames.purple,
];

interface MolstarTomogramWrapperProps {
  /* Additional custom controls */
  children?: ReactNode;
  tomogramId: number;
}

// This is tested inside the Molstar internals, and there is no benefit to a complex mock for this
/* c8 ignore start */
const resetOrientation = (isSlice = false) => {
  // Resets to original orientation (depends on view type)

  molstar!.canvas3d!.requestCameraReset({
    snapshot: (scene, camera) =>
      camera.getInvariantFocus(
        scene.boundingSphereVisible.center,
        scene.boundingSphereVisible.radius,
        isSlice ? Vec3.unitZ : Vec3.unitY,
        isSlice ? Vec3.negUnitY : Vec3.negUnitZ,
      ),
  });
};
/* c8 ignore end */

const MolstarTomogramWrapper = ({ children, tomogramId }: MolstarTomogramWrapperProps) => {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState<boolean | undefined>(false);
  const [isoSurfaceValue, setIsoSurfaceValue] = useState(1);

  useEffect(() => {
    const init = async () => {
      setIsRendered(true);
      molstar = new PluginContext(Default3DSpec);

      await molstar.init();
      await molstar.mountAsync(viewerDiv.current!);

      ["ribosome", "microtubule", "membrane", "tric"].map(async (feature, i) => {
        const mrcFile = await client.safeGet(`/tomograms/${tomogramId}/feature?feature=${feature}`);

        if (mrcFile.status !== 200 || !molstar) {
          return;
        }

        const rawData = mrcFile.data;
        const data = await molstar.builders.data.rawData({ data: rawData! }, { state: { isGhost: true } });
        const parsed = await molstar.dataFormats.get("ccp4")!.parse(molstar, data);
        const volume: StateObjectSelector<PluginStateObject.Volume.Data> = parsed.volumes?.[0] ?? parsed.volume;

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
                relativeValue: isoSurfaceValue,
              },
              tryUseGpu: true,
              sizeFactor: 1,
              visuals: ["solid"],
            },
              color: "uniform",
              colorParams: {value: COLOURS[i]}
            }),
          );
        await newRepr.commit();
      });
    };

    setIsRendered(undefined);

    init();

    return () => {
      molstar?.dispose();
      molstar = null;
    };
  }, [viewerDiv, tomogramId, isoSurfaceValue]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
        <Tooltip label='Reset Zoom'>
          <Button aria-label='Reset Zoom' isDisabled={!isRendered} onClick={() => molstar!.managers.camera.reset()}>
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
        <Tooltip label='Reset Original Orientation'>
          <Button aria-label='Reset Original Orientation' isDisabled={!isRendered} onClick={() => resetOrientation()}>
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
        <Tooltip label='Download File'>
          <Link href={prependApiUrl("")} target='_blank'>
            <Button aria-label='Download File' isDisabled={!isRendered}>
              <Icon as={MdFileDownload} />
            </Button>
          </Link>
        </Tooltip>
        <Spacer />
        {children}
      </HStack>
      <HStack h='90%' w='100%'>
        <Box bg='diamond.75' position='relative' display='flex' flexGrow={5} h='100%' ref={viewerDiv}>
          {isRendered ? null : isRendered === undefined ? (
            <Skeleton h='100%' w='100%' />
          ) : (
            <Heading display='flex' justifyContent='center' alignSelf='center' w='100%' variant='notFound'>
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
            max={10}
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
