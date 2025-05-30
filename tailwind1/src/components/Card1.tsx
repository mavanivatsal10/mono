export default function Card1({
  iconSrc,
  text,
  alt,
}: {
  iconSrc?: string;
  text?: string;
  alt: string;
}) {
  return (
    <div className="flex flex-col space-y-2 p-2 bg-gray-100 rounded-lg min-h-32">
      <div className="bg-white h-16 w-16 rounded-md p-2 flex items-center justify-center">
        <img src={iconSrc} alt={alt} />
      </div>
      <p className="text-xs">{text}</p>
    </div>
  );
}
