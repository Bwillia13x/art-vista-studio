import { Phone, MapPin, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOCATION_URL = "https://maps.google.com/?q=The+Bridge+Barbershop+Calgary";

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 text-primary border-b border-primary/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-2.5 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.25em] text-primary/90 font-medium">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Gift className="h-3.5 w-3.5 flex-shrink-0" />
            Complimentary Beverage Lounge
          </span>
          <span className="hidden h-3.5 w-px bg-primary/30 md:block" />
          <span className="flex items-center gap-2 whitespace-nowrap">
            <StarDivider />
            Walk-ins Welcome When Available
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
          <Button asChild size="sm" variant="ghost" className="gap-2 text-primary hover:bg-primary/10 h-8 px-3 text-xs font-medium">
            <a href="tel:14035550123" aria-label="Call The Bridge Barbershop">
              <Phone className="h-3.5 w-3.5" />
              (403) 555-0123
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="gap-2 text-primary hover:bg-primary/10 h-8 px-3 text-xs font-medium"
          >
            <a href={LOCATION_URL} target="_blank" rel="noreferrer" aria-label="Open directions to The Bridge Barbershop">
              <MapPin className="h-3.5 w-3.5" />
              Get Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StarDivider() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 text-primary"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927a1 1 0 011.902 0l1.018 3.136a1 1 0 00.95.69h3.301a1 1 0 01.588 1.81l-2.672 1.943a1 1 0 00-.364 1.118l1.02 3.138a1 1 0 01-1.536 1.118L10 13.347l-2.957 2.533a1 1 0 01-1.536-1.118l1.02-3.138a1 1 0 00-.364-1.118L3.49 8.563a1 1 0 01.588-1.81h3.3a1 1 0 00.95-.69l1.02-3.136z" />
    </svg>
  );
}
