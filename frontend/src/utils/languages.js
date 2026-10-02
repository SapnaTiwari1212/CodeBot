/**
 * The languages CodeBot supports.
 *
 * `monaco` is the language id Monaco expects. `id` is the identifier sent to the
 * backend, which validates it against the same list.
 */
export const LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python', extension: 'py' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', extension: 'js' },
  { id: 'java', label: 'Java', monaco: 'java', extension: 'java' },
  { id: 'c', label: 'C', monaco: 'c', extension: 'c' },
  { id: 'cpp', label: 'C++', monaco: 'cpp', extension: 'cpp' },
  { id: 'html', label: 'HTML', monaco: 'html', extension: 'html' },
  { id: 'css', label: 'CSS', monaco: 'css', extension: 'css' },
  { id: 'sql', label: 'SQL', monaco: 'sql', extension: 'sql' },
]

export const LANGUAGE_IDS = LANGUAGES.map((language) => language.id)

/** Look up a language by id, or return null when it is not supported. */
export function getLanguage(id) {
  return LANGUAGES.find((language) => language.id === id) ?? null
}

/** Human readable label for a language id, falling back to the raw id. */
export function getLanguageLabel(id) {
  return getLanguage(id)?.label ?? id
}

/** Monaco language id for a supported language id. */
export function getMonacoLanguage(id) {
  return getLanguage(id)?.monaco ?? 'plaintext'
}

/**
 * Input limits. These mirror the backend's MAX_CODE_LENGTH and MAX_PROMPT_LENGTH
 * so the interface can warn early. The backend validates independently, so this
 * is a convenience rather than the enforcement point.
 */
export const MAX_CODE_LENGTH = 20000
export const MAX_PROMPT_LENGTH = 2000

/** Sample code per language so the editor is never an empty void. */
export const STARTER_CODE = {
  python: `def calculate_sum(a, b):
    return a + b


def average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)
`,
  javascript: `function calculateSum(a, b) {
  return a + b;
}

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
`,
  java: `public class Calculator {
    public static int calculateSum(int a, int b) {
        return a + b;
    }

    public static double average(int[] numbers) {
        if (numbers.length == 0) return 0;
        int sum = 0;
        for (int n : numbers) sum += n;
        return (double) sum / numbers.length;
    }
}
`,
  c: `#include <stdio.h>

int calculate_sum(int a, int b) {
    return a + b;
}

double average(int values[], int count) {
    if (count == 0) return 0;
    int sum = 0;
    for (int i = 0; i < count; i++) sum += values[i];
    return (double)sum / count;
}
`,
  cpp: `#include <iostream>
#include <vector>

int calculateSum(int a, int b) {
    return a + b;
}

double average(const std::vector<int>& values) {
    if (values.empty()) return 0;
    int sum = 0;
    for (int value : values) sum += value;
    return static_cast<double>(sum) / values.size();
}
`,
  html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cart</title>
  </head>
  <body>
    <div class="cart">
      <h2>Your cart</h2>
      <ul id="items"></ul>
      <p class="total">Total: <span id="total">0.00</span></p>
    </div>
  </body>
</html>
`,
  css: `.cart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.cart .total {
  font-weight: 600;
}
`,
  sql: `SELECT
    c.id AS customer_id,
    c.name,
    SUM(i.quantity * i.price) AS subtotal
FROM customers c
JOIN order_items i ON i.order_id = c.order_id
GROUP BY c.id, c.name
ORDER BY subtotal DESC;
`,
}

/** Starter code for a language, or an empty string when none is defined. */
export function getStarterCode(languageId) {
  return STARTER_CODE[languageId] ?? ''
}