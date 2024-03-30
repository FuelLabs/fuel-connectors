import * as Toast from '@radix-ui/react-toast';
import clsx from 'clsx';
import React from 'react';

export type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type?: 'success' | 'error' | 'info';
  duration?: number;
} & React.PropsWithChildren;

export default function Notification(props: Props) {
  const { open, setOpen, type, duration, children } = props;
  return (
    <React.Fragment>
      <Toast.Root
        className="gradient-border items-center gap-x-4 rounded-lg bg-zinc-900 data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
        open={open}
        onOpenChange={setOpen}
        duration={duration || 10_000}
      >
        <div className="rounded-lg bg-zinc-900 p-4">
          <div className="mb-1.5 flex items-start justify-between">
            <Toast.Title
              className={clsx(
                'text-sm font-medium',
                type === 'success' && 'text-green-300',
                type === 'error' && 'text-red-300',
                type === 'info' && 'text-indigo-300',
                !type && 'text-zinc-300',
              )}
            >
              {type === 'success' && 'Succes'}
              {type === 'error' && 'Error'}
            </Toast.Title>
            <Toast.Close className="">
              <button
                type="button"
                className="rounded border border-zinc-500/10 bg-zinc-800 px-1.5 py-[1px] text-sm text-zinc-400"
              >
                Close
              </button>
            </Toast.Close>
          </div>
          <Toast.Description className={clsx('text-[15px] text-zinc-50/90')}>
            {children}
          </Toast.Description>
        </div>
      </Toast.Root>
    </React.Fragment>
  );
}
