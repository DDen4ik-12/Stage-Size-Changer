import siteDifferences from "./siteDifferences.js";
import { defaultSettings, generateSettings } from "./settings.js";

import globalStyle from "../assets/global.css";
import icon from "../assets/icon.svg";
import closeIcon from "../assets/close.svg";

// Player style
const resizePlayerStyle = document.createElement("style");
const updatePlayerSize = (width, height, stageSizeMode) => {
  stageSizeMode =
    stageSizeMode == "large" ? 1 : stageSizeMode == "small" ? 0.5 : 1;
  const pageWidth =
      document.documentElement.clientWidth ?? document.body.clientWidth;
  const pageHeight =
    document.documentElement.clientHeight ?? document.body.clientHeight;
  resizePlayerStyle.textContent = `.preview .guiPlayer [class*="stage_stage-overlays"],
  [class*="stage-wrapper_stage-wrapper"] [class*="stage_stage-overlays"] {
    top: 0;
    left: 0;
  }
  .preview .guiPlayer [class*="stage_question-wrapper"],
  [class*="stage-wrapper_stage-wrapper"] [class*="stage_question-wrapper"] {
    width: auto !important;
   }

  .preview .guiPlayer {
    width: ${width + 2}px !important;
  }
  .preview .guiPlayer [class*="stage_stage_"]:not([class*="stage-wrapper_full-screen"] *),
  .preview .guiPlayer [class*="monitor-list_monitor-list"]:not([class*="stage-wrapper_full-screen"] *),
  .preview .guiPlayer [class*="stage_stage-bottom-wrapper"]:not([class*="stage-wrapper_full-screen"] *),
  .preview .guiPlayer canvas:not([class*="stage-wrapper_full-screen"] *) {
    width: ${width}px !important;
    height: ${height}px !important;
  }
  .preview .guiPlayer [class*="monitor-list_monitor-list-scaler"]:not([class*="stage-wrapper_full-screen"] *) {
    transform: scale(1) !important;
  }

  [class*="stage-wrapper_stage-wrapper"] [class*="stage_stage"]:not([class*="stage-wrapper_full-screen"] *, [class*="stage-wrapper_stage-wrapper"] [class*="stage_stage-wrapper"], .preview .guiPlayer *),
  [class*="stage-wrapper_stage-wrapper"] [class*="monitor-list_monitor-list"]:not([class*="stage-wrapper_full-screen"] *, .preview .guiPlayer *),
  [class*="stage-wrapper_stage-wrapper"] [class*="stage_stage-bottom-wrapper"]:not([class*="stage-wrapper_full-screen"] *, .preview .guiPlayer *),
  [class*="stage-wrapper_stage-wrapper"] [class*="stage_stage_"] > div > canvas:not([class*="stage-wrapper_full-screen"] *, .preview .guiPlayer *) {
    width: ${width * stageSizeMode}px !important;
    height: ${height * stageSizeMode}px !important;
  }
  [class*="stage-wrapper_stage-wrapper"] [class*="monitor-list_monitor-list-scaler"]:not([class*="stage-wrapper_full-screen"] *, .preview .guiPlayer *) {
    transform: scale(${stageSizeMode}) !important;
  }

  body [class*="stage-wrapper_full-screen"] [class*="stage-wrapper_stage-canvas-wrapper"],
  body [class*="stage-wrapper_full-screen"] [class*="stage_stage"],
  body [class*="stage-wrapper_full-screen"] [class*="stage-header_stage-menu-wrapper"],
  body [class*="stage-wrapper_full-screen"] [class*="monitor-list_monitor-list"],
  body [class*="stage-wrapper_full-screen"] canvas {
    width: min(calc((100vh - 44px) * ${width} / ${height}), 100vw) !important;
  }
  body [class*="stage-wrapper_full-screen"] [class*="stage-wrapper_stage-canvas-wrapper"],
  body [class*="stage-wrapper_full-screen"] [class*="stage_stage"],
  body [class*="stage-wrapper_full-screen"] [class*="stage_green-flag-overlay-wrapper"],
  body [class*="stage-wrapper_full-screen"] [class*="monitor-list_monitor-list"],
  body [class*="stage-wrapper_full-screen"] canvas {
    height: min(calc(100vh - 44px), calc(100vw * ${height} / ${width})) !important;
  }
  body [class*="stage-wrapper_full-screen"] {
    padding: 0 !important;
  }
  body [class*="stage-wrapper_full-screen"] [class*="monitor-list_monitor-list-scaler"] {
    transform: scale(calc(min(calc(${pageHeight} * ${width} / ${height}), ${pageWidth}) / ${width})) !important;
  }
  body [class*="stage-wrapper_full-screen"] [class*="stage_stage_"] {
    border-width: 0;
  }`;
};

