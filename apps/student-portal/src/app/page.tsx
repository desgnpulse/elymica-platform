import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.userId) {
    redirect('/login');
  }

  return (
    <DashboardContent
      studentId={session.userId}
      studentName={session.user.name || 'Student'}
      tenantSubdomain={session.tenantSubdomain || 'tenant'}
    />
  );
}
