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
          offset: 92,
        },
      ],
    },
    bytecode: base64ToUint8Array(
      'GvAwAHQAAAIAAAAAAAAAXF3/wAEQ//8AGuxQAJEAAEBdQ/AFEEEDAHJEACAo7QRAUEOwIF1H8AUQRRMAckgAIChBFIChQ7QgE0EAABpEAAB2QAABXEfwICREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAFw=',
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
