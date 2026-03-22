
const SectionTitle = ({ children, icon }) => {
  return (
    <div className="flex items-center gap-2 mb-6 mt-4">
      {icon && <span className="text-blue-600">{icon}</span>}
      <div className="flex-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
          {children}
        </h3>
        <div className="h-0.5 w-12 bg-blue-600 mt-1 rounded-full"></div>
      </div>
    </div>
  );
};

export default SectionTitle;