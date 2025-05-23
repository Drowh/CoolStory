import React from "react";
import { useSettingsStore } from "../../../stores/settingsStore";

const SettingsTabContent: React.FC = () => {
  const autoCollapseFolders = useSettingsStore(
    (state) => state.autoCollapseFolders
  );
  const setAutoCollapseFolders = useSettingsStore(
    (state) => state.setAutoCollapseFolders
  );

  return (
    <div className="mb-4">
      <label className="flex items-center space-x-2 cursor-pointer text-zinc-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={autoCollapseFolders}
          onChange={(e) => setAutoCollapseFolders(e.target.checked)}
          className="custom-checkbox"
          aria-describedby="auto-collapse-folders-desc"
        />
        <span id="auto-collapse-folders-desc">
          Скрывать другие темки при открытии новой
        </span>
      </label>
    </div>
  );
};

export default SettingsTabContent;
