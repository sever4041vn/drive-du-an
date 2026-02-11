import { useEffect } from 'react';

export default function PreviewModal({ preview, onClose }) {
  // Đóng modal khi nhấn phím ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    // Khóa cuộn trang khi mở Modal
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);
  if (!preview) return null;
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Click vào vùng tối để đóng
    >
      {/* Nút đóng góc trên bên phải */}
      <button 
        className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-[110]"
        onClick={onClose}
      >
        &times;
      </button>

      {/* Container chứa ảnh */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Ngăn việc click vào ảnh bị đóng modal
      >
        {
          preview.type?.includes('image')?
          <img 
            src={preview.url} 
            alt="Preview" 
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-2 border-white/10 object-contain animate-zoomIn"
          />
          :
          <video
          controls
          autoPlay
          src={preview.url} 
          alt="Preview" 
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-2 border-white/10 object-contain animate-zoomIn"
         ></video>
        }


        {/* Nút tải về nhanh trong Modal */}
        <a 
          href={preview.url} 
          download 
          className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition border border-white/20 text-sm"
        >
          ⬇️ Tải xuống bản gốc
        </a>
      </div>
    </div>
  );
}