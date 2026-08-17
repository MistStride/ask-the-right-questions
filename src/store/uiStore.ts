import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastState {
  message: string
  tone: ToastTone
  id: number
  showToast: (message: string, tone?: ToastTone) => void
  hideToast: () => void
}

export const useUiStore = create<ToastState>((set) => ({
  message: '',
  tone: 'info',
  id: 0,
  showToast: (message, tone = 'info') => set((s) => ({ message, tone, id: s.id + 1 })),
  hideToast: () => set({ message: '' }),
}))
