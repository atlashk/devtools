"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useErrorHandler } from "@/hooks/use-error-handler";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  duration?: number;
} & Omit<React.ComponentProps<typeof Button>, "value" | "onClick" | "children">;

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied!",
  duration = 2000,
  variant = "ghost",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const { handleError } = useErrorHandler();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } catch (error) {
      handleError(error, "Copy");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      aria-label={copied ? copiedLabel : label}
      {...props}
    >
      {copied ? (
        <>
          <Check className="size-4 text-green-500" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
