import { useState } from 'react';
import { useGenerateBackground } from '../../hooks/useGenerateBackground';
import { Avatar, AvatarFallback } from './styles';

interface AvatarProps {
  src: string;
  hash: string;
}

const GeneratedFallback = ({ hash }: { hash: string }) => {
  return (
    <AvatarFallback
      style={{
        background: useGenerateBackground(hash),
      }}
    />
  );
};

export const AvatarGenerated = ({ hash, src }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <GeneratedFallback hash={hash} />;
  }

  return <Avatar src={src} onError={() => setHasError(true)} />;
};
