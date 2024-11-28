import phantom from '../../../../node_modules/@phantom/synpress/commands/phantom.js';

export const phantomExtended = {
  ...phantom,
  confirmTransaction: async () => {
    const notificationPage =
      await phantom.playwright.switchToNotification('phantom');
    await phantom.playwright.waitAndClick(
      'phantom',
      phantom.transactionPageElements.buttons.confirmTransaction,
      notificationPage,
      { waitForEvent: 'close' },
    );
    return true;
  },
};

export default phantomExtended;
