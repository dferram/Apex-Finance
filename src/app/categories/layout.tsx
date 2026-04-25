import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | Apex Finance',
  description: 'Manage your budget and expense categories.',
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
