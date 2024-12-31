import React from "react";

type DefaultStepKey = "dataSources" | "queries" | "alerts" | "dashboards" | "users";
export type StepKey<K> = DefaultStepKey | K;

export interface StepItem<K> {
  key: StepKey<K>;
  node: React.ReactNode;
}

export interface EmptyStateHelpMessageProps {
  helpTriggerType: string;
}

export declare const EmptyStateHelpMessage: React.FunctionComponent<EmptyStateHelpMessageProps>;

export interface EmptyStateProps {
  header?: string;
  icon?: string;
  description: string;
  illustration: string;
  illustrationType?: string; // svg, png, jpg
  onboardingMode?: boolean;
  showAlertStep?: boolean;
  showDashboardStep?: boolean;
  showInviteStep?: boolean;
}

declare class EmptyState<R> extends React.Component<EmptyStateProps<R>> {}

export default EmptyState;