// Userscript global style
const usGlobalStyle = Object.assign(document.createElement("style"), {
  textContent: globalStyle,
});

// Mouse position label
const mousePosLabel = () => {
  const result = Object.assign(document.createElement("span"), {
    textContent: "0, 0",
  });
  Object.assign(result.style, {
    width: `${0.625 * 0.55 * 10}rem`,
    fontSize: "0.625rem",
    fontWeight: "bold",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    whiteSpace: "nowrap",
    padding: "0.25rem",
    userSelect: "none",
    color: GM_getValue(
      "mousePosLabel.color",
      defaultSettings
        .find((setting) => setting.opcode == "mousePosLabel").args
        .find((arg) => arg.opcode == "color").defaultValue,
    ),
    display: GM_getValue(
      "mousePosLabel",
      defaultSettings
        .find((setting) => setting.opcode == "mousePosLabel").defaultValue,
    )
      ? "flex"
      : "none",
    alignItems: "center",
    justifyContent: "center",
    direction: "ltr",
  });
  GM_addValueChangeListener("mousePosLabel", (_1, _2, newValue) => {
    result.style.display = newValue ? "flex" : "none";
  });
  GM_addValueChangeListener("mousePosLabel.color", (_1, _2, newValue) => {
    result.style.color = newValue;
  });
  return result;
};

// Spacer
const spacer = () => {
  const result = document.createElement("div");
  result.style.marginLeft = "auto";
  return result;
};

// "Open settings" button
const openSettingsButton = (vm, settingsInterface) => {
  const result = new Object();

  result.container = Object.assign(document.createElement("div"), {
    className: "us-stage-sc_stage-button",
  });

  result.button = Object.assign(document.createElement("span"), {
    className: siteDifferences[location.host]?.outlinedStageButton,
    role: "button",
  });
  result.button.addEventListener("click", () => {
    settingsInterface.children[1].innerHTML = "";
    settingsInterface.children[1].append(
      ...generateSettings(
        GM_getValues(GM_listValues()),
        (save) => {
          if (
            Object.keys(save)[0] == "stageSize.width" ||
            Object.keys(save)[0] == "stageSize.height"
          ) {
            vm.runtime.setStageSize(
              save["stageSize.width"] ?? vm.runtime.stageWidth,
              save["stageSize.height"] ?? vm.runtime.stageHeight,
            );
          } else {
            GM_setValues(save);
          }
        }, 
        {
          "stageSize.width": vm.runtime.stageWidth,
          "stageSize.height": vm.runtime.stageHeight,
        },
      ),
    );
    settingsInterface.style.display = "flex";
  });
  result.container.appendChild(result.button);

  result.buttonContent = Object.assign(document.createElement("div"), {
    className: siteDifferences[location.host]?.buttonContent,
  });
  result.button.appendChild(result.buttonContent);

  result.img = Object.assign(document.createElement("img"), {
    className: siteDifferences[location.host]?.stageButtonIcon,
    alt: 'Open settings of "Stage Size Changer"',
    title: '"Stage Size Changer" Settings',
    draggable: false,
    src: icon,
  });
  result.buttonContent.appendChild(result.img);

  return result.container;
};

