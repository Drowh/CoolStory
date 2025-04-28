import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import Input from "../../components/ui/Input";

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useChatHistoryStore();

  return (
    <div className="relative mb-4">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск чатов..."
        className="w-full bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none pl-10 pr-3 py-2 text-base"
      />
      <FontAwesomeIcon
        icon="search"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          <FontAwesomeIcon icon="times" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;