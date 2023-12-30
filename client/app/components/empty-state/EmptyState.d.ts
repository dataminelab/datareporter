import React from "react";

export interface EmptyStateProps {
  header?: string;
  icon?: string;
  description: string;
  illustration: string;
  helpLink: string;
  illustrationWidth?: string; // 100px, 75%, 100vw
  illustrationType?: string; // svg, png, jpg
  onboardingMode?: boolean;
  showAlertStep?: boolean;
  showDashboardStep?: boolean;
  showInviteStep?: boolean;
}

declare const EmptyState: React.FunctionComponent<EmptyStateProps>;

export default EmptyState;
