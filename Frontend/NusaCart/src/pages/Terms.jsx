import React from 'react';
import { LuShoppingBag, LuShield, LuUser, LuHeart, LuSendHorizontal } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: "acceptance",
            title: "1. Penerimaan Syarat",
            icon: <LuShoppingBag className="w-5 h-5" />,
            content: [
                "Dengan mengakses dan menggunakan platform NusaCart, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini.",
                "Jika Anda tidak setuju dengan syarat dan ketentuan ini, mohon untuk tidak menggunakan layanan kami.",
                "Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya."
            ]
        },
        {
            id: "definitions",
            title: "2. Definisi",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "Platform: Website dan aplikasi mobile NusaCart",
                "Pengguna: Setiap individu atau entitas yang menggunakan platform kami",
                "Penjual: Pengguna yang menjual produk atau jasa melalui platform",
                "Pembeli: Pengguna yang membeli produk atau jasa melalui platform",
                "Konten: Semua informasi, teks, gambar, video yang ditampilkan di platform"
            ]
        },
        {
            id: "registration",
            title: "3. Pendaftaran Akun",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Anda harus berusia minimal 17 tahun atau memiliki persetujuan dari orang tua/wali untuk mendaftar.",
                "Informasi yang Anda berikan harus akurat, lengkap, dan terkini.",
                "Anda bertanggung jawab untuk menjaga kerahasiaan password dan aktivitas akun Anda.",
                "Satu orang hanya diperbolehkan memiliki satu akun aktif.",
                "Kami berhak menangguhkan atau menutup akun yang melanggar ketentuan ini."
            ]
        },
        {
            id: "seller-obligations",
            title: "4. Kewajiban Penjual",
            icon: <LuHeart className="w-5 h-5" />,
            content: [
                "Memberikan deskripsi produk yang akurat dan tidak menyesatkan.",
                "Memiliki hak legal untuk menjual produk yang ditawarkan.",
                "Memproses pesanan dalam waktu yang wajar (maksimal 2x24 jam).",
                "Tidak menjual barang yang dilarang oleh hukum Indonesia.",
                "Memberikan layanan purna jual sesuai dengan yang dipromosikan.",
                "Mematuhi semua peraturan perdagangan dan pajak yang berlaku."
            ]
        },
        {
            id: "buyer-obligations",
            title: "5. Kewajiban Pembeli",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "Melakukan pembayaran sesuai dengan metode dan waktu yang ditentukan.",
                "Memberikan informasi pengiriman yang akurat dan lengkap.",
                "Mengkonfirmasi penerimaan barang setelah menerima pesanan.",
                "Tidak menyalahgunakan sistem review dan rating.",
                "Menghubungi penjual terlebih dahulu sebelum memberikan review negatif."
            ]
        },
        {
            id: "prohibited-items",
            title: "6. Barang yang Dilarang",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Narkoba, obat-obatan terlarang, dan alat kesehatan tanpa izin",
                "Senjata api, senjata tajam, dan bahan peledak",
                "Produk yang melanggar hak kekayaan intelektual",
                "Barang curian atau hasil kejahatan",
                "Produk yang mengandung unsur SARA atau pornografi",
                "Hewan langka dan produk dari hewan yang dilindungi",
                "Dokumen resmi negara dan identitas palsu"
            ]
        },
        {
            id: "transactions",
            title: "7. Transaksi dan Pembayaran",
            icon: <LuSendHorizontal className="w-5 h-5" />,
            content: [
                "Semua transaksi dilakukan dalam mata uang Rupiah (IDR).",
                "NusaCart bertindak sebagai perantara dalam transaksi.",
                "Dana pembeli akan ditahan sampai konfirmasi penerimaan barang.",
                "Biaya transaksi dan layanan akan dikenakan sesuai ketentuan berlaku.",
                "Pembatalan pesanan hanya dapat dilakukan sebelum barang dikirim."
            ]
        },
        {
            id: "intellectual-property",
            title: "8. Hak Kekayaan Intelektual",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "NusaCart menghormati hak kekayaan intelektual pihak lain.",
                "Dilarang menjual produk yang melanggar hak cipta, merek dagang, atau paten.",
                "Konten yang Anda unggah tidak boleh melanggar hak kekayaan intelektual pihak lain.",
                "Kami berhak menghapus konten yang melanggar tanpa pemberitahuan.",
                "Logo, nama, dan semua materi NusaCart adalah milik eksklusif kami."
            ]
        },
        {
            id: "limitation-liability",
            title: "9. Batasan Tanggung Jawab",
            icon: <LuUser className="w-5 h-5" />,
            content: [
                "NusaCart tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform.",
                "Kami tidak menjamin keakuratan informasi produk yang disediakan penjual.",
                "Tanggung jawab kami terbatas pada nilai transaksi yang terkait.",
                "Kami tidak bertanggung jawab atas kerugian akibat force majeure.",
                "Setiap sengketa antara pembeli dan penjual harus diselesaikan secara langsung."
            ]
        },
        {
            id: "termination",
            title: "10. Pemutusan Layanan",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Kami dapat menangguhkan atau menutup akun Anda karena pelanggaran ketentuan.",
                "Anda dapat menutup akun sendiri kapan saja melalui pengaturan akun.",
                "Penutupan akun tidak menghilangkan kewajiban yang belum diselesaikan.",
                "Data akun yang ditutup akan dihapus sesuai kebijakan privasi kami.",
                "Kami berhak menolak layanan kepada siapa pun tanpa memberikan alasan."
            ]
        },
        {
            id: "governing-law",
            title: "11. Hukum yang Berlaku",
            icon: <LuShield className="w-5 h-5" />,
            content: [
                "Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.",
                "Setiap sengketa akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan.",
                "Jika ada bagian dari syarat ini yang tidak berlaku, bagian lainnya tetap berlaku.",
                "Kegagalan kami menegakkan suatu ketentuan tidak berarti mengesampingkan hak tersebut.",
                "Syarat dan ketentuan ini merupakan kesepakatan lengkap antara Anda dan NusaCart."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <LuShoppingBag className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Syarat dan Ketentuan</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Silakan baca dengan seksama syarat dan ketentuan penggunaan platform NusaCart
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        Terakhir diperbarui: 1 Januari 2025
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
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-red-600"
                            >
                                {section.icon}
                                <span>{section.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Terms Content */}
                <div className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.id} id={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {section.content.map((paragraph, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact and Home */}
                <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-semibold mb-4">Pertanyaan tentang Syarat dan Ketentuan?</h3>
                    <p className="text-red-100 mb-6">
                        Jika Anda memiliki pertanyaan atau memerlukan klarifikasi tentang syarat dan ketentuan ini, 
                        jangan ragu untuk menghubungi tim legal kami.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/kontak')}
                            className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Hubungi Tim Legal
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <LuSendHorizontal className="w-5 h-5" />
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>

                {/* Agreement Notice */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex gap-3">
                        <LuShield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">Pemberitahuan Penting</h4>
                            <p className="text-yellow-700 text-sm leading-relaxed">
                                Dengan melanjutkan penggunaan platform NusaCart, Anda dianggap telah membaca, 
                                memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum di atas. 
                                Pastikan Anda memeriksa halaman ini secara berkala untuk mengetahui pembaruan terbaru.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms; 