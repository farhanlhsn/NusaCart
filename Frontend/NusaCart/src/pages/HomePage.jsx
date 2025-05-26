import React, { useState } from "react";
import api from "../services/api";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import EditProfile from "../components/EditProfile"; // Import komponen EditProfile

export default function HomePage() {
    const { logout, accessToken, user } = useAuthStore();
    const navigate = useNavigate();
    const [showEditProfile, setShowEditProfile] = useState(false); // State untuk menampilkan/menyembunyikan EditProfile
    
    const handleLogoutSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gunakan instance api yang sudah diimpor dengan token
            await api.post("/api/auth/logout", {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            // Panggil fungsi logout dari zustand
            logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Konstruksi URL gambar profil
    const profileImageUrl = user && user.profilePicture 
        ? `http://localhost:6060${user.profilePicture}` 
        : null; // Atau gambar placeholder jika tidak ada foto profil

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Home Page</h1>
            
            {/* Bingkai Foto Profil */}
            {profileImageUrl ? (
                <div className="mb-4 p-1 border-2 border-gray-300 rounded-full shadow-md">
                    <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover" 
                    />
                </div>
            ) : (
                <div className="mb-4 p-1 border-2 border-gray-300 rounded-full shadow-md">
                    {/* Placeholder jika tidak ada gambar atau user tidak login */}
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                    </div>
                </div>
            )}

            <p className="mb-2">Selamat datang, {user ? user.name : "Pengguna"}!</p>
            <p className="mb-4 text-sm text-gray-600">{user ? user.email : ""}</p>

            {/* Tombol Edit Profile */}
            <button 
                onClick={() => setShowEditProfile(true)}
                className="w-full max-w-xs py-2 px-4 mb-3 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Edit Profile
            </button>

            <form className="w-full max-w-xs space-y-3 md:space-y-4" onSubmit={handleLogoutSubmit}>
                <button 
                    type="submit"
                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                >
                    Logout
                </button>
            </form>

            {/* Modal Edit Profile */}
            {showEditProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-3xl">
                        <button 
                            onClick={() => setShowEditProfile(false)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <EditProfile onClose={() => setShowEditProfile(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}