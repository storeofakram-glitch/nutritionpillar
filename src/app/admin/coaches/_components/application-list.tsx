
"use client";

import { useEffect, useState } from "react";
import type { CoachingApplication } from "@/types";
import { getApplicationsByCoach, getNewApplicationsCountByCoach } from "@/services/application-service";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import ViewApplicationDialog from "./view-application-dialog";
import DeleteApplicationDialog from "./delete-application-dialog";
import { updateApplicationStatus } from "@/services/application-service";

interface ApplicationListProps {
  coachId: string;
}

const applicationStatuses: CoachingApplication['status'][] = ['new', 'read', 'contacted', 'rejected', 'active'];

export default function ApplicationList({ coachId }: ApplicationListProps) {
    const [applications, setApplications] = useState<CoachingApplication[]>([]);
    const [newCount, setNewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<CoachingApplication | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [apps, count] = await Promise.all([
            getApplicationsByCoach(coachId),
            getNewApplicationsCountByCoach(coachId),
        ]);
        setApplications(apps);
        setNewCount(count);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [coachId]);
    
    const handleView = async (application: CoachingApplication) => {
        setSelectedApplication(application);
        setIsViewDialogOpen(true);
        if (application.status === 'new') {
            await updateApplicationStatus(application.id, 'read');
            fetchData();
        }
    };

    const handleDelete = (application: CoachingApplication) => {
        setSelectedApplication(application);
        setIsDeleteDialogOpen(true);
    };

    const handleStatusChange = async (id: string, status: CoachingApplication['status']) => {
        await updateApplicationStatus(id, status);
        fetchData();
    };
    
    const onDialogClose = () => {
        setIsViewDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedApplication(null);
        fetchData();
    };

    if (loading) {
        return <Badge variant="outline">Loading...</Badge>;
    }
    
    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="h-auto p-1 text-sm relative">
                        {applications.length} {applications.length === 1 ? 'App' : 'Apps'}
                        {newCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Coaching Applications</SheetTitle>
                        <SheetDescription>
                            Review applications for this coach.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                        {applications.length > 0 ? applications.map(app => (
                            <div key={app.id} className="border p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{app.applicant.name}</p>
                                    <p className="text-sm text-muted-foreground">Plan: {app.planTitle}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Badge variant={app.status === 'new' ? 'default' : 'secondary'}>{app.status}</Badge>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleView(app)}>View Details</DropdownMenuItem>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    {applicationStatuses.map(status => (
                                                        <DropdownMenuItem 
                                                            key={status} 
                                                            onSelect={() => handleStatusChange(app.id, status)}
                                                            disabled={app.status === status}
                                                        >
                                                            {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleDelete(app)} className="text-red-500">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No applications found for this coach.</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {selectedApplication && (
                <>
                    <ViewApplicationDialog 
                        isOpen={isViewDialogOpen}
                        onOpenChange={setIsViewDialogOpen}
                        application={selectedApplication}
                    />
                    <DeleteApplicationDialog
                        isOpen={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        application={selectedApplication}
                        onDialogClose={onDialogClose}
                    />
                </>
            )}
        </>
    );
}
