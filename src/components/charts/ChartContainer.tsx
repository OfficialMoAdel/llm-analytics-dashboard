/**
 * ChartContainer - Responsive container with consistent styling
 *
 * Provides a standardized container for all charts with:
 * - Responsive behavior
 * - Consistent padding and margins
 * - Card-based layout option
 * - Proper aspect ratio handling
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
  showCard?: boolean;
  fullWidth?: boolean;
}

export default function ChartContainer({
  title,
  description,
  children,
  className,
  height = 300,
  showCard = true,
  fullWidth = false,
}: ChartContainerProps) {
  const containerStyles = {
    height: showCard ? 'auto' : `${height}px`,
    width: fullWidth ? '100%' : 'auto',
  };

  const content = (
    <div
      className={className}
      style={containerStyles}
    >
      {children}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className={`flex flex-col ${className || ''}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={title || description ? "flex-1" : ""}>
        <div className="h-full min-h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
