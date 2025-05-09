import { createBrowserRouter } from "react-router-dom";
/* import HomePage from "./HomePage";
import AboutMe from "./AboutMe";
import Projects from "./Projects";
import Error from "./Error"; */
import Layout from "./layout";
import LoginPage from "./LoginPage";

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      /* errorElement: <Error />, */
      children: [
/*         {
          index: true,
          element: <HomePage />,
        },
        {
          path: "AboutMe",
          element: <AboutMe />,
        },
        {
          path: "Projects",
          element: <Projects />,
        }, */
        {
          path: "login",
          element: <LoginPage />,
        },
      ],
    }
  ]);