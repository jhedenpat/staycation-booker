import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import HouseRulesUI from './HouseRulesUI';
import { X } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }: TermsAndConditionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-none rounded-3xl bg-background max-h-[92vh] flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <HouseRulesUI onAccept={onAccept} />
        </div>
        
        {/* Close Button Overlay for top-right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-background/50 backdrop-blur-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
