
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
import { History, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CoachingApplication } from "@/types"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

interface AthleteHistoryDialogProps {
  athletes: CoachingApplication[];
}

export default function AthleteHistoryDialog({ athletes }: AthleteHistoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredAthletes = useMemo(() => {
    if (!searchTerm) return athletes;
    return athletes.filter(athlete => 
      athlete.applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [athletes, searchTerm]);


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
        <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <ScrollArea className="max-h-[60vh] pr-4">
            {filteredAthletes.length > 0 ? (
                <div className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Archived On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAthletes.slice(0, visibleCount).map(athlete => (
                                <TableRow key={athlete.id}>
                                    <TableCell>{athlete.applicant.name}</TableCell>
                                    <TableCell>{athlete.applicant.email}</TableCell>
                                    <TableCell>{format(new Date(athlete.createdAt), "PPP")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {filteredAthletes.length > visibleCount && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setVisibleCount(prev => prev + 10)}
                        >
                            Load More
                        </Button>
                    )}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">
                    {searchTerm ? `No results for "${searchTerm}"` : "No archived athletes found."}
                </p>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
