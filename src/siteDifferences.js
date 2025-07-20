const siteDifferences = {
  "scratch.mit.edu": {
    outlinedStageButton:
      "button_outlined-button_Uhh7R stage-header_stage-button_32Qds",
    buttonContent: "button_content_W+xEu",
    stageButtonIcon: "stage-header_stage-button-icon_tUZn7",
    inFullscreenButton: {
      query:
        'div[class^="stage-header_stage-menu-wrapper_"] > div[class^="stage-header_unselect-wrapper_"] > span[class^="button_outlined-button_"][role="button"], div[class^="stage-header_embed-scratch-logo_"] > a',
      parentI: 1,
    },
    matchingPage: (x) => {
      if (
        !new URL(x).pathname.split("/").includes("editor") &&
        !new URL(x).pathname.split("/").includes("fullscreen")
      ) {
        return "player";
      } else if (new URL(x).pathname.split("/").includes("editor")) {
        return "editor";
      } else if (
        new URL(x).pathname.split("/").includes("fullscreen") ||
        new URL(x).pathname.split("/").includes("embed")
      ) {
        return "fullscreen";
      }
    },
    pagesCheck: {
      player: () =>
        !location.pathname.split("/").includes("editor") &&
        !location.pathname.split("/").includes("fullscreen"),
      editor: () => location.pathname.split("/").includes("editor"),
      fullscreen: () =>
        location.pathname.split("/").includes("fullscreen") ||
        location.pathname.split("/").includes("embed"),
    },
    addListenersTo: [],
  },
  "lab.scratch.mit.edu": {
    defaultPage: "editor",
    outlinedStageButton:
      "button_outlined-button_3tmV_ stage-header_stage-button_XRe-_",
    buttonContent: "button_content_3j5-N",
    stageButtonIcon: "stage-header_stage-button-icon_3X5CV",
    inFullscreenButton: {
      query:
        'div[class^="stage-header_stage-menu-wrapper_"] > span[class^="button_outlined-button_"][role="button"]',
      parentI: 0,
    },
    pagesCheck: {
      player: () => false,
      editor: () =>
        !document.querySelector('[class*="stage-wrapper_full-screen"]'),
      fullscreen: () =>
        !!document.querySelector('[class*="stage-wrapper_full-screen"]'),
    },
    addListenersTo: [
      [
        'div[class^="stage-header_stage-size-row_"] div > span[class^="button_outlined-button_"][role="button"]',
        0,
        "fullscreen",
      ],
      [
        'div[class^="stage-header_stage-menu-wrapper_"] > div[class^="stage-header_unselect-wrapper_"] > span[class^="button_outlined-button_"][role="button"], div[class^="stage-header_stage-menu-wrapper_"] > span[class^="button_outlined-button_"][role="button"]',
        0,
        "editor",
      ],
    ],
  },
};

export default siteDifferences;