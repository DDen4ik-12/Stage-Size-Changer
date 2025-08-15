import siteDifferences from "./siteDifferences.js";
import applyPatches from "./patches/vm.js";
import applyPatches4AddingBlks from "./patches/blocks.js";
import { asyncQuerySelector } from "./utils/asyncQuery.js"
import { getReduxStore, getBlocksComponent } from "./instances.js";
import {
  resizePlayerStyle,
  updatePlayerSize,
  usGlobalStyle,
  mousePosLabel,
  spacer,
  openSettingsButton,
  settingsInterface,
} from "./elements.js";
import { defined } from "./utils/utils.js";

import icon from "../assets/icon.svg";

(async () => {
  // Site check
  if (!Object.hasOwn(siteDifferences, location.host)) {
    console.error(
      '%c %cThis page doesn\'t supported by userscript "Stage Size Changer"',
      `font-size: 1px; padding: 10px 10px; background: no-repeat url(${icon}); margin-right: 0.25rem;`,
      "",
    );
    return;
  }

  // Add styles
  document.head.appendChild(usGlobalStyle);
  document.head.appendChild(resizePlayerStyle);

  // Monitors div update
  const monitorsDivUpdate = () => {
    const monitorsDiv = document.querySelectorAll(
      'div[class^="monitor_monitor-container_"]',
    ),
    monitorsInfo = vm.runtime._monitorState.toArray().filter((monitor) => monitor.visible);
    monitorsDiv.forEach((monitorDiv, i) => {
      monitorDiv.style.transform = `translate(${monitorsInfo[i]?.x - monitorDiv.style.left.match(/\d+/gs)[0]}px, ${monitorsInfo[i]?.y - monitorDiv.style.top.match(/\d+/gs)[0]}px)`;
    });
  };

  // Get instances
  unsafeWindow.usStageSc = new Object();
  let reduxStore = await getReduxStore(),
    vm = reduxStore.getState().scratchGui.vm,
    blocksComponent,
    ScratchBlocks;
  if (!reduxStore.getState().scratchGui.mode.isPlayerOnly) {
    blocksComponent = await getBlocksComponent();
    ScratchBlocks = blocksComponent.ScratchBlocks;
  }
  Object.assign(unsafeWindow.usStageSc, {
    reduxStore,
    vm,
    blocksComponent,
    ScratchBlocks,
  });

  // Extract elements from functions
  const spacerExtracted = spacer(),
    mousePosLabelExtracted = mousePosLabel(),
    settingsInterfaceExtracted = settingsInterface(reduxStore),
    openSettingsButtonExtracted = openSettingsButton(vm, settingsInterfaceExtracted);

  // Add stage size changing listener for replace search parameter "StageSC_size"
  vm.runtime.on("STAGE_SIZE_CHANGED", (width, height) => {
    const params = new URLSearchParams(location.search);
    if (width == 480 && height == 360) {
      params.delete("StageSC_size");
    } else {
      params.set("StageSC_size", `${width}x${height}`);
    }
    history.replaceState("", "", `?${params.toString()}`);
  });

  // Add store state changing listener
  let currentStateValues = new Object();
  reduxStore.subscribe(async () => {
    const state = reduxStore.getState(),
      prevStateValues = currentStateValues;
    currentStateValues = {
      stageSizeMode: state.scratchGui.stageSize.stageSize,
      isFullscreen: state.scratchGui.mode.isFullScreen,
      isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    };

    if (currentStateValues.stageSizeMode != prevStateValues.stageSizeMode) {
      updatePlayerSize(
        vm.runtime.stageWidth,
        vm.runtime.stageHeight,
        currentStateValues.stageSizeMode,
      );
      vm.renderer.resize(
        vm.runtime.stageWidth,
        vm.runtime.stageHeight,
      );
      window.dispatchEvent(new Event("resize"));
    }
    if (
      currentStateValues.isFullscreen != prevStateValues.isFullscreen ||
      currentStateValues.isPlayerOnly != prevStateValues.isPlayerOnly
    ) {
      const params = new URLSearchParams(location.search);
      if (vm.runtime.stageWidth == 480 && vm.runtime.stageHeight == 360) {
        params.delete("StageSC_size");
      } else {
        params.set("StageSC_size", `${vm.runtime.stageWidth}x${vm.runtime.stageHeight}`);
      }
      history.replaceState("", "", `?${params.toString()}`);

      if (!currentStateValues.isPlayerOnly) {
        blocksComponent = await getBlocksComponent();
        ScratchBlocks = blocksComponent.ScratchBlocks;
        Object.assign(unsafeWindow.usStageSc, { blocksComponent, ScratchBlocks });
        if (!toolboxPatchesApplied) {
          toolboxPatchesApplied = true;
          applyToolboxPatches(ScratchBlocks, blocksComponent);
        }
      }

      (await asyncQuerySelector('div[class^="controls_controls-container_"]')).after(
        spacerExtracted,
      );
      (await asyncQuerySelector('img[class^="stop-all_stop-all_"]')).after(
        mousePosLabelExtracted,
      );
      await (async (advQuery) => {
        let result = await asyncQuerySelector(advQuery.map((query) => query[0]).join(", "));
        for (let advQueryI = 0; advQueryI < advQuery.length; advQueryI++) {
          if (result != document.querySelector(advQuery[advQueryI][0])) {
            continue;
          }
          for (let parentingCount = 0; parentingCount < advQuery[advQueryI][1]; parentingCount++) {
            result = result.parentElement;
          }
          result.before(openSettingsButtonExtracted);
          return;
        }
      })([
        [
          'div[class^="stage-header_stage-size-row_"] div > span[class^="button_outlined-button_"][role="button"]',
          1,
        ],
        [
          siteDifferences[location.host].inFullscreenButton.query,
          siteDifferences[location.host].inFullscreenButton.parentI,
        ],
      ]);

      updatePlayerSize(
        vm.runtime.stageWidth,
        vm.runtime.stageHeight,
        reduxStore.getState().scratchGui.stageSize.stageSize,
      );
    }
  });

  // Add window resize listener for resizing monitor scaler in fullscreen
  window.addEventListener("resize", () => {
    if (reduxStore.getState().scratchGui.mode.isFullScreen) {
      updatePlayerSize(
        vm.runtime.stageWidth,
        vm.runtime.stageHeight,
        reduxStore.getState().scratchGui.stageSize.stageSize,
      );
      vm.renderer.resize(
        vm.runtime.stageWidth,
        vm.runtime.stageHeight,
      );
    }
  });

  // Apply VM patches and patches for adding userscript's blocks
  applyPatches(
    reduxStore,
    vm,
    mousePosLabelExtracted,
    monitorsDivUpdate,
    updatePlayerSize,
  );
  const { addUserscriptBlock, applyToolboxPatches } = applyPatches4AddingBlks(vm);

  // Add userscipt's blocks
  addUserscriptBlock(
    '\u200B\u200Bhave "Stage Size Changer"?\u200B\u200B',
    'have "Stage Size Changer"?',
    [],
    "boolean",
    () => {
      return true;
    },
    false,
  );
  addUserscriptBlock(
    "\u200B\u200Bstage width\u200B\u200B",
    "stage width",
    [],
    "reporter",
    () => {
      return vm.runtime.stageWidth;
    },
    false,
  );
  addUserscriptBlock(
    "\u200B\u200Bstage height\u200B\u200B",
    "stage height",
    [],
    "reporter",
    () => {
      return vm.runtime.stageHeight;
    },
    false,
  );
  addUserscriptBlock(
    "\u200B\u200Bset stage size width:\u200B\u200B %n \u200B\u200Bheight:\u200B\u200B %n",
    "set stage size width: %n height: %n",
    ["width", "height"],
    "command",
    (args) => {
      vm.runtime.setStageSize(args.width, args.height);
    },
    false,
  );

  // Apply toolbox patches
  let toolboxPatchesApplied = false;
  if (defined(ScratchBlocks)) {
    toolboxPatchesApplied = true;
    applyToolboxPatches(ScratchBlocks, blocksComponent);
  }

  // Add elements
  document.body.appendChild(settingsInterfaceExtracted);
  (await asyncQuerySelector('div[class^="controls_controls-container_"]')).after(
    spacerExtracted,
  );
  (await asyncQuerySelector('img[class^="stop-all_stop-all_"]')).after(
    mousePosLabelExtracted,
  );
  await (async (advQuery) => {
    let result = await asyncQuerySelector(advQuery.map((query) => query[0]).join(", "));
    for (let advQueryI = 0; advQueryI < advQuery.length; advQueryI++) {
      if (result != document.querySelector(advQuery[advQueryI][0])) {
        continue;
      }
      for (let parentingCount = 0; parentingCount < advQuery[advQueryI][1]; parentingCount++) {
        result = result.parentElement;
      }
      result.before(openSettingsButtonExtracted);
      return;
    }
  })([
    [
      'div[class^="stage-header_stage-size-row_"] div > span[class^="button_outlined-button_"][role="button"]',
      1,
    ],
    [
      siteDifferences[location.host].inFullscreenButton.query,
      siteDifferences[location.host].inFullscreenButton.parentI,
    ],
  ]);

  // Update player size
  updatePlayerSize(
    vm.runtime.stageWidth,
    vm.runtime.stageHeight,
    reduxStore.getState().scratchGui.stageSize.stageSize,
  );

  // Handle search parameter "StageSC_size"
  if (/\d+x\d+/.test((new URL(location.href)).searchParams.get("StageSC_size"))) {
    const param = (new URL(location.href)).searchParams.get("StageSC_size");
    vm.runtime.setStageSize(...param.match(/\d+/g).map((number) => parseInt(number)));
  }

  // Start log
  console.log(
    '%c %cUserscript "Stage Size Changer" was runned successfully',
    `font-size: 1px; padding: 10px 10px; background: no-repeat url(${icon}); margin-right: 0.25rem;`,
    "",
  );
})();