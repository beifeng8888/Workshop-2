// src/router.tsx
import { createBrowserRouter, redirect } from "react-router-dom";
import LoginPage from "./login";
import CopilotDemo from "./chat";
import CodeLab from "./codelab";
/*
// 检查登录状态函数
async function checkAuthStatus() {
  try {
    const response = await fetch("/users/status", {
      method:"GET",
      credentials: "include", // 包含cookie
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // 检查状态码
      if (data.status === 0) { // 0: 已登录
        return { isAuthenticated: true, status: data.status };
      } else {
        return { isAuthenticated: false, status: data.status };
      }
    } else {
      return { isAuthenticated: false };
    }
  } catch (error) {
    return { isAuthenticated: false };
  }
}
*/
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    
  },
  {
    path: "/",
    element: <CopilotDemo />,
  },
  {
    path: "/workspace",
    element: <CodeLab />,
  }
]);