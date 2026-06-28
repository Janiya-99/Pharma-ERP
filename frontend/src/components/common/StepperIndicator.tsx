import React from "react";
import { Check } from "lucide-react";

export interface StepDef {
  label: string;
  icon?: React.ReactNode;
}

interface StepperIndicatorProps {
  steps: StepDef[];
  currentStep: number; // 0-indexed
  onStepClick?: (step: number) => void;
}

const StepperIndicator = ({
  steps,
  currentStep,
  onStepClick,
}: StepperIndicatorProps) => {
  return (
    <div className="card-premium mb-6 p-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step circle + label */}
              <div
                className={`flex shrink-0 flex-col items-center gap-1.5 ${
                  onStepClick && (isCompleted || isActive)
                    ? "cursor-pointer"
                    : ""
                }`}
                onClick={() => {
                  if (onStepClick && (isCompleted || isActive))
                    onStepClick(index);
                }}
              >
                <div
                  className={`step-indicator ${
                    isCompleted
                      ? "step-indicator-completed"
                      : isActive
                      ? "step-indicator-active"
                      : "step-indicator-pending"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`hidden whitespace-nowrap text-[11px] font-medium sm:block ${
                    isActive
                      ? "font-semibold text-indigo-700"
                      : isCompleted
                      ? "text-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`step-connector ${
                    index < currentStep
                      ? "step-connector-completed"
                      : "step-connector-pending"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepperIndicator;
