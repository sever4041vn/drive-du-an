export default function FolderCard({ folder, onEnter }) {
  return (
    <div 
      onDoubleClick={() => onEnter(folder.id, folder.name)}
      className="p-4 border rounded-xl flex items-center space-x-3 bg-white hover:bg-yellow-50 hover:border-yellow-200 cursor-pointer transition group"
    >
      <div className="text-2xl group-hover:scale-110 transition-transform">📁</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-gray-700">{folder.name}</p>
      </div>
    </div>
  );
}