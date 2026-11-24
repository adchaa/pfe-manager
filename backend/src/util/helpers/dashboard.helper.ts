import { ProjectMember } from "../../types/dashboard.types"

export const calculatePercentage = (
  completed: number,
  total: number,
): number => {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

export const normalizeMember = (member: any): ProjectMember => {
  return member
    ? (member as ProjectMember)
    : { _id: null as any, firstName: "N/A", lastName: "", role: undefined }
}
