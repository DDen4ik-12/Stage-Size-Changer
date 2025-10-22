const siteDifferences = {
  "scratch.mit.edu": {
    outlinedStageButton:
      "button_outlined-button_Uhh7R stage-header_stage-button_32Qds",
    buttonContent: "button_content_W+xEu",
    stageButtonIcon: "stage-header_stage-button-icon_tUZn7",
    card: "card_card_hogMD",
    cardHeaderButtons: "card_header-buttons_HNCqK",
    cardHeaderButtonsRight: "card_header-buttons-right_YiDtR",
    cardButton: "card_shrink-expand-button_mowrp",
    inFullscreenButton: {
      query:
        'div[class^="stage-header_stage-menu-wrapper_"] > div[class^="stage-header_rightSection_"] > span[class^="button_outlined-button_"][class*="stage-header_stage-button_"][role="button"],' +
        'div[class^="stage-header_stage-menu-wrapper_"] > div[class^="stage-header_unselect-wrapper_"] > span[class^="button_outlined-button_"][role="button"],' +
        'div[class^="stage-header_embed-scratch-logo_"] > a',
      parentI: 1,
    },
  },
  "lab.scratch.mit.edu": {
    defaultPage: "editor",
    outlinedStageButton:
      "button_outlined-button_3tmV_ stage-header_stage-button_XRe-_",
    buttonContent: "button_content_3j5-N",
    stageButtonIcon: "stage-header_stage-button-icon_3X5CV",
    card: "card_card_2cClv",
    cardHeaderButtons: "card_header-buttons_2CvFK",
    cardHeaderButtonsRight: "card_header-buttons-right_1E4UL",
    cardButton: "card_shrink-expand-button_2VkbD",
    inFullscreenButton: {
      query:
        'div[class^="stage-header_stage-menu-wrapper_"] > span[class^="button_outlined-button_"][role="button"]',
      parentI: 0,
    },
  },
};

export default siteDifferences;