import { Avatar, type AvatarProps } from '@fuels/ui';
import { useGenerateBackground } from '../../hooks/useGenerateBackground';

export type AvatarGeneratedProps = { hash: string } & Omit<
  AvatarProps,
  'fallback'
>;

const GeneratedFallback = ({ hash }: { hash: string }) => {
  return (
    <div
      className="h-full w-full rounded-full"
      style={{
        background: useGenerateBackground(hash),
      }}
    />
  );
};

export const AvatarGenerated = ({ hash, ...props }: AvatarGeneratedProps) => {
  return <Avatar {...props} fallback={<GeneratedFallback hash={hash} />} />;
};
