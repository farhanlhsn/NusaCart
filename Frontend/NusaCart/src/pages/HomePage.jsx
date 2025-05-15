import React from "react";
import axios from "axios";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { logout, Token } = useAuthStore();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Sending data to server:", Token);
			const response = await axios.post("/api/auth/logout", Token);
            logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Home Page</h1>
            <form className="w-full max-w-md space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                <button type="submit">Logout</button>
            </form>
        </div>
    );
}