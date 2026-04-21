const listeners = new Set();
let toasts = [];

function emit() {
  const snapshot = [...toasts];
  listeners.forEach((listener) => listener(snapshot));
}

function createToast(message, type = 'info', duration = 4000) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, message, type, duration }];
  emit();
  return id;
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => listeners.delete(listener);
}

export function addToast(message, type = 'info', duration = 4000) {
  return createToast(message, type, duration);
}

export function dismissToast(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export const toast = {
  loading(message) {
    return createToast(message, 'loading', null);
  },
  success(message) {
    return createToast(message, 'success', 4000);
  },
  error(message) {
    return createToast(message, 'error', 5000);
  },
  info(message) {
    return createToast(message, 'info', 4000);
  },
  dismiss(id) {
    dismissToast(id);
  },
};
