import {
  escapeHTML,
  overrideFunction,
  defined,
  hex2Hsl,
  hsl2Hex,
} from "../utils/utils.js";

import icon from "../../assets/icon.svg";

export default (vm) => {
  // Methods
  const userscriptBlocks = {},
    usBlkParamNamesIdsDflt = {},
    getUserscriptBlock = (procedureCode) => {
      if (!Object.hasOwn(userscriptBlocks, procedureCode)) {
        return;
      }
      return userscriptBlocks[procedureCode];
    },
    parseArguments = (code) =>
      code
        .split(/(?=[^\\]%[nbs])/g)
        .map((i) => i.trim())
        .filter((i) => i.charAt(0) == "%")
        .map((i) => i.substring(0, 2)),
    fixDisplayName = (displayName) =>
      displayName.replace(
        /([^\s])(%[nbs])/g,
        (_, before, arg) => `${before} ${arg}`,
      ),
    getNamesIdsDefaults = (blockData) => [
      blockData.args,
      blockData.args.map((_, i) => `arg${i}`),
      blockData.args.map(() => ""),
    ],
    generateUsBlocksXML = () => {
      let xml = "";
      for (const procedureCode of Object.keys(userscriptBlocks)) {
        const blockData = userscriptBlocks[procedureCode];
        if (blockData.hidden) continue;
        const [names, ids, defaults] = getNamesIdsDefaults(blockData);
        if (blockData.type == "command") {
          xml +=
            '<block type="procedures_call" gap="16"><mutation generateshadows="true" warp="false"' +
            ` proccode="${escapeHTML(procedureCode)}"` +
            ` argumentnames="${escapeHTML(JSON.stringify(names))}"` +
            ` argumentids="${escapeHTML(JSON.stringify(ids))}"` +
            ` argumentdefaults="${escapeHTML(JSON.stringify(defaults))}"` +
            "></mutation></block>";
        } else if (blockData.type == "reporter") {
          xml +=
            '<block type="argument_reporter_string_number" gap="16">' +
            `<field name="VALUE">${escapeHTML(
              `\u200B\u200BuserscriptStageSizeChanger\u200B\u200B${JSON.stringify(
                {
                  id: blockData.id,
                },
              )}`,
            )}</field>` +
            '<mutation generateshadows="true" warp="false"' +
            ` proccode="${escapeHTML(procedureCode)}"` +
            "></mutation></block>";
        } else if (blockData.type == "boolean") {
          xml +=
            '<block type="argument_reporter_boolean" gap="16">' +
            `<field name="VALUE">${escapeHTML(
              `\u200B\u200BuserscriptStageSizeChanger\u200B\u200B${JSON.stringify(
                {
                  id: blockData.id,
                },
              )}`,
            )}</field>` +
            '<mutation generateshadows="true" warp="false"' +
            ` proccode="${escapeHTML(procedureCode)}"` +
            "></mutation></block>";
        }
      }
      return xml;
    },
    addUserscriptBlock = (
      procedureCode,
      displayName,
      args,
      type,
      handler,
      hidden,
    ) => {
      if (getUserscriptBlock(procedureCode)) {
        return;
      }
      const procCodeArgs = parseArguments(procedureCode);
      if (args.length !== procCodeArgs.length) {
        return;
      }
      if (defined(displayName)) {
        displayName = fixDisplayName(displayName);
        const displayNameArgs = parseArguments(displayName);
        if (JSON.stringify(procCodeArgs) != JSON.stringify(displayNameArgs)) {
          displayName = procedureCode;
        }
      } else {
        displayName = procedureCode;
      }
      const blockData = {
        id: procedureCode,
        displayName,
        args,
        type,
        handler,
        hidden,
      };
      userscriptBlocks[procedureCode] = blockData;
      usBlkParamNamesIdsDflt[procedureCode] = getNamesIdsDefaults(blockData);
    },
    applyToolboxPatches = (ScratchBlocks, blocksComponent) => {
      // "Get userscript's category color" method
      const getUsCategoryColor = () => {
        const themeConvert = (hex, type) => {
          const userscriptHsl = hex2Hsl(hex),
            newMotionHsl = hex2Hsl(type == "quaternary"
              ? ScratchBlocks.Colours.motion.quaternary ?? ScratchBlocks.Colours.motion.tertiary
              : ScratchBlocks.Colours.motion[type]),
            oldMotionHsl = hex2Hsl(
              {
                primary: "#4c97ff",
                secondary: "#4280d7",
                tertiary: "#3373cc",
                quaternary: "#3373cc",
              }[type],
            );
          return hsl2Hex(
            userscriptHsl[0],
            Math.max(
              Math.min(userscriptHsl[1] * (newMotionHsl[1] / oldMotionHsl[1]), 1),
              0,
            ),
            Math.max(
              Math.min(userscriptHsl[2] * (newMotionHsl[2] / oldMotionHsl[2]), 1),
              0,
            ),
          );
        };
        return {
          primary: themeConvert("#8c9abf", "primary"),
          secondary: themeConvert("#7d8aab", "secondary"),
          tertiary: themeConvert("#6f7b99", "tertiary"),
          quaternary: themeConvert("#6f7b99", "quaternary"),
        };
      };

      // Override color updating for recolor userscript's blocks and remove custom context menu
      if (defined(ScratchBlocks.registry)) {
        ScratchBlocks.BlockSvg.prototype.applyColour = overrideFunction(
          ScratchBlocks.BlockSvg.prototype.applyColour,
          function (ogMethod, ...args) {
            if (
              (!this.isInsertionMarker() && this.type == "procedures_call") ||
              ((this.type == "argument_reporter_string_number" ||
                this.type == "argument_reporter_boolean") &&
                this.inputList[0].fieldRow[0].text_.startsWith(
                  "\u200B\u200BuserscriptStageSizeChanger\u200B\u200B",
                ))
            ) {
              let id;
              if (this.type != "procedures_call") {
                try {
                  id = JSON.parse(
                    this.inputList[0].fieldRow[0].text_.replace(
                      /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                      "",
                    ),
                  ).id;
                } catch {}
              }
              const block =
                  this.type == "procedures_call"
                    ? this.procCode_ && getUserscriptBlock(this.procCode_)
                    : getUserscriptBlock(id),
                color = getUsCategoryColor();
              if (defined(block)) {
                this.style = {
                  ...this.style,
                  colourPrimary: color.primary,
                  colourSecondary: color.secondary,
                  colourTertiary: color.tertiary,
                  colourQuaternary: color.quaternary,
                };
                this.pathObject.setStyle(this.style);
                this.customContextMenu = null;
              }
            }
            return ogMethod(...args);
          },
        );
      } else {
        ScratchBlocks.BlockSvg.prototype.updateColour = overrideFunction(
          ScratchBlocks.BlockSvg.prototype.updateColour,
          function (ogMethod, ...args) {
            if (
              (!this.isInsertionMarker() && this.type == "procedures_call") ||
              ((this.type == "argument_reporter_string_number" ||
                this.type == "argument_reporter_boolean") &&
                this.inputList[0].fieldRow[0].text_.startsWith(
                  "\u200B\u200BuserscriptStageSizeChanger\u200B\u200B",
                ))
            ) {
              let id;
              if (this.type != "procedures_call") {
                try {
                  id = JSON.parse(
                    this.inputList[0].fieldRow[0].text_.replace(
                      /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                      "",
                    ),
                  ).id;
                } catch {}
              }
              const block =
                  this.type == "procedures_call"
                    ? this.procCode_ && getUserscriptBlock(this.procCode_)
                    : getUserscriptBlock(id),
                color = getUsCategoryColor();
              if (defined(block)) {
                this.colour_ = color.primary;
                this.colourSecondary_ = color.secondary;
                this.colourTertiary_ = color.tertiary;
                this.colourQuaternary_ = color.quaternary;
                this.customContextMenu = null;
              }
            }
            return ogMethod(...args);
          },
        );
      }

      // Override render for change text in userscript's reporter blocks
      ScratchBlocks.BlockSvg.prototype.render = overrideFunction(
        ScratchBlocks.BlockSvg.prototype.render,
        function (ogMethod, optBubble) {
          if (
            (this.type == "argument_reporter_string_number" ||
              this.type == "argument_reporter_boolean") &&
            this.inputList[0].fieldRow[0].text_.startsWith(
              "\u200B\u200BuserscriptStageSizeChanger\u200B\u200B",
            )
          ) {
            const ogText = this.inputList[0].fieldRow[0].text_;
            try {
              this.inputList[0].fieldRow[0].text_ = getUserscriptBlock(
                JSON.parse(
                  this.inputList[0].fieldRow[0].text_.replace(
                    /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                    "",
                  ),
                ).id,
              ).displayName;
            } catch {
              return ogMethod(optBubble);
            }
            const result = ogMethod(optBubble);
            this.inputList[0].fieldRow[0].textElement_.innerHTML =
              this.inputList[0].fieldRow[0].text_.replace(" ", "\u00A0");
            const textWidth =
              this.inputList[0].fieldRow[0].textElement_.getBBox().width;
            this.inputList[0].fieldRow[0].textElement_.setAttribute(
              "x",
              textWidth / 2,
            );
            this.svgPath_.setAttribute(
              "d",
              this.svgPath_
                .getAttribute("d")
                .replace(
                  new RegExp(`(?<=m ${this.height / 2},0 H )\\d*\.?\\d+`),
                  textWidth +
                    this.inputList[0].fieldRow[0].textElement_.transform
                      .baseVal[0].matrix.e *
                      2 -
                    this.height / 2,
                ),
            );
            this.width =
              textWidth +
              this.inputList[0].fieldRow[0].textElement_.transform.baseVal[0]
                .matrix.e *
                2;
            this.inputList[0].fieldRow[0].text_ = ogText;
            return result;
          } else {
            return ogMethod(optBubble);
          }
        },
      );

      // Override getting extensions XML for create userscript's category
      vm.runtime.getBlocksXML = overrideFunction(
        vm.runtime.getBlocksXML,
        (ogMethod, target) => {
          const result = ogMethod(target);
          result.unshift({
            id: "us-stage-sc",
            xml:
              "<category" +
              ' name="StageSC"' +
              ` ${ScratchBlocks.registry ? "toolboxitemid" : "id"}="us-stage-sc"` +
              ` colour="${getUsCategoryColor().primary}"` +
              ` secondaryColour="${getUsCategoryColor().tertiary}"` +
              ` iconURI="${icon}"` +
              `>${generateUsBlocksXML()}</category>`,
          });
          return result;
        },
      );

      // Tricking Scratch into thinking userscript's blocks are defined somewhere
      if (!defined(ScratchBlocks.registry)) {
        ScratchBlocks.Procedures.getDefineBlock = overrideFunction(
          ScratchBlocks.Procedures.getDefineBlock,
          (ogMethod, procedureCode, workspace) => {
            const result = ogMethod(procedureCode, workspace);
            if (result) {
              return result;
            }
            const block = getUserscriptBlock(procedureCode);
            if (block) {
              return {
                workspace,
                getInput() {
                  return {
                    connection: {
                      targetBlock() {
                        return null;
                      },
                    },
                  };
                },
              };
            }
            return result;
          },
        );
      }

      // Override creating inputs for userscript's command blocks and make the newly copied
      // userscript's block use default drag strategy, then remove the original one.
      const newCreateAllInputs = (ogMethod) =>
        function (...args) {
          const blockData = getUserscriptBlock(this.procCode_);
          if (defined(blockData)) {
            const ogProcedureCode = this.procCode_;
            this.procCode_ = blockData.displayName;
            const ret = ogMethod.call(this, ...args);
            this.procCode_ = ogProcedureCode;
            return ret;
          }
          return ogMethod.call(this, ...args);
        };
      if (defined(ScratchBlocks.registry)) {
        ScratchBlocks.Block.prototype.doInit_ = overrideFunction(
          ScratchBlocks.Block.prototype.doInit_,
          function (ogMethod, ...args) {
            const result = ogMethod(...args);
            if (this.type == "procedures_call") {
              const ogCreateAllInputs = this.createAllInputs_;
              this.createAllInputs_ = newCreateAllInputs(ogCreateAllInputs);
              return result;
            }
          },
        );
        ScratchBlocks.Blocks.argument_reporter_string_number.init =
          overrideFunction(
            ScratchBlocks.Blocks.argument_reporter_string_number.init,
            (ogMethod) => {
              ogMethod();
              queueMicrotask(() => {
                if (
                  !this.getFieldValue("VALUE").startsWith(
                    "\u200B\u200BuserscriptStageSizeChanger\u200B\u200B",
                  ) ||
                  this.dragStrategy instanceof
                    ScratchBlocks.dragging.BlockDragStrategy ||
                  this.isInFlyout
                ) {
                  return;
                }
                let block;
                try {
                  block = getUserscriptBlock(
                    JSON.parse(
                      this.getFieldValue("VALUE").replace(
                        /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                        "",
                      ),
                    ).id,
                  );
                } catch {
                  return;
                }
                if (defined(block)) {
                  this.setDragStrategy(
                    new ScratchBlocks.dragging.BlockDragStrategy(this),
                  );
                  this.dragStrategy.block?.dispose();
                }
              });
            },
          );
        ScratchBlocks.Blocks.argument_reporter_boolean.init = overrideFunction(
          ScratchBlocks.Blocks.argument_reporter_boolean.init,
          (ogMethod) => {
            ogMethod();
            queueMicrotask(() => {
              if (
                !this.getFieldValue("VALUE").startsWith(
                  "\u200B\u200BuserscriptStageSizeChanger\u200B\u200B",
                ) ||
                this.dragStrategy instanceof
                  ScratchBlocks.dragging.BlockDragStrategy ||
                this.isInFlyout
              ) {
                return;
              }
              let block;
              try {
                block = getUserscriptBlock(
                  JSON.parse(
                    this.getFieldValue("VALUE").replace(
                      /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                      "",
                    ),
                  ).id,
                );
              } catch {
                return;
              }
              if (defined(block)) {
                this.setDragStrategy(
                  new ScratchBlocks.dragging.BlockDragStrategy(this),
                );
                this.dragStrategy.block?.dispose();
              }
            });
          },
        );
      } else {
        const ogCreateAllInputs =
          ScratchBlocks.Blocks.procedures_call.createAllInputs_;
        ScratchBlocks.Blocks.procedures_call.createAllInputs_ =
          newCreateAllInputs(ogCreateAllInputs);
      }

      // Update workspace and toolbox
      ScratchBlocks.Events.disable();
      const workspace = ScratchBlocks.getMainWorkspace();
      ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(
        ScratchBlocks.Xml.workspaceToDom(workspace),
        workspace,
      );
      if (defined(blocksComponent.getToolboxXML())) {
        workspace.updateToolbox(blocksComponent.getToolboxXML());
      }
      if (defined(ScratchBlocks.registry)) {
        workspace.getToolbox().forceRerender();
      } else {
        workspace.getToolbox().refreshSelection();
        workspace.toolboxRefreshEnabled_ = true;
      }
      ScratchBlocks.Events.enable();
      console.log(
        "%c %cToolbox patches applied",
        `font-size: 1px; padding: 10px 10px; background: no-repeat url(${icon}); margin-right: 0.25rem;`,
        "",
      );
    };

  // Override getting procedure params things
  vm.runtime.monitorBlocks.constructor.prototype.getProcedureParamNamesIdsAndDefaults =
    overrideFunction(
      vm.runtime.monitorBlocks.constructor.prototype
        .getProcedureParamNamesIdsAndDefaults,
      (ogMethod, name) => {
        return usBlkParamNamesIdsDflt[name] || ogMethod(name);
      },
    );

  // Override procedure stepping for handle userscript's command blocks
  vm.runtime.sequencer.stepToProcedure = overrideFunction(
    vm.runtime.sequencer.stepToProcedure,
    (ogMethod, thread, procedureCode) => {
      const blockData = getUserscriptBlock(procedureCode);
      if (defined(blockData)) {
        const stackFrame = thread.peekStackFrame();
        blockData.handler(stackFrame.params, thread);
        return;
      }
      return ogMethod(thread, procedureCode);
    },
  );

  // Override primitive of non-boolean arg reporter for handle userscript's reporter blocks
  vm.runtime._primitives.argument_reporter_string_number = overrideFunction(
    vm.runtime._primitives.argument_reporter_string_number,
    (ogMethod, args, util) => {
      const flag = String(args.VALUE),
        value = util.getParam(flag);
      if (value == null) {
        let id;
        if (
          flag.startsWith("\u200B\u200BuserscriptStageSizeChanger\u200B\u200B")
        ) {
          try {
            id = JSON.parse(
              flag.replace(
                /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                "",
              ),
            ).id;
          } catch {}
        }
        const blockData = getUserscriptBlock(id);
        return defined(blockData)
          ? blockData.handler(args, util)
          : ogMethod?.(args, util);
      }
      return value;
    },
  );

  // Override primitive of boolean arg reporter for handle userscript's boolean blocks
  vm.runtime._primitives.argument_reporter_boolean = overrideFunction(
    vm.runtime._primitives.argument_reporter_boolean,
    (ogMethod, args, util) => {
      const flag = String(args.VALUE),
        value = util.getParam(flag);
      if (value == null) {
        let id;
        if (
          flag.startsWith("\u200B\u200BuserscriptStageSizeChanger\u200B\u200B")
        ) {
          try {
            id = JSON.parse(
              flag.replace(
                /^\u200B\u200BuserscriptStageSizeChanger\u200B\u200B/,
                "",
              ),
            ).id;
          } catch {}
        }
        const blockData = getUserscriptBlock(id);
        return defined(blockData)
          ? blockData.handler(args, util)
          : ogMethod?.(args, util);
      }
      return value;
    },
  );
  return { addUserscriptBlock, applyToolboxPatches };
};