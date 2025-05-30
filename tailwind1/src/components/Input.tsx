export default function Input({
  type,
  placeholder,
}: {
  type: string;
  placeholder: string;
}) {
  return (
    <div className="border border-gray-400 rounded-lg p-2">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full focus:outline-none"
      />
    </div>
  );
}
