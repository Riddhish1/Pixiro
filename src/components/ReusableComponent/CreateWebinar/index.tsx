"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MultiStepForm from "./MultiStepForm";
import { SuccessStep } from "./SuccessStep";
import BasicInfoStep from "./BasicInfoStep";
import CTAStep from "./CTAStep";
import AdditionalInfoStep from "./AdditionalInfoStep";
import { useWebinarStore } from "@/store/useWebinarStore";
import PlusIcon from "@/icons/PlusIcon";
import Stripe from "stripe";
import { AiAgents } from "../../../../prisma/generated/client";

type Props = {
  assistants: AiAgents[] | [];
  stripeProducts: Stripe.Product[] | [];
};

const CreateWebinarButton = ({ assistants, stripeProducts }: Props) => {
  const { isModalOpen, isComplete, setModalOpen, setComplete, resetForm } =
    useWebinarStore();

  const [webinarLink, setWebinarLink] = useState<string>("");

  const steps = [
    {
      id: "basicInfo",
      title: "Basic Information",
      description: "Please fill out the standard info needed for your webinar",
      component: <BasicInfoStep />,
    },
    {
      id: "cta",
      title: "CTA",
      description:
        "Please provide the end-point for your customers through your webinar",
      component: (
        <CTAStep assistants={assistants} stripeProducts={stripeProducts} />
      ),
    },
    {
      id: "additionalInfo",
      title: "Additional information",
      description:
        "Please fill out information about additional options if necessary",
      component: <AdditionalInfoStep />,
    },
  ];

  const handleComplete = (webinarId: string) => {
    setComplete(true);
    setWebinarLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`
    );
  };

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Reset form state when dialog is closed
      setTimeout(() => {
        resetForm();
      }, 300);
    }
  };

  const handleCreateNew = () => {
    resetForm();
  };

  // For debugging
  useEffect(() => {
    console.log("Modal open state:", isModalOpen);
  }, [isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-none">
        {isComplete ? (
          <div className="bg-muted text-primary rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">Webinar Created</DialogTitle>
            <SuccessStep
              webinarLink={webinarLink}
              onCreateNew={handleCreateNew}
              onClose={() => setModalOpen(false)}
            />
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Create Webinar</DialogTitle>
            <MultiStepForm steps={steps} onComplete={handleComplete} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebinarButton;
