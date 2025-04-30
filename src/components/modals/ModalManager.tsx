import React from "react";
import { useModalStore } from "../../stores/modalStore";
import SettingsModal from "./SettingsModal";

const ModalManager: React.FC = () => {
  const modalType = useModalStore((state) => state.modalType);

  if (!modalType) return null;

  switch (modalType) {
    case "settings":
      return <SettingsModal />;
    // Здесь можно добавить другие модальные окна, например:
    // case "theme":
    //   return <ThemeModal />;
    // case "help":
    //   return <HelpModal />;
    default:
      return null;
  }
};

export default ModalManager;
