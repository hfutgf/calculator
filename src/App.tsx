import { useEffect, useState } from "react";
import { Display } from "./components/Display";
import { Keypad } from "./components/Keypad";
import { History } from "./components/History";
import { useCalculator } from "./hooks/useCalculator";
import "./App.css";

const KEY_MAP: Record<string, string> = {
  "*": "×",
  x: "×",
  X: "×",
  "/": "÷",
  "-": "−",
};

export default function App() {
  const calc = useCalculator();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { key } = e;

      if (key === "Enter" || key === "=") {
        e.preventDefault();
        calc.equals();
        return;
      }
      if (key === "Backspace") {
        e.preventDefault();
        calc.backspace();
        return;
      }
      if (key === "Escape") {
        e.preventDefault();
        calc.clear();
        return;
      }
      if (/[0-9.()%+]/.test(key) || key in KEY_MAP) {
        e.preventDefault();
        calc.inputChar(KEY_MAP[key] ?? key);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [calc]);

  return (
    <div className="app">
      <main className={`shell${showHistory ? " shell--history-open" : ""}`}>
        <section className="calculator">
          <header className="calculator__bar">
            <span className="calculator__brand">Calc</span>
            <button
              type="button"
              className="calculator__history-toggle"
              onClick={() => setShowHistory((v) => !v)}
              aria-pressed={showHistory}
            >
              {showHistory ? "Скрыть историю" : "История"}
              {calc.history.length > 0 && (
                <span className="calculator__badge">{calc.history.length}</span>
              )}
            </button>
          </header>

          <Display expr={calc.expr} preview={calc.preview} error={calc.error} />
          <Keypad
            onInput={calc.inputChar}
            onClear={calc.clear}
            onBackspace={calc.backspace}
            onEquals={calc.equals}
          />
        </section>

        <div className="history-pane">
          <History
            entries={calc.history}
            onUse={(entry) => {
              calc.useHistoryEntry(entry);
              setShowHistory(false);
            }}
            onRemove={calc.removeHistoryEntry}
            onClear={calc.clearHistory}
          />
        </div>
      </main>
    </div>
  );
}
