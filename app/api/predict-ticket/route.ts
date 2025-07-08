import { type NextRequest, NextResponse } from "next/server"

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

// Modifions la fonction POST pour gérer les erreurs plus gracieusement
// et assurer qu'elle fonctionne dans l'environnement de prévisualisation

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title && !description) {
      return NextResponse.json({ error: "Title or description required" }, { status: 400 })
    }

    // Vérifier si nous sommes dans un environnement de prévisualisation
    const isPreview =
      process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development" || !HUGGINGFACE_API_KEY

    if (isPreview) {
      console.log("Mode prévisualisation: simulation de prédiction IA")

      // Simuler un délai pour l'expérience utilisateur
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Logique simple pour déterminer la catégorie basée sur des mots-clés
      let predictedType = "request"
      let predictedCategory = "technical"
      let predictedPriority = "medium"

      const lowerTitle = title.toLowerCase()
      const lowerDesc = description.toLowerCase()
      const combinedText = lowerTitle + " " + lowerDesc

      // Type de ticket
      if (
        combinedText.includes("problème") ||
        combinedText.includes("bug") ||
        combinedText.includes("erreur") ||
        combinedText.includes("ne fonctionne pas")
      ) {
        predictedType = "incident"
      } else if (combinedText.includes("suggestion") || combinedText.includes("amélioration")) {
        predictedType = "suggestion"
      } else if (combinedText.includes("plainte") || combinedText.includes("mécontent")) {
        predictedType = "complaint"
      }

      // Catégorie
      if (
        combinedText.includes("compte") ||
        combinedText.includes("profil") ||
        combinedText.includes("connexion") ||
        combinedText.includes("mot de passe")
      ) {
        predictedCategory = "account"
      } else if (
        combinedText.includes("facture") ||
        combinedText.includes("paiement") ||
        combinedText.includes("prix") ||
        combinedText.includes("abonnement")
      ) {
        predictedCategory = "billing"
      } else if (combinedText.includes("fonctionnalité") || combinedText.includes("ajouter")) {
        predictedCategory = "feature"
      } else if (combinedText.includes("bug") || combinedText.includes("erreur")) {
        predictedCategory = "bug"
      }

      // Priorité
      if (
        combinedText.includes("urgent") ||
        combinedText.includes("immédiatement") ||
        combinedText.includes("critique")
      ) {
        predictedPriority = "urgent"
      } else if (combinedText.includes("important") || combinedText.includes("rapidement")) {
        predictedPriority = "high"
      } else if (combinedText.includes("quand vous pouvez") || combinedText.includes("pas pressé")) {
        predictedPriority = "low"
      }

      // Générer une réponse suggérée
      let suggestedResponse = `Merci pour votre ticket concernant "${title}". `

      if (predictedType === "incident") {
        suggestedResponse += "Je suis désolé pour ce problème. Notre équipe technique va l'examiner rapidement. "
        if (predictedCategory === "technical") {
          suggestedResponse +=
            "Pourriez-vous nous préciser votre environnement (navigateur, système d'exploitation) et les étapes pour reproduire le problème?"
        } else if (predictedCategory === "account") {
          suggestedResponse += "En attendant, avez-vous essayé de vous déconnecter puis reconnecter à votre compte?"
        }
      } else if (predictedType === "request") {
        suggestedResponse +=
          "Nous avons bien reçu votre demande. Un membre de notre équipe va l'examiner et vous répondre dans les plus brefs délais."
      } else if (predictedType === "suggestion") {
        suggestedResponse +=
          "Merci pour votre suggestion! Nous apprécions vos idées pour améliorer notre service. Notre équipe produit va l'étudier attentivement."
      }

      if (predictedPriority === "urgent") {
        suggestedResponse += " Compte tenu de l'urgence de votre demande, nous allons la traiter en priorité."
      }

      return NextResponse.json({
        type: predictedType,
        category: predictedCategory,
        priority: predictedPriority,
        suggestedResponse: suggestedResponse,
      })
    }

    // Si nous ne sommes pas en prévisualisation, continuer avec l'appel à Hugging Face
    const prompt = `[INST] Tu es un assistant IA spécialisé dans la classification de tickets de support technique. 

Analyse le titre et la description suivants et détermine :
1. Le TYPE de ticket parmi : incident, request, complaint, suggestion
2. La CATÉGORIE parmi : technical, account, billing, feature, bug, other  
3. La PRIORITÉ parmi : low, medium, high, urgent
4. Une RÉPONSE SUGGÉRÉE utile et professionnelle pour aider l'utilisateur

Titre: "${title}"
Description: "${description}"

Réponds UNIQUEMENT au format JSON suivant (sans markdown) :
{
  "type": "valeur_type",
  "category": "valeur_categorie", 
  "priority": "valeur_priorite",
  "suggestedResponse": "Réponse détaillée et utile en français"
} [/INST]`

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.3,
            return_full_text: false,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`)
      }

      const result = await response.json()
      let generatedText = ""

      if (Array.isArray(result) && result[0]?.generated_text) {
        generatedText = result[0].generated_text
      } else if (result.generated_text) {
        generatedText = result.generated_text
      } else {
        throw new Error("Unexpected response format from Hugging Face")
      }

      // Nettoyer et parser la réponse JSON
      const cleanedText = generatedText.trim()

      // Extraire le JSON de la réponse
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const jsonStr = jsonMatch[0]
      let parsedResult

      try {
        parsedResult = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw parseError
      }

      // Validation des valeurs
      const validTypes = ["incident", "request", "complaint", "suggestion"]
      const validCategories = ["technical", "account", "billing", "feature", "bug", "other"]
      const validPriorities = ["low", "medium", "high", "urgent"]

      const prediction = {
        type: validTypes.includes(parsedResult.type) ? parsedResult.type : "request",
        category: validCategories.includes(parsedResult.category) ? parsedResult.category : "other",
        priority: validPriorities.includes(parsedResult.priority) ? parsedResult.priority : "medium",
        suggestedResponse:
          parsedResult.suggestedResponse ||
          "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre dans les plus brefs délais.",
      }

      return NextResponse.json(prediction)
    } catch (error) {
      console.error("Error calling Hugging Face API:", error)
      throw error
    }
  } catch (error) {
    console.error("Error predicting ticket:", error)

    // Fallback en cas d'erreur
    return NextResponse.json({
      type: "request",
      category: "other",
      priority: "medium",
      suggestedResponse:
        "Merci pour votre demande. Notre équipe va examiner votre ticket et vous répondre dans les plus brefs délais. En attendant, n'hésitez pas à nous fournir des informations supplémentaires si nécessaire.",
    })
  }
}
