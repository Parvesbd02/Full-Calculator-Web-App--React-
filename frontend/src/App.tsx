import React, { useState } from "react";

// Full Calculator Web App
// Single-file React component (default export)
// Tailwind-friendly classes (no Tailwind import required here — add Tailwind to your project to get styling)

export default function CalculatorApp() {
  const [mode, setMode] = useState("basic"); // basic | scientific | emi | convert
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);

  // EMI state
  const [loan, setLoan] = useState(50000);
  const [rate, setRate] = useState(7.5);
  const [tenure, setTenure] = useState(36);
  const [emiRes, setEmiRes] = useState(null);

  // Converter state (simple)
  const [fromValue, setFromValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("cm");
  const [convRes, setConvRes] = useState(null);

  // Helpers
  function append(val) {
    setExpr((s) => s + val);
    setResult("");
  }

  function clearAll() {
    setExpr("");
    setResult("");
  }

  function backspace() {
    setExpr((s) => s.slice(0, -1));
  }

  function evaluateExpression() {
    if (!expr) return;
    try {
      // safe-ish evaluation for calculator expressions
      // replace common math inputs: ^ -> **, ÷ -> /, × -> *
      const safeExpr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
      // avoid calling global objects by disallowing letters except "e" and constants
      if (/[a-df-zA-DF-Z]/.test(safeExpr.replace(/e/g, ""))) throw new Error("Invalid characters in expression");
      // evaluate
      // eslint-disable-next-line no-new-func
      const res = Function(`"use strict"; return (${safeExpr})`)();
      setResult(String(res));
      setHistory((h) => [{ expr, res: String(res) }, ...h].slice(0, 50));
    } catch (err) {
      setResult("Error");
    }
  }

  // scientific helpers
  function scientific(fn) {
    try {
      // evaluate current expression then apply fn
      const safeExpr = expr || "0";
      if (/[a-df-zA-DF-Z]/.test(safeExpr.replace(/e/g, ""))) throw new Error("Invalid");
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${safeExpr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**")})`)();
      const res = fn(value);
      setExpr(String(res));
      setResult(String(res));
      setHistory((h) => [{ expr: `${fn.name}(${safeExpr})`, res: String(res) }, ...h].slice(0, 50));
    } catch (e) {
      setResult("Error");
    }
  }

  // EMI calculation
  function calcEmi() {
    const P = Number(loan);
    const r = Number(rate) / 100 / 12; // monthly rate
    const n = Number(tenure);
    if (r === 0) {
      const emi = P / n;
      setEmiRes({ emi, total: emi * n, interest: emi * n - P });
      return;
    }
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    setEmiRes({ emi: Number(emi.toFixed(2)), total: Number(total.toFixed(2)), interest: Number(interest.toFixed(2)) });
  }

  // Simple unit converter (length: m, cm, mm, km, inch, ft)
  const lengthFactors = {
    km: 1000,
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
  };

  function convertUnits() {
    const v = Number(fromValue);
    if (isNaN(v)) return setConvRes("NaN");
    const base = v * (lengthFactors[fromUnit] ?? 1);
    const out = base / (lengthFactors[toUnit] ?? 1);
    setConvRes(Number(out.toFixed(6)));
  }

  // keyboard support
  React.useEffect(() => {
    function onKey(e) {
      if (e.key >= "0" && e.key <= "9") append(e.key);
      else if ("+-*/().%^".includes(e.key)) append(e.key);
      else if (e.key === "Enter") evaluateExpression();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Calculator */}
        <div className="p-4 rounded-lg border">
          <div className="flex gap-2 mb-4">
            {[
              { id: "basic", label: "Basic" },
              { id: "scientific", label: "Scientific" },
              { id: "emi", label: "EMI" },
              { id: "convert", label: "Converter" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${mode === t.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Display */}
          <div className="mb-3">
            <div className="bg-slate-900 text-white text-right p-3 rounded-md text-2xl font-mono">{expr || "0"}</div>
            <div className="text-right mt-1 text-gray-600">{result ? `= ${result}` : " "}</div>
          </div>

          {mode === "basic" && (
            <div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "C", action: clearAll },
                  { label: "⌫", action: backspace },
                  { label: "%", action: () => append("%") },
                  { label: "÷", action: () => append("/") },
                  { label: "7", action: () => append("7") },
                  { label: "8", action: () => append("8") },
                  { label: "9", action: () => append("9") },
                  { label: "×", action: () => append("*") },
                  { label: "4", action: () => append("4") },
                  { label: "5", action: () => append("5") },
                  { label: "6", action: () => append("6") },
                  { label: "-", action: () => append("-") },
                  { label: "1", action: () => append("1") },
                  { label: "2", action: () => append("2") },
                  { label: "3", action: () => append("3") },
                  { label: "+", action: () => append("+") },
                  { label: "0", action: () => append("0") },
                  { label: ".", action: () => append(".") },
                  { label: "()", action: () => append("(") },
                  { label: "=", action: evaluateExpression },
                ].map((b, i) => (
                  <button
                    key={i}
                    onClick={b.action}
                    className={`p-3 rounded-md text-lg ${b.label === "=" ? "col-span-1 bg-indigo-600 text-white" : "bg-gray-100"}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "scientific" && (
            <div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  { label: "sin", fn: (x) => Math.sin((x * Math.PI) / 180) },
                  { label: "cos", fn: (x) => Math.cos((x * Math.PI) / 180) },
                  { label: "tan", fn: (x) => Math.tan((x * Math.PI) / 180) },
                  { label: "ln", fn: (x) => Math.log(x) },
                  { label: "log", fn: (x) => Math.log10(x) },
                  { label: "x^2", fn: (x) => x * x },
                  { label: "√", fn: (x) => Math.sqrt(x) },
                  { label: "n!", fn: (x) => { let n = Math.floor(x); if(n<0) return NaN; let f=1; for(let i=2;i<=n;i++) f*=i; return f; } },
                  { label: "^", action: () => append("^") },
                  { label: "π", action: () => append(String(Math.PI)) },
                ].map((b, i) => (
                  <button
                    key={i}
                    onClick={() => (b.fn ? scientific(b.fn) : b.action && b.action())}
                    className="p-3 rounded-md bg-gray-100"
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  "7","8","9","/",
                  "4","5","6","*",
                  "1","2","3","-",
                  "0",".","(",")",
                ].map((l, i)=> (
                  <button key={i} onClick={() => append(l)} className="p-3 rounded-md bg-gray-100">{l}</button>
                ))}

                <button onClick={evaluateExpression} className="col-span-4 p-3 rounded-md bg-indigo-600 text-white">Evaluate</button>
              </div>
            </div>
          )}

          {mode === "emi" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm">Loan amount (P)</label>
                <input type="number" value={loan} onChange={(e)=>setLoan(e.target.value)} className="p-2 rounded-md border" />
                <label className="text-sm">Annual rate (%)</label>
                <input type="number" value={rate} onChange={(e)=>setRate(e.target.value)} className="p-2 rounded-md border" />
                <label className="text-sm">Tenure (months)</label>
                <input type="number" value={tenure} onChange={(e)=>setTenure(e.target.value)} className="p-2 rounded-md border" />
                <div />
                <div className="flex gap-2">
                  <button onClick={calcEmi} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Calculate</button>
                  <button onClick={()=>{setEmiRes(null); setLoan(50000); setRate(7.5); setTenure(36)}} className="px-4 py-2 bg-gray-100 rounded-md">Reset</button>
                </div>
              </div>
              {emiRes && (
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div>Monthly EMI: <strong>{emiRes.emi}</strong></div>
                  <div>Total Payment: <strong>{emiRes.total}</strong></div>
                  <div>Total Interest: <strong>{emiRes.interest}</strong></div>
                </div>
              )}
            </div>
          )}

          {mode === "convert" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 items-center">
                <input type="number" value={fromValue} onChange={(e)=>setFromValue(e.target.value)} className="p-2 rounded-md border" />
                <div className="flex gap-2">
                  <select value={fromUnit} onChange={(e)=>setFromUnit(e.target.value)} className="p-2 rounded-md border">
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="km">km</option>
                    <option value="in">in</option>
                    <option value="ft">ft</option>
                  </select>

                  <select value={toUnit} onChange={(e)=>setToUnit(e.target.value)} className="p-2 rounded-md border">
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="mm">mm</option>
                    <option value="km">km</option>
                    <option value="in">in</option>
                    <option value="ft">ft</option>
                  </select>

                  <button onClick={convertUnits} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Convert</button>
                </div>
              </div>

              {convRes !== null && (
                <div className="p-3 bg-gray-50 rounded-md border">Result: <strong>{convRes}</strong> {toUnit}</div>
              )}
            </div>
          )}
        </div>

        {/* Right: History + Quick actions */}
        <div className="p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <div className="max-h-64 overflow-auto divide-y">
            {history.length === 0 && <div className="text-sm text-gray-500">No history yet — perform a calculation.</div>}
            {history.map((h, i) => (
              <div key={i} className="p-2 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">{h.expr}</div>
                  <div className="font-mono">{h.res}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{setExpr(h.expr); setResult(h.res);}} className="text-sm px-2 py-1 bg-gray-100 rounded-md">Use</button>
                  <button onClick={()=> setHistory((s)=> s.filter((_,idx)=>idx!==i))} className="text-sm px-2 py-1 bg-red-50 rounded-md">Del</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Quick Functions</h4>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>{setExpr("Math.PI"); setResult(String(Math.PI))}} className="px-3 py-2 bg-gray-100 rounded-md">π</button>
              <button onClick={()=>{setExpr(String(Math.E)); setResult(String(Math.E))}} className="px-3 py-2 bg-gray-100 rounded-md">e</button>
              <button onClick={()=>{setExpr("(1+1)/2"); setResult("")}} className="px-3 py-2 bg-gray-100 rounded-md">Example</button>
              <button onClick={()=>{clearAll(); setHistory([])}} className="px-3 py-2 bg-red-50 rounded-md">Clear All</button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Tips: Use the tabs to switch modes. Keyboard works: numbers, + - * / ( ), Enter = evaluate, Backspace = del.
          </div>
        </div>
      </div>
    </div>
  );
}
