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

const Default3DSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

const DefaultSliceSpec: PluginSpec = {
  ...Default3DSpec,
  canvas3d: {
    trackball: {
      rotateSpeed: 0,
    },
    cameraResetDurationMs: 0,
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
const resetOrientation = (isSlice = false) => {
  // Resets to original orientation (depends on view type)

  molstar!.canvas3d!.requestCameraReset({
    snapshot: (scene, camera) =>
      camera.getInvariantFocus(
        scene.boundingSphereVisible.center,
        scene.boundingSphereVisible.radius,
        isSlice ? Vec3.unitZ : Vec3.unitY,
        isSlice ? Vec3.negUnitY : Vec3.negUnitZ
      ),
  });
};
/* c8 ignore end */

const MolstarWrapper = ({ classId, autoProcId, children }: MolstarWrapperProps) => {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState<boolean | undefined>(false);
  const [sliceIndex, setSliceIndex] = useState<number>();
  const [sliceCount, setSliceCount] = useState(0);
  const [showSlice, setShowSlice] = useState(false);
  const [isoSurfaceValue, setIsoSurfaceValue] = useState(1);

  const [volumeData, setVolumeData] = useState<Volume>();
  const [repr, setRepr] = useState<StateObjectSelector>();
  const [rawData, setRawData] = useState<ArrayBuffer | null>();

  const mrcUrl = useMemo(
    () => `autoProc/${autoProcId}/classification/${classId}/image`,
    [autoProcId, classId]
  );

  const handleSliceIndexChanged = useMemo(
    () =>
      debounce((index: number) => {
        setSliceIndex(index);
      }, 200),
    []
  );

  useEffect(() => {
    client.safeGet(mrcUrl).then((response) => {
      if (response.status !== 200) {
        setRawData(null);
        setIsRendered(false);
      } else {
        setRawData(response.data);
      }
    });
  }, [mrcUrl]);

  useEffect(() => {
    if (repr && molstar && showSlice && volumeData && sliceIndex !== undefined) {
      molstar
        .build()
        .to(repr)
        .update(
          createVolumeRepresentationParams(molstar, volumeData, {
            type: "slice",
            typeParams: { dimension: { name: "y", params: sliceIndex } },
          })
        )
        .commit();

      molstar!.managers.camera.reset();
      resetOrientation(true);
    }
  }, [sliceIndex, showSlice, repr, volumeData]);

  useEffect(() => {
    if (repr && molstar && volumeData && !showSlice) {
      molstar
        .build()
        .to(repr)
        .update(
          createVolumeRepresentationParams(molstar, volumeData, {
            type: "isosurface",
            typeParams: { isoValue: { kind: "relative", relativeValue: isoSurfaceValue } },
          })
        )
        .commit();
    }
  }, [isoSurfaceValue, repr, showSlice, sliceIndex, volumeData]);

  useEffect(() => {
    const init = async (rawData: ArrayBuffer) => {
      setIsRendered(true);
      molstar = new PluginContext(showSlice ? DefaultSliceSpec : Default3DSpec);

      await molstar.init();
      molstar.mount(viewerDiv.current!);

      const data = await molstar.builders.data.rawData(
        { data: rawData! },
        { state: { isGhost: true } }
      );
      const parsed = await molstar.dataFormats.get("ccp4")!.parse(molstar, data);
      const volume: StateObjectSelector<PluginStateObject.Volume.Data> =
        parsed.volumes?.[0] ?? parsed.volume;

      const newSliceCount = volume.data!.grid.cells.space.dimensions[1];
      const newSliceIndex = Math.abs(newSliceCount / 2);

      setSliceCount(newSliceCount);
      setSliceIndex(newSliceIndex);

      // Generate initial representation before rerendering with default isosurface value
      const newRepr = molstar
        .build()
        .to(volume)
        .apply(
          StateTransforms.Representation.VolumeRepresentation3D,
          createVolumeRepresentationParams(molstar, volume.data!, undefined)
        );

      await newRepr.commit();

      setRepr(newRepr.selector);
      setVolumeData(volume.data);
    };

    setIsRendered(undefined);

    if (rawData) {
      init(rawData);
    }

    return () => {
      setRepr(undefined);
      molstar?.dispose();
      molstar = null;
    };
  }, [viewerDiv, rawData, showSlice]);

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
            isDisabled={!isRendered || showSlice}
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
        {sliceCount && showSlice ? (
          <>
            <Text style={{ writingMode: "sideways-lr" }} color='diamond.300' fontWeight='600'>
              Current Slice
            </Text>
            <Slider
              orientation='vertical'
              aria-label='Slice Slider'
              onChange={handleSliceIndexChanged}
              defaultValue={sliceCount / 2}
              max={sliceCount}
            >
              <SliderTrack bg='diamond.200'>
                <SliderFilledTrack bg='diamond.600' />
              </SliderTrack>
              <SliderThumb borderColor='diamond.300' />
            </Slider>
          </>
        ) : (
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
        )}
      </HStack>
      <Spacer />
      <HStack w='100%'>
        <ButtonGroup isAttached>
          <Button isDisabled={!showSlice} onClick={() => setShowSlice(false)}>
            3D
          </Button>
          <Button isDisabled={showSlice} onClick={() => setShowSlice(true)}>
            Slice
          </Button>
        </ButtonGroup>
        <Spacer />
        <Text>
          <b>Slices:</b> {sliceCount}
        </Text>
      </HStack>
    </VStack>
  );
};

export default MolstarWrapper;
