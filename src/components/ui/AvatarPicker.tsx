import React from "react";
import Image from "next/image";

interface AvatarPickerProps {
  selectedAvatarId: number;
  onSelectAvatar: (id: number) => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatarId,
  onSelectAvatar,
}) => {
  const avatarIds = Array.from({ length: 9 }, (_, i) => i + 1);

  const imageVersion = "v2";

  return (
    <div className="p-3">
      <h3 className="text-sm text-gray-300 mb-2 font-medium">
        Выберите аватар
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {avatarIds.map((id) => (
          <button
            key={id}
            onClick={() => onSelectAvatar(id)}
            className={`
              relative w-12 h-12 rounded-full overflow-hidden transition-all
              ${
                selectedAvatarId === id
                  ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-800 scale-110"
                  : "hover:ring-1 hover:ring-pink-400 hover:scale-105"
              }
            `}
          >
            <Image
              src={`/assets/icons/avatars/${id}.png?v=${imageVersion}`}
              alt={`Аватарка ${id}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;
