"use client";
import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: "red" }}>
          Произошла критическая ошибка. Перезагрузите страницу.
        </div>
      );
    }
    return this.props.children;
  }
}
