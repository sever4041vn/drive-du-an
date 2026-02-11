import { useState, useEffect } from 'react';
import { driveApi } from '../api/driveapi';
import axios from 'axios';

export default function StorageQuota({ ownerId }) {
  const [stats, setStats] = useState({ used: 0, limit: 1, percentage: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // Bạn có thể thêm hàm này vào driveApi.js
      const res = await driveApi.getStorageQuota();
      setStats(res.data);
    };
    fetchStats();
  }, []);

  // Hàm chuyển đổi byte sang GB/MB cho dễ đọc
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 bg-white rounded-xl border mt-auto">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-blue-600 text-xl">☁️</span>
        <span className="text-sm font-medium text-gray-700">Bộ nhớ</span>
      </div>
      
      {/* Thanh tiến trình (Progress Bar) */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            stats.percentage > 90 ? 'bg-red-500' : 'bg-blue-600'
          }`}
          style={{ width: `${stats.percentage}%` }}
        ></div>
      </div>

      <p className="text-xs text-gray-500">
        Đã dùng {formatBytes(stats.used)} trong tổng số {formatBytes(stats.limit)}
      </p>
      
      {stats.percentage > 80 && (
        <button className="mt-3 w-full py-1.5 text-xs font-bold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
          Mua thêm dung lượng
        </button>
      )}
    </div>
  );
}