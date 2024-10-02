function getFixedGradientDirection(hash: string) {
  const sum = hash
    .slice(4, 7)
    .split('')
    .reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

  return `${sum}deg`;
}

function hashToGradient(hash: string): string {
  let fixedHex = '';
  const length = hash?.length || 0;
  if (length === 0) {
    return '$cardBg';
  }

  for (let i = 0; i < length; i++) {
    const char = hash.charAt(i);
    if (/\d/.test(char)) {
      fixedHex += char;
    }
  }

  if (fixedHex.length < 12) {
    const diff = 12 - fixedHex.length;
    for (let i = 0; i < diff; i++) {
      fixedHex += '0';
    }
  }

  const color1 = fixedHex.slice(0, 6);
  const color2 = fixedHex.slice(6, 12);
  const direction = getFixedGradientDirection(hash);
  return `linear-gradient(${direction}, #${color1}, #${color2})`;
}

export function useGenerateBackground(hash: string) {
  return hashToGradient(hash);
}
