import { asyncQuerySelector } from "./utils/asyncQuery.js"
import { defined } from "./utils/utils.js";

const getReduxStore = async () => {
    await asyncQuerySelector("#app *");
    let wrapper = document.querySelector("#app");
    const internal = wrapper?._reactRootContainer?.current ?? (() => {
      let reactContainerKey = Object.keys(wrapper).find((key) =>
        key.startsWith("__reactContainer$"),
      );
      return wrapper[reactContainerKey];
    })();
    let childable = internal;
    while (!defined(childable?.memoizedProps?.store)) {
      childable = childable.child;
    }
    return childable.memoizedProps.store;
  },
  getBlocksComponent = async () => {
    let wrapper = await asyncQuerySelector('[class^="gui_blocks-wrapper"]');
    let reactInternalKey = Object.keys(wrapper).find((key) =>
      key.startsWith("__reactInternalInstance$") ||
      key.startsWith("__reactFiber$"),
    );
    const internal = wrapper[reactInternalKey];
    let childable = internal;
    while (!defined(childable?.stateNode?.ScratchBlocks)) {
      childable = childable.child;
    }
    return childable.stateNode;
  };

export { getReduxStore, getBlocksComponent };