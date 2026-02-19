/**
 * Stub for react-devtools-core so the production bundle does not depend on it.
 * Ink only loads the real devtools when DEV=true; we alias to this so global
 * installs work without installing react-devtools-core.
 */
export default {
  initialize() {},
  connectToDevTools() {},
};
