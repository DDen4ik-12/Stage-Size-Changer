import siteDifferences from "./siteDifferences.js";
import applyPatches from "./patches/vm.js";
import applyPatches4AddingBlks from "./patches/blocks.js";
import { asyncQuerySelector, asyncQuerySelectorAll } from "./utils/asyncQuery.js"
import { asyncGetStageWrapperState, getBlocksComponent } from "./instances.js";
import {
  resizePlayerStyle,
  updatePlayerSize,
  usGlobalStyle,
  mousePosLabel,
  spacer,
  openSettingsButton,
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
    monitorsInfo = monitorsStateClone.toArray().filter((x) => x.visible);
    monitorsDiv.forEach((value, index) => {
      value.style.transform = `translate(${monitorsInfo[index]?.x - value.style.left.match(/\d+/gs)[0]}px, ${monitorsInfo[index]?.y - value.style.top.match(/\d+/gs)[0]}px)`;
    });
  };

  // Get instances
  top.userscriptStageSizeChanger = new Object();
  let stageWrapperState = await asyncGetStageWrapperState(),
    stageSizeMode = siteDifferences[location.host].pagesCheck.editor()
      ? stageWrapperState.props.stageSize
      : "large",
    vm = stageWrapperState.props.vm,
    blocksComponent,
    ScratchBlocks;
  if (siteDifferences[location.host].pagesCheck.editor()) {
    blocksComponent = await getBlocksComponent();
    ScratchBlocks = blocksComponent.ScratchBlocks;
  }
  Object.assign(top.userscriptStageSizeChanger, { vm, blocksComponent, ScratchBlocks });

  // Add listeners to VM events
  vm.runtime.on("STAGE_SIZE_CHANGED", (width, height) => {
    const params = new URLSearchParams(location.search);
    if (width == 480 && height == 360) {
      params.delete("StageSC_size");
    } else {
      params.set("StageSC_size", `${width}x${height}`);
    }
    history.replaceState("", "", `?${params.toString()}`);
  });
  let monitorsStateClone = vm.runtime._monitorState.map((x) => x);
  vm.on("MONITORS_UPDATE", () => {
    for (const monitor of vm.runtime._monitorState.valueSeq()) {
      if (monitorsStateClone.size == 0) {
        continue;
      }
      const monitorFromClone = monitorsStateClone.get(monitor.get("id"));
      if (
        defined(monitorFromClone) &&
        monitorFromClone.get("visible") != monitor.get("visible") &&
        (monitorFromClone.get("x") != monitor.get("x") ||
          monitorFromClone.get("y") != monitor.get("y"))
      ) {
        vm.runtime.requestUpdateMonitor(
          new Map([
            ["id", monitor.get("id")],
            ["x", monitorsStateClone.get(monitor.get("id")).get("x")],
            ["y", monitorsStateClone.get(monitor.get("id")).get("y")],
          ]),
        );
      }
    }
    monitorsStateClone = vm.runtime._monitorState.map((x) => x);
    monitorsDivUpdate();
  });

  // Extract elements from functions
  const spacerRaw = spacer(),
    mousePosLabelRaw = mousePosLabel(),
    openSettingsButtonRaw = openSettingsButton(vm);

  // Apply VM patches and patches for adding userscript's blocks
  applyPatches(
    vm,
    mousePosLabelRaw,
    monitorsDivUpdate,
    updatePlayerSize,
    (x1, x2) => {
      stageWrapperState = x1;
      stageSizeMode = x2;
    },
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

  // Add elements to player controls
  (await asyncQuerySelector('div[class^="controls_controls-container_"]')).after(
    spacerRaw,
  );
  (await asyncQuerySelector('img[class^="stop-all_stop-all_"]')).after(
    mousePosLabelRaw,
  );
  await (async (x1) => {
    let result = await asyncQuerySelector(x1.map((x2) => x2[0]).join(", "));
    for (let i1 = 0; i1 < x1.length; i1++) {
      if (result != document.querySelector(x1[i1][0])) {
        continue;
      }
      for (let i2 = 0; i2 < x1[i1][1]; i2++) {
        result = result.parentElement;
      }
      result.before(openSettingsButtonRaw);
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
    stageSizeMode,
  );

  // Handle search parameter "StageSC_size"
  if (/\d+x\d+/.test((new URL(location.href)).searchParams.get("StageSC_size"))) {
    const param = (new URL(location.href)).searchParams.get("StageSC_size");
    vm.runtime.setStageSize(...param.match(/\d+/g).map((x) => parseInt(x)));
  }

  // Navigation
  const funcOnClick = {
    player: async () => {
      await funcOnNavigate(undefined, "player");
    },
    editor: async () => {
      await funcOnNavigate(undefined, "editor");
    },
    fullscreen: async () => {
      await funcOnNavigate(undefined, "fullscreen");
    },
  };
  const funcOnNavigate = async (
    event,
    page = siteDifferences[location.host]?.defaultPage,
  ) => {
    vm.runtime._monitorState =
      monitorsStateClone.size > 0
        ? monitorsStateClone.map((x) => x)
        : vm.runtime._monitorState;

    page =
      page ??
      siteDifferences[location.host].matchingPage(event.destination.url);
    let intervalId;
    await new Promise((resolve) => {
      intervalId = setInterval(() => {
        if (siteDifferences[location.host].pagesCheck[page]()) {
          resolve();
        }
      });
    });
    clearInterval(intervalId);

    /*const params = new URLSearchParams(location.search);
    if (vm.runtime.stageWidth == 480 && vm.runtime.stageHeight == 360) {
      params.delete("StageSC_size");
    } else {
      params.set("StageSC_size", `${vm.runtime.stageWidth}x${vm.runtime.stageHeight}`);
    }
    history.replaceState("", "", `?${params.toString()}`);*/

    if (siteDifferences[location.host].pagesCheck.editor()) {
      stageWrapperState = await asyncGetStageWrapperState();
      stageSizeMode = stageWrapperState.props.stageSize;
      blocksComponent = await getBlocksComponent();
      ScratchBlocks = blocksComponent.ScratchBlocks;
      Object.assign(top.userscriptStageSizeChanger, { blocksComponent, ScratchBlocks });
      if (!toolboxPatchesApplied) {
        toolboxPatchesApplied = true;
        applyToolboxPatches(ScratchBlocks, blocksComponent);
      }
    }

    (await asyncQuerySelector('div[class^="controls_controls-container_"]')).after(
      spacerRaw,
    );
    (await asyncQuerySelector('img[class^="stop-all_stop-all_"]')).after(
      mousePosLabelRaw,
    );
    await (async (x1) => {
      let result = await asyncQuerySelector(x1.map((x2) => x2[0]).join(", "));
      for (let i1 = 0; i1 < x1.length; i1++) {
        if (result != document.querySelector(x1[i1][0])) {
          continue;
        }
        for (let i2 = 0; i2 < x1[i1][1]; i2++) {
          result = result.parentElement;
        }
        result.before(openSettingsButtonRaw);
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
    await (async (x1) => {
      if (x1.length == 0) {
        return;
      }
      let elements = await asyncQuerySelectorAll(
        x1.map((x2) => x2[0]).join(", "),
      );
      for (let i1 = 0; i1 < x1.length; i1++) {
        elements
          .filter((x2) =>
            [...document.querySelectorAll(x1[i1][0])].includes(x2),
          )
          .forEach((x2) => {
            let parent = x2;
            for (let i2 = 0; i2 < x1[i1][1]; i2++) {
              parent = parent.parentElement;
            }
            parent.removeEventListener("click", funcOnClick[x1[i1][2]]);
            parent.addEventListener("click", funcOnClick[x1[i1][2]]);
          });
      }
    })(siteDifferences[location.host].addListenersTo);

    monitorsDivUpdate();
    updatePlayerSize(
      vm.runtime.stageWidth,
      vm.runtime.stageHeight,
      stageSizeMode,
    );
  };
  await (async (x1) => {
    if (x1.length == 0) {
      return;
    }
    let elements = await asyncQuerySelectorAll(
      x1.map((x2) => x2[0]).join(", "),
    );
    for (let i1 = 0; i1 < x1.length; i1++) {
      elements
        .filter((x2) => [...document.querySelectorAll(x1[i1][0])].includes(x2))
        .forEach((x2) => {
          let parent = x2;
          for (let i2 = 0; i2 < x1[i1][1]; i2++) {
            parent = parent.parentElement;
          }
          parent.addEventListener("click", funcOnClick[x1[i1][2]]);
        });
    }
  })(siteDifferences[location.host].addListenersTo);
  navigation.addEventListener("navigate", funcOnNavigate);

  // Start log
  console.log(
    '%c %cUserscript "Stage Size Changer" was runned successfully',
    `font-size: 1px; padding: 10px 10px; background: no-repeat url(${icon}); margin-right: 0.25rem;`,
    "",
  );
})();