
const TextArea = ({ label, name, value, onChange, placeholder, rows = 4 }) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wide">
        {label}

      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed resize-y shadow-sm"
      />
    </div>
  );
};

export default TextArea;