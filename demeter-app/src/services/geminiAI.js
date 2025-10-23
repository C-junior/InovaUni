import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiAIService {
  constructor() {
    this.apiKey = "AIzaSyAQwXT0qKdZufq7AMSaKHa5fgGb43NM3AU";
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Configuração com Google Search Grounding
    const generationConfig = {
      tools: [{
        googleSearch: {} // Ativa a busca no Google automaticamente
      }]
    };
    
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      ...generationConfig
    });

    this.systemPrompt = `Você é um especialista em irrigação que explica de forma simples e direta para o produtor rural.
    - Sempre analise os dados recebidos da fazenda, seja breve e objetivo.
    - Use frases curtas, sem termos técnicos complexos.
    - Informe a lâmina de água (mm/dia) pronta para uso.
    - Se faltar algum dado importante (ex: Kc da cultura), busque essa informação e use na sua recomendação.
    - NÃO use textos longos. Seja direto na solução!`;
  }

  async generateResponse(userMessage, farmData = null, etcData = null) {
    try {
      let contextMessage = this.systemPrompt + "\n\n";

      if (farmData) {
        contextMessage += `Dados da Fazenda:
        - Nome: ${farmData.name}
        - Localização: ${farmData.location}
        - Área: ${farmData.area} hectares
        - Cultura: ${farmData.crop}
        - Tipo de Solo: ${farmData.soilType}
        - Sistema de Irrigação: ${farmData.irrigationSystem}\n\n`;
      }

      if (etcData) {
        contextMessage += `Dados de Evapotranspiração:
        - ETc calculado: ${etcData.etc} mm/dia
        - ETo: ${etcData.eto} mm/dia
        - Kc (Coeficiente da cultura): ${etcData.kc}
        - Radiação solar: ${etcData.radiation} MJ/m²/dia
        - Data do cálculo: ${etcData.date}\n\n`;
      }

      contextMessage += `Pergunta do usuário: ${userMessage}`;

      const result = await this.model.generateContent(contextMessage);
      const response = await result.response;
      
      // Verifica se houve busca no Google
const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
if (groundingMetadata) {
  console.log("Buscas realizadas:", groundingMetadata.searchQueries);
  console.log("Fontes:", groundingMetadata.groundingSupports);
} else {
  console.log("Respondeu com conhecimento próprio");
}

      
      return response.text();
    } catch (error) {
      console.error("Erro ao gerar resposta do Gemini:", error);
      throw new Error("Erro ao comunicar com a IA. Tente novamente.");
    }
  }

  async getInitialRecommendation(farmData, etcData) {
    const initialMessage = `Com base nos dados fornecidos, faça uma análise e recomende a lâmina de água ideal para ${farmData.crop}. 
    Se precisar de dados como Kc ou características da cultura, busque essa informação.`;

    return await this.generateResponse(initialMessage, farmData, etcData);
  }
}

export default new GeminiAIService();
