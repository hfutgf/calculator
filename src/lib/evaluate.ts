// Safe arithmetic expression evaluator (no eval()).
// Pipeline: tokenize -> shunting-yard (to RPN) -> evaluate RPN.
// Supports + - × ÷ ^, parentheses, unary minus, postfix % and decimals.

type TokenType = "num" | "op" | "lparen" | "rparen" | "percent";
interface Token {
  type: TokenType;
  value: string;
}

interface OpInfo {
  prec: number;
  assoc: "L" | "R";
}

const OPS: Record<string, OpInfo> = {
  "+": { prec: 1, assoc: "L" },
  "-": { prec: 1, assoc: "L" },
  "*": { prec: 2, assoc: "L" },
  "/": { prec: 2, assoc: "L" },
  "^": { prec: 4, assoc: "R" },
  "u-": { prec: 3, assoc: "R" }, // unary minus
};

/** Convert pretty display symbols to plain ASCII operators. */
function normalize(input: string): string {
  return input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "");
}

function tokenize(input: string): Token[] {
  const s = normalize(input);
  const tokens: Token[] = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if (/[0-9.]/.test(c)) {
      let num = "";
      let dots = 0;
      while (i < s.length && /[0-9.]/.test(s[i])) {
        if (s[i] === ".") dots++;
        if (dots > 1) throw new Error("Invalid number");
        num += s[i];
        i++;
      }
      tokens.push({ type: "num", value: num });
      continue;
    }

    if (c === "(") {
      tokens.push({ type: "lparen", value: c });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c });
      i++;
      continue;
    }
    if (c === "%") {
      tokens.push({ type: "percent", value: c });
      i++;
      continue;
    }
    if ("+-*/^".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${c}`);
  }

  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | null = null;

  for (const t of tokens) {
    switch (t.type) {
      case "num":
        out.push(t);
        break;

      case "percent":
        out.push(t); // postfix: applies to the value on top of the output
        break;

      case "op": {
        // Detect unary minus (start of expression, or after another operator / "(").
        const isUnary =
          t.value === "-" &&
          (prev === null || prev.type === "op" || prev.type === "lparen");
        const op: Token = isUnary ? { type: "op", value: "u-" } : t;

        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.type !== "op") break;
          const o1 = OPS[op.value];
          const o2 = OPS[top.value];
          const shouldPop =
            (o1.assoc === "L" && o1.prec <= o2.prec) ||
            (o1.assoc === "R" && o1.prec < o2.prec);
          if (!shouldPop) break;
          out.push(stack.pop()!);
        }
        stack.push(op);
        break;
      }

      case "lparen":
        stack.push(t);
        break;

      case "rparen": {
        while (stack.length && stack[stack.length - 1].type !== "lparen") {
          out.push(stack.pop()!);
        }
        if (!stack.length) throw new Error("Mismatched parentheses");
        stack.pop(); // discard the "("
        break;
      }
    }
    prev = t;
  }

  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === "lparen") throw new Error("Mismatched parentheses");
    out.push(t);
  }

  return out;
}

function evalRPN(rpn: Token[]): number {
  const st: number[] = [];

  for (const t of rpn) {
    if (t.type === "num") {
      st.push(parseFloat(t.value));
      continue;
    }

    if (t.type === "percent") {
      const a = st.pop();
      if (a === undefined) throw new Error("Invalid expression");
      st.push(a / 100);
      continue;
    }

    if (t.type === "op") {
      if (t.value === "u-") {
        const a = st.pop();
        if (a === undefined) throw new Error("Invalid expression");
        st.push(-a);
        continue;
      }

      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) {
        throw new Error("Invalid expression");
      }

      switch (t.value) {
        case "+":
          st.push(a + b);
          break;
        case "-":
          st.push(a - b);
          break;
        case "*":
          st.push(a * b);
          break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          st.push(a / b);
          break;
        case "^":
          st.push(Math.pow(a, b));
          break;
      }
    }
  }

  if (st.length !== 1) throw new Error("Invalid expression");
  const result = st[0];
  if (!Number.isFinite(result)) throw new Error("Out of range");
  return result;
}

/** Evaluate a display-string expression. Throws on invalid input. */
export function evaluate(input: string): number {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new Error("Empty expression");
  return evalRPN(toRPN(tokens));
}

/** Format a number for display: trims float noise and adds thousands separators. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  // Strip floating-point artefacts (e.g. 0.1 + 0.2) by capping precision.
  const cleaned = parseFloat(n.toPrecision(12));
  return cleaned.toLocaleString("en-US", { maximumFractionDigits: 10 });
}
