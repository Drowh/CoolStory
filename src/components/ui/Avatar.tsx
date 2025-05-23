import React from "react";
import Image from "next/image";

interface AvatarProps {
  avatarId?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  avatarId = 1,
  size = "md",
  className = "",
}) => {
  const safeAvatarId = avatarId >= 1 && avatarId <= 9 ? avatarId : 1;

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const sizeClass = sizeMap[size] || sizeMap.md;

  const imageVersion = "v2";

  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}
    >
      <Image
        src={`/assets/icons/avatars/${safeAvatarId}.png?v=${imageVersion}`}
        alt={`Аватарка ${safeAvatarId}`}
        fill
        sizes="2.5rem"
        className="object-cover"
        priority
      />
    </div>
  );
};

export default Avatar;
