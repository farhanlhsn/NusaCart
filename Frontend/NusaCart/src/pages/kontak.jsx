import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function kontak() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            alert('Pesan Anda telah terkirim! Kami akan segera merespon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    const contactMethods = [
        {
            icon: (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: "Telepon",
            subtitle: "Hubungi kami langsung",
            info: "+62 813-8054-2261",
            action: () => window.open('tel:+6281380542261'),
            bgColor: "bg-blue-50",
            textColor: "text-blue-800"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: "Email",
            subtitle: "Kirim pesan email",
            info: "fikrianwar036@gmail.com",
            action: () => window.open('mailto:fikrianwar036@gmail.com'),
            bgColor: "bg-green-50",
            textColor: "text-green-800"
        },
        {
            icon: (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "WhatsApp",
            subtitle: "Chat dengan kami",
            info: "+62 813-8054-2261",
            action: () => window.open('https://wa.me/6281380542261?text=Halo%20NusaCart,%20saya%20ingin%20bertanya...'),
            bgColor: "bg-purple-50",
            textColor: "text-purple-800"
        }
    ];

    const faqs = [
        {
            question: "Bagaimana cara melacak pesanan saya?",
            answer: "Anda dapat melacak pesanan melalui halaman 'Pesanan Saya' di akun Anda atau melalui link tracking yang dikirim via email."
        },
        {
            question: "Berapa lama proses pengiriman?",
            answer: "Pengiriman standar memakan waktu 2-5 hari kerja, tergantung lokasi Anda. Untuk pengiriman express tersedia layanan same day atau next day."
        },
        {
            question: "Bagaimana kebijakan pengembalian barang?",
            answer: "Kami menerima pengembalian dalam 7 hari setelah barang diterima, dengan syarat barang masih dalam kondisi asli dan kemasan belum dibuka."
        },
        {
            question: "Apakah ada biaya pengiriman?",
            answer: "Kami menyediakan gratis ongkir untuk pembelian di atas Rp 100.000. Untuk pembelian di bawah itu, biaya pengiriman dihitung berdasarkan jarak dan berat barang."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <button 
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                className="hover:text-red-600 cursor-pointer transition-colors"
                            >
                                Beranda
                            </button>
                            <span>|</span>
                            <span className="text-red-600 font-medium">Kontak</span>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white mb-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Kami Siap Membantu Anda!</h2>
                        <p className="text-red-100 text-lg max-w-2xl mx-auto">
                            Tim customer service NusaCart tersedia 24/7 untuk menjawab pertanyaan dan membantu Anda. 
                            Jangan ragu untuk menghubungi kami kapan saja.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Methods */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Cara Menghubungi Kami</h3>
                            
                            {contactMethods.map((method, index) => (
                                <div 
                                    key={index}
                                    onClick={method.action}
                                    className={`${method.bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-white rounded-lg p-3 shadow-md">
                                            {method.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold ${method.textColor} text-lg mb-1`}>{method.title}</h4>
                                            <p className="text-gray-600 text-sm mb-2">{method.subtitle}</p>
                                            <p className={`font-medium ${method.textColor}`}>{method.info}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Business Hours */}
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-semibold text-gray-800 text-lg mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Jam Operasional
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Senin - Jumat:</span>
                                        <span className="font-medium">08:00 - 22:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sabtu - Minggu:</span>
                                        <span className="font-medium">09:00 - 21:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Customer Service:</span>
                                        <span className="font-medium text-green-600">24/7 Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Kirim Pesan</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                                placeholder="Masukkan nama lengkap Anda"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                                placeholder="nama@email.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Subjek *
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                        >
                                            <option value="">Pilih topik pertanyaan</option>
                                            <option value="order">Pertanyaan Pesanan</option>
                                            <option value="product">Informasi Produk</option>
                                            <option value="shipping">Pengiriman</option>
                                            <option value="return">Pengembalian/Refund</option>
                                            <option value="technical">Masalah Teknis</option>
                                            <option value="seller">Menjadi Penjual</option>
                                            <option value="other">Lainnya</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Pesan *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                                            placeholder="Jelaskan pertanyaan atau masalah Anda secara detail..."
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengirim...
                                            </div>
                                        ) : (
                                            'Kirim Pesan'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Pertanyaan yang Sering Diajukan</h3>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Temukan jawaban untuk pertanyaan umum sebelum menghubungi kami
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <h4 className="font-semibold text-gray-800 text-lg mb-3">{faq.question}</h4>
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Office Location */}
                    <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Kantor Pusat NusaCart</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-800">Alamat:</p>
                                            <p className="text-gray-600">
                                                Jl. Telekomunikasi No.1, Sukapura<br/>
                                                Kec. Dayeuhkolot, Kabupaten Bandung<br/>
                                                Jawa Barat 40267
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-800">Jam Kunjungan:</p>
                                            <p className="text-gray-600">Senin - Jumat, 09:00 - 17:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="font-medium">Peta Lokasi</p>
                                    <p className="text-sm">Klik untuk membuka di Google Maps</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
