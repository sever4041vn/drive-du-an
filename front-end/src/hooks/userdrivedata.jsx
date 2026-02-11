import { useState, useCallback } from 'react';
import { driveApi } from '../api/driveapi';

export function useDriveData() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);

  const loadData = useCallback(async (folderId = null) => {
    setLoading(true);
    try {
      const res = await driveApi.fetchList(folderId);
      setFiles(res.data.files || []);
      setFolders(res.data.folders || []);
      setCurrentFolder(folderId);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { files, folders, loading, currentFolder, loadData, setFiles };
}