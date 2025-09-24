import { cn } from "@/lib/utils";
import { Attendee } from "../../../../prisma/generated/client";
import { format } from "date-fns";
import React from "react";

type Props = {
  customer: Attendee;
  tags: string[];
  className?: string;
};

const UserInfoCard = ({ customer, tags, className }: Props) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col text-primary p-3 pr-10 gap-3 rounded-xl border-[0.5px] border-border backdrop-blur-[20px] bg-secondary",
        className
      )}
    >
      <h3 className="font-semibold text-xs text-primary">{customer.name}</h3>
      <p className="text-sm text-muted-foreground">{customer.email}</p>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-foreground px-3 py-1 rounded-md border border-border text-sm bg-background"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs font-normal text-muted-foreground">
        Updated At: {format(customer?.updatedAt, "MMM d, yyyy")}
      </p>
    </div>
  );
};

export default UserInfoCard;
