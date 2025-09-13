

"use client"

import { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Star, StarHalf, User, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoachWithMembership } from "@/types";
import EditCoachDialog from "./edit-coach-dialog";
import DeleteCoachDialog from "./delete-coach-dialog";
import ApplicationList from "./application-list";
import ViewPersonalInfoDialog from "./view-personal-info-dialog";
import AthleteList from "./athlete-list";
import { useToast } from "@/hooks/use-toast";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            if (ratingValue <= rating) {
                return <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />;
            } else if (ratingValue - 0.5 <= rating) {
                return <StarHalf key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />;
            } else {
                return <Star key={i} className="h-4 w-4 text-muted-foreground" />;
            }
        })}
    </div>
);


export default function CoachTable({ data, isLoading, onDataChange }: CoachTableProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  
  const [selectedCoach, setSelectedCoach] = useState<CoachWithMembership | null>(null);

  const handleEdit = (coach: CoachWithMembership) => {
    setSelectedCoach(coach);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (coach: CoachWithMembership) => {
    setSelectedCoach(coach);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewPersonalInfo = (coach: CoachWithMembership) => {
    setSelectedCoach(coach);
    setIsPersonalInfoOpen(true);
  };

  const onDialogClose = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsPersonalInfoOpen(false);
    setSelectedCoach(null);
    onDataChange();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Membership code copied to clipboard." });
  }

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Apps</TableHead>
              <TableHead>Athletes</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? renderSkeleton() : data.map(coach => (
              <TableRow key={coach.id}>
                <TableCell>
                  <Image src={coach.imageUrl} alt={coach.name} width={40} height={40} className="rounded-full object-cover" />
                </TableCell>
                <TableCell className="font-medium">{coach.name}</TableCell>
                <TableCell>
                    <Badge variant="outline">{coach.specialty}</Badge>
                </TableCell>
                <TableCell>
                    {coach.membershipCode ? (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{coach.membershipCode}</Badge>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(coach.membershipCode!)}>
                                <Copy className="h-3.5 w-3.5" />
                             </Button>
                        </div>
                    ) : (
                        <Badge variant="destructive">N/A</Badge>
                    )}
                </TableCell>
                <TableCell>
                    <StarRating rating={coach.rating} />
                </TableCell>
                <TableCell>
                    <ApplicationList coachId={coach.id} />
                </TableCell>
                <TableCell>
                    <AthleteList coachId={coach.id} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleEdit(coach)}>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleViewPersonalInfo(coach)}>View Personal Info</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleDelete(coach)} className="text-red-500">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No one found in this category.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCoach && (
        <>
          <EditCoachDialog 
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            coach={selectedCoach}
            onDialogClose={onDialogClose}
          />
          <DeleteCoachDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            coach={selectedCoach}
            onDialogClose={onDialogClose}
          />
          <ViewPersonalInfoDialog
            isOpen={isPersonalInfoOpen}
            onOpenChange={setIsPersonalInfoOpen}
            coach={selectedCoach}
          />
        </>
      )}
    </>
  );
}

interface CoachTableProps {
  data: CoachWithMembership[];
  isLoading: boolean;
  onDataChange: () => void;
}
