import { useEffect, useRef, useState } from "react";
import { getPrecision, compute, getSymbol } from "../utils";

export function useHandlers() {
  const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const OPERATORS = ["+", "-", "*", "/"];

  const [title, setTitle] = useState("0"); // show result
  const [subtitle, setSubtitle] = useState(""); // show expression (a + b =)
  const [prev, setPrev] = useState<number | null>(null); // first operand
  const [op, setOp] = useState<string | null>(null); // operator
  const [curr, setCurr] = useState(0);
  const [resetDisplay, setResetDisplay] = useState(false);
  const [prevBtnId, setPrevBtnId] = useState<string | null>(null);
  const [toggleFirst, setToggleFirst] = useState(true); // flag for setting proper subtitles
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (btnid: string) => {
    if (prevBtnId === "eq") {
      handleClear();
      setTitle(btnid);
      setCurr(Number(btnid));
    } else if (prevBtnId === "percent") {
      const parts = subtitle.split(/ (\+|-|×|÷) /);
      if (parts.length > 1) {
        setTitle(btnid);
        setSubtitle(`${parts[0]} ${parts[1]} `);
        setCurr(Number(btnid));
        setResetDisplay(false);
      }
    } else if (!prevBtnId || resetDisplay || title === "0") {
      setTitle(btnid);
      setCurr(Number(btnid));
      setResetDisplay(false);
    } else {
      setTitle(title + btnid);
      setCurr(Number(title + btnid));
    }
    setPrevBtnId(btnid);
  };

  const handleDecimal = () => {
    if (prevBtnId === "eq") {
      handleClear();
      setTitle("0.");
      setCurr(0);
    } else if (!prevBtnId || resetDisplay || title === "0" || title === "") {
      setTitle("0.");
      setCurr(0);
    } else if (!title.includes(".")) {
      setTitle(title + ".");
    }
    setResetDisplay(false);
    setPrevBtnId(".");
  };

  const handleClear = () => {
    setTitle("0");
    setSubtitle("");
    setPrev(null);
    setOp(null);
    setCurr(0);
    setResetDisplay(true);
    setPrevBtnId(null);
    setToggleFirst(true);
  };

  const handleClearEntry = () => {
    if (prevBtnId === "eq") {
      handleClear();
    } else {
      const parts = subtitle.split(/ (\+|-|×|÷) /);
      if (parts.length === 1) {
        handleClear();
      } else if (parts.length > 1) {
        setTitle("0");
        setSubtitle(`${parts[0]} ${parts[1]} `);
        setCurr(0);
        setResetDisplay(true);
      }
    }
    setPrevBtnId("ce");
  };

  const handleBackspace = () => {
    /** TESTS
     * 2 plus neg backspace
     * 2 plus 2 neg backspace
     * 2 inv backspace
     * 8 sqr sqr sqrt backspace
     * 8 sqr sqr sqrt eq backspace
     */
    if (
      !prevBtnId ||
      [...DIGITS, "."].includes(prevBtnId) ||
      (prevBtnId === "neg" && !/.+\( .+ \)/.test(subtitle)) ||
      (prevBtnId === "backspace" && !/.+\( .+ \)/.test(subtitle))
    ) {
      if (title.length === 1 || (title.length === 2 && title[0] === "-")) {
        setTitle("0");
      } else {
        setTitle(title.slice(0, -1));
      }
    } else if (prevBtnId === "eq" && !/.+\( .+ \)/.test(subtitle)) {
      setSubtitle("");
      setPrev(null);
      setOp(null);
      setResetDisplay(true);
      setPrevBtnId(null);
    }
    setPrevBtnId("backspace");
  };

  const handleInverse = () => {
    /** TESTS
     * inv
     * C inv
     * CE inv
     * 8 inv neg inv eq
     * 8 minus neg inv eq eq
     * 3 plus 2 inv neg eq eq
     * . neg 8 inv eq
     * 2 neg plus inv mult div eq eq eq eq
     * 2 mult neg inv plus eq
     * 2 minus 5 inv inv neg eq
     * 5 inv div 2 inv inv inv eq eq eq
     */
    if (title === "0") {
      handleClear();
      setTitle("Cannot divide by zero");
      return;
    } else if (prevBtnId === "eq" && subtitle.endsWith(" = ")) {
      const res = 1 / Number(title);
      setTitle(res.toString());
      setSubtitle(`1/( ${title} )`);
      setPrev(null);
      setOp(null);
      setCurr(res);
      setToggleFirst(false);
      setPrevBtnId("inv");
      return;
    } else if (prevBtnId === "eq" || prevBtnId === null) {
      setSubtitle(`1/( ${toggleFirst ? title : subtitle} )`);
      //setPrev(null); // remove if bug
      //setOp(null); // remove if bug
    } else if (
      ["neg", "inv", "sqr", "sqrt", ...DIGITS, "."].includes(prevBtnId)
    ) {
      const parts = subtitle.split(/ (\+|-|×|÷) /);
      if (parts.length === 1) {
        if (/.+ = $/.test(subtitle)) {
          setSubtitle(`1/( ${title} )`);
        } else {
          setSubtitle(`1/( ${toggleFirst ? title : subtitle} )`);
        }
      } else {
        setSubtitle(
          `${parts[0]} ${parts[1]} 1/( ${toggleFirst ? title : parts[2]} )`
        );
      }
    } else if (OPERATORS.includes(prevBtnId)) {
      setSubtitle(`${subtitle}1/( ${title} )`);
    }
    setTitle(getPrecision(1 / curr).toString());
    setCurr(1 / curr);
    setResetDisplay(true);
    setToggleFirst(false);
    setPrevBtnId("inv");
  };

  const handleOperator = (btnid: string) => {
    if (prevBtnId === "eq") {
      setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      setPrev(Number(title));
      setOp(btnid);
      setCurr(Number(title));
      setResetDisplay(true);
      setPrevBtnId(btnid);
    } else if (prevBtnId === null || prev === null || op === null) {
      if (
        // prev === null and op === null
        prevBtnId !== null &&
        ["neg", "inv", "sqr", "sqrt"].includes(prevBtnId)
      ) {
        // if (/.+ = $/.test(subtitle)) {
        setSubtitle(`${getPrecision(title)} ${getSymbol(btnid)} `);
        // } else {
        //   setSubtitle(`${subtitle} ${getSymbol(btnid)} `);
        // }
      } else {
        setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      }
      setTitle(Number(title).toString());
      setPrev(Number(title));
      setOp(btnid);
      setCurr(Number(title));
      setResetDisplay(true);
    } else if (OPERATORS.includes(prevBtnId)) {
      setOp(btnid);
      setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      setResetDisplay(true);
    } else if (
      ["neg", "inv", "sqr", "sqrt", ...DIGITS, "."].includes(prevBtnId)
    ) {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setHistory([...history, `${prev} ${getSymbol(op)} ${curr} = ${res}`]);
        setTitle(Number(res.toFixed(12)).toString());
        setCurr(res);
        setSubtitle(getPrecision(res) + " " + getSymbol(btnid) + " ");
        setPrev(res);
        setOp(btnid);
        setResetDisplay(true);
      }
    }
    setPrevBtnId(btnid);
    setToggleFirst(true); // remove if bugs
  };

  const handlePercent = () => {
    /** TESTS
     * 500 percent
     * 500 plus percent percent percent eq eq eq
     * 500 plus 50 percent 5 eq
     * 500 mult percent eq
     * 500 div percent percent percent eq eq eq
     */
    if (prevBtnId === null || prev === null || op === null) {
      handleClear();
      setSubtitle("0");
    } else if (["neg", "inv", "sqr", "sqrt", "percent"].includes(prevBtnId)) {
      const splitSub = subtitle.split(/ (\+|-|×|÷) /);
      if (splitSub.length > 1) {
        const res = op === "+" || op === "-" ? (curr / 100) * prev : curr / 100;
        setSubtitle(`${splitSub[0]} ${splitSub[1]} ${res}`);
        setTitle(getPrecision(res).toString());
        // setPrev(res); // possible bug
        setCurr(res);
        setResetDisplay(true);
        setPrevBtnId("percent");
      }
    } else if (prev !== null && (op === "+" || op === "-")) {
      const res = (curr / 100) * prev;
      setTitle(getPrecision(res).toString());
      setSubtitle(`${subtitle}${getPrecision(res).toString()}`);
      setCurr(res);
      setResetDisplay(true);
      setPrevBtnId("percent");
    } else if (prev !== null && (op === "*" || op === "/")) {
      const res = curr / 100;
      setTitle(getPrecision(res).toString());
      setSubtitle(`${subtitle}${getPrecision(res).toString()}`);
      setCurr(res);
      setResetDisplay(true);
      setPrevBtnId("percent");
    }
  };

  const handleEqual = () => {
    // if (/^.+\( .+ \)/.test(subtitle) && !/.+ = $/.test(subtitle)) {
    //   // matches sequence ...( ... )
    //   setSubtitle(`${subtitle} = `);
    //   if (prev !== null && op !== null) {
    //     const res = compute(prev, op, curr);
    //     if (res === null) {
    //       handleClear();
    //       setTitle("Cannot divide by zero");
    //     } else {
    //       setTitle(getPrecision(res).toString());
    //       setCurr(res); // possible bug
    //       setPrev(res); // possible bug
    //       setResetDisplay(true);
    //     }
    //   }
    // } else
    if (prevBtnId === null || prev === null || op === null) {
      if (/.+\( .+ \)/.test(subtitle) && !/.+ = $/.test(subtitle)) {
        setSubtitle(`${subtitle} = `);
        setHistory([...history, `${subtitle} = ${Number(title)}`]);
      } else {
        setSubtitle(Number(title).toString() + " = ");
      }
      setTitle(Number(title).toString());
      setCurr(Number(title));
      setResetDisplay(true);
    } else if (["neg", "inv", "sqr", "sqrt"].includes(prevBtnId as string)) {
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(getPrecision(res).toString());
        // possible bug
        // if (subtitle of the form ( ... ) + ( ... ) then )
        // setSubtitle(`${subtitle} = `);
        // else   `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
        if (
          /.+\( .+ \) (\+|-|×|÷) .+\( .+ \)/.test(subtitle) &&
          !/.+ = $/.test(subtitle)
        ) {
          setSubtitle(`${subtitle} = `);
          setHistory([...history, `${subtitle} = ${res}`]);
        } else {
          setSubtitle(
            `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
          );
          setHistory([
            ...history,
            `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(
              curr
            )} = ${res}`,
          ]);
        }
        setPrev(res);
        setResetDisplay(true);
      }
    } else if (OPERATORS.includes(prevBtnId as string) || prevBtnId === "eq") {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(getPrecision(res).toString());
        setSubtitle(
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
        );
        setHistory([
          ...history,
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(
            curr
          )} = ${res}`,
        ]);
        setPrev(res);
        setResetDisplay(true);
      }
    } else if ([...DIGITS, "."].includes(prevBtnId) || prevBtnId === "neg") {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(getPrecision(res).toString());
        setSubtitle(
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
        );
        setHistory([
          ...history,
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(
            curr
          )} = ${res}`,
        ]);
        setPrev(res);
      }
    } else if (prevBtnId === "percent") {
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
        return;
      }
      setTitle(getPrecision(res).toString());
      setSubtitle(
        `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
      );
      setHistory([
        ...history,
        `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = ${res}`,
      ]);
      setPrev(res);
      setResetDisplay(true);
    }
    setPrevBtnId("eq");
    setToggleFirst(true);
  };

  const handleSquareAndRoot = (btnid: "sqr" | "sqrt") => {
    /** TESTS
     * sqr sqrt sqrt inv
     * 3 sqr sqr plus 256 sqrt sqrt eq sqr // failing test
     */
    const prefix = btnid === "sqr" ? "sqr" : "√";
    const val = btnid === "sqr" ? curr * curr : Math.sqrt(curr);
    if (prevBtnId === "eq" && toggleFirst) {
      const val =
        btnid === "sqr"
          ? Number(title) * Number(title)
          : Math.sqrt(Number(title));
      setTitle(getPrecision(val).toString());
      setSubtitle(`${prefix}( ${toggleFirst ? title : subtitle} )`);
      setCurr(val);
      setToggleFirst(false);
      setPrevBtnId(btnid);
      return;
    } else if (prevBtnId === null) {
      setSubtitle(`${prefix}( ${toggleFirst ? title : subtitle} )`);
      // setPrev(null); // remove if bug
      // setOp(null); // remove if bug
    } else if (
      ["neg", "inv", "sqr", "sqrt", ...DIGITS, "."].includes(prevBtnId)
    ) {
      const parts = subtitle.split(/ (\+|-|×|÷) /);
      if (parts.length === 1) {
        setSubtitle(`${prefix}( ${toggleFirst ? title : subtitle} )`);
      } else {
        setSubtitle(
          `${parts[0]} ${parts[1]} ${prefix}( ${
            toggleFirst ? title : parts[2]
          } )`
        );
      }
    } else if (OPERATORS.includes(prevBtnId)) {
      setSubtitle(`${subtitle}${prefix}( ${title} )`);
    } else if ([...DIGITS, "."].includes(prevBtnId)) {
      // TODO: fix subtitles
    }
    setTitle(getPrecision(val).toString());
    setCurr(val);
    setResetDisplay(true);
    setToggleFirst(false);
    setPrevBtnId(btnid);
  };

  const handleToggleSign = () => {
    /** TESTS
     * neg
     * 3 plus 2 neg eq eq
     * 5 . eq neg neg neg plus neg neg eq eq
     * 5 eq . neg neg neg
     */
    if (
      prevBtnId === null ||
      [...DIGITS, "."].includes(prevBtnId) ||
      (prevBtnId === "neg" && subtitle.endsWith(" = "))
    ) {
      if (title === "0") return;
    } else if (prevBtnId === "eq") {
      setSubtitle(`negate( ${toggleFirst ? title : subtitle} )`);
    } else if (["neg", "inv", "sqr", "sqrt"].includes(prevBtnId)) {
      const parts = subtitle.split(/ (\+|-|×|÷) /);
      if (parts.length === 1) {
        setSubtitle(`negate( ${toggleFirst ? title : subtitle} )`);
      } else {
        setSubtitle(
          `${parts[0]} ${parts[1]} negate( ${toggleFirst ? title : parts[2]} )`
        );
      }
    } else if (OPERATORS.includes(prevBtnId)) {
      setSubtitle(`${subtitle}negate( ${title} )`);
    }
    setTitle(title.includes("-") ? title.slice(1) : "-" + title);
    setCurr(-1 * curr);
    setToggleFirst(false);
    setPrevBtnId("neg");
  };

  const processInput = (btnid: string) => {
    if (DIGITS.includes(btnid)) {
      handleDigit(btnid);
    } else if (btnid === ".") {
      handleDecimal();
    } else if (btnid === "c") {
      handleClear();
    } else if (btnid === "ce") {
      handleClearEntry();
    } else if (btnid === "eq") {
      handleEqual();
    } else if (btnid === "backspace") {
      handleBackspace();
    } else if (OPERATORS.includes(btnid)) {
      handleOperator(btnid);
    } else if (btnid === "neg") {
      handleToggleSign();
    } else if (btnid === "inv") {
      handleInverse();
    } else if (btnid === "sqr" || btnid === "sqrt") {
      handleSquareAndRoot(btnid);
    } else if (btnid === "percent") {
      handlePercent();
    }
  };

   const buttonRefs = useRef<{ [key: string]: HTMLButtonElement }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }

      if (
        [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "0",
          "+",
          "-",
          "*",
          "/",
        ].includes(e.key)
      ) {
        buttonRefs.current[e.key]?.click();
      } else if (e.key === "Enter") {
        buttonRefs.current["eq"]?.click();
      } else if (e.key === "Backspace") {
        buttonRefs.current["backspace"]?.click();
      } else if (e.key === ".") {
        buttonRefs.current["."]?.click();
      } else if (e.key === "%") {
        buttonRefs.current["percent"]?.click();
      } else if (e.key === "Escape" || e.key === " ") {
        buttonRefs.current["c"]?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [buttonRefs]);

  return {
    handlers: {
      handleDigit,
      handleDecimal,
      handleClear,
      handleClearEntry,
      handleEqual,
      handleBackspace,
      handleOperator,
      handleToggleSign,
      handleInverse,
      handleSquareAndRoot,
      handlePercent,
      processInput,
    },
    constants: { DIGITS, OPERATORS },
    state: {
      title,
      setTitle,
      subtitle,
      setSubtitle,
      prev,
      setPrev,
      op,
      setOp,
      curr,
      setCurr,
      resetDisplay,
      setResetDisplay,
      prevBtnId,
      setPrevBtnId,
      toggleFirst,
      setToggleFirst,
      history,
      setHistory,
      showHistory,
      setShowHistory,
    },
    buttonRefs,
  };
}
