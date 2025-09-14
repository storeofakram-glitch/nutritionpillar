
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Coach } from "@/types";
import { getCoaches } from "@/services/coach-service";
import { Download, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const CheckboxList = ({ title, items, allItems, selectedItems, onCheckedChange, onSelectAll, searchTerm, onSearchChange }: { title: string; items: string[]; allItems: string[]; selectedItems: string[]; onCheckedChange: (item: string, checked: boolean) => void; onSelectAll: (checked: boolean) => void; searchTerm: string; onSearchChange: (value: string) => void; }) => (
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
        <ScrollArea className="h-40 rounded-md border p-4">
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
             {items.length === 0 && <p className="text-center text-sm text-muted-foreground">No matches found.</p>}
        </ScrollArea>
    </div>
);


export default function CoachExportForm() {
    const { toast } = useToast();
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);

    const [specialtySearch, setSpecialtySearch] = useState("");
    const [stateSearch, setStateSearch] = useState("");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const coachesData = await getCoaches();
            setCoaches(coachesData);
            setLoading(false);
        }
        loadData();
    }, []);

    const { specialties, states } = useMemo(() => {
        const specialtySet = new Set(coaches.map(c => c.specialty));
        const stateSet = new Set(coaches.map(c => c.personalInfo?.state).filter(Boolean) as string[]);
        return {
            specialties: Array.from(specialtySet).sort(),
            states: Array.from(stateSet).sort(),
        };
    }, [coaches]);
    
    const filteredSpecialties = useMemo(() => {
        return specialties.filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase()));
    }, [specialties, specialtySearch]);

    const filteredStates = useMemo(() => {
        return states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
    }, [states, stateSearch]);

    const handleSpecialtyChange = (specialty: string, checked: boolean) => {
        setSelectedSpecialties(prev => 
            checked ? [...prev, specialty] : prev.filter(s => s !== specialty)
        );
    };
    
    const handleSelectAllSpecialties = (checked: boolean) => {
        setSelectedSpecialties(checked ? specialties : []);
    };

    const handleStateChange = (state: string, checked: boolean) => {
        setSelectedStates(prev => 
            checked ? [...prev, state] : prev.filter(s => s !== state)
        );
    };

    const handleSelectAllStates = (checked: boolean) => {
        setSelectedStates(checked ? states : []);
    };


    const handleDownload = () => {
        if (loading) return;

        let filteredCoaches = coaches;

        if (selectedSpecialties.length > 0) {
            filteredCoaches = filteredCoaches.filter(c => selectedSpecialties.includes(c.specialty));
        }
        
        if (selectedStates.length > 0) {
            filteredCoaches = filteredCoaches.filter(c => c.personalInfo?.state && selectedStates.includes(c.personalInfo.state));
        }
        
        if (filteredCoaches.length === 0) {
            toast({
                variant: 'destructive',
                title: "No Coaches Found",
                description: "No one matches the selected criteria.",
            });
            return;
        }

        const csvHeader = "Name,Email,Phone,Specialty,State";
        const csvRows = filteredCoaches.map(c => {
             const name = `"${c.name.replace(/"/g, '""')}"`;
             const email = `"${c.personalInfo?.email || ''}"`;
             const phone = `"${c.personalInfo?.phone || ''}"`;
             const specialty = `"${c.specialty}"`;
             const state = `"${c.personalInfo?.state || ''}"`;
             return [name, email, phone, specialty, state].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `coaches_list_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Download Started",
            description: `Your coach & expert list is downloading.`
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Coach & Expert Exporter</CardTitle>
                <CardDescription>
                    Create targeted lists of your team by filtering based on their specialty and location.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CheckboxList 
                        title="Filter by Specialty" 
                        items={filteredSpecialties}
                        allItems={specialties}
                        selectedItems={selectedSpecialties}
                        onCheckedChange={handleSpecialtyChange} 
                        onSelectAll={handleSelectAllSpecialties}
                        searchTerm={specialtySearch}
                        onSearchChange={setSpecialtySearch}
                    />
                    <CheckboxList 
                        title="Filter by State (Wilaya)" 
                        items={filteredStates}
                        allItems={states}
                        selectedItems={selectedStates}
                        onCheckedChange={handleStateChange}
                        onSelectAll={handleSelectAllStates}
                        searchTerm={stateSearch}
                        onSearchChange={setStateSearch}
                    />
                </div>
                
                <Button onClick={handleDownload} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Coach List
                </Button>
            </CardContent>
        </Card>
    );
}

