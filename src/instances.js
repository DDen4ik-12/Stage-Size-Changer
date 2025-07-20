import { asyncQuerySelector } from "./utils/asyncQuery.js"

const asyncGetStageWrapperState = async () =>
    Object.values(
      await asyncQuerySelector('div[class^="stage-wrapper_stage-wrapper_"]'),
    ).find((x) => x.child).child.child.child.stateNode,
  getStageWrapperState = () =>
    Object.values(
      document.querySelector('div[class^="stage-wrapper_stage-wrapper_"]'),
    ).find((x) => x.child).child.child.child.stateNode,
  getBlocksComponent = async () => {
    let wrapper = await asyncQuerySelector('[class^="gui_blocks-wrapper"]');
    let reactInternalKey = Object.keys(wrapper).find((key) =>
      key.startsWith("__reactInternalInstance$"),
    );
    const internal = wrapper[reactInternalKey];
    let childable = internal;
    while (
      ((childable = childable.child),
      !childable ||
        !childable.stateNode ||
        !childable.stateNode.ScratchBlocks)
    ) {}
    return childable.stateNode;
  };

export {
  asyncGetStageWrapperState,
  getStageWrapperState,
  getBlocksComponent,
};