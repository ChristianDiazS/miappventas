export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-gray-400">/</span>}
          {item.href ? (
            <a href={item.href} className="text-cyan-500 hover:underline">
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}