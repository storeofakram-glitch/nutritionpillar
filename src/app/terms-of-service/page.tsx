
export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="prose prose-lg max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-8">Terms of Service</h1>

        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
        
        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">1. Agreement to Terms</h2>
        <p>
          By using our website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the website. We may modify the Terms at any time, and such modifications shall be effective immediately upon posting of the modified Terms.
        </p>

        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">2. Use of the Site</h2>
        <p>
          You may use the Site for lawful purposes only. You may not use the Site to post, transmit or otherwise distribute any material that is unlawful, threatening, abusive, libelous, defamatory, obscene, vulgar, pornographic, profane or indecent.
        </p>
        
        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">3. Intellectual Property</h2>
        <p>
          The content on this website, including text, graphics, logos, images, and software, is the property of Nutrition Pillar or its content suppliers and protected by international copyright laws.
        </p>
        
        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">4. Product Information</h2>
        <p>
          We strive to be as accurate as possible in our product descriptions. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.
        </p>

        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">5. Limitation of Liability</h2>
        <p>
          In no event shall Nutrition Pillar be liable for any direct, indirect, special, punitive, incidental, exemplary or consequential damages, or any damages whatsoever, even if we have been previously advised of the possibility of such damages, whether in an action under contract, negligence, or any other theory, arising out of or in connection with the use, inability to use, or performance of the information, services, products, and materials available from this site.
        </p>
        
        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">6. Governing Law</h2>
        <p>
          These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Algeria.
        </p>

        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us through our website's contact page.
        </p>
      </div>
    </div>
  );
}
