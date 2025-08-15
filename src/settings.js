import arrowIcon from "../assets/arrow.svg";

const defaultSettings = [
  {
    opcode: "stageSize",
    name: "Stage size",
    description: "Changes the stage size from 480×360 to something else",
    toggleable: false,
    args: [
      {
        opcode: "width",
        name: "Width",
        type: "number",
        defaultValue: 480,
        options: {
          min: 1,
          step: 1,
        },
      },
      {
        opcode: "height",
        name: "Height",
        type: "number",
        defaultValue: 360,
        options: {
          min: 1,
          step: 1,
        },
      },
    ],
  },
  {
    opcode: "mousePosLabel",
    name: "Mouse position display",
    description: "Displays the mouse cursor coordinates relative to the stage in the stage controls",
    toggleable: true,
    defaultValue: true,
    args: [
      {
        opcode: "color",
        name: "Display color",
        type: "color",
        defaultValue: "#00bcd4",
        options: {},
      },
    ],
  },
  /*
  {
    opcode: "colorScheme",
    name: "Цветовая тема",
    toggleable: false,
    args: [
      {
        opcode: "darkMode",
        name: "Тёмный режим",
        description: "Устанавливает тёмный режим для расширения",
        type: "checkbox",
        defaultValue: false,
        options: {},
      },
      {
        opcode: "accent",
        name: "Акцент",
        description: "Устанавливает акцентный цвет для расширения",
        type: "buttonsGroup",
        defaultValue: "extension",
        options: {
          buttons: [
            {
              opcode: "extension",
              name: "Цвет расширений",
            },
            {
              opcode: "turbowarp",
              name: "Цвет TurboWarp",
            },
            {
              opcode: "penguinmod",
              name: "Цвет PenguinMod",
            },
            {
              opcode: "scratch",
              name: "Цвет Scratch",
            },
            {
              opcode: "scratchblue",
              name: "Цвет Scratch (синий)",
            },
          ],
        },
      },
    ],
  },
  */
];

