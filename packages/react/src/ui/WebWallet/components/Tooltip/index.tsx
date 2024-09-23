import { TooltipContent, TooltipText, TooltipWrapper } from './styles';

export interface ITooltipProps {
  value: string;
  children?: React.ReactNode;
}
export const Tooltip = ({ value, children }: ITooltipProps) => {
  return (
    <TooltipWrapper>
      <TooltipContent>
        <TooltipText>{value}</TooltipText>
      </TooltipContent>
      {children}
    </TooltipWrapper>
  );
};
