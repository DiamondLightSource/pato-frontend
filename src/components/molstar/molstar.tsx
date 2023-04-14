import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { StateObjectSelector } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { createVolumeRepresentationParams } from "molstar/lib/mol-plugin-state/helpers/volume-representation-params";
import { Box, Button, Divider, Heading, HStack, Icon, Link, Skeleton, Spacer, Tooltip, VStack } from "@chakra-ui/react";
import { Md3DRotation, MdCamera, MdFileDownload, MdYoutubeSearchedFor } from "react-icons/md";
import { client, prependApiUrl } from "utils/api/client";
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
  const [isRendered, setIsRendered] = useState<boolean | undefined>(false);

  const mrcUrl = useMemo(() => `autoProc/${autoProcId}/classification/${classId}/image`, [autoProcId, classId]);

  useEffect(() => {
    const init = async (rawData: ArrayBuffer) => {
      setIsRendered(true);
      molstar = new PluginContext(DefaultSpec);

      await molstar.init();
      molstar.mount(viewerDiv.current!);

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
    };

    setIsRendered(undefined);

    client.safeGet(mrcUrl).then((response) => {
      if (response.status !== 200) {
        setIsRendered(false);
        return;
      }

      init(response.data);
    });

    return () => {
      // See https://github.com/molstar/molstar/issues/730
      molstar?.dispose();
      molstar = null;
    };
  }, [mrcUrl, viewerDiv, setIsRendered]);

  return (
    <VStack h='100%'>
      <HStack w='100%'>
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
          <Link href={prependApiUrl(mrcUrl)}>
            <Button aria-label='Download File' isDisabled={!isRendered}>
              <Icon as={MdFileDownload} />
            </Button>
          </Link>
        </Tooltip>
        <Spacer />
        {children}
      </HStack>
      <Box bg='diamond.75' position='relative' display='flex' flexGrow={5} h='90%' w='100%' ref={viewerDiv}>
        {isRendered ? null : isRendered === undefined ? (
          <Skeleton h='100%' w='100%' />
        ) : (
          <Heading display='flex' justifyContent='center' alignSelf='center' w='100%' variant='notFound'>
            No Valid Volume File
          </Heading>
        )}
      </Box>
    </VStack>
  );
};

export default MolstarWrapper;
