"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-[#477e77] transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 z-10
                    ${isCompleted ? "bg-[#477e77] text-white" : ""}
                    ${isCurrent ? "bg-[#477e77] text-white ring-4 ring-[#477e77]/20" : ""}
                    ${!isCompleted && !isCurrent ? "bg-white border-2 border-gray-300 text-gray-400" : ""}
                  `}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <p
                  className={`
                    mt-2 text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-none
                    ${isCurrent ? "text-[#477e77]" : "text-gray-500"}
                  `}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
