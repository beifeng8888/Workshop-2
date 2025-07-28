// src/router.tsx
import { createBrowserRouter, redirect } from "react-router-dom";
import LoginPage from "./login"; // 您的登录页面组件
import CopilotDemo from "./chat"; // 您的主页面组件
import CodeLab from "./codelab";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <CopilotDemo />,
    // 添加路由守卫，确保只有登录用户才能访问
    loader: () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        return redirect("/login");
      }
      return null;
    }
  },
  {
    path:"/workspace",
    element: <CodeLab/>,
     loader: () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        return redirect("/login");
      }
      return null;
    }
  }
]);