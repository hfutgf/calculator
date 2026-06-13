interface DisplayProps {
  expr: string;
  preview: string;
  error: boolean;
}

export function Display({ expr, preview, error }: DisplayProps) {
  return (
    <div className="display" role="status" aria-live="polite">
      <div className="display__preview">{error ? "Ошибка" : preview}</div>
      <div
        className={`display__expr${error ? " display__expr--error" : ""}`}
        title={expr}
      >
        {expr || "0"}
      </div>
    </div>
  );
}
