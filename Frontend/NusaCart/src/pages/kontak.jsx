import React from "react";

export default function kontak() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Beranda</span>
                        <span>|</span>
                        <span className="text-red-600 font-medium">Kontak</span>
                    </div>
                </div>

                {/* Main Contact Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Call To Us Section */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Hubungi Kami</h2>
                        </div>
                        
                        <p className="text-gray-700 mb-4 text-base">
                            Kami tersedia 24/7, 7 hari seminggu.
                        </p>
                        
                        <p className="text-gray-800 font-medium text-base">
                            Telepon: +6281380542261
                        </p>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-300 mb-8" />

                    {/* Write To Us Section */}
                    <div>
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Kirim Pesan</h2>
                        </div>
                        
                        <p className="text-gray-700 mb-4 text-base">
                            Kami tersedia 24/7, 7 hari seminggu.
                        </p>
                        
                        <div className="space-y-2">
                            <p className="text-gray-800 font-medium text-base">
                                Email: fikrianwar036@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
