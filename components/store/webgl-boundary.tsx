"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isola falhas da cena 3D (WebGL indisponível, erro ao carregar o modelo,
 * etc.) para que o resto da página continue funcionando normalmente em vez
 * de travar tudo — cai no fallback (gradiente estático) em vez de crashar.
 */
export class WebglBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Cena 3D falhou, usando fallback estático:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
