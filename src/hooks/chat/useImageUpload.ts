import { useState } from "react";

type ToastState = {
  message: string;
  type: "error" | "success";
} | null;

export const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
      };
      reader.onerror = () => {
        setToast({ message: "Ошибка при чтении изображения", type: "error" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  return {
    imageUrl,
    setImageUrl,
    handleImageUpload,
    handleRemoveImage,
    toast,
    clearToast: () => setToast(null),
  };
};
