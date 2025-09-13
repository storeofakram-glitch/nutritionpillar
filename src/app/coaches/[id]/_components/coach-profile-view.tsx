
'use client';

import type { Coach, Plan } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Award, Dumbbell, Zap, HeartPulse, Rocket, StarHalf, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ApplyDialog from './apply-dialog';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            if (ratingValue <= rating) {
                return <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
            } else if (ratingValue - 0.5 <= rating) {
                return <StarHalf key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
            } else {
                return <Star key={i} className="h-5 w-5 text-muted-foreground/30" />;
            }
        })}
         <span className="text-muted-foreground ml-1 text-sm">({rating.toFixed(1)})</span>
    </div>
);

const PlanIcon = ({ iconName }: { iconName: string }) => {
    switch (iconName) {
        case 'Personal Training': return <Dumbbell className="h-8 w-8 text-primary" />;
        case 'Online Coaching': return <Zap className="h-8 w-8 text-primary" />;
        case 'Nutrition Plan': return <HeartPulse className="h-8 w-8 text-primary" />;
        case 'VIP Program': return <Rocket className="h-8 w-8 text-primary" />;
        default: return <Dumbbell className="h-8 w-8 text-primary" />;
    }
}

const PlanCard = ({ plan, coachId, coachName }: { plan: Plan; coachId: string; coachName: string }) => (
    <Card className="flex flex-col text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <PlanIcon iconName={plan.icon} />
            </div>
            <CardTitle className="font-headline pt-4">{plan.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm text-muted-foreground text-left">
                {plan.description.split('\n').map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
             <p className="text-2xl font-bold font-headline text-primary">
                DZD {plan.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/{plan.pricePeriod}</span>
            </p>
            <ApplyDialog plan={plan} coachId={coachId} coachName={coachName} />
        </CardFooter>
    </Card>
);

export default function CoachProfileView({ coach }: { coach: Coach }) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                     <Card className="p-4 sticky top-24">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-48 w-48 mb-4 rounded-full overflow-hidden shadow-lg">
                                <Image
                                    src={coach.imageUrl}
                                    alt={coach.name}
                                    fill
                                    className="object-cover"
                                    sizes="192px"
                                />
                            </div>
                            <h1 className="text-3xl font-bold font-headline">{coach.name}</h1>
                            <p className="text-lg text-primary font-semibold">{coach.type}</p>
                            <div className="my-3">
                                <StarRating rating={coach.rating} />
                            </div>
                            <Badge variant="secondary" className="text-base">{coach.specialty}</Badge>
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-8">
                     <Card>
                        <CardContent className="p-6">
                             <h2 className="text-2xl font-bold font-headline mb-4">About {coach.name}</h2>
                             <p className="text-muted-foreground leading-relaxed">
                                {coach.bio || "No biography provided."}
                            </p>
                        </CardContent>
                    </Card>
                    
                    {coach.certifications && coach.certifications.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold font-headline mb-4">Certifications</h2>
                                <ul className="space-y-3">
                                    {coach.certifications.map((cert, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <Award className="h-5 w-5 text-primary" />
                                            <span className="text-muted-foreground">{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {coach.plans && coach.plans.length > 0 && (
                        <div>
                             <h2 className="text-2xl font-bold font-headline mb-4 text-center">Coaching Plans</h2>
                             <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                                {coach.plans.map((plan, index) => (
                                    <PlanCard key={index} plan={plan} coachId={coach.id} coachName={coach.name} />
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
