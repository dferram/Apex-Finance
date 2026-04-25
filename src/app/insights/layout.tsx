import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insights & AI | Apex Finance',
  description: 'Get AI-driven insights on your financial data.',
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
