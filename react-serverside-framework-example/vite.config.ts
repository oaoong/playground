import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    manifest: true, // 매니페스트 파일 생성
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
      },
      output: {
        // 출력 파일명 패턴 설정
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  ssr: {
    noExternal: ["react-dom"],
  },
});
