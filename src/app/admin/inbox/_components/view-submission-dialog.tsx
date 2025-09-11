
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ContactSubmission } from "@/types"
import { format } from "date-fns"
import { Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ViewSubmissionDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    submission: ContactSubmission;
}

export default function ViewSubmissionDialog({ isOpen, onOpenChange, submission }: ViewSubmissionDialogProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{submission.subject}</DialogTitle>
          <DialogDescription>
            From: {submission.name} &lt;{submission.email}&gt;
            <span className="mx-2 text-muted-foreground">•</span>
            Received on {format(new Date(submission.createdAt), "PPP p")}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="prose prose-sm dark:prose-invert max-h-[50vh] overflow-y-auto rounded-md bg-muted/50 p-4">
            <p>{submission.message}</p>
        </div>
        <DialogFooter>
          <Button asChild>
            <a href={`mailto:${submission.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Reply via Email
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
