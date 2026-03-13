export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ')

export const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtTime = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
