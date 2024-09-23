import '../constants/index.css';
import { getThemeVariables } from '../constants/themes';

export function RootProvider({
  children,
  theme,
}: { children: React.ReactNode; theme: string; isOpen: boolean }) {
  return (
    <div
      // biome-ignore lint/suspicious/noExplicitAny: Variables wont show in default style
      style={getThemeVariables(theme) as any}
    >
      {children}
    </div>
  );
}
