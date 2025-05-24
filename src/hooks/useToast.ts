import DOMPurify from "dompurify";
import { toast } from "sonner";

type ToastOptions = Record<string, unknown>;

interface UseToastReturn {
  success: (message: string, options?: ToastOptions) => string | number;
  error: (message: string, options?: ToastOptions) => string | number;
  info: (message: string, options?: ToastOptions) => string | number;
  warning: (message: string, options?: ToastOptions) => string | number;
  loading: (message: string, options?: ToastOptions) => string | number;
  dismiss: (toastId: string | number) => void;
  custom: typeof toast;
}

export const useToast = (): UseToastReturn => {
  const safe = (msg: string) =>
    DOMPurify.sanitize(msg, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  const success = (message: string, options?: ToastOptions) =>
    toast.success(safe(message), options);
  const error = (message: string, options?: ToastOptions) =>
    toast.error(safe(message), options);
  const info = (message: string, options?: ToastOptions) =>
    toast(safe(message), options);
  const warning = (message: string, options?: ToastOptions) =>
    toast(safe(message), { ...options, icon: "⚠️" });
  const loading = (message: string, options?: ToastOptions) =>
    toast.loading(safe(message), options);

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss: toast.dismiss,
    custom: toast,
  };
};

export default useToast;
