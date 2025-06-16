# PersonalSign Testing Guide

## Overview
This guide provides comprehensive testing instructions for the enhanced PersonalSign functionality in the Fuel Wallet React example app. The implementation allows testing various message formats including text, byte arrays, JSON data, and predefined objects.

## Features Implemented

### 1. Multiple Input Types
- **Text Message**: Traditional string message signing
- **Byte Array**: PersonalSign with custom byte data
- **JSON Data**: PersonalSign with JSON converted to bytes
- **Predefined Object**: Auth token example with personalSign

### 2. Enhanced UI Components
- Input type selector dropdown
- Dynamic input fields based on selected type
- Real-time preview of message content
- Quick test buttons for common scenarios
- Better error handling and user feedback

### 3. Test Cases Included
- Single byte array `[0]`
- ASCII text as bytes `[72, 101, 108, 108, 111]` ("Hello")
- Binary data `[0xFF, 0xFE, 0xFD, 0xFC]`
- Unicode text with emojis
- JSON authentication tokens

## How to Test

### Prerequisites
1. Start the React app: `pnpm dev` (from the react-app directory)
2. Connect your Fuel Wallet to the application
3. Navigate to the "Sign Message (PersonalSign Testing)" section

### Test Scenarios

#### Scenario 1: Text Message (Traditional)
1. Select "Text Message" from the dropdown
2. Enter any text in the textarea
3. Click "Sign Message"
4. **Expected**: Wallet opens with readable text message
5. **Expected**: Returns valid signature

#### Scenario 2: Byte Array PersonalSign
1. Select "Byte Array (personalSign)" from the dropdown
2. Enter comma-separated numbers: `0,1,2,3,4,5`
3. Check the preview shows both bytes and decoded text
4. Click "Sign PersonalSign Data"
5. **Expected**: Wallet opens showing the byte data appropriately
6. **Expected**: Returns valid signature

#### Scenario 3: JSON Data PersonalSign
1. Select "JSON Data (personalSign)" from the dropdown
2. Enter valid JSON: `{"message": "test", "timestamp": 1234567890}`
3. Check the preview shows formatted JSON
4. Click "Sign PersonalSign Data"
5. **Expected**: Wallet displays the JSON data
6. **Expected**: Returns valid signature

#### Scenario 4: Predefined Object
1. Select "Predefined Object (personalSign)" from the dropdown
2. Review the auth token structure in the preview
3. Click "Sign PersonalSign Data"
4. **Expected**: Wallet shows the auth token data
5. **Expected**: Returns valid signature

#### Scenario 5: Quick Test Buttons
Test each quick test button:
- **Single Byte [0]**: Tests minimal byte array
- **"Hello" ASCII**: Tests ASCII text as bytes
- **Binary Data**: Tests high-value bytes
- **Unicode Text**: Tests emoji and international characters

### Expected Wallet Behavior

#### For Text Messages
- Wallet should display the message as readable text
- Standard message signing UI

#### For PersonalSign Messages
- Wallet should recognize the `personalSign` format
- May display as hex, attempt text decoding, or show raw bytes
- Should handle the signing appropriately

### Debugging and Troubleshooting

#### Console Logging
The implementation includes detailed console logging:
```javascript
console.log('Signing message:', message);
```
Check browser console for:
- Message structure being sent
- Error details if signing fails
- Response signatures

#### Common Issues

1. **"Invalid byte array" error**
   - Ensure comma-separated numbers 0-255
   - Example: `0,1,2,3,4,5` not `[0,1,2,3,4,5]`

2. **"Invalid JSON" error**
   - Validate JSON syntax
   - Use double quotes for strings
   - Example: `{"key": "value"}` not `{key: 'value'}`

3. **Wallet connection issues**
   - Ensure wallet is connected before signing
   - Check wallet extension is installed and unlocked

#### Error Messages
The UI provides user-friendly error messages:
- Input validation errors
- Wallet connection errors
- Signing operation errors

### Advanced Testing

#### Edge Cases to Test
1. **Empty inputs**
   - Empty text message
   - Empty byte array
   - Empty JSON object `{}`

2. **Large data**
   - Long text messages (>1000 characters)
   - Large byte arrays (>100 bytes)
   - Complex JSON structures

3. **Special characters**
   - Unicode characters: `Hello 🌍 World`
   - Special symbols: `!@#$%^&*()`
   - Newlines and tabs in text

4. **Invalid inputs**
   - Invalid byte values (>255, negative)
   - Malformed JSON
   - Non-UTF8 byte sequences

### Verification Steps

#### 1. Message Structure Verification
Check console logs to verify the message structure:
```javascript
// Text message
"Hello World"

// PersonalSign message
{
  personalSign: Uint8Array([72, 101, 108, 108, 111])
}
```

#### 2. Signature Verification
- All successful operations should return a signature string
- Signatures should be consistent for identical messages
- Different message types should produce different signatures

#### 3. Wallet UI Verification
- Text messages: Readable in wallet
- Byte arrays: Displayed as hex or decoded text
- JSON data: Formatted appropriately
- No crashes or UI freezes

### Performance Testing

#### Response Times
- Text messages: Should be near-instantaneous
- PersonalSign messages: May take slightly longer
- Large data: Monitor for timeouts

#### Memory Usage
- Large byte arrays should not cause memory issues
- Multiple signing operations should not leak memory

### Integration Testing

#### With Different Wallets
Test with various Fuel wallet implementations:
- Browser extension wallet
- Mobile wallet (if applicable)
- Hardware wallet integration

#### Cross-browser Testing
- Chrome/Chromium
- Firefox
- Safari (if supported)
- Edge

### Reporting Issues

When reporting issues, include:
1. **Input type and data used**
2. **Console error messages**
3. **Wallet behavior observed**
4. **Expected vs actual results**
5. **Browser and wallet versions**

### Success Criteria

The PersonalSign implementation is working correctly when:
1. ✅ All input types can be signed successfully
2. ✅ Wallet displays messages appropriately
3. ✅ Valid signatures are returned
4. ✅ Error handling works for invalid inputs
5. ✅ UI is responsive and user-friendly
6. ✅ Console logging provides useful debugging info

## Next Steps

After successful testing:
1. Document any wallet-specific behaviors
2. Create additional test cases for edge scenarios
3. Consider adding signature verification functionality
4. Implement batch signing capabilities
5. Add export/import functionality for test cases

This comprehensive testing approach ensures the PersonalSign functionality works reliably across different scenarios and provides a solid foundation for production use. 