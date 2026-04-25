import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports | Apex Finance',
  description: 'View deep dive analytics and historical performance reports.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
