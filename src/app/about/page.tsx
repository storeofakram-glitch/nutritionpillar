import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About Nutrition Pillar</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Your trusted partner in achieving peak performance and optimal health through premium, scientifically-backed supplements.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image 
                src="https://picsum.photos/600/600?random=10"
                alt="Our Team"
                data-ai-hint="team photo"
                fill
                className="object-cover"
            />
        </div>
        <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
                Founded by a team of fitness enthusiasts and nutritionists, Nutrition Pillar was born from a simple idea: to provide pure, potent, and transparent supplements that people can trust. We were tired of the hype and fillers in the industry. We wanted to create a brand that stands on a pillar of quality, efficacy, and unwavering support for our customers' goals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                From our humble beginnings, we've grown into a community of athletes, health-conscious individuals, and everyone in between, all striving to be their best. We source the finest ingredients, rigorously test every batch, and provide clear, honest information so you can fuel your body with confidence.
            </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    To empower your health and fitness journey with superior supplements, grounded in science and formulated for results.
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    To be the most trusted name in sports nutrition, recognized for our commitment to quality, innovation, and customer success.
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Quality, Transparency, and Community. These are the pillars that support everything we do.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
