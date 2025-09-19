
import { getCoachById } from '@/services/coach-service';
import { notFound } from 'next/navigation';
import CoachProfileView from './_components/coach-profile-view';

// This is a Server Component
export default async function CoachProfilePage({ params }: { params: { id: string } }) {
  const coach = await getCoachById(params.id);

  if (!coach) {
    notFound();
  }

  return <CoachProfileView coach={coach} />;
}
