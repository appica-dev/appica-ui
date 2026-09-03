import { createRawSnippet, type Snippet } from 'svelte'

/** Build a children snippet from plain text for tests. */
export function textSnippet(text: string): Snippet {
  return createRawSnippet(() => ({
    render: () => `<span>${text}</span>`,
  }))
}

/** Build a snippet from an HTML string for tests. */
export function htmlSnippet(html: string): Snippet {
  return createRawSnippet(() => ({
    render: () => html,
  }))
}
