import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goals | Apex Finance',
  description: 'Manage and track your financial goals.',
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
