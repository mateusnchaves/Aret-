import { parseISODate, type ISODate } from './dates'

export interface Maxim {
  text: string
  author: string
  source: string
}

/**
 * Máximas com autoria e obra conferidas (traduções livres). Nada de citações apócrifas.
 */
export const MAXIMS: Maxim[] = [
  {
    text: 'Tornamo-nos justos praticando atos justos, temperantes praticando atos temperantes, corajosos praticando atos corajosos.',
    author: 'Aristóteles',
    source: 'Ética a Nicômaco, II.1',
  },
  { text: 'A excelência moral é fruto do hábito.', author: 'Aristóteles', source: 'Ética a Nicômaco, II.1' },
  { text: 'Primeiro diga a si mesmo o que você quer ser; depois faça o que tem de ser feito.', author: 'Epicteto', source: 'Discursos, III.23' },
  { text: 'Nenhuma grande coisa nasce de repente.', author: 'Epicteto', source: 'Discursos, I.15' },
  { text: 'São as dificuldades que mostram o que os homens são.', author: 'Epicteto', source: 'Discursos, I.24' },
  {
    text: 'Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que elas são difíceis.',
    author: 'Sêneca',
    source: 'Cartas a Lucílio, 104',
  },
  { text: 'Enquanto adiamos, a vida passa.', author: 'Sêneca', source: 'Cartas a Lucílio, 1' },
  { text: 'Considere cada dia como uma vida inteira.', author: 'Sêneca', source: 'Cartas a Lucílio, 101' },
  { text: 'Sofre mais do que o necessário quem sofre antes do necessário.', author: 'Sêneca', source: 'Cartas a Lucílio, 98' },
  { text: 'O que impede a ação faz a ação avançar. O que está no caminho se torna o caminho.', author: 'Marco Aurélio', source: 'Meditações, V.20' },
  { text: 'Chega de discutir como deve ser um homem bom. Seja um.', author: 'Marco Aurélio', source: 'Meditações, X.16' },
  { text: 'Se não é certo, não faça; se não é verdade, não diga.', author: 'Marco Aurélio', source: 'Meditações, XII.17' },
  {
    text: 'A cada momento, dedique-se com firmeza ao que tem diante de si, com dignidade e sem pressa.',
    author: 'Marco Aurélio',
    source: 'Meditações, II.5',
  },
]

/** Uma máxima por dia do ano: muda à meia-noite e é a mesma o dia todo. */
export function maximOfDay(date: ISODate): Maxim {
  const d = parseISODate(date)
  const dayOfYear = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86_400_000)
  return MAXIMS[dayOfYear % MAXIMS.length]!
}
