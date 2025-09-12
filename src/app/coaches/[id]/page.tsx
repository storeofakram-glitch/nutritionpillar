
import { getCoachById } from '@/services/coach-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CoachProfileView from './_components/coach-profile-view';
import Link from 'next/link';

// This is a Server Component
export default async function CoachProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const coach = await getCoachById(id);

  if (!coach) {
    notFound();
  }

  return <CoachProfileView coach={coach} />;
}

// Add a custom not found component
export function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold font-headline">404 - Profile Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground">Sorry, we couldn't find the coach or expert you're looking for.</p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Go back to Homepage</Link>
      </Button>
    </div>
  )
}
