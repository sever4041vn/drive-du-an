export default function FileCard ({ file, onPreview, onDelete }) {
  const getIcon = (mime) => {
    if (mime?.includes('image')) return '🖼️';
    if (mime?.includes('pdf')) return '📕';
    if (mime?.includes('video')) return '📺';
    return '📄';
  };

  return (
    <div className="bg-white p-4 border rounded-xl hover:shadow-lg transition group relative text-center">
      <div className="text-5xl mb-3 cursor-pointer" onClick={() => onPreview(file)}>
        {getIcon(file.mimeType)}
      </div>
      <p className="text-xs font-medium truncate text-gray-600 px-2">{file.name}</p>
      <button 
        onClick={() => onDelete(file.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 bg-red-50 p-1 rounded-full hover:bg-red-100 transition"
      >
        ✕
      </button>
    </div>
  );
};