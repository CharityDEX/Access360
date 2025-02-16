import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 })
  }

  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const result = await generateObject({
      model: openai("gpt-4-turbo"),
      system: `
        You are a summarizer that extracts crucial restaurant information from the provided text.
        Return only valid JSON with the exact format:
        {
          "restaurantName": "<string>",
          "address": "<string>"
        }
        If any field cannot be determined, return an empty string in its place.
      `,
      prompt: text,
      schema: z.object({
        restaurantName: z.string().describe("Name of the restaurant"),
        address: z.string().describe("Address of the restaurant"),
      }),
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Information extraction error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract information" },
      { status: 500 },
    )
  }
}

