
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { CoachingApplication, Coach, Plan } from "@/types"
import { format } from "date-fns"
import { Mail, MessageSquare, CreditCard, Percent } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCoachById } from "@/services/coach-service";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewApplicationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    application: CoachingApplication;
}

export default function ViewApplicationDialog({ isOpen, onOpenChange, application }: ViewApplicationDialogProps) {
  
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoach() {
      if (isOpen && application) {
        setLoading(true);
        const coachData = await getCoachById(application.coachId);
        setCoach(coachData);
        setLoading(false);
      }
    }
    fetchCoach();
  }, [isOpen, application]);
  
  const { applicant } = application;

  const appliedPlan = coach?.plans?.find(p => p.title === application.planTitle);

  const calculateTotalPrice = () => {
    if (!appliedPlan || appliedPlan.pricePeriod !== 'month') {
        return { totalPrice: null, discountApplied: 0 };
    }
    const durationMap: Record<string, number> = {
        '1 month': 1,
        '3 months': 3,
        '6 months': 6,
        '1 year': 12,
    };
    const discountMap: Record<string, number | undefined> = {
        '3 months': appliedPlan.discount3Months,
        '6 months': appliedPlan.discount6Months,
        '1 year': appliedPlan.discount1Year,
    };

    const multiplier = durationMap[applicant.duration];
    if (multiplier) {
        const basePrice = appliedPlan.price * multiplier;
        const discountPercentage = discountMap[applicant.duration];
        
        if (discountPercentage && discountPercentage > 0) {
            const discount = basePrice * (discountPercentage / 100);
            return { totalPrice: basePrice - discount, discountApplied: discountPercentage };
        }
        return { totalPrice: basePrice, discountApplied: 0 };
    }
    return { totalPrice: null, discountApplied: 0 };
  }

  const { totalPrice, discountApplied } = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application for {application.planTitle}</DialogTitle>
          <DialogDescription>
            From: {applicant.name} | Submitted: {format(new Date(application.createdAt), "PPP p")}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ScrollArea className="max-h-[60vh]">
            <div className="p-1 pr-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold">Name:</span> {applicant.name}</div>
                    <div><span className="font-semibold">Email:</span> {applicant.email}</div>
                    <div><span className="font-semibold">Phone:</span> {applicant.phone}</div>
                    <div><span className="font-semibold">Age:</span> {applicant.age}</div>
                    <div><span className="font-semibold">Weight:</span> {applicant.weight} kg</div>
                    <div><span className="font-semibold">Height:</span> {applicant.height} cm</div>
                    <div><span className="font-semibold">Goal:</span> {applicant.goal}</div>
                    <div><span className="font-semibold">Duration:</span> {applicant.duration}</div>
                </div>
                 {appliedPlan && (
                    <div>
                        <h4 className="font-semibold mb-2">Plan Price:</h4>
                         <div className="flex flex-col gap-2 p-3 bg-primary/10 rounded-md">
                            <div className="flex items-center justify-between text-primary font-bold">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>DZD {appliedPlan.price.toLocaleString()} / {appliedPlan.pricePeriod}</span>
                                </div>
                                {totalPrice !== null && (
                                    <div className="text-right">
                                        <p className="text-lg">Total: DZD {totalPrice.toLocaleString()}</p>
                                        <p className="text-xs font-normal text-muted-foreground">({applicant.duration})</p>
                                    </div>
                                )}
                            </div>
                            {discountApplied > 0 && (
                                <div className="flex items-center gap-2 text-xs text-green-600 font-medium border-t border-primary/10 pt-2 mt-2">
                                    <Percent className="h-3 w-3" />
                                    <span>Discount of {discountApplied}% applied!</span>
                                </div>
                            )}
                        </div>
                    </div>
                 )}
                {applicant.message && (
                    <div>
                        <h4 className="font-semibold mb-2">Additional Message:</h4>
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{applicant.message}</p>
                    </div>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button asChild>
            <a href={`mailto:${applicant.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Reply via Email
            </a>
          </Button>
           <Button asChild variant="secondary">
            <Link href={`https://wa.me/${applicant.phone.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact via WhatsApp
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
