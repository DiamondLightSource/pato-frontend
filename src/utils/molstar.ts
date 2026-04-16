import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

export const Default3DSpec: PluginSpec = {
  ...DefaultPluginSpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

export const DefaultSliceSpec: PluginSpec = {
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

// This is tested inside the Molstar internals, and there is no benefit to a complex mock for this
/* c8 ignore start */
export const resetCameraOrientation = (molstar: PluginContext,isSlice = false) => {
  // Resets to original orientation (depends on view type)

  molstar.canvas3d!.requestCameraReset({
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