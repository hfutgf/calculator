import type { HistoryEntry } from "../types";

interface HistoryProps {
  entries: HistoryEntry[];
  onUse: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function History({ entries, onUse, onRemove, onClear }: HistoryProps) {
  return (
    <aside className="history">
      <header className="history__header">
        <h2 className="history__title">История</h2>
        {entries.length > 0 && (
          <button type="button" className="history__clear" onClick={onClear}>
            Очистить
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="history__empty">
          Пока пусто.
          <br />
          Вычисления появятся здесь.
        </p>
      ) : (
        <ul className="history__list">
          {entries.map((entry) => (
            <li key={entry.id} className="history__item">
              <button
                type="button"
                className="history__use"
                onClick={() => onUse(entry)}
                title="Подставить результат"
              >
                <span className="history__expr">{entry.expression}</span>
                <span className="history__result">= {entry.result}</span>
                <span className="history__time">{formatTime(entry.timestamp)}</span>
              </button>
              <button
                type="button"
                className="history__remove"
                onClick={() => onRemove(entry.id)}
                aria-label="Удалить запись"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
