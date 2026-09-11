/**
 * Remark plugin that normalizes shell-session code blocks.
 * Lines without a prompt prefix get "$ " prepended so Prism's shell-session
 * grammar can tokenize and style them correctly.
 *
 * Only runs at build time -- no client-side script involved.
 * The copy button skips prompt tokens via data-no-copy (set by rehypeCodeBlocks).
 */

import { visit } from 'unist-util-visit';

/**
 * @param {object} [opts]
 * @param {string} [opts.prompt='$ '] - default prompt to prepend to unprompted lines
 */
export function remarkShellSession({ prompt = '$ ' } = {}) {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'shell-session') return;

      const lines = node.value.split('\n');
      let continuation = false;

      node.value = lines.map(line => {
        // preserve empty lines as-is, reset continuation
        if (!line.trim()) {
          continuation = false;
          return line;
        }
        // continuation lines (after a trailing \) get no new prompt
        if (continuation) {
          continuation = line.trimEnd().endsWith('\\');
          return line;
        }
        // lines already have a prompt
        if (line.startsWith('$ ') || line.startsWith('# ')) {
          continuation = line.trimEnd().endsWith('\\');
          return line;
        }
        // line has no prompt -- prepend the default one
        continuation = line.trimEnd().endsWith('\\');
        return prompt + line;
      }).join('\n');
    });
  };
}
