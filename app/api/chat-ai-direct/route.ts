import { type NextRequest, NextResponse } from "next/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MODEL = "deepseek/deepseek-chat-v3-0324:free"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Données reçues :", body)

    const message = body.message
    const ticket = body.ticketContext || {}
    const conversationHistory = body.conversationHistory || []
    const userEmail = body.userContext?.email || "unknown@example.com"

    const title = ticket.title || ""
    const description = ticket.description || ""

    if (!title && !description) {
      console.warn("⚠️ Aucune donnée fournie pour le ticket")
      return NextResponse.json({ error: "Title or description required" }, { status: 400 })
    }

    const prompt = `
Tu es un assistant IA spécialisé dans la classification de tickets de support technique. 

Analyse le titre et la description suivants et détermine :
1. Le TYPE de ticket parmi : incident, request, complaint, suggestion
2. La CATÉGORIE parmi : technical, account, billing, feature, bug, other  
3. La PRIORITÉ parmi : low, medium, high, urgent
4. Une RÉPONSE SUGGÉRÉE utile et professionnelle pour aider l'utilisateur

Titre: "${title}"
Description: "${description}"

Réponds UNIQUEMENT au format JSON suivant (sans texte autour) :
{
  "type": "valeur_type",
  "category": "valeur_categorie", 
  "priority": "valeur_priorite",
  "suggestedResponse": "Réponse détaillée et utile en français"
}
`

    console.log("🔑 OPENROUTER_API_KEY: Chargée ✅")
    console.log("📡 Appel API OpenRouter avec modèle:", MODEL)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // à adapter si déployé
        "X-Title": "Smart Ticket Assistant"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Tu es un assistant IA utile et professionnel." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    const data = await response.json()

    if (!response.ok || !data.choices) {
      console.error("❌ Erreur OpenRouter:", data)
      throw new Error("Erreur OpenRouter")
    }

    const rawText = data.choices[0].message.content.trim()
    console.log("🧠 Réponse IA brute :", rawText)

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("❌ Pas de JSON détecté dans la réponse")

    const jsonStr = jsonMatch[0]
    const parsed = JSON.parse(jsonStr)

    const validTypes = ["incident", "request", "complaint", "suggestion"]
    const validCategories = ["technical", "account", "billing", "feature", "bug", "other"]
    const validPriorities = ["low", "medium", "high", "urgent"]

    const result = {
      type: validTypes.includes(parsed.type) ? parsed.type : "request",
      category: validCategories.includes(parsed.category) ? parsed.category : "other",
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : "medium",
      suggestedResponse:
        parsed.suggestedResponse ||
        "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre rapidement.",
      response: parsed.suggestedResponse || "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre rapidement."
    }

    console.log("✅ Résultat final :", result)
    return NextResponse.json(result)

  } catch (error) {
    console.error("❌ Erreur backend :", error)

    return NextResponse.json({
      type: "request",
      category: "other",
      priority: "medium",
      suggestedResponse:
        "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre dans les plus brefs délais.",
      response:
        "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre dans les plus brefs délais."
    })
  }
}
