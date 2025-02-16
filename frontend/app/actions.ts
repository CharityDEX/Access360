"use server"

interface ImagesResponse {
  images: string[]
  processed_images: string[]
}

interface Observation {
  observation_name: string
  observation_sentiment: "FANTASTIC" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "EGREGIOUS"
  associated_disability: string[]
  explanation: string
  feedback: string
}

interface APIResponse {
  observations: Observation[]
  percentage: number
}

interface AIResponse {
  Percentage: number
  observations: Observation[]
}

const CLOUDINARY_FETCH_URL = "https://res.cloudinary.com/decnnqfzf/image/fetch/"

export async function getImages(address: string): Promise<ImagesResponse> {
  if (!address) {
    throw new Error("Address is required")
  }
  console.log("Fetching images for address:", address)

  const maxRetries = 5
  let retries = 0
  const baseDelay = 1000

  while (retries < maxRetries) {
    try {
      const response = await fetch("http://44.246.144.147/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Server error: ${response.status} ${errorText || response.statusText}`)
      }

      const data = await response.json()
      console.log("Server response data:", data)

      if (!data || !data.processed_images) {
        throw new Error("Invalid response from server: missing processed_images")
      }

      // Transform image URLs to use Cloudinary
      const processedImages = data.processed_images.map((imgUrl: string) => {
        const fullUrl = imgUrl.startsWith("http")
          ? imgUrl
          : `http://44.246.144.147${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`
        return `${CLOUDINARY_FETCH_URL}${encodeURIComponent(fullUrl)}`
      })

      console.log("Processed images with Cloudinary URLs:", processedImages)

      return {
        images: data.images || [],
        processed_images: processedImages,
      }
    } catch (error) {
      console.error(`Error in getImages (attempt ${retries + 1}):`, error)
      retries++
      if (retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.warn("Failed to fetch images after all retries. Returning empty arrays.")
        return { images: [], processed_images: [] }
      }
    }
  }

  return { images: [], processed_images: [] }
}

export async function getAccessibilityAnalysis(address: string, name: string) {
  const maxRetries = 5
  let retries = 0
  const baseDelay = 1000

  while (retries < maxRetries) {
    try {
      console.log(`Fetching accessibility analysis for: ${address}, ${name} (Attempt ${retries + 1})`)
      const response = await fetch("http://44.246.144.147/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          name: name,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Failed to fetch analysis: ${response.status} ${errorText}`)
      }

      const data: APIResponse = await response.json()
      console.log("API Response:", data)

      if (!data || !Array.isArray(data.observations) || typeof data.percentage !== "number") {
        throw new Error("Invalid response format from server")
      }

      // Format the percentage to have at most one decimal place
      const formattedPercentage = Number(data.percentage.toFixed(1))

      // Transform the data to match our UI components
      const transformedData: AIResponse = {
        Percentage: formattedPercentage,
        observations: data.observations,
      }

      console.log("Transformed data:", transformedData)

      return transformedData
    } catch (error) {
      console.error(`Error fetching analysis (attempt ${retries + 1}):`, error)
      retries++
      if (retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries - 1) // Exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`Failed to fetch accessibility analysis after ${maxRetries} attempts`)
        throw error // Throw the last error encountered
      }
    }
  }

  throw new Error(`Failed to fetch accessibility analysis after ${maxRetries} attempts`)
}

