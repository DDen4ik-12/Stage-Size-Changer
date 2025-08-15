import { overrideFunction, defined } from "../utils/utils.js";

export default (
  reduxStore,
  vm,
  mousePosLabel,
  monitorsDivUpdate,
  updatePlayerSize,
) => {
  // Add new stage size props and methods and override existing stage size props
  vm.runtime.stageWidth = 480;
  vm.runtime.stageHeight = 360;
  vm.runtime.setStageSize = (width, height) => {
    width = Math.round(Math.max(1, width));
    height = Math.round(Math.max(1, height));
    if (vm.runtime.stageWidth !== width || vm.runtime.stageHeight !== height) {
      mousePosLabel.style.width = `${0.625 * 0.55 * (width.toString().length + height.toString().length + 4)}rem`;

      if (vm.runtime._monitorState.size > 0) {
        const offsetX = (width - vm.runtime.stageWidth) / 2,
          offsetY = (height - vm.runtime.stageHeight) / 2;
        for (const monitor of vm.runtime._monitorState.valueSeq()) {
          reduxStore.dispatch({
            type: "scratch-gui/monitors/MOVE_MONITOR_RECT",
            monitorId: monitor.get("id"),
            newX: monitor.get("x") + offsetX,
            newY: monitor.get("y") + offsetY,
          });
          vm.runtime.requestUpdateMonitor(
            new Map([
              ["id", monitor.get("id")],
              ["x", monitor.get("x") + offsetX],
              ["y", monitor.get("y") + offsetY],
            ]),
          );
        }
        vm.runtime.emit("MONITORS_UPDATE", vm.runtime._monitorState);
        monitorsDivUpdate();
      }

      const penIndexInDrawList = vm.renderer._layerGroups.pen.drawListOffset,
        penDrawableId = vm.renderer._drawList[penIndexInDrawList],
        penSkinId = vm.renderer._allDrawables[penDrawableId]?._skin?._id;

      vm.runtime.stageWidth = width;
      vm.runtime.stageHeight = height;
      vm.runtime.renderer.setStageSize(
        -width / 2,
        width / 2,
        -height / 2,
        height / 2,
      );
      updatePlayerSize(
        width,
        height,
        reduxStore.getState().scratchGui.stageSize.stageSize,
      );
      vm.renderer.resize(width, height);
      window.dispatchEvent(new Event("resize"));
      vm.runtime.emit("STAGE_SIZE_CHANGED", width, height);
      vm.emit("STAGE_SIZE_CHANGED", width, height);

      if (
        defined(vm.renderer._allSkins[penSkinId]?.constructor) &&
        defined(new vm.renderer._allSkins[penSkinId].constructor(0, vm.renderer)
          .drawPoint)
      ) {
        const newPenSkin = new vm.renderer._allSkins[penSkinId].constructor(
          penSkinId,
          vm.renderer,
        );
        vm.renderer._allSkins[penSkinId] = newPenSkin;
        vm.renderer._allDrawables[penDrawableId]._skin =
          vm.renderer._allSkins[penSkinId];
        vm.renderer._allDrawables[penDrawableId].updateScale([101, 100]);
        vm.renderer._allDrawables[penDrawableId].updateScale([100, 100]);
      }
    }
  };
  vm.setStageSize = vm.runtime.setStageSize;
  Object.defineProperty(vm.runtime.constructor, "STAGE_WIDTH", {
    set: () => {},
    get: () => {
      return vm.runtime.stageWidth;
    },
  });
  Object.defineProperty(vm.runtime.constructor, "STAGE_HEIGHT", {
    set: () => {},
    get: () => {
      return vm.runtime.stageHeight;
    },
  });

  // Override project save and load for handle monitors positions
  vm.toJSON = overrideFunction(vm.toJSON, (ogMethod, ...args) => {
    const result = JSON.parse(ogMethod(...args));
    result.monitors.forEach((monitor) => {
      monitor.x += (480 - vm.runtime.stageWidth) / 2;
      monitor.y += (360 - vm.runtime.stageHeight) / 2;
    });
    return JSON.stringify(result);
  });
  vm.deserializeProject = overrideFunction(
    vm.deserializeProject,
    async (ogMethod, json, zip) => {
      const result = await ogMethod(json, zip);

      const offsetX = (vm.runtime.stageWidth - 480) / 2,
        offsetY = (vm.runtime.stageHeight - 360) / 2;
      for (const monitor of vm.runtime._monitorState.valueSeq()) {
        vm.runtime.requestUpdateMonitor(
          new Map([
            ["id", monitor.get("id")],
            ["x", monitor.get("x") + offsetX],
            ["y", monitor.get("y") + offsetY],
          ]),
        );
      }
      vm.runtime.emit("MONITORS_UPDATE", vm.runtime._monitorState);

      const stageComments = json.targets.find((target) => target.isStage).comments;
      if (defined(stageComments)) {
        const twConfigComment = Object.values(stageComments).find((comment) => comment.text.includes("// _twconfig_"));
        if (defined(twConfigComment)) {
          let twConfig;
          try {
            twConfig = JSON.parse(twConfigComment.text.match(/\{.*\}(?=( \/\/ _twconfig_$))/g)[0]);
          } catch {}
          if (defined(twConfig?.width) || defined(twConfig?.height)) {
            vm.runtime.setStageSize(
              twConfig?.width ? parseInt(twConfig.width) : vm.runtime.stageWidth,
              twConfig?.height ? parseInt(twConfig.height) : vm.runtime.stageHeight,
            );
          }
        }
      }
      return result;
    },
  );

  // Override mouse position
  vm.runtime.ioDevices.mouse._usStageSc = { x: 0, y: 0 };
  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchX", {
    set: function (set) {
      this._usStageSc.x = Math.round(
        set * (vm.runtime.stageWidth / 480),
      );
      mousePosLabel.textContent = `${this._usStageSc.x}, ${this._usStageSc.y}`;
    },
    get: function () {
      return this._usStageSc.x;
    },
  });
  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchY", {
    set: function (set) {
      this._usStageSc.y = Math.round(
        set * (vm.runtime.stageHeight / 360),
      );
      mousePosLabel.textContent = `${this._usStageSc.x}, ${this._usStageSc.y}`;
    },
    get: function () {
      return this._usStageSc.y;
    },
  });
};