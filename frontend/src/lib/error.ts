import { AxiosError } from "axios"

export function extractErrorMessage(error: any): string {
  if (!error) return ""

  if (error.isAxiosError || error instanceof AxiosError) {
    const data = error.response?.data

    if (data?.error?.message) {
      return data.error.message
    }
    if (data?.message) {
      return data.message
    }
    if (typeof data === "string") {
      return data
    }
    return error.message || "An error occurred"
  }
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unknown error occurred"
}
