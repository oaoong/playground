import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { renderToString } from "react-dom/server";
import React from "react";
import compression from "compression";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

interface ServerEntryModule {
  render: () => React.ReactElement;
}

async function createServer() {
  const app = express();
  app.use(compression());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let vite: any;

  if (!isProduction) {
    // 개발 모드: Vite 개발 서버 설정
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);
  } else {
    // 프로덕션 모드: 정적 파일 제공
    app.use(express.static(path.resolve(__dirname, "../dist/client")));
  }

  app.use("*", async (req: Request, res: Response) => {
    const url = req.originalUrl;

    try {
      // HTML 템플릿 가져오기
      let template: string;

      if (!isProduction) {
        // 개발 모드: Vite를 통해 템플릿 변환
        template = fs.readFileSync(
          path.resolve(__dirname, "../index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
      } else {
        // 프로덕션 모드: 빌드된 템플릿 사용
        template = fs.readFileSync(
          path.resolve(__dirname, "../dist/client/index.html"),
          "utf-8"
        );
      }

      // 서버 엔트리 모듈 불러오기
      let render: ServerEntryModule["render"];

      if (!isProduction) {
        // 개발 모드: Vite를 통해 서버 엔트리 모듈 변환
        const entryModule = (await vite.ssrLoadModule(
          "/src/entry-server.tsx"
        )) as ServerEntryModule;
        render = entryModule.render;
      } else {
        // 프로덕션 모드: 빌드된 서버 엔트리 모듈 사용
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverPath = path.resolve(
          __dirname,
          "../dist/server/assets/entry-server.js"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entryModule = (await import(serverPath)) as any;
        render = entryModule.render;
      }

      // HTML 템플릿 파싱 - root 마운트 포인트 이전과 이후로 분리
      const [htmlStart, htmlEnd] = template.split(`<div id="root"></div>`);

      // 컴포넌트를 문자열로 렌더링
      const appHtml = renderToString(render());

      // 클라이언트 스크립트 설정
      const clientScript = isProduction
        ? '<script type="module" src="/assets/main.js"></script>'
        : '<script type="module" src="/src/entry-client.tsx"></script>';

      // 완성된 HTML 응답
      const html = `${htmlStart}<div id="root">${appHtml}</div>${clientScript}${htmlEnd}`;

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.end(html);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      vite?.ssrFixStacktrace(error);
      console.error("SSR 오류:", error);
      res.status(500).send("서버 오류가 발생했습니다");
    }
  });

  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다`);
  });
}

createServer();
