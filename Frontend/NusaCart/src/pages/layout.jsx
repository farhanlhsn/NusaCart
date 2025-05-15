import React from "react";
import Footer from "../components/footer"; 
import Navbar from "../components/navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="main-content flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}