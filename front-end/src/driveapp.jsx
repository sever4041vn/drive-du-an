import React, { useState, useEffect, useMemo } from 'react';
import { driveApi } from './api/driveapi';
import { useDriveData } from './hooks/userdrivedata';
import FolderCard from './components/folderCard';
import  FileCard  from './components/fileCard';
import PreviewModal from './components/previewmodal';
import StorageQuota from './components/storagequota';

export default function driveApp() {
  const { files, folders, loading, currentFolder, loadData } = useDriveData();
  const [path, setPath] = useState([{ id: null, name: 'My Drive' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { loadData(); }, [loadData]);
//logout
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth'; // Reset toàn bộ trạng thái app
};



  // Lọc file theo tìm kiếm
  const filteredFiles = useMemo(() => {
    return files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  // Điều hướng
  const enterFolder = (id, name) => {
    setPath([...path, { id, name }]);
    loadData(id);
  };

  const jumpToPath = (index) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    loadData(newPath[newPath.length - 1].id);
  };

  // Upload xử lý cả nút bấm và Drag & Drop
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('folderId', currentFolder || '');

    try {
      await driveApi.upload(formData);
      loadData(currentFolder);
    } catch (err) { alert("Lỗi upload!"); }
  };
  //tao folders
const handleCreateFolder = async () => {
  const folderName = prompt("Nhập tên thư mục mới:");
  if (!folderName) return;

  try {
    
    await driveApi.createFolder({name:folderName,parentId:currentFolder});
    loadData(currentFolder); // Load lại danh sách để thấy folder mới
  } catch (err) {
    alert("Lỗi khi tạo thư mục!");
  }
};
  return (
    <div 
      className={`flex min-h-screen p-4 md:p-8 transition-all ${isDragging ? 'bg-blue-100' : 'bg-gray-50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
      }}
    >

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Clone Drive ☁️</h1>
          <input 
            className="border rounded-full px-6 py-2 w-full md:w-96 shadow-sm outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tìm file trong thư mục này..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
  onClick={handleCreateFolder}
  className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full hover:shadow-md transition text-gray-700"
>
  <span className="text-xl text-yellow-500">📁+</span>
  <span className="font-medium">Thư mục mới</span>
</button>
          <input 
            type="file" id="fileInput" className="hidden" 
            onChange={(e) => handleFileUpload(e.target.files[0])} 
          />
          <label htmlFor="fileInput" className="bg-blue-600 text-white px-6 py-2 rounded-full cursor-pointer text-center hover:bg-blue-700">
            + Tải lên
          </label>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 mb-6 text-sm text-gray-500">
          {path.map((p, i) => (
            <React.Fragment key={i}>
              <span className="hover:text-blue-600 cursor-pointer" onClick={() => jumpToPath(i)}>{p.name}</span>
              {i < path.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-blue-500">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {searchTerm === '' && folders.map(f => (
              <FolderCard key={f.id} folder={f} onEnter={enterFolder} />
            ))}
            {filteredFiles.map(f => (
              <FileCard 
                key={f.id} 
                file={f} 
                onPreview={(file) => setPreview({"url":driveApi.getDownloadUrl(file.id),"type":file.mimeType})}
                onDelete={async (id) => { if(confirm("Xóa?")) { await driveApi.deleteFile(id); loadData(currentFolder); }}}
              />
            ))}
          </div>
        )}

        <PreviewModal preview={preview} onClose={() => setPreview(null)} />
      </div>

      {isDragging && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center bg-blue-500/20">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-dashed border-blue-500">
            <p className="text-2xl font-bold text-blue-600">Thả file để tải lên! 📂</p>
          </div>
        </div>
      )}
  {/* Sidebar giả định */}
  <aside className="w-64 bg-white border-r p-6 flex flex-col">
      <div className="space-y-2">
<button 
  onClick={handleLogout}
  className="flex items-center space-x-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition w-full"
>
  <span>🚪</span>
  <span className="font-medium">Đăng xuất</span>
</button>
        <button onClick={() => setView('drive')} className="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg text-blue-600 font-bold">
          <span>📂</span> <span className="ml-3">Tệp của tôi</span>
        </button>
        <button onClick={() => setView('trash')} className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg text-gray-600">
          <span>🗑️</span> <span className="ml-3">Thùng rác</span>
        </button>
      </div>
    
    {/* Chèn Component Dung lượng vào đây */}
    <StorageQuota/>
  </aside>
    </div>
    
  );
}