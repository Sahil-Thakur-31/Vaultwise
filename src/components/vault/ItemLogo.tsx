import { CreditCard, FileText, KeyRound, User } from "lucide-react";
import { VaultItem } from "@/types/vault";

interface ItemLogoProps {
  item: Pick<VaultItem, "name" | "color" | "type">;
  size?: "sm" | "md" | "lg";
}

export function ItemLogo({ item, size = "md" }: ItemLogoProps) {
  const sizeClasses = {
    sm: "size-7 text-[11px] rounded-md",
    md: "size-8 text-xs rounded-lg",
    lg: "size-10 text-sm rounded-lg",
  }[size];

  const initial = item.name.trim().slice(0, 1).toUpperCase();

  const fallbackIcon =
    item.type === "Card" ? (
      <CreditCard className="size-4" />
    ) : item.type === "Secure note" ? (
      <FileText className="size-4" />
    ) : item.type === "Identity" ? (
      <User className="size-4" />
    ) : (
      <KeyRound className="size-4" />
    );

  return (
    <div
      className={`grid place-items-center font-bold text-white shrink-0 shadow-2xs ${item.color} ${sizeClasses}`}
    >
      {initial || fallbackIcon}
    </div>
  );
}
