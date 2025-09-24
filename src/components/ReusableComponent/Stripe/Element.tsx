"use client";
import { useStripeElements } from "@/lib/stripe/stripe-client";
import { Elements } from "@stripe/react-stripe-js";

type StripeElementsProps = {
  children: React.ReactNode;
};

export const StripeElements = ({ children }: StripeElementsProps) => {
  const { StripePromise } = useStripeElements();
  const promise = StripePromise();
  return promise && <Elements stripe={promise}>{children}</Elements>;
};
