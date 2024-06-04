export const predicates = {
  'verification-predicate': {
    abi: {
      encoding: '1',
      types: [
        {
          typeId: 0,
          type: 'b256',
          components: null,
          typeParameters: null,
        },
        {
          typeId: 1,
          type: 'bool',
          components: null,
          typeParameters: null,
        },
      ],
      functions: [
        {
          inputs: [],
          name: 'main',
          output: {
            name: '',
            type: 1,
            typeArguments: null,
          },
          attributes: null,
        },
      ],
      loggedTypes: [],
      messagesTypes: [],
      configurables: [
        {
          name: 'SIGNER',
          configurableType: {
            name: '',
            type: 0,
            typeArguments: null,
          },
          offset: 456,
        },
      ],
    },
    bytecode: base64ToUint8Array(
      'GvAwAHQAAAIAAAAAAAAByF3/wAEQ//8AGuxQAJEAAVBhQAQBUEewkBrpAAAa5RAAIPgzAFj74AJQ++AEdAAAORpD0ABQR7EQckgAQChFBIBQQ7BwXUfwBhBFEMBySAAgKEEUgF/tAABdQ/AEX+0AARpDsABQR7DwckgAEChFBIBQQ7DQGukQABrlAAAg+DMAWPvgAlD74AR0AAAvGkPQAFBHsRAaSAAAUE+wMHJQACAoTQUAUEOwUHJQACAoQSUAQE0UABpAgAATQQBAdkAACVBDsCBf7AAEUEUAD1xL8CheRSAAUEexAHJIABAoRQSAdAAABlBDsBBf7BACX+wAA1BHsQBySAAQKEUEgF1DsCATQQAAXEfwKHZAAAEaRAAAJEQAAJUAAA+WCAAAGuxQABpDoAAaR5AAGkvgAHJMAEAoRQTAGvUQABr5IACYCAAAlwAAD0r4AACVAAA/lggAABrsUACRAABAGkOgABpHkAAaS+AAckwAECjtBMAaT7AAXU0wAFBTsBByVAAQKFEFQBtAEAAQQTQAUE+wIHJQACAoTQUAUEOwIHJMACAoRQTAGvUQAJIAAEAa+SAAmAgAAJcAAD9K+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAEAAAAAAAAAAAAAAAAAAXA=',
    ),
  },
};

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
