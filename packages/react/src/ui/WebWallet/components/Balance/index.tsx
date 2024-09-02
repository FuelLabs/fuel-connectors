import { Flex } from '../Container';
import { Typography } from '../Typography';

export interface IBackgroundProps {
  color?: string;
  width?: string;
  height?: string;
}
export const Background = ({ color, width, height }: IBackgroundProps) => {
  const style: React.CSSProperties = {
    position: 'absolute',
  };
  return (
    <svg
      style={style}
      color={color ?? 'black'}
      width={width ?? '100'}
      height={height ?? '100'}
      viewBox="8 8 204 204"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>background</title>
      <path d="M30 10 Q10 10 10 30" stroke="currentColor" fill="transparent" />
      <path d="M10 30 L10 190" stroke="currentColor" fill="transparent" />
      <path
        d="M10 190 Q10 210 30 210"
        stroke="currentColor"
        fill="transparent"
      />
      <path d="M30 210 L190 210" stroke="currentColor" fill="transparent" />
      <path d="M190 210 L210 190" stroke="currentColor" fill="transparent" />
      <path d="M210 190 L210 30" stroke="currentColor" fill="transparent" />
      <path
        d="M210 30 Q210 10 190 10"
        stroke="currentColor"
        fill="transparent"
      />
      <path d="M190 10 L30 10" stroke="currentColor" fill="transparent" />
    </svg>
  );
};

export const Balance = () => {
  const style = {
    minHeight: '100px',
  };
  return (
    <div style={style}>
      <Background color="#ADADAD" />
      <Flex padding="15px" direction="column" gap={10} alignItems="flex-start">
        <Typography fontSize={10} color="#ADADAD">
          Total Balance
        </Typography>
        <Typography fontSize={20} fontWeight={700}>
          $0.00
        </Typography>
      </Flex>
    </div>
  );
};
