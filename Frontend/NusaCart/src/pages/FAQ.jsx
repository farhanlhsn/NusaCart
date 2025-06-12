import React, { useState } from 'react';
import { LuUser, LuShoppingBag, LuHeart, LuSendHorizontal, LuShield } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData = [
        {
            category: "Umum",
            icon: <LuUser className="w-5 h-5" />,
            questions: [
                {
                    question: "Apa itu NusaCart?",
                    answer: "NusaCart adalah marketplace online yang menghubungkan pembeli dan penjual di seluruh Indonesia. Kami menyediakan platform yang aman dan mudah digunakan untuk berbelanja berbagai produk lokal dan internasional."
                },
                {
                    question: "Bagaimana cara mendaftar di NusaCart?",
                    answer: "Anda dapat mendaftar dengan mengklik tombol 'Masuk / Daftar' di bagian atas halaman atau di footer. Isi formulir pendaftaran dengan email dan password, atau daftar menggunakan akun Google atau Facebook."
                },
                {
                    question: "Apakah gratis untuk berbelanja di NusaCart?",
                    answer: "Ya, mendaftar dan browsing produk di NusaCart sepenuhnya gratis. Anda hanya perlu membayar untuk produk yang Anda beli dan biaya pengiriman yang berlaku."
                }
            ]
        },
        {
            category: "Pemesanan & Pembayaran",
            icon: <LuShoppingBag className="w-5 h-5" />,
            questions: [
                {
                    question: "Metode pembayaran apa saja yang tersedia?",
                    answer: "Kami menerima berbagai metode pembayaran termasuk transfer bank, kartu kredit/debit, e-wallet (GoPay, OVO, DANA), dan cicilan 0% untuk pembelian tertentu."
                },
                {
                    question: "Bagaimana cara membatalkan pesanan?",
                    answer: "Anda dapat membatalkan pesanan melalui halaman 'Pesanan Saya' selama pesanan belum diproses oleh penjual. Setelah diproses, hubungi customer service untuk bantuan pembatalan."
                },
                {
                    question: "Apakah ada minimum pembelian?",
                    answer: "Tidak ada minimum pembelian untuk berbelanja di NusaCart. Namun, beberapa penjual mungkin memiliki minimum order tersendiri yang akan ditampilkan di halaman produk."
                }
            ]
        },
        {
            category: "Pengiriman",
            icon: <LuSendHorizontal className="w-5 h-5" />,
            questions: [
                {
                    question: "Berapa lama waktu pengiriman?",
                    answer: "Waktu pengiriman bervariasi tergantung lokasi dan jenis pengiriman yang dipilih. Umumnya 1-3 hari untuk dalam kota, 3-7 hari untuk antar provinsi. Pengiriman ekspres tersedia untuk pengiriman lebih cepat."
                },
                {
                    question: "Bagaimana cara melacak pesanan?",
                    answer: "Setelah pesanan dikirim, Anda akan mendapat nomor resi yang dapat digunakan untuk melacak paket di halaman 'Pesanan Saya' atau langsung di website kurir yang bersangkutan."
                },
                {
                    question: "Apakah ada gratis ongkir?",
                    answer: "Ya, kami sering mengadakan promo gratis ongkir untuk pembelian minimal tertentu atau untuk daerah tertentu. Pantau terus halaman utama untuk penawaran terbaru."
                }
            ]
        },
        {
            category: "Keamanan & Garansi",
            icon: <LuShield className="w-5 h-5" />,
            questions: [
                {
                    question: "Apakah transaksi di NusaCart aman?",
                    answer: "Ya, semua transaksi dilindungi dengan enkripsi SSL dan sistem escrow. Uang Anda akan disimpan aman sampai pesanan diterima dan dikonfirmasi."
                },
                {
                    question: "Bagaimana jika produk tidak sesuai?",
                    answer: "Kami memiliki kebijakan pengembalian barang. Jika produk tidak sesuai deskripsi atau rusak, Anda dapat mengajukan komplain dalam 7 hari setelah barang diterima."
                },
                {
                    question: "Apakah ada garansi untuk produk elektronik?",
                    answer: "Garansi tergantung pada kebijakan masing-masing penjual dan brand. Informasi garansi akan tercantum di halaman produk. Kami juga menyediakan perlindungan pembeli untuk klaim garansi."
                }
            ]
        },
        {
            category: "Pengembalian & Refund",
            icon: <LuHeart className="w-5 h-5" />,
            questions: [
                {
                    question: "Bagaimana cara mengembalikan barang?",
                    answer: "Masuk ke halaman 'Pesanan Saya', pilih pesanan yang ingin dikembalikan, klik 'Ajukan Pengembalian', upload foto dan alasan pengembalian, lalu tunggu persetujuan dari penjual."
                },
                {
                    question: "Berapa lama proses refund?",
                    answer: "Setelah pengembalian disetujui dan barang diterima penjual, refund akan diproses dalam 3-5 hari kerja ke rekening atau metode pembayaran asal."
                },
                {
                    question: "Siapa yang menanggung ongkos kirim pengembalian?",
                    answer: "Jika produk cacat atau tidak sesuai deskripsi, ongkos kirim ditanggung penjual. Jika pengembalian karena alasan pribadi pembeli, ongkos kirim ditanggung pembeli."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <LuUser className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Temukan jawaban untuk pertanyaan yang sering diajukan tentang NusaCart
                    </p>
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-12 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Tidak menemukan jawaban yang dicari?</h3>
                            <p className="text-red-100">Tim customer service kami siap membantu Anda 24/7</p>
                        </div>
                        <button 
                            onClick={() => navigate('/kontak')}
                            className="mt-4 md:mt-0 bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Hubungi Kami
                        </button>
                    </div>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                    {faqData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        {category.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
                                </div>
                            </div>
                            
                            <div className="divide-y divide-gray-200">
                                {category.questions.map((item, questionIndex) => {
                                    const globalIndex = categoryIndex * 100 + questionIndex;
                                    const isOpen = openIndex === globalIndex;
                                    
                                    return (
                                        <div key={questionIndex}>
                                            <button
                                                onClick={() => toggleFAQ(globalIndex)}
                                                className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                                                        {item.question}
                                                    </h3>
                                                    <div className="flex-shrink-0">
                                                        <span className="text-gray-500 text-xl">
                                                            {isOpen ? "▲" : "▼"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                            
                                            {isOpen && (
                                                <div className="px-6 pb-5">
                                                    <div className="border-l-4 border-red-200 pl-4">
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {item.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still need help section */}
                <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Masih butuh bantuan?</h3>
                    <p className="text-gray-600 mb-6">
                        Tim support kami tersedia untuk membantu Anda dengan pertanyaan apapun
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/kontak')}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                        >
                            Hubungi Customer Service
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ; 