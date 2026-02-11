import axios from 'axios';

const API_BASE = 'http://localhost:3000';
const token = localStorage.getItem('token');


export const driveApi = {
  fetchList: (folderId) => axios.get(`${API_BASE}/list${folderId ? `/${folderId}` : ''}`,{
    headers: { Authorization: `Bearer ${token}` }
}),
  upload: (formData) => axios.post(`${API_BASE}/upload`, formData, {
    headers: { Authorization: `Bearer ${token}` }
}),
  createFolder: (data) => axios.post(`${API_BASE}/folders`, {name:data.name,parentId:data.parentId}, {
    headers: { Authorization: `Bearer ${token}` }
}),
  deleteFile: (id) => axios.delete(`${API_BASE}/delete-file/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
}),
  getStorageQuota: () => axios.get(`${API_BASE}/storage-stats/`, {
    headers: { Authorization: `Bearer ${token}` }
}),
  getDownloadUrl: (id) => `${API_BASE}/download/${id}`,
};