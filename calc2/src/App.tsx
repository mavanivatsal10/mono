import { ArrowLeft, Divide, History, Minus, Plus, X } from "lucide-react";
import Button from "./components/Button";
import { useHandlers } from "./hooks/useHandlers";

export default function App() {
  const {
    handlers: { processInput },
    state: { title, subtitle, showHistory, setShowHistory, history },
    buttonRefs,
  } = useHandlers();

  return (
    <div className="flex items-center justify-center bg-gray-100 h-screen gap-8 select-none">
      <div className="bg-gray-900 flex flex-col gap-1 p-4 text-right text-sm w-100">
        <div>
          <button
            className="text-gray-300 hover:bg-gray-700 rounded-full"
            type="button"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History />
          </button>
        </div>
        <div className="text-gray-300">{subtitle}</div>
        <div className="text-white text-3xl font-semibold text-right truncate">
          {title}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-6">
          {[
            {
              displayVal: "%",
              btnid: "percent",
              variant: "dark",
            },
            {
              displayVal: "CE",
              btnid: "ce",
              variant: "dark",
            },
            {
              displayVal: "C",
              btnid: "c",
              variant: "dark",
            },
            {
              displayVal: <ArrowLeft />,
              btnid: "backspace",
              variant: "dark",
            },
            {
              displayVal: (
                <div className="text-xl">
                  <span>⅟</span>
                  <span>x</span>
                </div>
              ),
              btnid: "inv",
              variant: "dark",
            },
            {
              displayVal: (
                <div className="text-xl">
                  x<sup>2</sup>
                </div>
              ),
              btnid: "sqr",
              variant: "dark",
            },
            {
              displayVal: "√x",
              btnid: "sqrt",
              variant: "dark",
            },
            {
              displayVal: <Divide />,
              btnid: "/",
              variant: "dark",
            },
            {
              displayVal: "7",
              btnid: "7",
              variant: "light",
            },
            {
              displayVal: "8",
              btnid: "8",
              variant: "light",
            },
            {
              displayVal: "9",
              btnid: "9",
              variant: "light",
            },
            {
              displayVal: <X />,
              btnid: "*",
              variant: "dark",
            },
            {
              displayVal: "4",
              btnid: "4",
              variant: "light",
            },
            {
              displayVal: "5",
              btnid: "5",
              variant: "light",
            },
            {
              displayVal: "6",
              btnid: "6",
              variant: "light",
            },
            {
              displayVal: <Minus />,
              btnid: "-",
              variant: "dark",
            },
            {
              displayVal: "1",
              btnid: "1",
              variant: "light",
            },
            {
              displayVal: "2",
              btnid: "2",
              variant: "light",
            },
            {
              displayVal: "3",
              btnid: "3",
              variant: "light",
            },
            {
              displayVal: <Plus />,
              btnid: "+",
              variant: "dark",
            },

            {
              displayVal: <div className="text-xl">+/-</div>,
              btnid: "neg",
              variant: "light",
            },
            {
              displayVal: "0",
              btnid: "0",
              variant: "light",
            },
            {
              displayVal: ".",
              btnid: ".",
              variant: "light",
            },
            {
              displayVal: "=",
              btnid: "eq",
              variant: "orange",
            },
          ].map(({ displayVal, btnid, variant }) => (
            <Button
              displayVal={displayVal}
              onClick={() => processInput(btnid)}
              variant={variant as "dark" | "light" | "orange"}
              ref={(e: HTMLButtonElement) => (buttonRefs.current[btnid] = e)}
              key={btnid}
            />
          ))}
        </div>
      </div>
      {showHistory && (
        <div className="bg-white w-100 h-150 p-4 text-gray-800 shadow-md rounded-lg overflow-y-auto">
          {history.map((s: string, index: number) => (
            <div key={index}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}
