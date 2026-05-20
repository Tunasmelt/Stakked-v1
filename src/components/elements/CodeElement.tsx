'use client';

import React, { useState, useCallback } from 'react';
import { StakkedElement, StakkedCodeContent } from '@/types/element';
import styles from '@/styles/Elements.module.css';

const JS_KEYWORDS = /\b(const|let|var|function|return|if|else|class|import|export|from|default|new|this|typeof|instanceof|for|while|do|switch|case|break|continue|try|catch|finally|throw|void|delete|in|of|async|await|yield|true|false|null|undefined|NaN|Infinity)\b/g;
const PY_KEYWORDS = /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|True|False|None|pass|break|continue|try|except|finally|raise|with|as|lambda|yield|global|nonlocal|del|assert|async|await)\b/g;
const CSS_KEYWORDS = /\b(px|em|rem|vh|vw|%|auto|none|inherit|initial|unset|flex|grid|block|inline|absolute|relative|fixed|sticky)\b/g;

const THEMES = {
  dark: {
    bg: '#1e1e2e',
    text: '#cdd6f4',
    lineNumBg: '#181825',
    lineNumColor: '#585b70',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    comment: '#6c7086',
    number: '#fab387',
    operator: '#89dceb',
    headerBg: '#13131f',
    headerText: '#585b70',
    copyBtn: '#45475a',
    copyBtnHover: '#585b70',
  },
  light: {
    bg: '#fafafa',
    text: '#383a42',
    lineNumBg: '#f0f0f0',
    lineNumColor: '#a0a1a7',
    keyword: '#a626a4',
    string: '#50a14f',
    comment: '#a0a1a7',
    number: '#986801',
    operator: '#0184bc',
    headerBg: '#e8e8e8',
    headerText: '#a0a1a7',
    copyBtn: '#d0d0d0',
    copyBtnHover: '#b0b0b0',
  },
};

function tokenize(code: string, language: string, theme: 'dark' | 'light'): string {
  const t = THEMES[theme];

  // Escape HTML
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments (// and # style)
  escaped = escaped.replace(
    /(\/\/[^\n]*|#[^\n]*)/g,
    `<span style="color:${t.comment}">$1</span>`
  );

  // Strings (double and single quoted)
  escaped = escaped.replace(
    /(&quot;[^&]*?&quot;|'[^']*?'|`[^`]*?`)/g,
    `<span style="color:${t.string}">$1</span>`
  );

  // Numbers
  escaped = escaped.replace(
    /\b(\d+\.?\d*)\b/g,
    `<span style="color:${t.number}">$1</span>`
  );

  // Keywords (language-specific)
  const kwRe = language === 'python' ? PY_KEYWORDS
    : language === 'css' ? CSS_KEYWORDS
    : JS_KEYWORDS;
  escaped = escaped.replace(
    kwRe,
    `<span style="color:${t.keyword};font-weight:600">$1</span>`
  );

  return escaped;
}

export default function CodeElement({ element }: { element: StakkedElement; isEditing?: boolean }) {
  const content = element.content.type === 'code'
    ? element.content as StakkedCodeContent
    : null;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!content) return;
    navigator.clipboard.writeText(content.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {/* ignore */});
  }, [content]);

  if (!content) return null;

  const { code, language, theme, showLineNumbers, showCopyButton } = content;
  const t = THEMES[theme];

  const lines = code.split('\n');
  const tokenized = lines.map(line => tokenize(line, language, theme));

  return (
    <div className={styles.codeWrapper} style={{ background: t.bg, color: t.text }}>
      {/* Header bar */}
      <div className={styles.codeHeader} style={{ background: t.headerBg }}>
        <span className={styles.codeLanguage} style={{ color: t.headerText }}>{language}</span>
        {showCopyButton && (
          <button
            className={styles.codeCopyBtn}
            style={{ background: t.copyBtn, color: t.text }}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>

      {/* Code body */}
      <div className={styles.codeBody}>
        {showLineNumbers && (
          <div className={styles.codeLineNumbers} style={{ background: t.lineNumBg, color: t.lineNumColor }}>
            {lines.map((_, i) => (
              <div key={i} className={styles.codeLineNum}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre
          className={styles.codePre}
          style={{ color: t.text, margin: 0 }}
        >
          {tokenized.map((html, i) => (
            <div
              key={i}
              className={styles.codeRow}
              dangerouslySetInnerHTML={{ __html: html || ' ' }}
            />
          ))}
        </pre>
      </div>
    </div>
  );
}
