import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "./App";
import Home from "./Pages/Home";
import Cars from "./Pages/Cars";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import CarDetails from "./Pages/CarDetails";
import Compare from "./Components/Compare";
import SavedCars from "./Pages/SavedCars";
import SellCar from "./Pages/SellCar";
import MyListings from "./Pages/MyListings";
import EditCar from "./Pages/EditCar";
import Chat from "./Pages/Chat";
import Messages from "./Pages/Messages";
import SellerDashboard from "./Pages/SellerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,

    children: [
      {
        index: true,
        Component: Home,
      },

      {
        path: "cars",
        Component: Cars,
      },

      {
        path: "login",
        Component: Login,
      },

      {
        path: "signup",
        Component: Signup,
      },

      {
        path: "cars/:id",
        Component: CarDetails,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "cars/:id/edit",
            Component: EditCar,
          },

          {
            path: "chat/car/:carId",
            Component: Chat,
          },

          {
            path: "chat/conversation/:conversationId",
            Component: Chat,
          },

          {
            path: "compare",
            Component: Compare,
          },

          {
            path: "saved",
            Component: SavedCars,
          },

          {
            path: "messages",
            Component: Messages,
          },

          {
            path: "sell",
            Component: SellCar,
          },

          {
            path: "my-listings",
            Component: MyListings,
          },

          {
            path: "seller-dashboard",
            Component: SellerDashboard,
          },
        ],
      },

      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          {
            path: "admin",
            Component: AdminDashboard,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);