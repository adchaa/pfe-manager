import api from "@/services/api"

export async function downloadReport(fileUrl: string, fileName: string = "report.pdf") {
  try {
    const url = new URL(fileUrl)
    const relativePath = url.pathname.replace("/api", "")

    const response = await api.get(relativePath, {
      responseType: "blob",
    })

    const blob = new Blob([response.data], { type: "application/pdf" })
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error("Download failed:", error)
    alert("Failed to download the report. Please try again.")
  }
}
