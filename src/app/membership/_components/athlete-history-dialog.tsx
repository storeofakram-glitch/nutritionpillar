
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CoachingApplication } from "@/types"
import { format } from "date-fns"

interface AthleteHistoryDialogProps {
  athletes: CoachingApplication[];
}

export default function AthleteHistoryDialog({ athletes }: AthleteHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" />
          View Athlete History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Athlete History</DialogTitle>
          <DialogDescription>
            A record of all past clients.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            {athletes.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Archived On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {athletes.map(athlete => (
                            <TableRow key={athlete.id}>
                                <TableCell>{athlete.applicant.name}</TableCell>
                                <TableCell>{athlete.applicant.email}</TableCell>
                                <TableCell>{format(new Date(athlete.createdAt), "PPP")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground py-10">No archived athletes found.</p>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
