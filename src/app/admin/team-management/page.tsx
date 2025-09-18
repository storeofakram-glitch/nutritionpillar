

'use client';

import { useEffect, useState, useMemo } from "react";
import { getTeamApplications, type TeamApplicationData } from "@/services/join-team-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, RefreshCw, Mail, Phone, Link as LinkIcon, Download, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeleteTeamApplicationDialog from "./_components/delete-team-application-dialog";
import { Input } from "@/components/ui/input";

const ApplicationDetailsDialog = ({ application }: { application: TeamApplicationData }) => {
    return (
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Application: {application.name}</DialogTitle>
                <DialogDescription>
                    {application.position} application for {application.specialty}.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4 text-sm">
                <p><strong>Received:</strong> {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</p>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Phone:</strong> {application.phone}</p>
                    <p><strong>Age:</strong> {application.age}</p>
                    <p><strong>Nationality:</strong> {application.nationality}</p>
                </div>
                <div>
                    <p><strong>Address:</strong></p>
                    <p className="text-muted-foreground">{application.address}, {application.city}, {application.state}, {application.country}</p>
                </div>
                
                {application.certifications && application.certifications.length > 0 && (
                    <div>
                        <p><strong>Certifications:</strong></p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                            {application.certifications.map((cert, i) => <li key={i}>{cert}</li>)}
                        </ul>
                    </div>
                )}
                
                {application.message && (
                    <div>
                        <p><strong>Message:</strong></p>
                        <blockquote className="mt-2 border-l-2 pl-6 italic text-muted-foreground">
                            {application.message}
                        </blockquote>
                    </div>
                )}

                <div className="space-y-2">
                    <p><strong>Social / Portfolio Links:</strong></p>
                     <div className="flex flex-wrap gap-2">
                        {application.resumeUrl && <Button variant="link" asChild size="sm" className="p-0 h-auto"><Link href={application.resumeUrl} target="_blank">Resume/Portfolio</Link></Button>}
                        {application.tiktokUrl && <Button variant="link" asChild size="sm" className="p-0 h-auto"><Link href={application.tiktokUrl} target="_blank">TikTok</Link></Button>}
                        {application.instagramUrl && <Button variant="link" asChild size="sm" className="p-0 h-auto"><Link href={application.instagramUrl} target="_blank">Instagram</Link></Button>}
                        {application.linkedinUrl && <Button variant="link" asChild size="sm" className="p-0 h-auto"><Link href={application.linkedinUrl} target="_blank">LinkedIn</Link></Button>}
                    </div>
                </div>

            </div>
            </ScrollArea>
        </DialogContent>
    );
};


export default function TeamManagementPage({ authLoading }: { authLoading?: boolean }) {
    const [applications, setApplications] = useState<TeamApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<TeamApplicationData | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getTeamApplications();
            setApplications(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team applications.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => 
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.phone.includes(searchTerm)
        );
    }, [applications, searchTerm]);

    const handleDeleteClick = (application: TeamApplicationData) => {
        setSelectedApp(application);
        setIsDeleteDialogOpen(true);
    };

    const onDialogClose = () => {
        setSelectedApp(null);
        setIsDeleteDialogOpen(false);
        fetchApplications();
    };

    const downloadCSV = () => {
        const header = "Name,Email,Phone,Age,Position,Specialty,Resume URL,TikTok,Instagram,LinkedIn,Message\n";
        const rows = applications.map(app => {
            const row = [
                `"${app.name}"`,
                `"${app.email}"`,
                `"${app.phone}"`,
                app.age,
                app.position,
                app.specialty,
                `"${app.resumeUrl || ''}"`,
                `"${app.tiktokUrl || ''}"`,
                `"${app.instagramUrl || ''}"`,
                `"${app.linkedinUrl || ''}"`,
                `"${(app.message || '').replace(/"/g, '""')}"`,
            ].join(',');
            return row;
        }).join('\n');

        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'team_applications.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const renderSkeleton = () => Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
    ));

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle>Team Management</CardTitle>
                            <CardDescription>Review applications from individuals wanting to join your team.</CardDescription>
                        </div>
                        <div className="flex w-full md:w-auto items-center gap-2">
                             <div className="relative flex-1 md:flex-initial">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or phone..."
                                    className="pl-8 sm:w-[200px] lg:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchApplications} disabled={authLoading || loading}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={downloadCSV} disabled={authLoading || loading || applications.length === 0}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? renderSkeleton() : filteredApplications.map(app => (
                                <Dialog key={app.id}>
                                    <TableRow>
                                        <TableCell className="font-medium">{app.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{app.position}</Badge></TableCell>
                                        <TableCell><Badge variant="outline">{app.specialty}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild><Link href={`mailto:${app.email}`}><Mail className="mr-2 h-4 w-4" />Email</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link href={`tel:${app.phone}`}><Phone className="mr-2 h-4 w-4" />Call</Link></DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => handleDeleteClick(app)} className="text-red-500">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    <ApplicationDetailsDialog application={app} />
                                </Dialog>
                            ))}
                            {!loading && filteredApplications.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No applications found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedApp && (
                <DeleteTeamApplicationDialog 
                    isOpen={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    application={selectedApp}
                    onDialogClose={onDialogClose}
                />
            )}
        </>
    )
}
