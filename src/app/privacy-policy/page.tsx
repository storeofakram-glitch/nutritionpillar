
import { getSiteSettings } from "@/services/site-settings-service";
import type { SiteSettings } from "@/types";
import ReactMarkdown from 'react-markdown';

export default async function PrivacyPolicyPage() {
    const siteSettings: SiteSettings | null = await getSiteSettings();

    const privacyPage = siteSettings?.privacyPage || {
        title: "Privacy Policy",
        content: `
*Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*

Welcome to our website. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.

## Collection of Your Information
We may collect information about you in a variety of ways. The information we may collect on the Site includes personal data that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.

## Use of Your Information
Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to create and manage your account, process your transactions, and email you regarding your account or order.

## Security of Your Information
We use administrative, technical, and physical security measures to help protect your personal information.

## Contact Us
If you have questions or comments about this Privacy Policy, please contact us.
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
                    {`# ${privacyPage.title}\n\n${privacyPage.content}`}
                </ReactMarkdown>
            </div>
        </div>
    );
}
