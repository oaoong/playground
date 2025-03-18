import React from "react";

const SlowComponent = () => {
  return (
    <div className="slow-component">
      <h2>서버에서 렌더링된 지연 컴포넌트</h2>
      <p>이 컴포넌트는 Suspense를 통해 렌더링됩니다.</p>
    </div>
  );
};

export default SlowComponent;
