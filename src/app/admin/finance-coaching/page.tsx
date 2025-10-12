
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, Wallet, RefreshCw } from "lucide-react";
import { getCoaches } from "@/services/coach-service";
import { getClientPayments, getCoachFinancials, getCoachPayouts } from "@/services/coach-finance-service";
import type { Coach, CoachFinancials, ClientPayment, CoachPayout, CoachWithFinancials } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import CommissionTable from "./_components/commission-table";
import ClientPaymentsTable from "./_components/client-payments-table";
import PayoutsTable from "./_components/payouts-table";
import PayoutsHistoryTable from "./_components/payouts-history-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminFinanceCoachingPage({ authLoading }: { authLoading?: boolean }) {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [financials, setFinancials] = useState<CoachFinancials[]>([]);
    const [payments, setPayments] = useState<ClientPayment[]>([]);
    const [payouts, setPayouts] = useState<CoachPayout[]>([]);
    const [loading, setLoading] = useState(true);

    const [commissionsSearch, setCommissionsSearch] = useState("");
    const [clientPaymentsSearch, setClientPaymentsSearch] = useState("");
    const [pendingPayoutsSearch, setPendingPayoutsSearch] = useState("");
    const [payoutsHistorySearch, setPayoutsHistorySearch] = useState("");
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [coachesData, financialsData, paymentsData, payoutsData] = await Promise.all([
                getCoaches(),
                getCoachFinancials(),
                getClientPayments(),
                getCoachPayouts(),
            ]);
            setCoaches(coachesData);
            setFinancials(financialsData);
            setPayments(paymentsData);
            setPayouts(payoutsData);
        } catch (error) {
            console.error("Failed to fetch coaching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { 
        totalRevenue, 
        totalPaidOut, 
        pendingPayoutsTotal, 
    } = useMemo(() => {
        const revenue = payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);
        const paid = payouts.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0);
        const pending = financials.reduce((sum, fin) => sum + (fin.pendingPayout || 0), 0);
        
        return { 
            totalRevenue: revenue,
            totalPaidOut: paid,
            pendingPayoutsTotal: pending,
        };
    }, [financials, payments, payouts]);

     const filteredCoachesWithFinancials = useMemo(() => {
        const financialsMap = new Map(financials.map(f => [f.coachId, f]));
        const coachesWithData: CoachWithFinancials[] = coaches.map(coach => {
            const coachFinancials = financialsMap.get(coach.id) || { commissionRate: 70, pendingPayout: 0 };
            return { ...coach, ...coachFinancials };
        });
        return coachesWithData.filter(c => c.name.toLowerCase().includes(commissionsSearch.toLowerCase()));
    }, [coaches, financials, commissionsSearch]);

    const filteredClientPayments = useMemo(() => {
        return payments.filter(p => 
            p.clientName.toLowerCase().includes(clientPaymentsSearch.toLowerCase()) ||
            p.coachName.toLowerCase().includes(clientPaymentsSearch.toLowerCase())
        );
    }, [payments, clientPaymentsSearch]);

    const filteredCoachesWithPending = useMemo(() => {
         return filteredCoachesWithFinancials.filter(c => 
            (c.pendingPayout || 0) > 0 &&
            c.name.toLowerCase().includes(pendingPayoutsSearch.toLowerCase())
        );
    }, [filteredCoachesWithFinancials, pendingPayoutsSearch]);
    
    const filteredPayoutsHistory = useMemo(() => {
        const coachMap = new Map(coaches.map(c => [c.id, c.name]));
        return payouts.filter(p => {
            const coachName = coachMap.get(p.coachId) || '';
            return coachName.toLowerCase().includes(payoutsHistorySearch.toLowerCase());
        });
    }, [payouts, coaches, payoutsHistorySearch]);

    const platformNet = totalRevenue - totalPaidOut - pendingPayoutsTotal;

    const StatsCard = ({ title, value, icon: Icon, description, cardClassName, textClassName }: { title: string, value: string, icon: React.ElementType, description: string, cardClassName?: string, textClassName?: string }) => (
        <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("text-sm font-medium", textClassName)}>{title}</CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", textClassName)} />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-32" /> : <div className={cn("text-2xl font-bold", textClassName)}>{value}</div>}
                <p className={cn("text-xs text-muted-foreground", textClassName && `${textClassName} opacity-80`)}>{description}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Finance (Coaching)</h1>
                    <p className="text-muted-foreground">Manage financial details related to coaches and experts.</p>
                </div>
                 <Button variant="outline" size="icon" onClick={fetchData} disabled={loading || authLoading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh</span>
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Client Revenue" value={`DZD ${totalRevenue.toFixed(2)}`} icon={DollarSign} description="Total paid by all coaching clients." cardClassName="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" textClassName="text-blue-800 dark:text-blue-200" />
                <StatsCard title="Total Paid to Coaches" value={`DZD ${totalPaidOut.toFixed(2)}`} icon={TrendingUp} description="Total amount successfully paid out." cardClassName="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
                <StatsCard title="Pending Payouts" value={`DZD ${pendingPayoutsTotal.toFixed(2)}`} icon={Wallet} description="Amount waiting to be paid out." cardClassName="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" textClassName="text-yellow-800 dark:text-yellow-200" />
                <StatsCard title="Platform Net" value={`DZD ${platformNet.toFixed(2)}`} icon={Percent} description="Total revenue minus total paid out." cardClassName={cn("border", platformNet >= 0 ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800")} textClassName={cn(platformNet >= 0 ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200")} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CommissionTable 
                    coaches={filteredCoachesWithFinancials} 
                    isLoading={loading} 
                    onDataChange={fetchData} 
                    searchTerm={commissionsSearch}
                    onSearchTermChange={setCommissionsSearch}
                />
                <ClientPaymentsTable 
                    clients={filteredClientPayments} 
                    coaches={coaches} 
                    isLoading={loading} 
                    onDataChange={fetchData} 
                    searchTerm={clientPaymentsSearch}
                    onSearchTermChange={setClientPaymentsSearch}
                />
            </div>

            <PayoutsTable 
                coachesWithPending={filteredCoachesWithPending} 
                isLoading={loading} 
                onDataChange={fetchData} 
                searchTerm={pendingPayoutsSearch}
                onSearchTermChange={setPendingPayoutsSearch}
            />
            <PayoutsHistoryTable 
                payouts={filteredPayoutsHistory} 
                coaches={coaches} 
                isLoading={loading}
                searchTerm={payoutsHistorySearch}
                onSearchTermChange={setPayoutsHistorySearch}
                onDataChange={fetchData}
            />
        </div>
    );
}

    