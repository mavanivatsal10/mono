export default function Heading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4]">
      <h1 className="text-4xl font-semibold font-[Poppins] text-center my-4">
        {text}
      </h1>
      <div className="h-0.5 bg-orange-400 w-[5%] mb-8"></div>
    </div>
  );
}
