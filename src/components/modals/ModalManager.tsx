import React from "react";
import { useModalStore } from "../../stores/modalStore";
import TabbedModal from "./TabbedModal";
import AuthForm from "../auth/AuthForm";

const ModalManager: React.FC = () => {
  const { modalType, settingsActiveTab } = useModalStore();

  if (!modalType) return null;

  switch (modalType) {
    case "settings":
      return <TabbedModal initialTab={settingsActiveTab || "settings"} />;
    case "auth":
      return <AuthForm />;
    default:
      return null;
  }
};

export default ModalManager;
