import React from "react";
import { useSettingsStore } from "../../../stores/settingsStore";

const SettingsTabContent: React.FC = () => {
  const autoCollapseFolders = useSettingsStore(
    (state) => state.autoCollapseFolders
  );
  const setAutoCollapseFolders = useSettingsStore(
    (state) => state.setAutoCollapseFolders
  );
  const fluidCursorEnabled = useSettingsStore(
    (state) => state.fluidCursorEnabled
  );
  const setFluidCursorEnabled = useSettingsStore(
    (state) => state.setFluidCursorEnabled
  );

  return (
    <div className="space-y-4">
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
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer text-zinc-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={fluidCursorEnabled}
            onChange={(e) => setFluidCursorEnabled(e.target.checked)}
            className="custom-checkbox"
            aria-describedby="fluid-cursor-desc"
          />
          <span id="fluid-cursor-desc">Включить свечение курсора</span>
        </label>
      </div>
    </div>
  );
};

export default SettingsTabContent;
