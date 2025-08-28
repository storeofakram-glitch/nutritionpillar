"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supplementRecommendation, SupplementRecommendationOutput } from "@/ai/flows/supplement-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";

const formSchema = z.object({
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  gender: z.enum(["male", "female", "other"]),
  fitnessGoals: z.string().min(10, "Please describe your goals in more detail."),
  otherRequirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function RecommendationForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SupplementRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      gender: "male",
      fitnessGoals: "",
      otherRequirements: "",
    },
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await supplementRecommendation(values);
      setResult(response);
    } catch (e) {
      setError("An error occurred while generating the recommendation. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Fill in your details to get a personalized recommendation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fitnessGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Goals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Build lean muscle, lose weight, improve endurance..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Vegan, allergies, specific health conditions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Get Recommendation
                </>
              )}
            </Button>
          </form>
        </Form>

        {error && <p className="mt-4 text-center text-destructive">{error}</p>}
        
        {result && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-2xl font-bold font-headline mb-4">Your Recommended Stack</h3>
            <div className="prose prose-stone dark:prose-invert max-w-none bg-secondary/50 p-6 rounded-lg">
                <h4 className="font-semibold">Supplements:</h4>
                <p>{result.supplementStack}</p>
                <h4 className="font-semibold">Explanation:</h4>
                <p>{result.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
