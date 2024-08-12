export interface ModalProps {
  open: boolean;
  children: React.ReactNode;
}

export function Modal({ open, children }: ModalProps) {
  const style = {
    display: open ? 'flex' : 'none',
  };
  return (
    <div
      className="fixed left-0 w-full h-screen bg-black bg-opacity-50 shadow-lg"
      style={style}
    >
      <div className="fixed inset-0 justify-center items-center rounded-lg h-full">
        <dialog
          className="relative overflow-y-auto overflow-x-hidden max-w-full max-h-full w-3/4 h-full rounded-2xl"
          open={open}
        >
          {children}
        </dialog>
      </div>
    </div>
  );
}
