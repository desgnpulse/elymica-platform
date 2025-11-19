import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { TeacherDashboardContent } from '@/components/dashboard/teacher-dashboard-content';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <TeacherDashboardContent
      teacherName={session.user?.name || 'Teacher'}
      tenantSubdomain={session.tenantSubdomain || 'tenant'}
    />
  );
}
