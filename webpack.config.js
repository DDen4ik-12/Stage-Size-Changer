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
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: "stageSizeChangerNew",
        version: "1.0-beta.1",
        author: "Den4ik-12",
        description: "Userscript for the Scratch website that allows you to resize the scene.",
        match: [
          "https://scratch.mit.edu/projects/*",
          "https://lab.scratch.mit.edu/*",
        ],
        grant: "none",
        "run-at": "document-start",
        namespace: "stageSizeChangerNew",
        downloadURL: "https://raw.githubusercontent.com/DDen4ik-12/Stage-Size-Changer/refs/heads/main/stageSizeChanger.user.js",
        updateURL: "https://raw.githubusercontent.com/DDen4ik-12/Stage-Size-Changer/refs/heads/main/stageSizeChanger.meta.js",
      },
    }),
  ],
};