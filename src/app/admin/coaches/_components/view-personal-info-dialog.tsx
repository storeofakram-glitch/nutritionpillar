
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Coach } from "@/types"
import { Mail, Phone, Home, Globe, Flag, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ViewPersonalInfoDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    coach: Coach;
}

export default function ViewPersonalInfoDialog({ isOpen, onOpenChange, coach }: ViewPersonalInfoDialogProps) {
  
  const { personalInfo } = coach;

  const InfoRow = ({ icon: Icon, label, value, action }: { icon: React.ElementType, label: string, value?: string, action?: React.ReactNode }) => {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-muted-foreground text-sm">{value}</p>
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
  };
  
  const fullAddress = [personalInfo?.address, personalInfo?.city, personalInfo?.state].filter(Boolean).join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personal Info: {coach.name}</DialogTitle>
          <DialogDescription>
            This information is private and for administrative use only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <InfoRow 
                icon={Mail} 
                label="Email" 
                value={personalInfo?.email}
                action={
                    personalInfo?.email && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`mailto:${personalInfo.email}`} aria-label="Send Email">
                                <Mail className="h-4 w-4" />
                            </Link>
                        </Button>
                    )
                }
            />
            <InfoRow 
                icon={Phone} 
                label="Phone" 
                value={personalInfo?.phone}
                action={
                    personalInfo?.phone && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`https://wa.me/${personalInfo.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Send WhatsApp message">
                                <MessageSquare className="h-4 w-4" />
                            </Link>
                        </Button>
                    )
                }
            />
            <InfoRow icon={Home} label="Address" value={fullAddress} />
            <InfoRow icon={Globe} label="Country" value={personalInfo?.country} />
            <InfoRow icon={Flag} label="Nationality" value={personalInfo?.nationality} />

            {!personalInfo || Object.values(personalInfo).every(v => !v) && (
                <p className="text-center text-muted-foreground text-sm py-8">No personal information has been added for this person.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
