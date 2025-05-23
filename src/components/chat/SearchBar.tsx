import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistory";
import Input from "../../components/ui/Input";
import debounce from "lodash.debounce";

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useChatHistoryStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(searchQuery);

  const updateSearchQuery = useCallback(
    (value: string) => {
      setSearchQuery(value);
    },
    [setSearchQuery]
  );

  const debouncedUpdateSearchQuery = useRef(debounce(updateSearchQuery, 300));

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const debounced = debouncedUpdateSearchQuery.current;
    return () => {
      debounced.cancel();
    };
  }, [debouncedUpdateSearchQuery]); 

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedUpdateSearchQuery.current(value);
  };

  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-lg filter blur-md transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Поиск чатов..."
          className={`w-full bg-white dark:bg-gray-700 text-zinc-900 dark:text-gray-100 rounded-lg border transition-all duration-200 outline-none pl-10 pr-3 py-2.5 text-sm placeholder-zinc-500 dark:placeholder-gray-400 ${
            isFocused
              ? "border-pink-500 shadow-md shadow-pink-500/10"
              : "border-zinc-300 dark:border-gray-600 group-hover:border-zinc-400 dark:group-hover:border-gray-500"
          }`}
          aria-label="Поле поиска чатов"
        />
        <FontAwesomeIcon
          icon="search"
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? "text-pink-500" : "text-zinc-500 dark:text-gray-400"
          }`}
          aria-hidden="true"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-700/80 hover:bg-zinc-100/80 dark:hover:bg-gray-600/80 rounded-full p-1 transition-colors duration-200"
            aria-label="Очистить поиск"
          >
            <FontAwesomeIcon icon="times" size="xs" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
