
'use client';

import type { Coach } from '@/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
        ))}
         <span className="text-muted-foreground ml-1 text-sm">({rating.toFixed(1)})</span>
    </div>
);

export default function CoachProfileView({ coach }: { coach: Coach }) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                     <Card className="p-4">
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
                </div>
            </div>
        </div>
    );
}
