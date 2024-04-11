export const setBurnerWalletPrivateKey = (privateKey: string) => {
  sessionStorage.setItem('burner-wallet-private-key', privateKey);

  return privateKey;
};

export const getBurnerWalletPrivateKey = () =>
  sessionStorage.getItem('burner-wallet-private-key');

export const isBurnerWalletConnected = () =>
  localStorage.getItem('burner-wallet-connected') === 'true';

export const connectBurnerWallet = () => {
  localStorage.setItem('burner-wallet-connected', 'true');

  return isBurnerWalletConnected();
};

export const disconnectBurnerWallet = () => {
  localStorage.setItem('burner-wallet-connected', 'false');

  return isBurnerWalletConnected();
};
