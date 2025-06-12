import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const ReportChat = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);

  const reportReasons = [
    'Pesan mengganggu (Spam)',
    'Produk Palsu',
    'Penipuan',
    'Pesan/Gambar/Video yang tidak pantas (Mengandung SARA)',
    'Lainnya'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedReason && description.trim()) {
      onSubmit({
        reason: selectedReason,
        description: description.trim(),
        attachments
      });
      // Reset form
      setSelectedReason('');
      setDescription('');
      setAttachments([]);
      onClose();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
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

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lampiran
              </label>
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-600">Tambah lampiran</span>
                </label>
              </div>

              {/* Attachment Counter */}
              <div className="text-sm text-gray-500 mt-2">
                {attachments.length}/6
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                             <button
                         type="button"
                         onClick={() => removeAttachment(index)}
                         className="text-red-500 hover:text-red-700 ml-2"
                       >
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedReason || !description.trim()}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Laporkan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportChat; 