
import { getSiteSettings } from "@/services/site-settings-service";
import type { SiteSettings } from "@/types";
import ReactMarkdown from 'react-markdown';

export default async function TermsOfServicePage() {
    const siteSettings: SiteSettings | null = await getSiteSettings();

    const termsPage = siteSettings?.termsPage || {
        title: "Terms of Service",
        content: `
*Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*

## 1. Agreement to Terms
By using our website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the website. We may modify the Terms at any time, and such modifications shall be effective immediately upon posting of the modified Terms.

## 2. Use of the Site
You may use the Site for lawful purposes only. You may not use the Site to post, transmit or otherwise distribute any material that is unlawful, threatening, abusive, libelous, defamatory, obscene, vulgar, pornographic, profane or indecent.

## 3. Intellectual Property
The content on this website, including text, graphics, logos, images, and software, is the property of Nutrition Pillar or its content suppliers and protected by international copyright laws.

## 4. Product Information
We strive to be as accurate as possible in our product descriptions. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.

## 5. Limitation of Liability
In no event shall Nutrition Pillar be liable for any direct, indirect, special, punitive, incidental, exemplary or consequential damages, or any damages whatsoever, even if we have been previously advised of the possibility of such damages, whether in an action under contract, negligence, or any other theory, arising out of or in connection with the use, inability to use, or performance of the information, services, products, and materials available from this site.

## 6. Governing Law
These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Algeria.

## Contact Us
If you have any questions about these Terms of Service, please contact us through our website's contact page.
`
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
                 <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-8" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold font-headline mt-8 mb-4" {...props} />,
                    }}
                >
                    {`# ${termsPage.title}\n\n${termsPage.content}`}
                </ReactMarkdown>
            </div>
        </div>
    );
}
