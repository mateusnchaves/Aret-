/** Minúsculas e sem acento, para busca: "Pão" casa com "pao". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Todas as palavras da busca aparecem no texto, em qualquer ordem: "frango grelhado" acha "Frango, peito, …, grelhado". */
export function matchesAll(haystack: string, query: string): boolean {
  const h = normalize(haystack)
  return normalize(query)
    .split(/[\s,]+/)
    .filter(Boolean)
    .every((word) => h.includes(word))
}
