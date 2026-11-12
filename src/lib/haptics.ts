/** Vibração curta ao salvar. Só tem efeito no Android; iOS ignora em PWA. */
export function hapticSuccess() {
  try {
    navigator.vibrate?.(18)
  } catch {
    // sem suporte: nada a fazer
  }
}
