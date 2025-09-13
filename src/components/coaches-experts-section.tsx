

'use client';

import { getCoaches } from "@/services/coach-service";
import type { Coach } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useEffect, useState, useMemo } from "react";
import { Star, StarHalf, Search } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            if (ratingValue <= rating) {
                return <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />;
            } else if (ratingValue - 0.5 <= rating) {
                return <StarHalf key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />;
            } else {
                return <Star key={i} className="h-4 w-4 text-muted-foreground/30" />;
            }
        })}
    </div>
);

const CoachCard = ({ person }: { person: Coach }) => {
  return (
    <Card className="h-full flex flex-col text-center transition-all duration-300 border shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-primary">
        <CardHeader className="p-0">
            <div className="relative w-full aspect-square">
                <Image
                    src={person.imageUrl}
                    alt={person.name}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold font-headline text-lg">{person.name}</h3>
            <Badge variant="secondary" className="mt-1 self-center">{person.specialty}</Badge>
            <div className="mt-2 self-center">
                <StarRating rating={person.rating} />
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground border-primary/50" asChild>
                <Link href={`/coaches/${person.id}`}>View Details</Link>
            </Button>
        </CardFooter>
    </Card>
  );
};


const CarouselSection = ({ title, items, searchTerm }: { title: string, items: Coach[], searchTerm: string }) => {
    if (items.length === 0) {
      if (searchTerm) {
        return (
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-6">{title}</h3>
            <p className="text-muted-foreground text-center">No {title.toLowerCase()} found for "{searchTerm}".</p>
          </div>
        );
      }
      return null;
    }

    return (
        <div>
            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-6">{title}</h3>
            <Carousel
                opts={{ align: "start", loop: items.length > 5 }}
                className="w-full"
            >
                <CarouselContent className="-ml-4 py-4">
                    {items.map((person) => (
                        <CarouselItem key={person.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5 pl-4">
                            <CoachCard person={person} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
            </Carousel>
        </div>
    );
};

export default function CoachesExpertsSection() {
  const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const coachesData = await getCoaches();
      setAllCoaches(coachesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const { coachList, expertList } = useMemo(() => {
    const filteredCoaches = allCoaches.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
        coachList: filteredCoaches.filter(c => c.type === 'Coach'),
        expertList: filteredCoaches.filter(c => c.type === 'Expert')
    };
  }, [allCoaches, searchTerm]);
  
  if (loading) {
    return (
        <section id="coaches" className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-10">
                    <Skeleton className="h-6 w-48 mx-auto" />
                    <Skeleton className="h-10 w-72 mx-auto mt-4" />
                </div>
                <div className="flex gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1/5">
                            <Skeleton className="w-full h-80" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
  }
  
  if (allCoaches.length === 0) {
    return null; // Don't render the section if there are no coaches or experts
  }

  return (
    <section id="coaches" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
            <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">Trusted Coaches & Experts</h2>
        </div>

        <div className="relative max-w-lg mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
            />
        </div>

        <div className="space-y-12">
            <CarouselSection title="Our Coaches" items={coachList} searchTerm={searchTerm} />
            <CarouselSection title="Our Experts" items={expertList} searchTerm={searchTerm} />
        </div>
      </div>
    </section>
  );
}
