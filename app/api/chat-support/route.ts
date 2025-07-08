import { type NextRequest, NextResponse } from "next/server"

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"

// Modifions la fonction POST pour gérer les erreurs plus gracieusement
// et assurer qu'elle fonctionne dans l'environnement de prévisualisation

export async function POST(request: NextRequest) {
  try {
    const { message, ticketContext } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    // Vérifier si nous sommes dans un environnement de prévisualisation
    const isPreview =
      process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development" || !HUGGINGFACE_API_KEY

    if (isPreview) {
      console.log("Mode prévisualisation: simulation de réponse IA")

      // Simuler un délai pour l'expérience utilisateur
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Logique simple pour générer des réponses basées sur des mots-clés
      const lowerMessage = message.toLowerCase()
      let response = ""

      if (lowerMessage.includes("bonjour") || lowerMessage.includes("salut") || lowerMessage.includes("hello")) {
        response = "Bonjour ! Comment puis-je vous aider concernant votre ticket ?"
      } else if (lowerMessage.includes("merci")) {
        response = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions."
      } else if (
        lowerMessage.includes("délai") ||
        lowerMessage.includes("attendre") ||
        lowerMessage.includes("quand")
      ) {
        if (ticketContext?.priority === "urgent") {
          response = "Votre ticket est marqué comme urgent. Un agent devrait vous répondre dans les 2 heures ouvrables."
        } else if (ticketContext?.priority === "high") {
          response = "Votre ticket est prioritaire. Un agent devrait vous répondre dans les 4 heures ouvrables."
        } else if (ticketContext?.priority === "medium") {
          response = "Un agent devrait traiter votre ticket dans les 24 heures."
        } else {
          response = "Votre ticket sera traité dans un délai de 72 heures maximum."
        }
      } else if (lowerMessage.includes("problème") || lowerMessage.includes("bug") || lowerMessage.includes("erreur")) {
        response =
          "Je comprends que vous rencontrez un problème. Pourriez-vous me donner plus de détails ? Par exemple, quand est-ce que cela se produit et quelles sont les étapes pour reproduire le problème ?"
      } else if (
        lowerMessage.includes("agent") ||
        lowerMessage.includes("humain") ||
        lowerMessage.includes("personne")
      ) {
        response =
          "Je vais transférer votre demande à un agent humain. Un membre de notre équipe vous contactera dès que possible."
      } else {
        response =
          "Merci pour votre message. Je vais transmettre ces informations à notre équipe qui traite votre ticket. Y a-t-il autre chose que je puisse faire pour vous aider ?"
      }

      return NextResponse.json({ response })
    }

    // Si nous ne sommes pas en prévisualisation, continuer avec l'appel à Hugging Face
    const contextInfo = ticketContext
      ? `
Contexte du ticket :
- Titre: ${ticketContext.title}
- Description: ${ticketContext.description}  
- Catégorie: ${ticketContext.category}
- Priorité: ${ticketContext.priority}
- Type: ${ticketContext.type}
`
      : ""

    const prompt = `[INST] Tu es un assistant de support technique professionnel et bienveillant. 

${contextInfo}

L'utilisateur te pose la question suivante : "${message}"

Réponds de manière utile, professionnelle et en français. Donne des conseils pratiques et des solutions concrètes quand c'est possible. Si tu ne peux pas résoudre le problème, oriente vers un agent humain.

Réponse: [/INST]`

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
            max_new_tokens: 300,
            temperature: 0.7,
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

      // Nettoyer la réponse
      const cleanedResponse = generatedText.trim()

      return NextResponse.json({
        response:
          cleanedResponse ||
          "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez contacter un agent humain pour une assistance personnalisée.",
      })
    } catch (error) {
      console.error("Error calling Hugging Face API:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in chat support:", error)

    return NextResponse.json({
      response:
        "Je rencontre actuellement des difficultés techniques. Veuillez contacter un agent humain pour une assistance immédiate.",
    })
  }
}
