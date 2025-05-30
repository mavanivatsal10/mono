export default function Button({
  text,
  color,
  iconSrc,
  classes,
}: {
  text?: string;
  color: string;
  iconSrc?: string;
  classes?: string;
}) {
  return (
    <button
      className={`flex bg-${color} font-semibold text-xs text-white py-2 px-4 rounded-md ${classes}`}
    >
      {text && text.toUpperCase()}
      {iconSrc && <img src={iconSrc} className="h-4 w-4" />}
    </button>
  );
}
