import { onBoardingSteps } from '@/lib/data'
import Link from 'next/link'
import { getOnboardingStatus } from '@/action/onboarding'
import { ArrowRight, Check } from 'lucide-react'

const OnBoarding = async () => {
  const response = await getOnboardingStatus()

  if (response.status !== 200 || !response.steps) {
    return null
  }

  const status = response.steps

  const getStepStatus = (index: number) => {
    const isCompleted =
      index === 0
        ? status.connectStripe
        : index === 1
          ? status.createAiAgent
          : status.createWebinar

    if (isCompleted) return 'completed'

    // Find the first incomplete step
    const firstIncomplete = !status.connectStripe
      ? 0
      : !status.createAiAgent
        ? 1
        : !status.createWebinar
          ? 2
          : -1

    return index === firstIncomplete ? 'current' : 'pending'
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl">
      {onBoardingSteps.map((step, index) => {
        const stepStatus = getStepStatus(index)

        return (
          <Link
            key={step.id}
            href={step.link}
            className={`
              flex items-center gap-3 p-3 rounded-md transition-colors
              ${
                stepStatus === 'completed'
                  ? 'bg-muted/30 hover:bg-muted/50'
                  : stepStatus === 'current'
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-muted/30'
              }
            `}
          >
            {/* Status Indicator */}
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${
                stepStatus === 'completed'
                  ? 'bg-[#a76ef6] text-primary'
                  : stepStatus === 'current'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }
            `}
            >
              {stepStatus === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`
                text-sm font-medium truncate
                ${
                  stepStatus === 'completed'
                    ? 'text-primary'
                    : stepStatus === 'current'
                      ? 'text-primary'
                      : 'text-foreground'
                }
              `}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight
              className={`
              w-4 h-4 flex-shrink-0
              ${
                stepStatus === 'completed'
                  ? 'text-primary'
                  : stepStatus === 'current'
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }
            `}
            />
          </Link>
        )
      })}
    </div>
  )
}

export default OnBoarding
