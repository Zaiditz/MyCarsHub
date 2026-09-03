import { Outlet } from "react-router";
import Navbar from "./Components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
