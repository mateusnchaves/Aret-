import { describe, expect, it } from 'vitest'
import { ageOn, bmrMifflinStJeor, dailyTargets } from './nutrition'

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
