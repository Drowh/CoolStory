import React from "react";
import { useModalStore } from "../../stores/modalStore";
import SettingsModal from "./SettingsModal";
import AuthForm from "../auth/AuthForm";

const ModalManager: React.FC = () => {
  const modalType = useModalStore((state) => state.modalType);

  if (!modalType) return null;

  switch (modalType) {
    case "settings":
      return <SettingsModal />;
    case "auth":
      return <AuthForm />;

    default:
      return null;
  }
};

export default ModalManager;
