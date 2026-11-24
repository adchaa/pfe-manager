import { ProjectState } from "@/types/enums"

interface BadgeStateProps {
  state: ProjectState
}

const styles: Record<ProjectState, string> = {
  [ProjectState.ACTIVE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [ProjectState.ARCHIVED]: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "",
}

const labels: Record<ProjectState, string> = {
  [ProjectState.ACTIVE]: "Active",
  [ProjectState.ARCHIVED]: "Archived",
  COMPLETED: "",
}

export function BadgeState({ state }: BadgeStateProps) {
  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full border ${styles[state]}`}
    >
      {labels[state]}
    </span>
  )
}
