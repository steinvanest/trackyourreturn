// De "@/..."-imports in src/ werken alleen tijdens het bundelen dankzij deze plugin
// (tsconfig.json regelt alleen de TypeScript-typechecking, niet de Metro-bundler).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: { "@": "./src" },
        },
      ],
    ],
  };
};