// Settings interface
const settingsInterface = (reduxStore) => {
  const result = new Object();

  result.interface = Object.assign(document.createElement("div"), {
    className: siteDifferences[location.host]?.card,
  });
  Object.assign(result.interface.style, {
    width: "15rem",
    height: "20rem",
    backgroundColor: "#ffffff",
    display: "none",
    position: "absolute",
    top: "0px",
    left: "0px",
    zIndex: 5001,
  });

  result.header = Object.assign(document.createElement("div"), {
    className: siteDifferences[location.host]?.cardHeaderButtons,
  });
  Object.assign(result.header.style, {
    backgroundColor: "var(--us-stage-sc-accent-color)",
    borderColor: "var(--us-stage-sc-accent-tertiary-color)",
  });
  let mouseOffsetX = 0;
  let mouseOffsetY = 0;
  let lastX = 0;
  let lastY = 0;
  const handleStartDrag = (e) => {
    e.preventDefault();
    mouseOffsetX = e.clientX - result.interface.offsetLeft;
    mouseOffsetY = e.clientY - result.interface.offsetTop;
    lastX = e.clientX;
    lastY = e.clientY;
    document.addEventListener("mouseup", handleStopDrag);
    document.addEventListener("mousemove", handleDragInterface);
  };
  const handleStopDrag = () => {
    document.removeEventListener("mouseup", handleStopDrag);
    document.removeEventListener("mousemove", handleDragInterface);
  };
  const moveInterface = (x, y) => {
    lastX = x;
    lastY = y;
    const width =
      (document.documentElement.clientWidth ?? document.body.clientWidth) - 1;
    const height =
      (document.documentElement.clientHeight ?? document.body.clientHeight) - 1;
    const clampedX = Math.max(
      0,
      Math.min(x - mouseOffsetX, width - result.interface.offsetWidth),
    );
    const clampedY = Math.max(
      0,
      Math.min(y - mouseOffsetY, height - result.interface.offsetHeight),
    );
    result.interface.style.left = clampedX + "px";
    result.interface.style.top = clampedY + "px";
  };
  const handleDragInterface = (e) => {
    e.preventDefault();
    moveInterface(e.clientX, e.clientY);
  };
  window.addEventListener("resize", () => moveInterface(lastX, lastY));
  result.header.addEventListener("mousedown", handleStartDrag);
  result.interface.appendChild(result.header);

  result.headerButtonsRight = Object.assign(document.createElement("div"), {
    className: siteDifferences[location.host]?.cardHeaderButtonsRight,
  });
  result.header.append(
    result.headerButtonsRight.cloneNode(),
    result.headerButtonsRight,
  );

  result.closeButton = Object.assign(document.createElement("div"), {
    className: siteDifferences[location.host]?.cardButton,
    draggable: false,
  });
  result.closeButton.addEventListener("click", () => {
    result.content.innerHTML = "";
    result.interface.style.display = "none";
  });
  result.headerButtonsRight.appendChild(result.closeButton);

  result.closeButtonImg = Object.assign(document.createElement("img"), {
    draggable: false,
    src: closeIcon,
  });
  result.closeButtonSpan = Object.assign(document.createElement("span"), {
    textContent: reduxStore.getState().locales.messages["gui.cards.close"],
  });
  result.closeButton.append(result.closeButtonImg, result.closeButtonSpan);

  result.content = document.createElement("div");
  Object.assign(result.content.style, {
    width: "calc(100% - 1rem)",
    height: "100%",
    overflow: "auto",
    cursor: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.5rem",
  });
  result.interface.appendChild(result.content);

  return result.interface;
};

export {
  resizePlayerStyle,
  updatePlayerSize,
  usGlobalStyle,
  mousePosLabel,
  spacer,
  openSettingsButton,
  settingsInterface,
};