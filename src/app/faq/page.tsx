import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSiteSettings } from "@/services/site-settings-service";
import type { SiteSettings } from "@/types";

export default async function FaqPage() {
  const siteSettings: SiteSettings | null = await getSiteSettings();

  const faqPage = siteSettings?.faqPage || {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about our products, shipping, and policies.",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, as well as payment through various secure online payment gateways. All transactions are encrypted for your safety."
      },
      {
        question: "What is your shipping policy?",
        answer: "We offer shipping to all 58 wilayas of Algeria. Shipping costs and delivery times vary depending on your location. You can see the specific shipping cost for your city during checkout."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive a confirmation email with a tracking number. You can use this number on the carrier's website to track the status of your delivery."
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{faqPage.title}</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            {faqPage.subtitle}
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
            {faqPage.faqs.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg text-left font-semibold hover:no-underline">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}
