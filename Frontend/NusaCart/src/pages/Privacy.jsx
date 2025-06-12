import React from 'react';
import { LuShield, LuUser, LuSendHorizontal, LuShoppingBag, LuHeart } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: "overview",
            title: "1. Ikhtisar Kebijakan",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "NusaCart berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.",
                "Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.",
                "Dengan menggunakan layanan kami, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.",
                "Kami mematuhi Undang-Undang Perlindungan Data Pribadi Indonesia dan standar internasional."
            ]
        },
        {
            id: "data-collection",
            title: "2. Data yang Kami Kumpulkan",
            icon: <LuShoppingBag className="w-5 h-5" />,
            content: [
                "Informasi Akun: Nama, email, nomor telepon, alamat, dan foto profil",
                "Data Transaksi: Riwayat pembelian, metode pembayaran, dan alamat pengiriman",
                "Aktivitas Platform: Riwayat pencarian, produk yang dilihat, dan interaksi dengan konten",
                "Data Teknis: Alamat IP, jenis perangkat, browser, dan informasi lokasi",
                "Komunikasi: Pesan dengan customer service dan review produk",
                "Data Keuangan: Informasi rekening bank dan e-wallet (dienkripsi)",
                "Cookies dan Teknologi Pelacakan: Untuk meningkatkan pengalaman pengguna"
            ]
        },
        {
            id: "data-usage",
            title: "3. Penggunaan Data",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "Memproses transaksi dan mengirimkan produk yang dibeli",
                "Memberikan layanan customer support dan menangani keluhan",
                "Meningkatkan keamanan platform dan mencegah penipuan",
                "Mengirimkan notifikasi pesanan, promosi, dan update layanan",
                "Menganalisis perilaku pengguna untuk meningkatkan layanan",
                "Mematuhi kewajiban hukum dan regulasi yang berlaku",
                "Menampilkan iklan dan konten yang relevan dengan minat Anda"
            ]
        },
        {
            id: "data-sharing",
            title: "4. Berbagi Data dengan Pihak Ketiga",
            icon: <LuHeart className="w-5 h-5" />,
            content: [
                "Penjual: Informasi pesanan dan pengiriman untuk memproses transaksi",
                "Payment Gateway: Data pembayaran untuk memproses transaksi (terenkripsi)",
                "Jasa Pengiriman: Alamat dan kontak untuk pengiriman produk",
                "Penyedia Layanan IT: Untuk maintenance sistem dan cloud storage",
                "Otoritas Hukum: Jika diwajibkan oleh hukum atau proses pengadilan",
                "Partner Bisnis: Untuk program loyalitas dan promosi bersama",
                "Auditor: Untuk audit keamanan dan compliance (data ter-anonymized)"
            ]
        },
        {
            id: "data-security",
            title: "5. Keamanan Data",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Enkripsi SSL/TLS untuk semua transmisi data sensitif",
                "Server tersimpan di data center dengan standar keamanan internasional",
                "Akses data dibatasi hanya untuk karyawan yang memerlukan",
                "Sistem monitoring 24/7 untuk mendeteksi aktivitas mencurigakan",
                "Backup data regular dan disaster recovery plan",
                "Penetration testing berkala oleh security expert independen",
                "Pelatihan keamanan rutin untuk seluruh tim NusaCart"
            ]
        },
        {
            id: "user-rights",
            title: "6. Hak Pengguna",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Hak Akses: Meminta salinan data pribadi yang kami simpan",
                "Hak Koreksi: Memperbaiki data yang tidak akurat atau tidak lengkap",
                "Hak Penghapusan: Meminta penghapusan data dalam kondisi tertentu",
                "Hak Pembatasan: Membatasi pemrosesan data untuk tujuan tertentu",
                "Hak Portabilitas: Memindahkan data ke platform lain dalam format standar",
                "Hak Keberatan: Menolak pemrosesan data untuk tujuan pemasaran",
                "Hak Penarikan Persetujuan: Menarik persetujuan kapan saja"
            ]
        },
        {
            id: "data-retention",
            title: "7. Penyimpanan Data",
            icon: <LuHeart className="w-5 h-5" />,
            content: [
                "Data akun aktif disimpan selama akun masih digunakan",
                "Data transaksi disimpan selama 7 tahun untuk keperluan audit",
                "Data komunikasi disimpan selama 3 tahun untuk referensi",
                "Data marketing dihapus jika Anda unsubscribe dari newsletter",
                "Data akun yang dihapus akan dihancurkan dalam 30 hari",
                "Beberapa data mungkin disimpan lebih lama jika diwajibkan hukum",
                "Data ter-anonymized dapat disimpan untuk analisis statistik"
            ]
        },
        {
            id: "cookies",
            title: "8. Cookies dan Teknologi Serupa",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Essential Cookies: Diperlukan untuk fungsi dasar platform",
                "Performance Cookies: Membantu kami memahami penggunaan platform",
                "Functional Cookies: Menyimpan preferensi dan pengaturan Anda",
                "Marketing Cookies: Menampilkan iklan yang relevan di platform lain",
                "Anda dapat mengatur preferensi cookies melalui browser",
                "Menonaktifkan cookies tertentu dapat mempengaruhi fungsionalitas",
                "Kami menggunakan Google Analytics dan Facebook Pixel"
            ]
        },
        {
            id: "minors",
            title: "9. Perlindungan Anak di Bawah Umur",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Layanan kami tidak ditujukan untuk anak di bawah 13 tahun",
                "Kami tidak secara sengaja mengumpulkan data dari anak di bawah 13 tahun",
                "Pengguna 13-17 tahun memerlukan persetujuan orang tua/wali",
                "Jika kami mengetahui ada data anak di bawah 13 tahun, akan segera dihapus",
                "Orang tua dapat menghubungi kami untuk menghapus data anak mereka",
                "Kami menerapkan verifikasi usia pada produk tertentu",
                "Pendidikan digital safety untuk remaja melalui program khusus"
            ]
        },
        {
            id: "international-transfer",
            title: "10. Transfer Data Internasional",
            icon: <LuSendHorizontal className="w-5 h-5" />,
            content: [
                "Data utama disimpan di server dalam wilayah Indonesia",
                "Beberapa layanan mungkin melibatkan transfer ke negara lain",
                "Transfer hanya dilakukan ke negara dengan perlindungan data memadai",
                "Kami menggunakan Standard Contractual Clauses untuk transfer ke EU",
                "Data yang ditransfer dienkripsi dan dilindungi dengan standar tinggi",
                "Anda berhak mengetahui negara tujuan transfer data Anda",
                "Transfer selalu sesuai dengan regulasi perlindungan data Indonesia"
            ]
        },
        {
            id: "policy-changes",
            title: "11. Perubahan Kebijakan",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "Kami dapat memperbarui kebijakan ini sewaktu-waktu",
                "Perubahan signifikan akan diberitahukan melalui email atau notifikasi",
                "Versi terbaru selalu tersedia di halaman ini",
                "Tanggal pembaruan terakhir tercantum di bagian atas halaman",
                "Penggunaan berkelanjutan dianggap persetujuan atas perubahan",
                "Untuk perubahan material, kami akan meminta persetujuan ulang",
                "Anda dapat mengunduh salinan kebijakan untuk referensi"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <LuShield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Privasi</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Perlindungan data pribadi Anda adalah prioritas utama kami
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        Terakhir diperbarui: 1 Januari 2025
                    </div>
                </div>

                {/* Data Protection Promise */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-12 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <LuShield className="w-8 h-8" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-semibold mb-2">Komitmen Perlindungan Data</h3>
                            <p className="text-blue-100">
                                Kami menggunakan teknologi enkripsi terdepan dan mengikuti standar keamanan internasional 
                                untuk memastikan data pribadi Anda selalu aman dan terlindungi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigasi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-blue-600"
                            >
                                {section.icon}
                                <span>{section.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Privacy Content */}
                <div className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.id} id={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {section.content.map((paragraph, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Data Rights CTA */}
                <div className="mt-12 bg-green-50 border border-green-200 rounded-2xl p-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                            <LuShield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Kelola Data Pribadi Anda</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Anda memiliki kontrol penuh atas data pribadi Anda. Gunakan fitur-fitur berikut untuk mengelola informasi Anda:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                            <button 
                                onClick={() => navigate('/profile')}
                                className="bg-white border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors"
                            >
                                Lihat Data Saya
                            </button>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="bg-white border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors"
                            >
                                Edit Informasi
                            </button>
                            <button 
                                onClick={() => navigate('/kontak')}
                                className="bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                            >
                                Hubungi DPO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact and Home */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-semibold mb-4">Pertanyaan tentang Privasi?</h3>
                    <p className="text-blue-100 mb-6">
                        Tim Data Protection Officer (DPO) kami siap membantu Anda dengan segala pertanyaan 
                        terkait perlindungan data dan privasi.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/kontak')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <LuSendHorizontal className="w-5 h-5" />
                            privacy@nusacart.com
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <LuHeart className="w-5 h-5" />
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>

                {/* GDPR & Compliance Notice */}
                <div className="mt-8 bg-gray-100 rounded-2xl p-6">
                    <div className="flex gap-3">
                        <LuShield className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Standar Perlindungan Internasional</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                NusaCart mematuhi Undang-Undang Perlindungan Data Pribadi Indonesia, GDPR Uni Eropa, 
                                dan standar keamanan internasional ISO 27001. Kami berkomitmen untuk memberikan 
                                perlindungan data terbaik bagi semua pengguna kami.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy; 