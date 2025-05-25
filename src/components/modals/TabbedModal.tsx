import React, { useState, useEffect, useCallback, useRef } from "react";
import { useModalStore } from "../../stores/modalStore";
import Button from "../ui/Button";
import SettingsTabContent from "./settings/SettingsTabContent";
import HelpTabContent from "./settings/HelpTabContent";
import TermsTabContent from "./settings/TermsTabContent";
import TabButton from "../ui/TabButton";

interface SettingsModalProps {
  initialTab: "settings" | "help" | "terms";
}

const TabbedModal: React.FC<SettingsModalProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<"settings" | "help" | "terms">(
    "settings"
  );
  const [isVisible, setIsVisible] = useState(false);
  const setModalType = useModalStore((state) => state.setModalType);
  const modalRef = useRef<HTMLDivElement>(null);
  const settingsTabRef = useRef<HTMLButtonElement>(null);
  const helpTabRef = useRef<HTMLButtonElement>(null);
  const termsTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsVisible(true);
    if (initialTab === "settings") {
      settingsTabRef.current?.focus();
    } else if (initialTab === "help") {
      helpTabRef.current?.focus();
    } else {
      termsTabRef.current?.focus();
    }
  }, [initialTab]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setModalType(null), 300);
  }, [setModalType]);

  const handleTabChange = useCallback((tab: "settings" | "help" | "terms") => {
    setActiveTab(tab);
    if (tab === "settings") {
      settingsTabRef.current?.focus();
    } else if (tab === "help") {
      helpTabRef.current?.focus();
    } else {
      termsTabRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const tabs = ["settings", "help", "terms"] as const;
        const currentIndex = tabs.indexOf(activeTab);
        const newIndex =
          e.key === "ArrowLeft"
            ? (currentIndex - 1 + tabs.length) % tabs.length
            : (currentIndex + 1) % tabs.length;
        handleTabChange(tabs[newIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handleClose, handleTabChange]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 flex items-center justify-center ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
      role="button"
      aria-label="Закрыть окно настроек"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scroll-fix transition-all duration-300 transform ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="settings-modal-title"
            className="text-xl font-bold text-zinc-900 dark:text-gray-200"
          >
            {activeTab === "settings"
              ? "Настройки"
              : activeTab === "help"
              ? "Помощь"
              : "Условия использования"}
          </h2>
          <Button
            onClick={handleClose}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Закрыть
          </Button>
        </div>

        <div className="flex space-x-4 mb-6" role="tablist">
          <TabButton
            ref={settingsTabRef}
            label="Настройки"
            isActive={activeTab === "settings"}
            onClick={() => handleTabChange("settings")}
            id="settings-tab"
            aria-selected={activeTab === "settings"}
            aria-controls="settings-panel"
          />
          <TabButton
            ref={helpTabRef}
            label="Помощь"
            isActive={activeTab === "help"}
            onClick={() => handleTabChange("help")}
            id="help-tab"
            aria-selected={activeTab === "help"}
            aria-controls="help-panel"
          />
          <TabButton
            ref={termsTabRef}
            label="Условия"
            isActive={activeTab === "terms"}
            onClick={() => handleTabChange("terms")}
            id="terms-tab"
            aria-selected={activeTab === "terms"}
            aria-controls="terms-panel"
          />
        </div>

        <div
          role="tabpanel"
          id="settings-panel"
          aria-labelledby="settings-tab"
          className={`transition-all duration-300 transform ${
            activeTab === "settings"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 hidden"
          }`}
        >
          <SettingsTabContent />
        </div>
        <div
          role="tabpanel"
          id="help-panel"
          aria-labelledby="help-tab"
          className={`transition-all duration-300 transform ${
            activeTab === "help"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 hidden"
          }`}
        >
          <HelpTabContent />
        </div>
        <div
          role="tabpanel"
          id="terms-panel"
          aria-labelledby="terms-tab"
          className={`transition-all duration-300 transform ${
            activeTab === "terms"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 hidden"
          }`}
        >
          <TermsTabContent />
        </div>
      </div>
    </div>
  );
};

export default TabbedModal;
