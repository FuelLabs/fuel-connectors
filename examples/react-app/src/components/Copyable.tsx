import { useState } from 'react';
import { CopyIcon } from '../../../../packages/react/src/icons/CopyIcon';
import Notification, { type Props as NotificationProps } from './notification';

export function Copyable({ value }: { value: string }) {
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(value || '');
    setToast({
      open: true,
      type: 'success',
      children: 'Copied to clipboard',
    });
  }

  return (
    <>
      <CopyIcon
        size={16}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          handleCopy();
        }}
      />
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </>
  );
}
