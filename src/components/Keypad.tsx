import { Key } from "./Key";

interface KeypadProps {
  onInput: (c: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
}

export function Keypad({
  onInput,
  onClear,
  onBackspace,
  onEquals,
}: KeypadProps) {
  return (
    <div className="keypad">
      <Key variant="function" onClick={onClear} ariaLabel="Очистить">
        AC
      </Key>
      <Key variant="function" onClick={() => onInput("(")} ariaLabel="Открыть скобку">
        (
      </Key>
      <Key variant="function" onClick={() => onInput(")")} ariaLabel="Закрыть скобку">
        )
      </Key>
      <Key variant="accent" onClick={() => onInput("÷")} ariaLabel="Разделить">
        ÷
      </Key>

      <Key onClick={() => onInput("7")}>7</Key>
      <Key onClick={() => onInput("8")}>8</Key>
      <Key onClick={() => onInput("9")}>9</Key>
      <Key variant="accent" onClick={() => onInput("×")} ariaLabel="Умножить">
        ×
      </Key>

      <Key onClick={() => onInput("4")}>4</Key>
      <Key onClick={() => onInput("5")}>5</Key>
      <Key onClick={() => onInput("6")}>6</Key>
      <Key variant="accent" onClick={() => onInput("−")} ariaLabel="Минус">
        −
      </Key>

      <Key onClick={() => onInput("1")}>1</Key>
      <Key onClick={() => onInput("2")}>2</Key>
      <Key onClick={() => onInput("3")}>3</Key>
      <Key variant="accent" onClick={() => onInput("+")} ariaLabel="Плюс">
        +
      </Key>

      <Key variant="function" onClick={() => onInput("%")} ariaLabel="Процент">
        %
      </Key>
      <Key onClick={() => onInput("0")}>0</Key>
      <Key onClick={() => onInput(".")} ariaLabel="Точка">
        .
      </Key>
      <Key variant="equals" onClick={onEquals} ariaLabel="Равно">
        =
      </Key>

      <Key variant="function" wide onClick={onBackspace} ariaLabel="Удалить символ">
        ⌫ Стереть
      </Key>
    </div>
  );
}
