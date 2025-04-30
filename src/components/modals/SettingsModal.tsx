import React from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useModalStore } from "../../stores/modalStore";
import Button from "../ui/Button";

const SettingsModal: React.FC = () => {
  const autoCollapseFolders = useSettingsStore(
    (state) => state.autoCollapseFolders
  );
  const setAutoCollapseFolders = useSettingsStore(
    (state) => state.setAutoCollapseFolders
  );
  const setModalType = useModalStore((state) => state.setModalType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg text-gray-200 mb-4">Настройки</h2>
        <div className="mb-4">
          <label className="flex items-center space-x-2 text-gray-300">
            <input
              type="checkbox"
              checked={autoCollapseFolders}
              onChange={(e) => setAutoCollapseFolders(e.target.checked)}
              className="form-checkbox h-5 w-5 text-pink-600"
            />
            <span>Скрывать другие темки при открытии новой</span>
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => setModalType(null)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
