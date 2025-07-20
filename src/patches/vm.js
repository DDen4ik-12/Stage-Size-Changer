import { getStageWrapperState } from "../instances.js";
import { overrideFunction, defined } from "../utils/utils.js";

export default (
  vm,
  mousePosLabel,
  monitorsDivUpdate,
  updatePlayerSize,
  setInstances,
) => {
  // Add new stage size props and methods and override existing stage size props
  vm.runtime.stageWidth = 480;
  vm.runtime.stageHeight = 360;
  vm.runtime.setStageSize = (width, height) => {
    width = Math.round(Math.max(1, width));
    height = Math.round(Math.max(1, height));
    if (vm.runtime.stageWidth !== width || vm.runtime.stageHeight !== height) {
      mousePosLabel.style.width = `${0.625 * 0.55 * (width.toString().length + height.toString().length + 4)}rem`;

      const deltaX = width - vm.runtime.stageWidth,
        deltaY = height - vm.runtime.stageHeight;

      if (vm.runtime._monitorState.size > 0) {
        const offsetX = deltaX / 2,
          offsetY = deltaY / 2;
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
      vm.renderer.resize(width, height);
      vm.runtime.emit("STAGE_SIZE_CHANGED", width, height);
      vm.emit("STAGE_SIZE_CHANGED", width, height);
      window.dispatchEvent(new Event("resize"));

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

  // Override renderer resize
  vm.renderer.resize = overrideFunction(
    vm.renderer.resize,
    (ogMethod, ...args) => {
      ((x) => {
        setInstances(x, x.props.stageSize);
        updatePlayerSize(
          vm.runtime.stageWidth,
          vm.runtime.stageHeight,
          x.props.stageSize,
        );
      })(getStageWrapperState());
      ogMethod(...args);
      window.dispatchEvent(new Event("resize"));
    },
  );

  // Override project save and load for handle monitors positions
  vm.toJSON = overrideFunction(vm.toJSON, (ogMethod, ...args) => {
    const result = JSON.parse(ogMethod(...args));
    result.monitors.forEach((x) => {
      x.x += (480 - vm.runtime.stageWidth) / 2;
      x.y += (360 - vm.runtime.stageHeight) / 2;
    });
    return JSON.stringify(result);
  });
  vm.deserializeProject = overrideFunction(
    vm.deserializeProject,
    async (ogMethod, json, zip) => {
      const result = await ogMethod(json, zip);
      for (const monitor of vm.runtime._monitorState.valueSeq()) {
        vm.runtime.requestUpdateMonitor(
          new Map([
            ["id", monitor.get("id")],
            ["x", monitor.get("x") + (vm.runtime.stageWidth - 480) / 2],
            ["y", monitor.get("y") + (vm.runtime.stageHeight - 360) / 2],
          ]),
        );
      }
      vm.runtime.emit("MONITORS_UPDATE", vm.runtime._monitorState);
      const stageComments = json.targets.find((x) => x.isStage).comments;
      if (defined(stageComments)) {
        const twConfigComment = Object.values(stageComments).find((x) => x.text.includes("// _twconfig_"));
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
  vm.runtime.ioDevices.mouse._userscriptStageSizeChanger = { x: 0, y: 0 };
  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchX", {
    set: function (set) {
      this._userscriptStageSizeChanger.x = Math.round(
        set * (vm.runtime.stageWidth / 480),
      );
      mousePosLabel.textContent = `${this._userscriptStageSizeChanger.x}, ${this._userscriptStageSizeChanger.y}`;
    },
    get: function () {
      return this._userscriptStageSizeChanger.x;
    },
  });
  Object.defineProperty(vm.runtime.ioDevices.mouse, "_scratchY", {
    set: function (set) {
      this._userscriptStageSizeChanger.y = Math.round(
        set * (vm.runtime.stageHeight / 360),
      );
      mousePosLabel.textContent = `${this._userscriptStageSizeChanger.x}, ${this._userscriptStageSizeChanger.y}`;
    },
    get: function () {
      return this._userscriptStageSizeChanger.y;
    },
  });
};