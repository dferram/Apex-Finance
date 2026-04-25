import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console | Apex Finance',
  description: 'Manage workspaces, users, and general settings.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
