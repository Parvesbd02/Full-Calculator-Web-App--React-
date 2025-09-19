import React, { useState, useEffect } from "react";

// Full Calculator Web App
// Single-file React component (default export)
// Tailwind-friendly classes

export default function CalculatorApp() {
  const [mode, setMode] = useState("basic"); // basic | scientific | emi | convert | age | date
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

  // Age Calculator state
  const [dob, setDob] = useState("2000-01-01");
  const [ageRes, setAgeRes] = useState(null);

  // Date Converter state
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [fromCalendar, setFromCalendar] = useState("en-CA"); // Gregorian
  const [toCalendar, setToCalendar] = useState("ar-SA"); // Islamic (Arabic)
  const [dateRes, setDateRes] = useState("");

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
      const safeExpr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
      if (/[a-df-zA-DF-Z]/.test(safeExpr.replace(/e/g, ""))) throw new Error("Invalid characters in expression");
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
    const r = Number(rate) / 100 / 12;
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

  // Age calculation
  function calculateAge() {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    setAgeRes({ years, months, days });
  }
  
  // Date Conversion
  const calendars = {
    "en-CA": "Gregorian (English)",
    "ar-SA": "Islamic (Arabic)",
    "bn-BD": "Bengali",
  };

  function convertDate() {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) throw new Error("Invalid date");
      const formatter = new Intl.DateTimeFormat(toCalendar, {
        dateStyle: 'full',
        calendar: toCalendar.split('-')[0] === "en" ? "gregory" : (toCalendar.split('-')[0] === "ar" ? "islamic" : "bengali"),
      });
      setDateRes(formatter.format(d));
    } catch (e) {
      setDateRes("Invalid Date");
    }
  }

  // keyboard support
  useEffect(() => {
    function onKey(e) {
      if (mode !== "basic" && mode !== "scientific") return;
      if (e.key >= "0" && e.key <= "9") append(e.key);
      else if ("+-*/().%^".includes(e.key)) append(e.key);
      else if (e.key === "Enter") evaluateExpression();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 flex items-start justify-center font-sans">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Headline and Developer Card */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            All-in-One Calculator
          </h1>
          <div className="mt-4 inline-block bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600 font-medium border border-gray-200">
            Developed by: Mohammad Parves
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Calculator */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "basic", label: "Basic" },
                { id: "scientific", label: "Scientific" },
                { id: "emi", label: "EMI" },
                { id: "convert", label: "Unit" },
                { id: "age", label: "Age" },
                { id: "date", label: "Date" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    mode === t.id ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Display */}
            {(mode === "basic" || mode === "scientific") && (
              <div className="mb-6">
                <div className="bg-slate-900 text-white text-right p-4 rounded-xl text-3xl font-mono truncate">{expr || "0"}</div>
                <div className="text-right mt-2 text-lg text-gray-600 font-medium h-6">{result ? `= ${result}` : ""}</div>
              </div>
            )}

            {mode === "basic" && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "C", action: clearAll, className: "bg-red-500 text-white" },
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
                  { label: "0", action: () => append("0"), className: "col-span-2" },
                  { label: ".", action: () => append(".") },
                  { label: "=", action: evaluateExpression, className: "bg-indigo-600 text-white" },
                ].map((b, i) => (
                  <button
                    key={i}
                    onClick={b.action}
                    className={`p-4 rounded-xl text-xl font-semibold transition-transform transform active:scale-95 ${b.className || "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}

            {mode === "scientific" && (
              <div>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[
                    { label: "sin", fn: (x) => Math.sin((x * Math.PI) / 180) },
                    { label: "cos", fn: (x) => Math.cos((x * Math.PI) / 180) },
                    { label: "tan", fn: (x) => Math.tan((x * Math.PI) / 180) },
                    { label: "ln", fn: (x) => Math.log(x) },
                    { label: "log", fn: (x) => Math.log10(x) },
                    { label: "x²", fn: (x) => x * x },
                    { label: "√", fn: (x) => Math.sqrt(x) },
                    { label: "n!", fn: (x) => { let n = Math.floor(x); if(n<0) return NaN; let f=1; for(let i=2;i<=n;i++) f*=i; return f; } },
                    { label: "^", action: () => append("^") },
                    { label: "π", action: () => append(String(Math.PI)) },
                    { label: "(", action: () => append("(") },
                    { label: ")", action: () => append(")") },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={() => (b.fn ? scientific(b.fn) : b.action && b.action())}
                      className="p-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition-transform transform active:scale-95"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    "7","8","9","/",
                    "4","5","6","*",
                    "1","2","3","-",
                    "0",".","C","+",
                  ].map((l, i)=> (
                    <button key={i} onClick={() => l === "C" ? clearAll() : append(l)} className="p-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-xl font-semibold transition-transform transform active:scale-95">{l}</button>
                  ))}
                  <button onClick={evaluateExpression} className="col-span-4 p-4 rounded-xl bg-indigo-600 text-white text-xl font-semibold hover:bg-indigo-700 transition-transform transform active:scale-95">Evaluate</button>
                </div>
              </div>
            )}

            {mode === "emi" && (
              <div className="space-y-4 p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">EMI Calculator</h4>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <label className="text-sm font-medium">Loan amount</label>
                  <input type="number" value={loan} onChange={(e)=>setLoan(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                  <label className="text-sm font-medium">Annual rate (%)</label>
                  <input type="number" value={rate} onChange={(e)=>setRate(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                  <label className="text-sm font-medium">Tenure (months)</label>
                  <input type="number" value={tenure} onChange={(e)=>setTenure(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={calcEmi} className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Calculate</button>
                  <button onClick={()=>{setEmiRes(null); setLoan(50000); setRate(7.5); setTenure(36)}} className="px-5 py-3 bg-gray-200 rounded-xl font-semibold hover:bg-gray-300 transition-colors">Reset</button>
                </div>
                {emiRes && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-800">
                    <div className="text-lg font-semibold">Monthly EMI: <span className="font-mono">{emiRes.emi}</span></div>
                    <div>Total Payment: <span className="font-mono">{emiRes.total}</span></div>
                    <div>Total Interest: <span className="font-mono">{emiRes.interest}</span></div>
                  </div>
                )}
              </div>
            )}

            {mode === "convert" && (
              <div className="space-y-4 p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Unit Converter</h4>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <input type="number" value={fromValue} onChange={(e)=>setFromValue(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                  <select value={fromUnit} onChange={(e)=>setFromUnit(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
                    {Object.keys(lengthFactors).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <p className="text-center text-gray-600">to</p>
                  <select value={toUnit} onChange={(e)=>setToUnit(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
                    {Object.keys(lengthFactors).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <div className="col-span-2 flex justify-center mt-2">
                    <button onClick={convertUnits} className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Convert</button>
                  </div>
                </div>
                {convRes !== null && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-800 text-lg font-semibold">Result: <span className="font-mono">{convRes}</span> {toUnit}</div>
                )}
              </div>
            )}

            {mode === "age" && (
              <div className="space-y-4 p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Age Calculator</h4>
                <div className="grid grid-cols-1 gap-4 items-center">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input type="date" value={dob} onChange={(e)=>setDob(e.target.value)} className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex justify-center mt-2">
                  <button onClick={calculateAge} className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Calculate Age</button>
                </div>
                {ageRes && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-800 text-lg font-semibold">
                    <p>You are:</p>
                    <p><span className="font-mono text-xl">{ageRes.years}</span> years, <span className="font-mono text-xl">{ageRes.months}</span> months, and <span className="font-mono text-xl">{ageRes.days}</span> days old.</p>
                  </div>
                )}
              </div>
            )}

            {mode === "date" && (
              <div className="space-y-4 p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Date Converter</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input type="date" value={dateInput} onChange={(e)=>setDateInput(e.target.value)} className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Calendar</label>
                    <select value={fromCalendar} onChange={(e)=>setFromCalendar(e.target.value)} className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
                      {Object.entries(calendars).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">To Calendar</label>
                    <select value={toCalendar} onChange={(e)=>setToCalendar(e.target.value)} className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
                      {Object.entries(calendars).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-center mt-2">
                  <button onClick={convertDate} className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Convert Date</button>
                </div>
                {dateRes && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-800 text-lg font-semibold">
                    <p>Converted Date:</p>
                    <p className="font-mono text-xl">{dateRes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: History + Quick actions */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">History</h3>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 space-y-2 pr-2">
              {history.length === 0 && <div className="text-sm text-gray-500 p-4">No history yet.</div>}
              {history.map((h, i) => (
                <div key={i} className="p-3 flex justify-between items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-sm text-gray-600 font-mono break-all">{h.expr}</div>
                    <div className="font-bold text-gray-900 text-lg font-mono">{h.res}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{setExpr(h.expr); setResult(h.res);}} className="text-xs px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Use</button>
                    <button onClick={()=> setHistory((s)=> s.filter((_,idx)=>idx!==i))} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">Del</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-xl mb-2">Quick Functions</h4>
              <div className="flex flex-wrap gap-2">
                <button onClick={()=>{setExpr("Math.PI"); setResult(String(Math.PI))}} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">π</button>
                <button onClick={()=>{setExpr(String(Math.E)); setResult(String(Math.E))}} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">e</button>
                <button onClick={()=>{setExpr("(1+1)/2"); setResult("")}} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">Example</button>
                <button onClick={()=>{clearAll(); setHistory([])}} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Clear All</button>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-2">Keyboard Shortcuts:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>**Numbers & Operators:** Type directly for basic and scientific modes.</li>
                <li>**Enter:** Evaluate the expression.</li>
                <li>**Backspace:** Delete the last character.</li>
                <li>**Escape:** Clear the current expression.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
