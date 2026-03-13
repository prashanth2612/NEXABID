import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ALL_CATEGORIES = [
  'Textiles & Garments',
  'Electronics & Components',
  'Hardware & Metals',
  'Plastics & Polymers',
  'Furniture & Wood',
  'Chemicals & Pharma',
  'Food & Beverages',
  'Automotive Parts',
  'Paper & Packaging',
  'Other',
] as const

export type Category = (typeof ALL_CATEGORIES)[number]

export const CATEGORY_META: Record<Category, { emoji: string; description: string; color: string }> = {
  'Textiles & Garments':      { emoji: '👕', description: 'Fabric, apparel, uniforms', color: '#6366f1' },
  'Electronics & Components': { emoji: '⚡', description: 'PCBs, circuits, sensors',   color: '#0ea5e9' },
  'Hardware & Metals':        { emoji: '🔩', description: 'Steel, brackets, castings', color: '#64748b' },
  'Plastics & Polymers':      { emoji: '🧴', description: 'Moulding, containers, parts', color: '#f97316' },
  'Furniture & Wood':         { emoji: '🪵', description: 'Wooden goods, furnishings', color: '#92400e' },
  'Chemicals & Pharma':       { emoji: '🧪', description: 'Industrial chemicals, APIs', color: '#10b981' },
  'Food & Beverages':         { emoji: '🍱', description: 'Processed foods, packaging', color: '#f59e0b' },
  'Automotive Parts':         { emoji: '🚗', description: 'Engine, body, brake parts',  color: '#ef4444' },
  'Paper & Packaging':        { emoji: '📦', description: 'Boxes, cartons, labels',     color: '#8b5cf6' },
  'Other':                    { emoji: '🏭', description: 'Miscellaneous manufacturing', color: '#6b7280' },
}

interface CategoryStore {
  selected: Category[]
  hasChosen: boolean
  toggle: (cat: Category) => void
  selectAll: () => void
  clearAll: () => void
  confirm: () => void
  reset: () => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      selected: [],
      hasChosen: false,

      toggle: (cat) =>
        set((s) => ({
          selected: s.selected.includes(cat)
            ? s.selected.filter((c) => c !== cat)
            : [...s.selected, cat],
        })),

      selectAll: () => set({ selected: [...ALL_CATEGORIES] }),
      clearAll: () => set({ selected: [] }),

      confirm: () => set({ hasChosen: true }),

      reset: () => set({ selected: [], hasChosen: false }),
    }),
    { name: 'nexabid-category-filter' }
  )
)
