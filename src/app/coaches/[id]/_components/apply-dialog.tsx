
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

interface ApplyDialogProps {
  plan: Plan;
  coachName: string;
}

export default function ApplyDialog({ plan, coachName }: ApplyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for: {plan.title}</DialogTitle>
          <DialogDescription>
            Complete the form below to apply for this plan with {coachName}.
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm 
            plan={plan} 
            coachName={coachName} 
            onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
