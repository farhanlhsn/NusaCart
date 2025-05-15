import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import LoginPage from "./LoginPage";
import ErrorPage from "./ErrorPage";
import UserRegisterPage from "./UserRegisterPage";
import UserSuccesRegisterPage from "./UserSuccesRegisterPage";
import HomePage from "./HomePage";
/* import ForgotPasswordPage from "./ForgotPasswordPage"; */

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },  
  {
    path: "/register",
    element: <UserRegisterPage />,
  },
  {
    path: "/register/success",
    element: <UserSuccesRegisterPage />,
  },
  /* {
    path: "/forgot",
    element: <ForgotPasswordPage />,
  }, */
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
    ],
  },
]);