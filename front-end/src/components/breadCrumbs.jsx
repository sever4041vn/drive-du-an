export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 bg-gray-100 p-2 rounded-lg">
      {path.map((item, index) => (
        <div key={index} className="flex items-center">
          <button 
            onClick={() => onNavigate(item, index)}
            className={`hover:text-blue-600 font-medium ${index === path.length - 1 ? 'text-gray-800' : ''}`}
          >
            {item.name}
          </button>
          {index < path.length - 1 && <span className="mx-2 text-gray-400">/</span>}
        </div>
      ))}
    </nav>
  );
}