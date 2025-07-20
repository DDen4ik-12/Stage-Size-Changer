import siteDifferences from "./siteDifferences.js";
import { defined } from "./utils/utils.js";

import icon from "../assets/icon.svg";

// Player style
const resizePlayerStyle = document.createElement("style");
const updatePlayerSize = (width, height, stageSizeMode) => {
  stageSizeMode =
    stageSizeMode == "large" ? 1 : stageSizeMode == "small" ? 0.5 : 1;
  const stageWrapperBoundingRect = document
    .querySelector('[class*="stage-wrapper_stage-wrapper"]')
    .getBoundingClientRect();
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
    transform: scale(calc(min(calc(${stageWrapperBoundingRect.height} * ${width} / ${height}), ${stageWrapperBoundingRect.width}) / ${width})) !important;
  }
  body [class*="stage-wrapper_full-screen"] [class*="stage_stage_"] {
    border-width: 0;
  }`;
};

// Userscript global style
const usGlobalStyle = Object.assign(
  document.createElement("style"),
  {
    textContent: `[dir="ltr"] div.userscript-stage-size-changer_stage-button {
      margin-right: 0.2rem;
    }
    [dir="rtl"] div.userscript-stage-size-changer_stage-button {
      margin-left: 0.2rem;
    }`,
  },
);

// Mouse position label
const mousePosLabel = () => {
  const result = Object.assign(
    document.createElement("span"),
    { textContent: "0, 0" },
  );
  Object.assign(result.style, {
    width: `${0.625 * 0.55 * 10}rem`,
    fontSize: "0.625rem",
    fontWeight: "bold",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    whiteSpace: "nowrap",
    padding: "0.25rem",
    userSelect: "none",
    color: "#00bcd4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    direction: "ltr",
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
const openSettingsButton = (vm) => {
  const result = new Object();
  result.container = Object.assign(
    document.createElement("div"),
    { className: "userscript-stage-size-changer_stage-button" },
  );
  result.button = Object.assign(
    document.createElement("span"),
    {
      className: siteDifferences[location.host]?.outlinedStageButton,
      role: "button",
    },
  );
  result.button.addEventListener("click", () => {
    const width = prompt("Stage width", vm.runtime.stageWidth),
      height = prompt("Stage height", vm.runtime.stageHeight);
    if (!defined(width) || !defined(height)) {
      return;
    }
    if (/^\d+$/.test(width) && /^\d+$/.test(height)) {
      vm.runtime.setStageSize(width, height);
    }
  });
  result.container.appendChild(result.button);
  result.buttonContent = Object.assign(
    document.createElement("div"),
    { className: siteDifferences[location.host]?.buttonContent },
  );
  result.button.appendChild(result.buttonContent);
  result.img = Object.assign(
    document.createElement("img"),
    { className: siteDifferences[location.host]?.stageButtonIcon },
  );
  Object.assign(result.img, {
    alt: 'Open settings of "Stage Size Changer"',
    title: '"Stage Size Changer" Settings',
    draggable: false,
    src: icon,
  });
  result.buttonContent.appendChild(result.img);
  return result.container;
};

export {
  resizePlayerStyle,
  updatePlayerSize,
  usGlobalStyle,
  mousePosLabel,
  spacer,
  openSettingsButton,
};