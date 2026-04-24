# ⚡ Compiler Visualizer

A stunning, interactive, purely frontend web application designed to visualize the internal pipeline of a compiler. Watch your code get transformed step-by-step through Lexical Analysis, Parsing, Abstract Syntax Trees, Control Flow Graphs, and Three Address Code.

Featuring a beautiful, interactive "coding constellation" background and an incredibly snappy UI, this project runs entirely in the browser with no backend required!

---

## 🚀 Features

The visualizer supports a C-like syntax and breaks the compilation process down into six distinct, visual stages:

1. **Lexer**: Tokenizes the input code, classifying identifiers, numbers, operators, keywords, and symbols.
2. **Symbol Table**: Extracts and displays declared variables, tracking their data types and assignments.
3. **Errors**: Performs syntax and structural checking to ensure your code is valid, providing helpful error messages if it's not.
4. **Tree**: Dynamically draws a highly detailed Abstract Syntax Tree (AST) on a canvas, showing exactly how the compiler parses the hierarchy of your code.
5. **CFG (Control Flow Graph)**: Visually maps the logical paths of your code—perfect for understanding how `if` statements and `while` loops branch and merge.
6. **3AC (Three Address Code)**: Translates the code into intermediate machine-like instructions, handling temporary variables (`t1`, `t2`), conditional jumps, and function calls.

---

## 📂 Project Structure

All logic is written in modular, vanilla JavaScript to ensure blazing fast performance without heavy frameworks.

| File | Purpose |
|------|---------|
| `index.html` | The main entry point and UI structure. |
| `style.css` | Modern, dark-themed styles with neon accents. |
| `script.js` | UI orchestration (button clicks, canvas clearing, hiding/showing panels). |
| `background.js` | The interactive, cursor-responsive floating particle background. |
| `compiler.js` | The master function that runs all compiler stages sequentially. |
| `lexer.js` | The Lexical Analyzer (Regex-based tokenization). |
| `parser.js` / `tree.js` / `drawTree.js` | The Syntax Analyzer and AST Canvas rendering logic. |
| `symbolTable.js` | Logic for parsing declarations and populating the symbol table. |
| `tac.js` | The Intermediate Code Generator (Three Address Code). |
| `cfg.js` | Logic to convert TAC into a visual Control Flow Graph on the canvas. |

*(Note: The DFA visualization logic was previously included but has been removed to keep the interface streamlined).*

---

## 🛠️ How to Run

Because this project is built entirely with Vanilla HTML/CSS/JS, it is incredibly easy to run.

### Option 1: Direct Open (Easiest)
Simply double-click `index.html` to open it in your favorite web browser (Chrome, Edge, Firefox, or Safari).

### Option 2: Local Web Server (Recommended for development)
If you are modifying the code and want to avoid strict browser CORS policies when testing, run a simple local HTTP server:

**Using Python:**
```bash
# Open your terminal in the project directory
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

**Using VS Code:**
Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".

---

## 💻 Example Code to Try

Paste the following C-like snippet into the editor and click through the stages 1 to 6 to see the magic happen!

```c
#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    
    if (x < y) {
        printf("x is smaller");
    } else {
        printf("y is smaller");
    }
    
    while (x > 0) {
        x = x - 1;
    }
    
    return 0;
}
```

---

## 🎨 Design Notes

- **Aesthetics**: Uses a `#0f172a` deep slate background with vibrant `#38bdf8` (sky blue) and `#4ade80` (neon green) accents.
- **Interactivity**: Move your mouse across the background to interact with the drifting code constellation! Nodes will glow and gently push away from your cursor.
- **Responsive**: Canvases are generated dynamically, though they are optimized for desktop viewing due to the wide nature of syntax trees and flow graphs.
