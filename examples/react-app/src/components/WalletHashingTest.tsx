import { Signer, arrayify, hashMessage } from 'fuels';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

import { Copyable } from './Copyable';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface TestResult {
  testName: string;
  passed: boolean;
  signature: string;
  recoveredAddress: string;
  expectedAddress: string;
  error?: string;
  details: {
    singleHashedMatch: boolean;
  };
}

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function WalletHashingTest({ isSigning, setIsSigning }: Props) {
  const { currentConnector, account, isConnected } = useWallet();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const TEST_NAME = 'Hash Object Test';
  const TEST_HASH =
    '0x6eca378ab5ed54f3b21c075d39b4c61ab927c049610670214ddeeee90db832e2';

  const runHashTest = async () => {
    if (!currentConnector.connector || !account) return;

    setIsLoading(true);
    setIsSigning(true);

    try {
      const hashBytes = arrayify(TEST_HASH);

      const signature = await currentConnector.connector.signMessage(account, {
        personalSign: hashBytes,
      });

      const hashedMsg = hashMessage({ personalSign: hashBytes });
      const recoveredAddress = Signer.recoverAddress(
        hashedMsg,
        signature,
      ).toHexString();

      const passed = recoveredAddress.toLowerCase() === account.toLowerCase();

      const result: TestResult = {
        testName: TEST_NAME,
        passed,
        signature,
        recoveredAddress,
        expectedAddress: account,
        details: { singleHashedMatch: passed },
      };

      setTestResults((prev) => [
        ...prev.filter((r) => r.testName !== TEST_NAME),
        result,
      ]);

      setToast({
        open: true,
        type: passed ? 'success' : 'error',
        children: passed
          ? 'Hash test passed - Wallet correctly hashes and recovers address'
          : 'Hash test failed - Wallet may not be compatible',
      });
    } catch (error) {
      const result: TestResult = {
        testName: 'Hash Object Test',
        passed: false,
        signature: '',
        recoveredAddress: '',
        expectedAddress: account,
        error: (error as Error).message,
        details: {
          singleHashedMatch: false,
        },
      };

      setTestResults((prev) => [
        ...prev.filter((r) => r.testName !== 'Hash Object Test'),
        result,
      ]);

      setToast({
        open: true,
        type: 'error',
        children: `Hash test failed: ${(error as Error).message.substring(
          0,
          30,
        )}`,
      });
    } finally {
      setIsLoading(false);
      setIsSigning(false);
    }
  };

  function TestResultCard({ result }: { result: TestResult }) {
    return (
      <div className="border border-zinc-500/25 rounded-lg p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span
            className={
              result.passed
                ? 'text-green-500 font-bold'
                : 'text-red-500 font-bold'
            }
          >
            {result.passed ? '✓ PASS' : '❌ FAIL'}
          </span>
        </div>

        {result.error && (
          <div className="text-red-500">
            <strong>Error:</strong> {result.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <Feature
      title=""
      lastRow={
        testResults.length > 0 ? (
          <div className="mt-2 -ml-2">
            {testResults.map((result) => (
              <TestResultCard
                key={
                  result.signature || result.recoveredAddress || result.testName
                }
                result={result}
              />
            ))}
          </div>
        ) : null
      }
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 justify-between">
          <div className="w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 font-mono md:-ml-2 md:p-2 dark:bg-transparent overflow-x-hidden">
            <pre>{TEST_HASH}</pre>
          </div>
          <Button
            onClick={runHashTest}
            disabled={
              isLoading ||
              isSigning ||
              !isConnected ||
              !currentConnector.connector ||
              !account
            }
            className="shrink-0 w-1/3"
            loading={isLoading}
            loadingText="Signing Hash..."
          >
            Sign Hash
          </Button>
        </div>
      </div>

      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </Feature>
  );
}
