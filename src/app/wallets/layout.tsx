import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallets | Apex Finance',
  description: 'Manage your wallets and view their balances and expense reports.',
};

export default function WalletsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
