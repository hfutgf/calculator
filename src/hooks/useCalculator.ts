import { useCallback, useMemo, useState } from "react";
import { evaluate, formatNumber } from "../lib/evaluate";
import { useLocalStorage } from "./useLocalStorage";
import type { HistoryEntry } from "../types";

const OPERATORS = "+−×÷";
const HISTORY_KEY = "calc.history.v1";
const MAX_HISTORY = 100;

let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter}`;
}

export function useCalculator() {
  const [expr, setExpr] = useState("");
  const [error, setError] = useState(false);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    HISTORY_KEY,
    []
  );

  /** Live result preview — shown while typing if the expression is valid. */
  const preview = useMemo(() => {
    if (!expr) return "";
    const hasOperator = [...expr.slice(1)].some((c) => OPERATORS.includes(c));
    if (!hasOperator) return "";
    try {
      return formatNumber(evaluate(expr));
    } catch {
      return "";
    }
  }, [expr]);

  const clearError = useCallback(() => setError(false), []);

  const inputChar = useCallback((c: string) => {
    setError(false);
    setExpr((prev) => {
      const last = prev.slice(-1);

      if (OPERATORS.includes(c)) {
        if (prev === "") return c === "−" ? c : prev; // allow leading minus
        if (last === "(") return c === "−" ? prev + c : prev;
        if (OPERATORS.includes(last)) return prev.slice(0, -1) + c; // swap operator
        return prev + c;
      }

      if (c === ".") {
        // Prevent two dots in the current number segment.
        const seg = prev.split(/[+−×÷()%]/).pop() ?? "";
        if (seg.includes(".")) return prev;
        if (seg === "") return prev + "0."; // ".5" -> "0.5"
        return prev + c;
      }

      if (c === ")") {
        const opens = (prev.match(/\(/g) ?? []).length;
        const closes = (prev.match(/\)/g) ?? []).length;
        if (opens <= closes) return prev; // nothing to close
        if (last === "" || OPERATORS.includes(last) || last === "(") return prev;
        return prev + c;
      }

      return prev + c;
    });
  }, []);

  const backspace = useCallback(() => {
    setError(false);
    setExpr((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setError(false);
    setExpr("");
  }, []);

  const equals = useCallback(() => {
    if (!expr) return;
    try {
      const value = evaluate(expr);
      const result = formatNumber(value);
      const entry: HistoryEntry = {
        id: makeId(),
        expression: expr,
        result,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      setExpr(result.replace(/,/g, "")); // chain from the result
      setError(false);
    } catch {
      setError(true);
    }
  }, [expr, setHistory]);

  const useHistoryEntry = useCallback((entry: HistoryEntry) => {
    setError(false);
    setExpr(entry.result.replace(/,/g, ""));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const removeHistoryEntry = useCallback(
    (id: string) => setHistory((prev) => prev.filter((e) => e.id !== id)),
    [setHistory]
  );

  return {
    expr,
    preview,
    error,
    history,
    inputChar,
    backspace,
    clear,
    equals,
    useHistoryEntry,
    clearHistory,
    removeHistoryEntry,
    clearError,
  };
}
