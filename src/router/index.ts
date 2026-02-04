import { createBrowserRouter } from "react-router"
import App from "../App.tsx"
import RootLayout from "../layouts/RootLayout/RootLayout.tsx"
import Home from "../pages/Home.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: App },
      { path: "home", Component: Home }
    ]
  }
])

export default router
