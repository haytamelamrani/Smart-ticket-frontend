import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title && !description) {
      return NextResponse.json({ error: "Title or description required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `Tu es un assistant IA spécialisé dans la classification de tickets de support. 
      Analyse le titre et la description fournis et détermine la catégorie la plus appropriée parmi :
      - technical (Problème technique)
      - account (Compte utilisateur) 
      - billing (Facturation)
      - feature (Demande de fonctionnalité)
      - bug (Signalement de bug)
      - other (Autre)
      
      Réponds uniquement avec la valeur de la catégorie (technical, account, billing, feature, bug, ou other).`,
      prompt: `Titre: ${title}\nDescription: ${description}`,
    })

    const predictedCategory = text.trim().toLowerCase()

    return NextResponse.json({
      category: predictedCategory,
      confidence: "high", // Vous pouvez ajouter une logique de confiance si nécessaire
    })
  } catch (error) {
    console.error("Error predicting category:", error)
    return NextResponse.json({ error: "Failed to predict category" }, { status: 500 })
  }
}
