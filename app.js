// ExplainMyCode — a small, dependency-free code explainer.
// It reads the *structure* of code (functions, loops, conditions, variables)
// and turns each line into plain English. No code is sent anywhere.

const $ = (id) => document.getElementById(id);

const SAMPLES = {
  python: `def is_even(n):
    if n % 2 == 0:
        return True
    return False

print(is_even(10))`,
  javascript: `function sum(numbers) {
  let total = 0;
  for (let n of numbers) {
    total += n;
  }
  return total;
}

console.log(sum([1, 2, 3]));`,
  loop: `for i in range(5):
    print("Hello", i)`,
};

function detectLanguage(code) {
  if (/^\s*</.test(code) || /<\/?(html|div|p|h1|body)[\s>]/.test(code)) return "HTML";
  if (/\bdef\s+\w+\s*\(/.test(code) || /\bprint\s*\(/.test(code) || /:\s*$/.test(code.split("\n")[0])) return "Python";
  if (/\bfunction\s+\w+|=>|console\.log|const\s+\w+\s*=|let\s+\w+\s*=/.test(code)) return "JavaScript";
  if (/\bpublic\s+(static\s+)?\w+\s+\w+\s*\(|System\.out\.println/.test(code)) return "Java";
  if (/#include|std::|int\s+main\s*\(/.test(code)) return "C / C++";
  return "Code";
}

function clean(line) {
  return line.trim().replace(/\s+/g, " ");
}

function explainLine(raw, level) {
  const line = clean(raw);
  if (!line) return null;
  const simple = level === "simple";
  const detail = level === "detailed";

  const match = (re) => line.match(re);

  let m;
  if ((m = match(/^(def|function)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/))) {
    const args = m[3].trim();
    return simple
      ? `This creates a reusable block of code called "${m[2]}".`
      : `This defines a function named "${m[2]}"${args ? ` that takes ${args} as input` : " with no inputs"}. You can run it later by calling its name.`;
  }
  if ((m = match(/^(class)\s+([A-Za-z_]\w*)/))) {
    return `This creates a class called "${m[2]}" — a blueprint for making objects with their own data and actions.`;
  }
  if ((m = match(/^(import|from)\s+(.+)/))) {
    return `This brings in ready-made code (${m[2]}) so you can use it here instead of writing it from scratch.`;
  }
  if ((m = match(/^(if|elif|else if)\s+(.+?)\s*:?\s*\{?\s*$/))) {
    return `This checks a condition: ${m[2]}. If it is true, the code underneath it runs.`;
  }
  if (/^else\s*:?\s*\{?\s*$/.test(line)) {
    return "Otherwise — if none of the conditions above were true — run the code underneath this.";
  }
  if ((m = match(/^for\s+(.+?)\s+(in|of)\s+(.+?)\s*:?\s*\{?\s*$/))) {
    return `This loops through ${m[3]}, doing the following code once for each item, stored in ${m[1]} each time.`;
  }
  if ((m = match(/^for\s*\(\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/))) {
    return `This is a counting loop: it starts with ${m[1]}, keeps going while ${m[2]}, and after each round does ${m[3]}.`;
  }
  if ((m = match(/^while\s+(.+?)\s*:?\s*\{?\s*$/))) {
    return `This repeats the code underneath as long as ${m[1]} stays true.`;
  }
  if ((m = match(/^(return)\s+(.+)/))) {
    return `This sends ${m[2]} back as the result of the function, and stops the function here.`;
  }
  if (/^return\b/.test(line)) {
    return "This ends the function and sends nothing back.";
  }
  if ((m = match(/^(print|console\.log|System\.out\.println|printf|cout)\s*\(?\s*(.+?)\s*\)?\s*;?\s*$/))) {
    return `This shows ${m[2]} as output, so you can see what the program is doing.`;
  }
  if ((m = match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|=)\s*(.+?)\s*;?\s*$/))) {
    if (m[2] === "=") {
      return simple
        ? `This stores ${m[3]} in a box called "${m[1]}" so we can use it later.`
        : `This creates (or updates) a variable called "${m[1]}" and sets it to ${m[3]}.`;
    }
    return `This updates "${m[1]}" by ${m[2] === "+=" ? "adding" : m[2] === "-=" ? "subtracting" : m[2] === "*=" ? "multiplying by" : "dividing by"} ${m[3]}.`;
  }
  if ((m = match(/(const|let|var|int|float|string|double)\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s*;?\s*$/))) {
    return `This declares a variable called "${m[2]}" and sets it to ${m[3]}.`;
  }
  if (/^(break|continue)\b/.test(line)) {
    return line.startsWith("break")
      ? "This stops the loop immediately."
      : "This skips the rest of this round of the loop and jumps to the next one.";
  }
  if (/^#/.test(line) || /^\/\//.test(line)) {
    return "This is a comment — a note for humans. The computer ignores it.";
  }
  if (/\w+\s*\(.*\)\s*;?\s*$/.test(line)) {
    const name = line.match(/([A-Za-z_]\w*)\s*\(/)[1];
    return `This calls (runs) "${name}".`;
  }
  if (/^}/.test(line) || /^\{/.test(line)) {
    return "This marks the end (or start) of a block of code.";
  }
  return detail
    ? `This line runs as part of the program: ${line}.`
    : `This runs: ${line}.`;
}

function findConcepts(code) {
  const concepts = [];
  const add = (label, test) => { if (test.test(code)) concepts.push(label); };
  add("Function", /\b(def|function)\s+\w+\s*\(/);
  add("Loop", /\b(for|while)\b/);
  add("Condition (if/else)", /\bif\b/);
  add("Variable", /=/);
  add("Output / print", /\b(print|console\.log|System\.out\.println)\b/);
  add("Return value", /\breturn\b/);
  add("List / array", /\[.*\]|\bof\b/);
  add("Maths", /[+\-*/%]/);
  return concepts;
}

function summarize(code, language, lines) {
  const hasFn = /\b(def|function)\s+([A-Za-z_]\w*)/.exec(code);
  const hasLoop = /\b(for|while)\b/.test(code);
  const hasIf = /\bif\b/.test(code);
  const parts = [];
  if (hasFn) parts.push(`it defines a function called "${hasFn[2]}"`);
  if (hasLoop) parts.push("it uses a loop to repeat work");
  if (hasIf) parts.push("it makes a decision with an if-condition");
  if (!parts.length) parts.push("it runs a short sequence of steps, top to bottom");

  const joined = parts.length > 1
    ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]
    : parts[0];

  return `Overall, this ${language} code is ${joined}. In plain terms: read it top to bottom, follow what each named block does, and watch how the variables change as it runs. (${lines} non-empty line${lines === 1 ? "" : "s"}.)`;
}

function explain() {
  const code = $("code").value;
  if (!code.trim()) {
    alert("Paste some code first!");
    $("code").focus();
    return;
  }

  const chosen = $("language").value;
  const level = $("level").value;
  const language = chosen === "auto" ? detectLanguage(code) : $("language").selectedOptions[0].text;

  const rawLines = code.split("\n");
  const list = $("lines");
  list.innerHTML = "";
  let count = 0;

  rawLines.forEach((raw) => {
    const text = explainLine(raw, level);
    if (!text) return;
    count += 1;
    const li = document.createElement("li");
    li.textContent = text;
    const codeEl = document.createElement("code");
    codeEl.textContent = raw;
    li.appendChild(codeEl);
    list.appendChild(li);
  });

  $("detected").textContent = `Detected: ${language}`;
  $("stats").textContent = `${count} lines explained · ${code.split("\n").length} total lines`;
  $("summary").textContent = summarize(code, language, count);

  const concepts = $("concepts");
  concepts.innerHTML = "";
  findConcepts(code).forEach((c) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = c;
    concepts.appendChild(chip);
  });

  $("output").classList.remove("hidden");
  $("copy").disabled = false;
  $("output").scrollIntoView({ behavior: "smooth" });
}

function copyExplanation() {
  const summary = $("summary").textContent;
  const lines = [...$("lines").children].map((li) => {
    const codeText = li.querySelector("code")?.textContent || "";
    const text = li.firstChild.textContent;
    return `- ${text} [${codeText}]`;
  }).join("\n");
  navigator.clipboard.writeText(`${summary}\n\nLine by line:\n${lines}`).then(() => {
    $("copy").textContent = "Copied!";
    setTimeout(() => { $("copy").textContent = "Copy explanation"; }, 2000);
  });
}

$("explain").addEventListener("click", explain);
$("clear").addEventListener("click", () => {
  $("code").value = "";
  $("output").classList.add("hidden");
  $("copy").disabled = true;
  $("code").focus();
});
$("copy").addEventListener("click", copyExplanation);
document.querySelectorAll("[data-sample]").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("code").value = SAMPLES[btn.dataset.sample];
    if (btn.dataset.sample === "javascript") $("language").value = "javascript";
    else $("language").value = "python";
    explain();
  });
});
