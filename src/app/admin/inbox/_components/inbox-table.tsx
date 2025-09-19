
"use client"

import { useEffect, useState, useTransition, useMemo } from "react";
import { MoreHorizontal, Dot } from "lucide-react";
import type { ContactSubmission } from "@/types";
import { getSubmissions, updateSubmissionStatus } from "@/services/contact-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import ViewSubmissionDialog from "./view-submission-dialog";
import DeleteSubmissionDialog from "./delete-submission-dialog";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InboxTableProps {
    onDataChange: () => void;
    searchTerm: string;
}

export default function InboxTable({ onDataChange, searchTerm }: InboxTableProps) {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

    const fetchSubmissions = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedSubmissions = await getSubmissions();
                setSubmissions(fetchedSubmissions);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) {
            return submissions;
        }
        return submissions.filter(submission => 
            submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [submissions, searchTerm]);


    const handleView = async (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsViewDialogOpen(true);
        // Mark as read if it's new
        if (submission.status === 'new') {
            await updateSubmissionStatus(submission.id, 'read');
            // Optimistically update UI
            setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'read' } : s));
        }
    };

    const handleDelete = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsDeleteDialogOpen(true);
    };

    const onDialogClose = () => {
        setIsViewDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedSubmission(null);
        onDataChange();
    };

    const handleStatusChange = async (id: string, status: ContactSubmission['status']) => {
        const result = await updateSubmissionStatus(id, status);
        if (result.success) {
            toast({ title: "Status Updated", description: `Message status changed to "${status}".` });
            onDataChange();
        } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        }
    };

    const renderSkeleton = () => (
        Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                            <TableHead>From</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Received</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? renderSkeleton() : filteredSubmissions.map((submission) => (
                            <TableRow key={submission.id} className={cn(submission.status === 'new' && 'bg-muted/50 font-bold')}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {submission.status === 'new' && <span className="h-2 w-2 rounded-full bg-primary" />}
                                        <div className="flex flex-col">
                                            <span>{submission.name}</span>
                                            <span className="text-xs font-normal text-muted-foreground">{submission.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{submission.subject}</TableCell>
                                <TableCell className="text-muted-foreground font-normal">
                                    {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
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
                                            <DropdownMenuItem onSelect={() => handleView(submission)}>View Message</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleStatusChange(submission.id, 'archived')}>Archive</DropdownMenuItem>
                                            {submission.status !== 'new' && (
                                                <DropdownMenuItem onSelect={() => handleStatusChange(submission.id, 'new')}>Mark as New</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleDelete(submission)} className="text-red-500">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!loading && filteredSubmissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    {searchTerm ? `No messages found for "${searchTerm}"` : 'Your inbox is empty.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {selectedSubmission && (
                <>
                    <ViewSubmissionDialog
                        isOpen={isViewDialogOpen}
                        onOpenChange={setIsViewDialogOpen}
                        submission={selectedSubmission}
                    />
                    <DeleteSubmissionDialog
                        isOpen={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        submission={selectedSubmission}
                        onDialogClose={onDialogClose}
                    />
                </>
            )}
        </>
    );
}
