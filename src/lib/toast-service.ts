export interface ToastItem {
  id: number
  message: string
}

let toastId = 0
let listeners: Array<(t: ToastItem) => void> = []

/** Fire a global toast from anywhere (no hook needed) */
export function toast(message: string) {
  const item: ToastItem = { id: ++toastId, message }
  listeners.forEach((fn) => fn(item))
}

export function subscribeToToasts(fn: (t: ToastItem) => void) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((x) => x !== fn)
  }
}
