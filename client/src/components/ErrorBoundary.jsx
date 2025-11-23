// --- /client/src/ErrorBoundary.jsx (新檔案 - 解決問題二：崩潰) ---

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次 render 顯示備用 UI
    console.error("ErrorBoundary 捕捉到一個 3D 渲染錯誤 (很可能是 useTexture):", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你也可以在這裡記錄錯誤
    console.error("ErrorBoundary Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 當 3D 模型載入失敗 (例如 VinylModel 的封面)，
      // 我們只 render 'null'，這樣 3D 會消失，但 UI 不會崩潰。
      return null; 
    }

    // 如果沒有錯誤，正常 render 子組件
    return this.props.children; 
  }
}

export default ErrorBoundary;