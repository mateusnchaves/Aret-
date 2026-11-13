import { describe, expect, it } from 'vitest'
import { adherence, ageOn, bmrMifflinStJeor, dailyTargets, macrosForGrams, resolveTargets, sumMacros } from './nutrition'

describe('ageOn', () => {
  it('só conta o ano depois do aniversário', () => {
    expect(ageOn('1996-11-12', '2026-11-11')).toBe(29)
    expect(ageOn('1996-11-11', '2026-11-11')).toBe(30)
  })
})

describe('bmrMifflinStJeor', () => {
  it('aplica a fórmula por sexo', () => {
    expect(bmrMifflinStJeor({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBe(1780)
    expect(bmrMifflinStJeor({ sex: 'female', weightKg: 60, heightCm: 165, age: 25 })).toBe(1345.25)
  })
})

describe('dailyTargets', () => {
  it('calcula meta e macros para cutting', () => {
    expect(
      dailyTargets({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activity: 'moderate', goal: 'cut' }),
    ).toEqual({ bmr: 1780, tdee: 2759, kcal: 2207, proteinG: 160, fatG: 64, carbsG: 248 })
  })

  it('bulking soma 10%', () => {
    expect(
      dailyTargets({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activity: 'moderate', goal: 'bulk' }).kcal,
    ).toBe(3035)
  })

  it('nunca dá carboidrato negativo', () => {
    expect(
      dailyTargets({ sex: 'female', weightKg: 150, heightCm: 150, age: 70, activity: 'sedentary', goal: 'cut' }).carbsG,
    ).toBe(0)
  })
})

describe('macrosForGrams', () => {
  it('escala os valores por 100 g', () => {
    const arroz = { kcal: 128, protein_g: 2.5, carbs_g: 28.1, fat_g: 0.2 }
    expect(macrosForGrams(arroz, 150)).toEqual({ kcal: 192, proteinG: 3.8, carbsG: 42.2, fatG: 0.3 })
  })
})

describe('sumMacros', () => {
  it('soma sem acumular erro de ponto flutuante', () => {
    const m = { kcal: 0.1, proteinG: 0.2, carbsG: 0.3, fatG: 0.1 }
    expect(sumMacros([m, m, m])).toEqual({ kcal: 0.3, proteinG: 0.6, carbsG: 0.9, fatG: 0.3 })
    expect(sumMacros([])).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })
  })
})

describe('resolveTargets', () => {
  const calc = { bmr: 1780, tdee: 2759, kcal: 2207, proteinG: 160, fatG: 64, carbsG: 248 }
  const none = { kcal: null, proteinG: null, carbsG: null, fatG: null }

  it('sem metas manuais, usa o cálculo', () => {
    expect(resolveTargets(calc, none)).toEqual({ kcal: 2207, proteinG: 160, carbsG: 248, fatG: 64, manual: false })
  })

  it('kcal manual recalcula o carboidrato que sobra', () => {
    expect(resolveTargets(calc, { ...none, kcal: 2500 })).toEqual({ kcal: 2500, proteinG: 160, carbsG: 321, fatG: 64, manual: true })
  })

  it('tudo manual (nutricionista) vence o cálculo', () => {
    expect(resolveTargets(calc, { kcal: 2000, proteinG: 150, carbsG: 200, fatG: 60 })).toEqual({
      kcal: 2000,
      proteinG: 150,
      carbsG: 200,
      fatG: 60,
      manual: true,
    })
  })

  it('sem cálculo e sem kcal manual não há meta', () => {
    expect(resolveTargets(null, none)).toBeNull()
  })
})

describe('adherence', () => {
  it('±10% conta como meta batida', () => {
    expect(adherence(1800, 2000)).toBe('ok')
    expect(adherence(1799, 2000)).toBe('under')
    expect(adherence(2200, 2000)).toBe('ok')
    expect(adherence(2201, 2000)).toBe('over')
  })
})
