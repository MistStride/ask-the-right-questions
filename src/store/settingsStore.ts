import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../schema/levelTypes'

interface SettingsState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'atrq-settings-v1' },
  ),
)
