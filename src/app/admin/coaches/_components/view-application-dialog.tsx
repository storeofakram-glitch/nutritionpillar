
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
import type { CoachingApplication } from "@/types"
import { format } from "date-fns"
import { Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewApplicationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    application: CoachingApplication;
}

export default function ViewApplicationDialog({ isOpen, onOpenChange, application }: ViewApplicationDialogProps) {
  
  const { applicant } = application;

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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
