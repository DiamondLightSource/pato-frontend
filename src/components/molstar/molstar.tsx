import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import { Box, Button, Divider, Heading, HStack, Icon, Skeleton, Spacer, Tooltip, VStack } from "@chakra-ui/react";
import { Md3DRotation, MdCamera, MdFileDownload, MdYoutubeSearchedFor } from "react-icons/md";
import { client } from "utils/api/client";
import { downloadBuffer } from "utils/api/response";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

const DefaultSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataTimestamp, setDatatimestamp] = useState("1");
  const [rawData, setRawData] = useState<ArrayBuffer | null | undefined>();

  const downloadMrc = useCallback(() => {
    downloadBuffer(rawData!, "text/plain; charset=utf-8");
  }, [rawData]);

  useEffect(() => {
    client.safe_get(`autoProc/${autoProcId}/classification/${classId}/image`).then(async (response) => {
      if (response.status === 200) {
        setRawData(response.data);
        setDatatimestamp(new Date().getTime().toString());
      } else {
        setRawData(null);
      }
    });
  }, [autoProcId, classId]);

  useEffect(() => {
    async function init() {
      molstar = new PluginContext(DefaultSpec);

      await molstar.init();

      if (!molstar.initViewer(canvasRef.current as HTMLCanvasElement, viewerDiv.current as HTMLDivElement)) {
        return;
      }

      const data = await molstar.builders.data.rawData({ data: rawData! }, { state: { isGhost: true } });
      const parsed = await molstar.dataFormats.get("ccp4")!.parse(molstar, data);
      const volume: StateObjectSelector<PluginStateObject.Volume.Data> = parsed.volumes?.[0] ?? parsed.volume;

      const repr = molstar
        .build()
        .to(volume)
        .apply(
          StateTransforms.Representation.VolumeRepresentation3D,
          createVolumeRepresentationParams(molstar, volume.data!)
        );

      await repr.commit();
    }

    if (rawData && canvasRef) {
      init();
    }

    return () => {
      // See https://github.com/molstar/molstar/issues/730
      molstar?.dispose();
      molstar = null;
    };
  }, [rawData, viewerDiv, canvasRef]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
        <Tooltip label='Reset Zoom'>
          <Button aria-label='Reset Zoom' isDisabled={!rawData} onClick={() => molstar!.managers.camera.reset()}>
            <Icon as={MdYoutubeSearchedFor} />
          </Button>
        </Tooltip>
        <Tooltip label='Reset Original Orientation'>
          <Button aria-label='Reset Original Orientation' isDisabled={!rawData} onClick={resetOrientation}>
            <Icon as={Md3DRotation} />
          </Button>
        </Tooltip>
        <Divider orientation='vertical' />
        <Tooltip label='Take Screenshot'>
          <Button
            aria-label='Take Screenshot'
            isDisabled={!rawData}
            onClick={() => molstar?.helpers.viewportScreenshot?.download()}
          >
            <Icon as={MdCamera} />
          </Button>
        </Tooltip>
        <Tooltip label='Download File'>
          <Button aria-label='Download File' isDisabled={!rawData} onClick={downloadMrc}>
            <Icon as={MdFileDownload} />
          </Button>
        </Tooltip>
        <Spacer />
        {children}
      </HStack>
      <Box flexGrow={5} h='90%' w='100%' ref={viewerDiv}>
        {rawData ? (
          <canvas key={dataTimestamp} data-testid='render-canvas' ref={canvasRef} />
        ) : rawData === null ? (
          <VStack w='100%' h='100%' bg='diamond.75'>
            <Heading m='auto' variant='notFound'>
              No Valid Volume File
            </Heading>
          </VStack>
        ) : (
          <Skeleton h='100%' w='100%' />
        )}
      </Box>
    </VStack>
  );
};

export default MolstarWrapper;
