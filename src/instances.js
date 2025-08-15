import { asyncQuerySelector } from "./utils/asyncQuery.js"
import { defined } from "./utils/utils.js";

const getReduxStore = async () => {
    await asyncQuerySelector("#app *");
    let wrapper = document.querySelector("#app");
    const internalRoot = wrapper._reactRootContainer._internalRoot ?? wrapper._reactRootContainer;
    let childable = internalRoot.current;
    while (!defined(childable?.memoizedProps?.store)) {
      childable = childable.child;
    }
    return childable.memoizedProps.store;
  },
  getBlocksComponent = async () => {
    let wrapper = await asyncQuerySelector('[class^="gui_blocks-wrapper"]');
    let reactInternalKey = Object.keys(wrapper).find((key) =>
      key.startsWith("__reactInternalInstance$"),
    );
    const internal = wrapper[reactInternalKey];
    let childable = internal;
    while (!defined(childable?.stateNode?.ScratchBlocks)) {
      childable = childable.child;
    }
    return childable.stateNode;
  };

export { getReduxStore, getBlocksComponent };