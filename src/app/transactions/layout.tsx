import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions | Apex Finance',
  description: 'View and manage all your transactions.',
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
