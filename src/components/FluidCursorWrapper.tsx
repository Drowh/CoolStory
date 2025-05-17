"use client";

import dynamic from "next/dynamic";

const FluidCursorComponent = dynamic(
  () => import("./ClientComponents").then((mod) => mod.FluidCursorComponent),
  { ssr: false }
);

export default function FluidCursorWrapper() {
  return <FluidCursorComponent />;
}
