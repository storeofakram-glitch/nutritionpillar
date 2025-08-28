import RecommendationForm from "@/components/recommendation-form";
import { BrainCircuit } from "lucide-react";

export default function RecommendationPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <BrainCircuit className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline">AI Supplement Recommendation</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Answer a few questions and our AI will build a custom supplement stack based on your goals.
            </p>
        </div>

        <RecommendationForm />
      </div>
    </div>
  );
}
