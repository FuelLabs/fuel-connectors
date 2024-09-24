import { handleCopy } from '../../../../utils';
import { StyledIconCopy } from './styles';

export interface CopyButtonProps {
  address: string;
  size?: number;
}
export const CopyButton = ({ address, size }: CopyButtonProps) => {
  const handleOnClick = () => {
    handleCopy(address);
  };
  return <StyledIconCopy size={size ?? 18} onClick={handleOnClick} />;
};
