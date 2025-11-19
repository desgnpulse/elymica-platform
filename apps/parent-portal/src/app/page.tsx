import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { ParentDashboardContent } from '@/components/dashboard/parent-dashboard-content';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <ParentDashboardContent
      parentName={session.user?.name || 'Parent'}
      tenantSubdomain={session.tenantSubdomain || 'tenant'}
      parentId={session.userId || ''}
    />
  );
}
