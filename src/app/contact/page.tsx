import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Contact Us</CardTitle>
                    <CardDescription className="text-lg">
                        Have a question or feedback? We'd love to hear from you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g., Question about an order" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message here..." rows={6} />
                        </div>
                        <Button type="submit" className="w-full font-bold" size="lg">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
