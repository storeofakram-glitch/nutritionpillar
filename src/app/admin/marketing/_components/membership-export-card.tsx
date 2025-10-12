
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Membership, Coach } from "@/types";
import { getMemberships } from "@/services/membership-service";
import { getCoaches } from "@/services/coach-service";
import { Download, ShieldCheck, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dzStates } from "@/lib/dz-states";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CheckboxList = ({ title, items, allItems, selectedItems, onCheckedChange, onSelectAll, searchTerm, onSearchChange, emptyText = "No items found." }: { title: string; items: string[]; allItems: string[]; selectedItems: string[]; onCheckedChange: (item: string, checked: boolean) => void; onSelectAll: (checked: boolean) => void; searchTerm: string; onSearchChange: (value: string) => void; emptyText?: string; }) => (
    <div className="space-y-2">
        <h3 className="font-semibold text-sm">{title} ({selectedItems.length || 'All'})</h3>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 mb-2"
            />
        </div>
        <ScrollArea className="h-32 rounded-md border p-4">
             <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                    id={`select-all-${title}`}
                    checked={allItems.length > 0 && selectedItems.length === allItems.length}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
                <Label htmlFor={`select-all-${title}`} className="font-bold cursor-pointer">
                    Select All
                </Label>
            </div>
            <Separator className="my-2" />
            {items.map(item => (
                <div key={item} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                        id={`${title}-${item}`}
                        checked={selectedItems.includes(item)}
                        onCheckedChange={(checked) => onCheckedChange(item, !!checked)}
                    />
                    <Label htmlFor={`${title}-${item}`} className="text-sm font-normal cursor-pointer">
                        {item}
                    </Label>
                </div>
            ))}
             {items.length === 0 && <p className="text-center text-sm text-muted-foreground">{emptyText}</p>}
        </ScrollArea>
    </div>
);


export default function MembershipExportCard() {
    const { toast } = useToast();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);

    // State for filters
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [specialtySearch, setSpecialtySearch] = useState("");
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [stateSearch, setStateSearch] = useState("");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [membershipsData, coachesData] = await Promise.all([
                getMemberships(),
                getCoaches(),
            ]);
            setMemberships(membershipsData);
            setCoaches(coachesData);
            setLoading(false);
        }
        loadData();
    }, []);

    const { allSpecialties, allStatesFromMemberships } = useMemo(() => {
        const specialtySet = new Set(coaches.map(c => c.specialty));
        
        // This is tricky as loyalty members don't have a state. This field might not exist on memberships.
        // We will assume `customerState` could be a property for this to work.
        const stateSet = new Set(memberships
            .filter(m => (m as any).customerState)
            .map(m => (m as any).customerState)
        );
        
        return {
            allSpecialties: Array.from(specialtySet).sort(),
            allStatesFromMemberships: Array.from(stateSet).sort(),
        };
    }, [coaches, memberships]);
    
    const filteredSpecialties = useMemo(() => {
        return allSpecialties.filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase()));
    }, [allSpecialties, specialtySearch]);
    
    const filteredStates = useMemo(() => {
        return allStatesFromMemberships.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
    }, [allStatesFromMemberships, stateSearch]);


    const downloadCSV = (data: Membership[], filename: string) => {
        if (data.length === 0) {
            toast({
                variant: 'destructive',
                title: "No Members Found",
                description: "There are no members in this category to export.",
            });
            return;
        }

        const csvHeader = "Name,Email,Phone,Membership Code";
        const csvRows = data.map(m => {
            const name = `"${m.customerName.replace(/"/g, '""')}"`;
            const email = `"${m.customerEmail || ''}"`;
            const phone = `"${m.customerPhone || ''}"`;
            const code = `"${m.code}"`;
            return [name, email, phone, code].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Download Started",
            description: `Your member list is downloading.`
        });
    };

    const handleDownloadLoyalty = () => {
        let loyaltyMembers = memberships.filter(m => m.type === 'Fitness Pillar');
        
        if (selectedStates.length > 0) {
            loyaltyMembers = loyaltyMembers.filter(m => selectedStates.includes((m as any).customerState));
        }

        downloadCSV(loyaltyMembers, `loyalty_members_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleDownloadCoaching = () => {
        let coachingClients = memberships.filter(m => m.type === 'Coaching');

        if (selectedSpecialties.length > 0) {
            const coachSpecialtyMap = new Map(coaches.map(c => [c.name, c.specialty]));
            coachingClients = coachingClients.filter(m => {
                const specialty = coachSpecialtyMap.get(m.coachName || "");
                return specialty && selectedSpecialties.includes(specialty);
            });
        }
        
        downloadCSV(coachingClients, `coaching_clients_${new Date().toISOString().split('T')[0]}.csv`);
    };
    
    const handleSelectAllSpecialties = (checked: boolean) => {
        setSelectedSpecialties(checked ? allSpecialties : []);
    };
    const handleSpecialtyChange = (specialty: string, checked: boolean) => {
        setSelectedSpecialties(prev => checked ? [...prev, specialty] : prev.filter(s => s !== specialty));
    };
    const handleSelectAllStates = (checked: boolean) => {
        setSelectedStates(checked ? allStatesFromMemberships : []);
    };
    const handleStateChange = (state: string, checked: boolean) => {
        setSelectedStates(prev => checked ? [...prev, state] : prev.filter(s => s !== state));
    };

    if (loading) {
        return (
            <Card className="border-primary">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle>Membership Lists</CardTitle>
                <CardDescription>
                    Download lists of your loyalty program members and coaching clients.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-semibold text-center">Coaching Client Filters</h4>
                     <CheckboxList
                        title="Filter by Coach Specialty"
                        items={filteredSpecialties}
                        allItems={allSpecialties}
                        selectedItems={selectedSpecialties}
                        onCheckedChange={handleSpecialtyChange}
                        onSelectAll={handleSelectAllSpecialties}
                        searchTerm={specialtySearch}
                        onSearchChange={setSpecialtySearch}
                        emptyText="No specialties found."
                    />
                    <Button onClick={handleDownloadCoaching} disabled={loading} className="w-full" variant="secondary">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Download Coaching Clients
                    </Button>
                </div>
                 <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-semibold text-center">Loyalty Member Filters</h4>
                    <p className="text-xs text-center text-muted-foreground">(Note: State data for loyalty members is not yet available)</p>
                     <CheckboxList
                        title="Filter by State (Wilaya)"
                        items={filteredStates}
                        allItems={allStatesFromMemberships}
                        selectedItems={selectedStates}
                        onCheckedChange={handleStateChange}
                        onSelectAll={handleSelectAllStates}
                        searchTerm={stateSearch}
                        onSearchChange={setStateSearch}
                        emptyText="No state data available."
                    />
                    <Button onClick={handleDownloadLoyalty} disabled={loading || true} className="w-full">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Download Loyalty Members
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
