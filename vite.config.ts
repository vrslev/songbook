import vue from "@vitejs/plugin-vue";
import type { NodeTransform } from "@vue/compiler-core";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { fileURLToPath, URL } from "url";
// @ts-ignore
import vitePluginFaviconsInject from "vite-plugin-favicons-inject";
import { defineConfig } from "vitest/config";

const isProd = process.env.NODE_ENV == "production";

// https://github.com/vitejs/vite/issues/636#issuecomment-665545551
const stripDataTestTags: NodeTransform = (node) => {
  if (node.type != 1) return; // NodeTypes.ELEMENT
  for (let idx = 0; idx < node.props.length; idx++) {
    const prop = node.props[idx];
    // NodeTypes.ATTRIBUTE
    if (prop.type == 6 && prop.name == "data-test") {
      node.props.splice(idx, 1);
      idx--;
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./frontend", import.meta.url)),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          nodeTransforms: isProd ? [stripDataTestTags] : undefined,
        },
      },
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ["./frontend/components"],
      dts: "frontend/components.d.ts",
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue-router"],
      eslintrc: {
        enabled: true,
      },
      dts: "frontend/auto-imports.d.ts",
    }),

    // https://github.com/JohnPremKumar/vite-plugin-favicons-inject
    isProd // https://github.com/JohnPremKumar/vite-plugin-favicons-inject/issues/3
      ? vitePluginFaviconsInject("./design/favicon.svg", {
          appName: "Songbook",
          appShortName: "Songbook",
          appDescription: "Chords and lyrics",
        })
      : null,
  ],

  test: {
    globals: true,
    environment: "happy-dom",
    coverage: { exclude: ["frontend/client"] },
    setupFiles: "tests/frontend/setup.ts",
  },
});
