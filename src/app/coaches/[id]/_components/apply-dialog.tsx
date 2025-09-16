
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "./application-form";
import type { Plan } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApplyDialogProps {
  plan: Plan;
  coachId: string;
  coachName: string;
}

export default function ApplyDialog({ plan, coachId, coachName }: ApplyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for: {plan.title}</DialogTitle>
          <DialogDescription>
            Complete the form below to apply for this plan with {coachName}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-6">
            <ApplicationForm 
                plan={plan} 
                coachId={coachId}
                coachName={coachName} 
                onSuccess={() => setOpen(false)} 
            />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
