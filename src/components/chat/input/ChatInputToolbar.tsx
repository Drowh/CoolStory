import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../ui/Button";
import CustomDropup from "../../ui/CustomDropup";
import Image from "next/image";

interface ChatInputToolbarProps {
  selectedModel: "deepseek" | "maverick" | "claude" | "gpt4o";
  setSelectedModel: (model: "deepseek" | "maverick" | "claude" | "gpt4o") => void;
  thinkMode: boolean;
  setThinkMode: (value: boolean) => void;
  imageUrl: string | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ChatInputToolbar: React.FC<ChatInputToolbarProps> = ({
  selectedModel,
  setSelectedModel,
  thinkMode,
  setThinkMode,
  imageUrl,
  onImageUpload,
  onRemoveImage,
}) => {
  return (
    <div className="flex items-center mt-auto">
      <CustomDropup
        value={selectedModel}
        onChange={(value) => setSelectedModel(value)}
        className="mr-2"
      />
      
      <Button
        onClick={() => setThinkMode(!thinkMode)}
        className={`p-2 rounded-full ${
          thinkMode
            ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            : "bg-gray-700 hover:bg-gray-600"
        } text-white mr-2`}
      >
        <FontAwesomeIcon icon="brain" />
      </Button>
      
      {!imageUrl && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="imageUpload"
            
          />
          <label
            htmlFor="imageUpload"
            className="p-2 rounded-full text-gray-400 hover:text-gray-200 cursor-pointer mr-2"
          >
            <FontAwesomeIcon icon="image" size="lg" />
          </label>
        </>
      )}
      
      {imageUrl && (
        <div className="flex items-center relative mr-2">
          <Image
            src={imageUrl}
            alt="Attached"
            className="w-8 h-8 object-cover rounded"
            width={32}
            height={32}
          />
          <Button
            onClick={onRemoveImage}
            className="absolute -top-4 right-4 bg-transparent hover:bg-transparent hover:text-red-500 text-gray-400 border-none outline-none focus:outline-none"
          >
            <FontAwesomeIcon icon="times" size="sm" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInputToolbar; 