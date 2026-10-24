# ExplainMyCode

Understand code, one explanation at a time.

Paste code, get a plain-English explanation — line by line. No sign-up, no API key, nothing is sent to a server. It all runs in your browser.

## What it does

- Auto-detects Python, JavaScript, Java, C/C++, and HTML (or pick a language yourself)
- Explains each line in plain English
- Gives an overall summary of what the code does
- Highlights the concepts used: functions, loops, conditions, variables, and more
- Three explanation levels: Simple, Normal, and Detailed
- Built-in examples, and a one-click copy of the whole explanation

## How to use it

### Option 1: Open it right away

Just open `index.html` in any browser. That's it — no build step, no install.

### Option 2: GitHub Pages

1. Go to the repo on GitHub → **Settings → Pages**
2. Under **Build and deployment**, choose **Deploy from a branch**
3. Choose `main` and `/ (root)`, then **Save**
4. Your site will be live at `https://vantaexe.github.io/ExplainMyCode/`

## Try it

Paste this in:

```python
def is_even(n):
    if n % 2 == 0:
        return True
    return False

print(is_even(10))
```

You should get: a summary saying it checks whether a number is even, plus a line-by-line explanation of the function, the `if` check, and both `return` statements.

## How it works

`app.js` reads the structure of your code — function definitions, `if`/`else`, `for`/`while` loops, variable assignments, `return`, and `print`/`console.log` — and turns each pattern into plain English. It's a great first step for learning. For very complex code, also try running it step by step, or with a debugger.

## What's next

Ideas for future versions:

- More languages and code patterns
- A "quiz me on this code" mode
- An optional AI explanation mode (with your own API key, kept in your browser only)

---

Made by Vanta · Learning by building.
