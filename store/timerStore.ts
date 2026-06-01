'use client'

import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  startTime: Date | null
  category: string
  notes: string
  entryId: string | null
  elapsed: number // seconds

  startTimer: (category: string, notes?: string) => void
  stopTimer: () => void
  setEntryId: (id: string) => void
  tick: () => void
  reset: () => void
  recoverTimer: (entryId: string, category: string, notes: string, startTime: Date) => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  startTime: null,
  category: 'work',
  notes: '',
  entryId: null,
  elapsed: 0,

  startTimer: (category, notes = '') => {
    set({
      isRunning: true,
      startTime: new Date(),
      category,
      notes,
      elapsed: 0,
    })
  },

  stopTimer: () => {
    set({
      isRunning: false,
      startTime: null,
      entryId: null,
      elapsed: 0,
    })
  },

  setEntryId: (id) => set({ entryId: id }),

  tick: () => {
    const { startTime, isRunning } = get()
    if (!isRunning || !startTime) return
    set({ elapsed: Math.floor((Date.now() - startTime.getTime()) / 1000) })
  },

  reset: () =>
    set({
      isRunning: false,
      startTime: null,
      category: 'work',
      notes: '',
      entryId: null,
      elapsed: 0,
    }),

  recoverTimer: (entryId, category, notes, startTime) =>
    set({
      isRunning: true,
      startTime,
      category,
      notes,
      entryId,
      elapsed: Math.floor((Date.now() - startTime.getTime()) / 1000),
    }),
}))
