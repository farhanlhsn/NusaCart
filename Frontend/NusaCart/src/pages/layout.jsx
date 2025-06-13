import React from "react";
import Footer from "../components/footer"; 
import Navbar from "../components/navbar";
import { Outlet } from "react-router-dom";
import NotificationSystem, { useNotifications } from "../components/NotificationSystem";

export default function Layout() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="main-content flex-grow">
        <Outlet />
      </main>
      <Footer />
      <NotificationSystem 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
}