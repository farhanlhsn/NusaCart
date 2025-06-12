import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";

export default function tentang() {
    const navigate = useNavigate();
    const [imageErrors, setImageErrors] = useState({});
    // Data team members
    const teamMembers = [
        {
            name: "Athallah Zacky Maulana",
            position: "Back End Developer",
            image: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
            name: "Muhammad Farhan Al Hasan",
            position: "Full Stack Developer",
            image: "https://randomuser.me/api/portraits/men/2.jpg"
        },
        {
            name: "Akbar Maulana Perdana",
            position: "Back End Developer",
            image: "https://randomuser.me/api/portraits/men/5.jpg"
        },
        {
            name: "Fikri Anwar",
            position: "UI/UX Designer & Back End Developer",
            image: "https://randomuser.me/api/portraits/men/4.jpg"
        },
        {
            name: "Adi Bintang Syahputra",
            position: "UI/UX Designer & Back End Developer",
            image: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
            name: "Ali Hizqil Syauqani",
            position: "UI/UX Designer & Back End Developer",
            image: "https://randomuser.me/api/portraits/men/6.jpg"
        }
    ];
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <button 
                            onClick={() => navigate('/')}
                            className="hover:text-red-600 cursor-pointer transition-colors"
                        >
                            Beranda
                        </button>
                        <span>|</span>
                        <span className="text-red-600 font-medium">Tentang</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    {/* About Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Description */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-6">Tentang NusaCart</h1>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                NusaCart adalah platform e-commerce terdepan di Indonesia yang menghubungkan 
                                jutaan pembeli dan penjual dalam satu ekosistem digital yang aman dan terpercaya.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                Dengan teknologi terkini dan layanan pelanggan yang prima, kami berkomitmen 
                                untuk memberikan pengalaman berbelanja online yang mudah, cepat, dan menyenangkan.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-red-50 px-4 py-2 rounded-lg">
                                    <span className="text-red-600 font-semibold">1M+ Pengguna</span>
                                </div>
                                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                    <span className="text-blue-600 font-semibold">100K+ Produk</span>
                                </div>
                                <div className="bg-green-50 px-4 py-2 rounded-lg">
                                    <span className="text-green-600 font-semibold">500+ Kota</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Logo */}
                        <div className="flex items-center justify-center">
                            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl">
                                <img 
                                    src={logo} 
                                    alt="NusaCart Logo" 
                                    className="w-full max-w-md h-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold text-blue-800 mb-4">Visi Kami</h3>
                            <p className="text-blue-700 leading-relaxed">
                                Menjadi platform e-commerce terdepan yang menghubungkan seluruh Nusantara 
                                dalam satu ekosistem digital yang inklusif dan berkelanjutan.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold text-green-800 mb-4">Misi Kami</h3>
                            <p className="text-green-700 leading-relaxed">
                                Memberdayakan UMKM Indonesia dengan teknologi digital, menciptakan lapangan kerja, 
                                dan meningkatkan kesejahteraan masyarakat melalui perdagangan elektronik.
                            </p>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tim Kami</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Dibangun oleh tim profesional yang berpengalaman dan berdedikasi 
                            untuk menghadirkan inovasi terbaik dalam dunia e-commerce.
                        </p>
                    </div>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-red-200 bg-gray-100">
                                    {imageErrors[index] || !member.image ? (
                                        <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                            <img 
                                                src={logo} 
                                                alt={member.name} 
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <img 
                                            src={member.image} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover"
                                            onLoad={() => console.log(`Loaded: ${member.name}`)}
                                            onError={(e) => {
                                                console.log(`Error loading image for ${member.name}:`, member.image);
                                                setImageErrors(prev => ({...prev, [index]: true}));
                                            }}
                                        />
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">{member.name}</h4>
                                <p className="text-sm text-gray-500">{member.position}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-4">Hubungi Kami</h3>
                        <p className="text-red-100 mb-6">
                            Punya pertanyaan atau ingin bergabung dengan NusaCart? 
                            Jangan ragu untuk menghubungi tim kami.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={() => window.open('mailto:fikrianwar036@gmail.com', '_blank')} className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                                Email Kami
                            </button>
                            <button onClick={() => window.open('https://wa.me/6281380542261', '_blank')} className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
