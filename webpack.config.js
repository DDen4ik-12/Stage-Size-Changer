import path from "path";
import { UserscriptPlugin } from "webpack-userscript";
import { fileURLToPath } from "url";

console.log(
  "Build will be stored in:",
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "build"),
);

export default {
  entry: "./src/index.js",
  output: {
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "build"),
    filename: "stageSizeChanger.js",
  },
  module: {
    rules: [
      {
        test: /\.(svg|png)$/,
        loader: "url-loader",
      },
      {
        test: /\.(css)$/,
        loader: "raw-loader",
      },
    ],
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "stageSizeChanger",
        version: "1.0-beta.1",
        author: "Den4ik-12",
        description: "Userscript for the Scratch and Scratch Lab websites that allows you to change the stage size from 480×360 to something else",
        match: [
          "https://scratch.mit.edu/projects/*",
          "https://lab.scratch.mit.edu/*/*",
        ],
        grant: [
          "GM_setValues",
          "GM_getValues",
          "GM_listValues",
          "GM_getValue",
          "GM_addValueChangeListener",
          "unsafeWindow",
        ],
        "run-at": "document-start",
        namespace: "stageSizeChanger",
        downloadURL: "https://github.com/DDen4ik-12/Stage-Size-Changer/releases/latest/download/stageSizeChanger.user.js",
        updateURL: "https://github.com/DDen4ik-12/Stage-Size-Changer/releases/latest/download/stageSizeChanger.meta.js",
      },
    }),
  ],
};