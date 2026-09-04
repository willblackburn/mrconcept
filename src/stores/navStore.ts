import { create } from 'zustand'

type NavState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useNavStore = create<NavState>((set) => ({
  isOpen: false,
  open: () => {
    set({ isOpen: true })
  },
  close: () => {
    set({ isOpen: false })
  },
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }))
  },
}))
