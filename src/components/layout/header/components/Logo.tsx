import React from "react";
import Image from "next/image";
import logo from "../../../../assets/icons/logo.png";

const Logo: React.FC = () => {
  return (
    <Image
      src={logo}
      alt="logo"
      width={100}
      height={30}
      className="ml-9"
      style={{ width: "auto", height: "auto" }}
      priority
    />
  );
};

export default Logo;
