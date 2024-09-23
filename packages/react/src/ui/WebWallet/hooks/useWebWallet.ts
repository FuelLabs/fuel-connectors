import { useState } from 'react';

export const useWebWallet = () => {
  // @TODO: the idea is to have the rest of the behaviors from WebWallet component here
  const [isOpen, setOpen] = useState(false);

  return { isOpen, setOpen };
};
