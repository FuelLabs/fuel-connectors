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
          offset: 280,
        },
      ],
    },
    bytecode: base64ToUint8Array(
      'GvAwAHQAAAIAAAAAAAABGF3/wAEQ//8AGuxQAJEAAPBhQAQBUEewYBrpAAAa5RAAIPgzAFj74AJQ++AEdAAAJhpD0ABQR7CwckgAQChFBIBQT7CwGlAAAFBDsCBdR/AFEEUTAHJIACAoQRSAUEewQHJIACAoRUSAQEE0QBpAgAATQQBAdkAACVBDsBBf7AACUEUAD1xL8CBeRSAAUEewoHJIABAoRQSAdAAABV/sEABf7AABUEOwoHJEABAoQ7RAXUOwFBNBAABcR/AgdkAAARpEAAAkRAAAlQAAD5YIAAAa7FAAGkOgABpHkAAaS+AAckwAQChFBMAa9RAAGvkgAJgIAACXAAAPSvgAAEcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAABGA==',
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
