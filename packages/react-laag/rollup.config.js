const path = require("path");
const { terser } = require("rollup-plugin-terser");
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const resolve = require("@rollup/plugin-node-resolve").default;
const sourceMaps = require("rollup-plugin-sourcemaps");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const { DEFAULT_EXTENSIONS: DEFAULT_BABEL_EXTENSIONS } = require("@babel/core");

const external = id => !id.startsWith(".") && !path.isAbsolute(id);

const getOutputName = (format, minify, env) =>
  [
    path.join(__dirname, "dist", "react-laag"),
    format,
    env,
    minify ? "min" : "",
    "js"
  ]
    .filter(Boolean)
    .join(".");

const outputBase = {
  freeze: false,
  esModule: true,
  name: "react-laag",
  sourcemap: true,
  globals: { react: "React" },
  exports: "named"
};

/** @type {import("rollup").RollupOptions } */
const options = {
  input: path.join(__dirname, "src", "index.ts"),
  external,

  output: [
    {
      file: getOutputName("cjs", true, "production"),
      format: "cjs",
      ...outputBase,
      plugins: [
        terser({
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
            passes: 10
          },
          ecma: 5,
          toplevel: true,
          warnings: true
        })
      ]
    },
    {
      file: getOutputName("cjs", false, "development"),
      format: "cjs",
      ...outputBase
    },
    {
      file: getOutputName("esm", false, undefined),
      format: "esm",
      ...outputBase
    }
  ],

  plugins: [
    resolve({
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    typescript({
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
      sourceMap: true,
      declaration: true,
      declarationDir: "dist/types"
    }),
    babel({
      extensions: [...DEFAULT_BABEL_EXTENSIONS, ".ts", ".tsx"],
      exclude: "node_modules/**",
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            loose: true,
            targets: "last 3 versions, IE 11, not dead"
          }
        ],
        "@babel/preset-react"
      ],
      plugins: [
        "babel-plugin-macros",
        "babel-plugin-annotate-pure-calls",
        "babel-plugin-dev-expression",
        ["babel-plugin-polyfill-regenerator", { method: "usage-pure" }],
        ["@babel/plugin-proposal-class-properties", { loose: true }]
      ]
    }),
    sourceMaps()
  ]
};

module.exports = options;
