import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../services/api';

// Custom CSS for animations
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0.5;
      transform: translateY(30px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideInUp {
    animation: slideInUp 0.5s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

const ReportChat = ({ isOpen, onClose, reportedUserId }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const reportReasons = [
    'Pesan mengganggu (Spam)',
    'Produk Palsu',
    'Penipuan',
    'Pesan/Gambar/Video yang tidak pantas (Mengandung SARA)',
    'Lainnya'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedReason && description.trim() && !isSubmitting && reportedUserId) {
      setIsSubmitting(true);
      try {
        const response = await api.post('/api/chat/report', {
          reportedUserId: reportedUserId,
          reason: selectedReason,
          description: description.trim()
        });

        if (response.status === 200) {
          // Show success popup
          setShowSuccessPopup(true);
          
          // Auto close after 2 seconds
          setTimeout(() => {
            setShowSuccessPopup(false);
            // Reset form
            setSelectedReason('');
            setDescription('');
            onClose();
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting report:', error);
        if (error.response?.status === 401) {
          alert('Sesi Anda telah berakhir. Silakan login kembali.');
        } else {
          alert('Gagal mengirim laporan. Silakan coba lagi.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  if (!isOpen) return null;

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-500 ease-out animate-slideInUp">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Laporan Berhasil Dikirim!
              </h3>
              <p className="text-gray-600">
                Terima kasih atas laporan Anda. Tim kami akan meninjau laporan ini.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Lapor Pengguna</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Tolong berikan alasan mengapa melaporkan pengguna.
              </h3>
              
              {/* Radio Options */}
              <div className="space-y-3">
                {reportReasons.map((reason, index) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-3 text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan masalahmu....."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50"
                rows="4"
                maxLength="320"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {description.length}/320
              </div>
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedReason || !description.trim() || isSubmitting || !reportedUserId}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Mengirim...' : 'Laporkan'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default ReportChat;