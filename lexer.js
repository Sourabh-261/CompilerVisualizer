"use strict";
// ============================================
// Codeezy — C Language Lexical Analyzer
// ============================================

// C language keywords
const C_KEYWORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
  'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof',
  'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void',
  'volatile', 'while',
]);

// Multi-character operators (ordered by length — longest first)
const MULTI_OPS = [
  '<<=', '>>=',
  '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->', '##',
];

// Single-character operators
const SINGLE_OPS = new Set([
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':',
]);

// Delimiters
const DELIMITERS = new Set([
  '(', ')', '{', '}', '[', ']', ';', ',', '.', '#',
]);

/**
 * Tokenize C source code.
 * Returns a flat array of { type, value } objects matching the format
 * expected by compiler.js, parser.js, tac.js, and highlights.js.
 *
 * Type mapping:
 *   KEYWORD      → "KEY"
 *   IDENTIFIER   → "ID"
 *   CONSTANT     → "NUM"
 *   STRING_LIT   → "STRING"
 *   CHAR_LIT     → "CHAR"
 *   OPERATOR     → "OP"
 *   DELIMITER    → "SYM"
 *   PREPROCESSOR → "PREPROCESSOR"
 *   ERROR        → "INVALID"
 */
function tokenize(source) {
  const tokens = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  const length = source.length;

  function peek(offset = 0) {
    return pos + offset < length ? source[pos + offset] : '\0';
  }

  function advance() {
    const ch = source[pos];
    pos++;
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function addToken(type, lexeme) {
    tokens.push({ type, value: lexeme });
  }

  function isAlpha(ch) {
    return /[a-zA-Z_]/.test(ch);
  }

  function isDigit(ch) {
    return /[0-9]/.test(ch);
  }

  function isAlphaNum(ch) {
    return /[a-zA-Z0-9_]/.test(ch);
  }

  function isWhitespace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
  }

  // ─── Main tokenization loop ──────────────────────────────
  while (pos < length) {
    const ch = peek();

    // Skip whitespace
    if (isWhitespace(ch)) {
      advance();
      continue;
    }

    // ─── Comments ────────────────────────────────────────
    if (ch === '/' && peek(1) === '/') {
      // Single-line comment — skip
      while (pos < length && peek() !== '\n') {
        advance();
      }
      continue;
    }

    if (ch === '/' && peek(1) === '*') {
      // Multi-line comment
      advance(); // /
      advance(); // *
      let closed = false;
      while (pos < length) {
        if (peek() === '*' && peek(1) === '/') {
          advance(); // *
          advance(); // /
          closed = true;
          break;
        }
        advance();
      }
      if (!closed) {
        addToken("INVALID", "/* unterminated comment");
      }
      continue;
    }

    // ─── Preprocessor Directives ─────────────────────────
    if (ch === '#') {
      let lexeme = '';
      while (pos < length && peek() !== '\n') {
        lexeme += advance();
      }
      addToken("PREPROCESSOR", lexeme.trim());
      continue;
    }

    // ─── String Literals ─────────────────────────────────
    if (ch === '"') {
      let lexeme = '';
      lexeme += advance(); // opening "
      let closed = false;
      while (pos < length) {
        const c = peek();
        if (c === '\\') {
          lexeme += advance(); // backslash
          if (pos < length) lexeme += advance(); // escaped char
          continue;
        }
        if (c === '"') {
          lexeme += advance(); // closing "
          closed = true;
          break;
        }
        if (c === '\n') {
          break; // string can't span lines in C
        }
        lexeme += advance();
      }
      if (closed) {
        addToken("STRING", lexeme);
      } else {
        addToken("INVALID", lexeme);
      }
      continue;
    }

    // ─── Character Literals ──────────────────────────────
    if (ch === "'") {
      let lexeme = '';
      lexeme += advance(); // opening '
      let closed = false;
      while (pos < length) {
        const c = peek();
        if (c === '\\') {
          lexeme += advance();
          if (pos < length) lexeme += advance();
          continue;
        }
        if (c === "'") {
          lexeme += advance();
          closed = true;
          break;
        }
        if (c === '\n') break;
        lexeme += advance();
      }
      if (closed) {
        addToken("CHAR", lexeme);
      } else {
        addToken("INVALID", lexeme);
      }
      continue;
    }

    // ─── Numbers (integers and floats) ──────────────────
    if (isDigit(ch) || (ch === '.' && isDigit(peek(1)))) {
      let lexeme = '';

      // Handle hex: 0x...
      if (ch === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
        lexeme += advance(); // 0
        lexeme += advance(); // x
        while (pos < length && /[0-9a-fA-F]/.test(peek())) {
          lexeme += advance();
        }
        addToken("NUM", lexeme);
        continue;
      }

      // Integer or float
      while (pos < length && isDigit(peek())) {
        lexeme += advance();
      }
      if (peek() === '.' && isDigit(peek(1))) {
        lexeme += advance(); // .
        while (pos < length && isDigit(peek())) {
          lexeme += advance();
        }
      }
      // Scientific notation
      if (peek() === 'e' || peek() === 'E') {
        lexeme += advance();
        if (peek() === '+' || peek() === '-') lexeme += advance();
        while (pos < length && isDigit(peek())) {
          lexeme += advance();
        }
      }
      // Suffix: f, l, u, etc.
      if (/[fFlLuU]/.test(peek())) {
        lexeme += advance();
      }

      addToken("NUM", lexeme);
      continue;
    }

    // ─── Identifiers and Keywords ──────────────────────
    if (isAlpha(ch)) {
      let lexeme = '';
      while (pos < length && isAlphaNum(peek())) {
        lexeme += advance();
      }
      const type = C_KEYWORDS.has(lexeme) ? "KEY" : "ID";
      addToken(type, lexeme);
      continue;
    }

    // ─── Multi-character Operators ──────────────────────
    let matchedOp = null;
    for (const op of MULTI_OPS) {
      let match = true;
      for (let i = 0; i < op.length; i++) {
        if (peek(i) !== op[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        matchedOp = op;
        break;
      }
    }
    if (matchedOp) {
      for (let i = 0; i < matchedOp.length; i++) advance();
      addToken("OP", matchedOp);
      continue;
    }

    // ─── Single-character Operators ─────────────────────
    if (SINGLE_OPS.has(ch)) {
      advance();
      addToken("OP", ch);
      continue;
    }

    // ─── Delimiters ─────────────────────────────────────
    if (DELIMITERS.has(ch)) {
      advance();
      addToken("SYM", ch);
      continue;
    }

    // ─── Unknown character ──────────────────────────────
    const unknownChar = advance();
    addToken("INVALID", unknownChar);
  }

  return tokens;
}
