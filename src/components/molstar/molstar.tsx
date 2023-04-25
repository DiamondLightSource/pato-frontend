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
  VStack,
} from "@chakra-ui/react";
import { Md3DRotation, MdCamera, MdFileDownload, MdYoutubeSearchedFor } from "react-icons/md";
import { client, prependApiUrl } from "utils/api/client";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

const Default3DSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

const DefaultSliceSpec: PluginSpec = {
  ...Default3DSpec,
  canvas3d: {
    trackball: {
      rotateSpeed: 0,
      autoAdjustMinMaxDistance: {
        name: "on",
        params: { minDistanceFactor: 0.1, maxDistanceFactor: 1.8, maxDistanceMin: 190, minDistancePadding: 1 },
      },
    },
    camera: {
      helper: {
        axes: {},
      },
    },
  },
};

let molstar: PluginContext | null = null;

interface MolstarWrapperProps {
  /* Particle classification ID */
  classId: number;
  autoProcId: number;
  /* Additional custom controls */
  children?: ReactNode;
}

// This is tested inside the Molstar internals, and there is no benefit to a complex mock for this
/* c8 ignore start */
const resetOrientation = () => {
  // Resets to original orientation (XY plane, Z=0)

  molstar!.canvas3d!.requestCameraReset({
    snapshot: (scene, camera) =>
      camera.getInvariantFocus(
        scene.boundingSphereVisible.center,
        scene.boundingSphereVisible.radius,
        Vec3.unitY,
        Vec3.negUnitZ
      ),
  });
};
/* c8 ignore end */

const MolstarWrapper = ({ classId, autoProcId, children }: MolstarWrapperProps) => {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState<boolean | undefined>(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [sliceCount, setSliceCount] = useState(0);
  const [showSlice, setShowSlice] = useState(false);
  const [rawData, setRawData] = useState();

  const mrcUrl = useMemo(() => `autoProc/${autoProcId}/classification/${classId}/image`, [autoProcId, classId]);

  useEffect(() => {
    client.safeGet(mrcUrl).then((response) => {
      setRawData(response.status === 200 ? response.data : null);
    });
  }, [mrcUrl]);

  useEffect(() => {
    const init = async (rawData: ArrayBuffer) => {
      setIsRendered(true);
      molstar = new PluginContext(showSlice ? DefaultSliceSpec : Default3DSpec);

      await molstar.init();
      molstar.mount(viewerDiv.current!);

      const data = await molstar.builders.data.rawData({ data: rawData! }, { state: { isGhost: true } });
      const parsed = await molstar.dataFormats.get("ccp4")!.parse(molstar, data);
      const volume: StateObjectSelector<PluginStateObject.Volume.Data> = parsed.volumes?.[0] ?? parsed.volume;

      setSliceCount(volume.data!.grid.cells.space.dimensions[1]);

      const newRepr = molstar
        .build()
        .to(volume)
        .apply(
          StateTransforms.Representation.VolumeRepresentation3D,
          createVolumeRepresentationParams(
            molstar,
            volume.data!,
            showSlice
              ? {
                  type: "slice",
                  typeParams: { dimension: { name: "y", params: sliceIndex } },
                }
              : undefined
          )
        );

      await newRepr.commit();

      molstar!.canvas3d!.requestCameraReset({
        snapshot: (scene, camera) =>
          camera.getInvariantFocus(
            scene.boundingSphereVisible.center, //scene.boundingSphereVisible.center,
            scene.boundingSphereVisible.radius,
            Vec3.unitZ,
            Vec3.negUnitY
          ),
      });
    };

    setIsRendered(undefined);

    if (rawData) {
      init(rawData);
    }

    return () => {
      // See https://github.com/molstar/molstar/issues/730
      molstar?.dispose();
      molstar = null;
    };
  }, [viewerDiv, sliceIndex, rawData, showSlice]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
        <ButtonGroup isAttached>
          <Button isDisabled={!showSlice} onClick={() => setShowSlice(false)}>
            3D
          </Button>
          <Button isDisabled={showSlice} onClick={() => setShowSlice(true)}>
            Slice
          </Button>
        </ButtonGroup>
        <Tooltip label='Reset Zoom'>
          <Button aria-label='Reset Zoom' isDisabled={!isRendered} onClick={() => molstar!.managers.camera.reset()}>
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
        <Tooltip label='Reset Original Orientation'>
          <Button aria-label='Reset Original Orientation' isDisabled={!isRendered} onClick={resetOrientation}>
            <Icon as={Md3DRotation} />
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
          <Link href={prependApiUrl(mrcUrl)} target='_blank'>
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
        <Slider
          isDisabled={sliceCount < 1 || !showSlice}
          orientation='vertical'
          aria-label='slider-ex-2'
          onChangeEnd={setSliceIndex}
          colorScheme='pink'
          defaultValue={0}
          max={sliceCount}
        >
          <SliderTrack bg='diamond.200'>
            <SliderFilledTrack bg='diamond.600' />
          </SliderTrack>
          <SliderThumb borderColor='diamond.300' />
        </Slider>
      </HStack>
    </VStack>
  );
};

export default MolstarWrapper;
