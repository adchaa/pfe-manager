export type UserRole = "ETUDIANT" | "ENCADRANT_ENTREPRISE" | "ENCADRANT_UNIVERSITAIRE"

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}