const generateSettings = (savedSettings, saveFunction, overrideDefault) => {
  const settingGroups = new Array();
  for (
    let settingGroupI = 0;
    settingGroupI < defaultSettings.length;
    settingGroupI++
  ) {
    settingGroups[settingGroupI] = new Object();
    let settingGroup = settingGroups[settingGroupI];

    const expandButtonClick = (toggleType) => {
      if (toggleType == "toggle") {
        settingGroup.expandButton.setAttribute(
          "state",
          settingGroup.expandButton.getAttribute("state") == "on"
            ? "off"
            : "on",
        );
      } else if (toggleType == "on") {
        settingGroup.expandButton.setAttribute("state", "on");
      } else if (toggleType == "off") {
        settingGroup.expandButton.setAttribute("state", "off");
      }
      if (settingGroup.hasOwnProperty("description")) {
        settingGroup.description.style.display =
          settingGroup.expandButton.getAttribute("state") == "on" ? "" : "none";
      }
      if (settingGroup.hasOwnProperty("list")) {
        settingGroup.list.style.display =
          settingGroup.expandButton.getAttribute("state") == "on" ? "" : "none";
      }
    };

    settingGroup.group = Object.assign(document.createElement("div"), {
      className: "us-stage-sc_gen_setting-group",
    });

    settingGroup.header = Object.assign(document.createElement("div"), {
      className: "us-stage-sc_gen_setting-header",
    });
    settingGroup.group.appendChild(settingGroup.header);

    settingGroup.headerLeft = Object.assign(document.createElement("div"), {
      className: "us-stage-sc_gen_setting-header-left",
    });
    settingGroup.header.appendChild(settingGroup.headerLeft);

    settingGroup.headerRight = Object.assign(document.createElement("div"), {
      className: "us-stage-sc_gen_setting-header-right",
    });
    settingGroup.header.appendChild(settingGroup.headerRight);

    if (defaultSettings[settingGroupI].toggleable) {
      settingGroup.toggle = Object.assign(document.createElement("button"), {
        className: "us-stage-sc_gen_setting-input",
      });
      settingGroup.toggle.setAttribute(
        "data-opcode",
        defaultSettings[settingGroupI].opcode,
      );
      settingGroup.toggle.setAttribute("type", "checkbox");
      settingGroup.toggle.setAttribute(
        "state",
        (savedSettings[defaultSettings[settingGroupI].opcode] ??
          defaultSettings[settingGroupI].defaultValue)
          ? "on"
          : "off",
      );
      settingGroup.toggle.addEventListener("click", () => {
        settingGroup.toggle.setAttribute(
          "state",
          settingGroup.toggle.getAttribute("state") == "on" ? "off" : "on",
        );
        expandButtonClick(
          settingGroup.toggle.getAttribute("state") == "on" ? "on" : "off",
        );
        saveFunction({
          [settingGroup.toggle.getAttribute("data-opcode")]:
            settingGroup.toggle.getAttribute("state") == "on",
        });
      });
      settingGroup.headerLeft.appendChild(settingGroup.toggle);
    }

    settingGroup.name = Object.assign(document.createElement("div"), {
      textContent: defaultSettings[settingGroupI].name,
    });
    settingGroup.headerLeft.appendChild(settingGroup.name);

    settingGroup.expandButton = Object.assign(
      document.createElement("button"),
      { className: "us-stage-sc_gen_setting-button-right" },
    );
    settingGroup.expandButton.setAttribute("state", "off");
    settingGroup.expandButton.addEventListener("click", () =>
      expandButtonClick("toggle"),
    );
    settingGroup.headerRight.appendChild(settingGroup.expandButton);

    settingGroup.expandButtonImage = Object.assign(
      document.createElement("img"),
      {
        src: arrowIcon,
        draggable: false,
      },
    );
    settingGroup.expandButton.appendChild(settingGroup.expandButtonImage);

    if (defaultSettings[settingGroupI].hasOwnProperty("description")) {
      settingGroup.description = Object.assign(document.createElement("div"), {
        className: "us-stage-sc_gen_setting-description",
        innerHTML: defaultSettings[settingGroupI].description,
      });
      settingGroup.description.style.display = "none";
      settingGroup.group.appendChild(settingGroup.description);
    }

    if (defaultSettings[settingGroupI].hasOwnProperty("args")) {
      settingGroup.list = Object.assign(document.createElement("div"), {
        className: "us-stage-sc_gen_setting-list",
      });
      settingGroup.list.style.display = "none";
      settingGroup.group.appendChild(settingGroup.list);

      settingGroup.args = new Array();

      for (
        let settingArgI = 0;
        settingArgI < defaultSettings[settingGroupI].args.length;
        settingArgI++
      ) {
        settingGroup.args[settingArgI] = new Object();
        let arg = settingGroup.args[settingArgI];

        arg.main = Object.assign(document.createElement("div"), {
          className: "us-stage-sc_gen_setting-list-arg-group",
        });
        settingGroup.list.appendChild(arg.main);

        arg.arg = Object.assign(document.createElement("div"), {
          className: "us-stage-sc_gen_setting-list-arg",
        });
        arg.main.appendChild(arg.arg);

        let settingArgName =
          defaultSettings[settingGroupI].args[settingArgI].name;
        if (
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("min") ||
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("max") ||
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("measure")
        ) {
          settingArgName += " [";
        }
        if (
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("min") &&
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("max")
        ) {
          settingArgName += `${defaultSettings[settingGroupI].args[settingArgI].options.min}-${defaultSettings[settingGroupI].args[settingArgI].options.max}`;
        } else if (
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("min")
        ) {
          settingArgName += `≥${defaultSettings[settingGroupI].args[settingArgI].options.min}`;
        } else if (
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("max")
        ) {
          settingArgName += `≤${defaultSettings[settingGroupI].args[settingArgI].options.max}`;
        }
        settingArgName += defaultSettings[settingGroupI].args[
          settingArgI
        ].options.hasOwnProperty("measure")
          ? defaultSettings[settingGroupI].args[settingArgI].options.measure
          : "";
        if (
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("min") ||
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("max") ||
          defaultSettings[settingGroupI].args[
            settingArgI
          ].options.hasOwnProperty("measure")
        ) {
          settingArgName += "]";
        }
        arg.name = Object.assign(document.createElement("div"), {
          className: "us-stage-sc_gen_setting-list-arg-text",
          textContent: settingArgName,
        });
        arg.arg.appendChild(arg.name);

        if (defaultSettings[settingGroupI].args[settingArgI].type == "number") {
          arg.input = Object.assign(document.createElement("input"), {
            type: "number",
            min:
              defaultSettings[settingGroupI].args[settingArgI].options.min ??
              "",
            max:
              defaultSettings[settingGroupI].args[settingArgI].options.max ??
              "",
            step:
              defaultSettings[settingGroupI].args[settingArgI].options.step ??
              "",
            value:
              savedSettings[
                `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
              ] ??
              overrideDefault[
                `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
              ] ??
              defaultSettings[settingGroupI].args[settingArgI].defaultValue,
          });
          arg.input.addEventListener("change", () => {
            arg.input.value = Math.max(
              defaultSettings[settingGroupI].args[settingArgI].options.min ??
                -Infinity,
              Math.min(
                defaultSettings[settingGroupI].args[settingArgI].options.max ??
                  Infinity,
                arg.input.value,
              ),
            );
            saveFunction({
              [arg.input.getAttribute("data-opcode")]: arg.input.value,
            });
          });
        } else if (
          defaultSettings[settingGroupI].args[settingArgI].type == "checkbox"
        ) {
          /*
          arg.input = document.createElement("button");
          arg.input.setAttribute("type", "checkbox");
          arg.input.setAttribute(
            "state",
            (savedSettings[
              `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
            ] ?? defaultSettings[settingGroupI].args[settingArgI].defaultValue)
              ? "on"
              : "off",
          );
          arg.input.addEventListener("click", () => {
            arg.input.setAttribute(
              "state",
              arg.input.getAttribute("state") == "on" ? "off" : "on",
            );
            saveFunction({
              [arg.input.getAttribute("data-opcode")]:
                arg.input.getAttribute("state") == "on",
            });
          });
          */
        } else if (
          defaultSettings[settingGroupI].args[settingArgI].type == "color"
        ) {
          arg.input = Object.assign(document.createElement("input"), {
            type: "color",
            value:
              savedSettings[
                `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
              ] ??
              defaultSettings[settingGroupI].args[settingArgI].defaultValue,
          });
          arg.input.addEventListener("input", () => {
            arg.shownInput.style.backgroundColor = arg.input.value;
          });
          arg.input.addEventListener("change", () =>
            saveFunction({
              [arg.input.getAttribute("data-opcode")]: arg.input.value,
            }),
          );

          arg.shownInput = Object.assign(document.createElement("button"), {
            className: "us-stage-sc_gen_setting-input",
            title: "Open color palette",
          });
          arg.shownInput.style.backgroundColor =
            savedSettings[
              `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
            ] ?? defaultSettings[settingGroupI].args[settingArgI].defaultValue;
          arg.shownInput.setAttribute("type", "color");
          arg.shownInput.addEventListener("click", () => arg.input.click());
          arg.arg.appendChild(arg.shownInput);
        } else if (
          defaultSettings[settingGroupI].args[settingArgI].type ==
          "buttonsGroup"
        ) {
          /*
          arg.input = document.createElement("div");
          arg.input.setAttribute("type", "buttons-group");

          arg.buttons = new Array();

          for (
            let settingArgBtnI = 0;
            settingArgBtnI <
            defaultSettings[settingGroupI].args[settingArgI].options.buttons
              .length;
            settingArgBtnI++
          ) {
            arg.buttons[settingArgBtnI] = Object.assign(document.createElement("button"), {
              textContent: defaultSettings[settingGroupI].args[settingArgI].options.buttons[
                settingArgBtnI
              ].name,
            });
            arg.buttons[settingArgBtnI].setAttribute(
              "data-opcode",
              defaultSettings[settingGroupI].args[settingArgI].options.buttons[
                settingArgBtnI
              ].opcode,
            );
            arg.buttons[settingArgBtnI].setAttribute(
              "state",
              (savedSettings[
                `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`
              ] ?? defaultSettings[settingGroupI].args[settingArgI].defaultValue) ==
                defaultSettings[settingGroupI].args[settingArgI].options
                  .buttons[settingArgBtnI].opcode
                ? "on"
                : "off",
            );
            arg.buttons[settingArgBtnI].addEventListener("click", () => {
              arg.input.querySelectorAll('button[state="on"]').forEach((button) => {
                button.setAttribute("state", "off");
              });
              arg.buttons[settingArgBtnI].setAttribute("state", "on");
              saveFunction({
                [arg.input.getAttribute("data-opcode")]:
                  arg.buttons[settingArgBtnI].getAttribute("data-opcode"),
              });
            });
            arg.input.appendChild(arg.buttons[settingArgBtnI]);
          }
          */
        }
        arg.input.className = "us-stage-sc_gen_setting-input";
        arg.input.setAttribute(
          "data-opcode",
          `${defaultSettings[settingGroupI].opcode}.${defaultSettings[settingGroupI].args[settingArgI].opcode}`,
        );
        arg.arg.appendChild(arg.input);

        if (
          defaultSettings[settingGroupI].args[settingArgI].hasOwnProperty(
            "description",
          )
        ) {
          arg.description = Object.assign(document.createElement("div"), {
            className: "us-stage-sc_gen_setting-list-arg-description",
            innerHTML: defaultSettings[settingGroupI].args[settingArgI].description,
          });
          arg.main.appendChild(arg.description);
        }
      }
    }
  }
  return settingGroups.map((settingGroup) => settingGroup.group);
};

export { defaultSettings, generateSettings };