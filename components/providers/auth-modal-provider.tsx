'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalContextType = {
  isOpen: boolean;
  view: 'signin' | 'signup';
  openModal: (view?: 'signin' | 'signup') => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType>({
  isOpen: false,
  view: 'signin',
  openModal: () => {},
  closeModal: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'signin' | 'signup'>('signin');

  const openModal = (initialView: 'signin' | 'signup' = 'signin') => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);
