import { Toaster as SonnerToaster } from "sonner";

// SVG иконки для разных типов уведомлений
const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EC4899"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EF4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3B82F6"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="8"></line>
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F59E0B"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12" y2="17"></line>
  </svg>
);

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      style={{ top: "70px", right: "235px" }}
      theme="dark"
      className="custom-toaster"
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <InfoIcon />,
        warning: <WarningIcon />,
      }}
      toastOptions={{
        duration: 2000,
        unstyled: true,
        classNames: {
          toast: `
            font-family: inherit
            rounded-md
            p-4
            bg-[#1F1F23]
            border
            border-[#2D2D33]
            shadow-lg
            text-white
            flex
            items-center
            gap-3
            animate-toast-slide-in
          `,
          success: "border-l-4 border-l-pink-500",
          error: "border-l-4 border-l-red-500",
          warning: "border-l-4 border-l-amber-500",
          info: "border-l-4 border-l-blue-500",
          icon: "flex-shrink-0",
          title: "font-medium",
          description: "text-sm opacity-90",
          actionButton: "bg-pink-600 text-white rounded px-2 py-1 text-xs",
          cancelButton: "bg-gray-600 text-white rounded px-2 py-1 text-xs ml-1",
          closeButton: "text-white/50 hover:text-white",
        },
      }}
    />
  );
}

export default Toaster;
