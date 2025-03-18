import React, { useState, Suspense } from "react";
import SlowComponent from "./components/SlowComponent";

const App = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="App">
      <h1>Vite + React 18 + TypeScript SSR 예제</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          카운트: {count}
        </button>
        <p>
          React 18과 Vite 그리고 TypeScript를 이용한 서버사이드 렌더링
          예제입니다.
        </p>
      </div>

      <Suspense fallback={<div className="loading">로딩 중...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
};

export default App;
