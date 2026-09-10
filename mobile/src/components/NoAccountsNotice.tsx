import { useRouter } from 'expo-router';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { SkeletonRow } from '@/src/components/Skeleton';
import { useFinance } from '@/src/store/FinanceContext';

export type NoAccountsNoticeProps = {
  title?: string;
  body?: string;
  /**
   * Passed on the profile screen, where the add sheet is right there. Everywhere
   * else the button carries the user to the profile with that sheet open.
   */
  onAddAccount?: () => void;
};

/**
 * What a screen shows instead of a balance, a picker or a list while there are
 * no accounts to show. Renders nothing once there are.
 *
 * Accounts are held in the database and nowhere else, so an empty list is one of
 * three different things, and saying the wrong one is worse than saying nothing:
 * the list may still be on its way, the server may be unreachable — in which
 * case the user may well have accounts — or there may genuinely be none yet.
 * Only the last of those is the user's to fix, and only it offers to.
 */
export function NoAccountsNotice({ title, body, onAddAccount }: NoAccountsNoticeProps) {
  const router = useRouter();
  const { state, accountsLoading, accountsError, refreshAccounts } = useFinance();

  if (state.accounts.length > 0) return null;

  // While the list is on its way, stand in for the rows themselves rather than
  // announcing the wait: the shape of what is coming makes the screen feel like
  // it is filling in, and nothing shifts when the real rows replace it.
  if (accountsLoading) {
    return (
      <Card>
        <SkeletonRow />
        <SkeletonRow />
      </Card>
    );
  }

  if (accountsError) {
    return (
      <Card padded={false}>
        <EmptyState
          compact
          icon="cloud-offline-outline"
          title="Can't load your accounts"
          body={`${accountsError}. Your accounts are safe — this device just cannot reach them right now.`}
          actionLabel="Try again"
          onAction={refreshAccounts}
        />
      </Card>
    );
  }

  return (
    <Card padded={false}>
      <EmptyState
        compact
        icon="wallet-outline"
        title={title ?? 'No accounts yet'}
        body={
          body ??
          'Add the bank account, wallet or cash you keep your money in — every transaction is recorded against one.'
        }
        actionLabel="Add an account"
        onAction={
          onAddAccount ??
          (() => router.push({ pathname: '/profile', params: { addAccount: '1' } }))
        }
      />
    </Card>
  );
}
