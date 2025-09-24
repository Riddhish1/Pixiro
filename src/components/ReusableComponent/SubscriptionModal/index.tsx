"use client";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { User } from "../../../../prisma/generated/client";

type Props = {
  user: User;
};

const SubscriptionModal = ({ user }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Replace this with your actual webinar creation logic
      console.log("Webinar creation confirmed for:", user.email);

      // Optionally navigate or refresh
      router.refresh();
    } catch (e) {
      console.log("WEBINAR CREATION ERROR -->", e);
      toast.error("Failed to create webinar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20">
          <PlusIcon />
          Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Webinar</DialogTitle>
        </DialogHeader>

        {/* Optional: Add your actual form inputs here */}
        <div className="text-sm text-muted-foreground">
          Add your webinar creation fields or redirect logic here.
        </div>

        <DialogFooter className="gap-4 items-center">
          <DialogClose className="w-full sm:w-auto border border-border rounded-md px-3 py-2" disabled={loading}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" />
                </svg>
                Loading...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
