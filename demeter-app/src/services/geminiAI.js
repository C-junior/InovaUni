import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiAIService {
  constructor() {
    this.apiKey = "AIzaSyAQwXT0qKdZufq7AMSaKHa5fgGb43NM3AU";
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Contexto do especialista em irrigação
    this.systemPrompt = `Você é um especialista em irrigação e manejo de água na agricultura. 
    Sua função é analisar dados de evapotranspiração (ETc) e fornecer recomendações precisas 
    para otimizar a eficiência da lâmina de água na irrigação.

    Você deve:
    - Analisar os dados de ETc fornecidos
    - Considerar fatores como tipo de cultura, estágio de desenvolvimento, condições climáticas
    - Recomendar a lâmina de água ideal para maximizar a eficiência
    - Sugerir estratégias de manejo de irrigação
    - Explicar de forma clara  suas recomendações
    - Você é um especialista em irrigação que explica de forma simples e direta para o produtor rural.
    - Sempre analise os dados recebidos da fazenda, seja breve e objetivo.
    -Use frases curtas, sem termos técnicos complexos. Foque na resposta prática, usando apenas os dados da fazenda e cultura informados.

      - Informe a lâmina de água (mm/dia) pronta para uso.
      - Oriente o manejo com dicas práticas, fáceis de aplicar.
      - Se faltar algum dado importante (ex: Kc), recomende consultar o arquivo de dados da fazenda ou pergunte.
      - NÃO use textos longos ou explicações técnicas. Seja direto na solução!
      - Use sempre os dados que estão descritos na fazenda informada.
    `;
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
      return response.text();
    } catch (error) {
      console.error("Erro ao gerar resposta do Gemini:", error);
      throw new Error("Erro ao comunicar com a IA. Tente novamente.");
    }
  }

  async getInitialRecommendation(farmData, etcData) {
    const initialMessage = `Com base nos dados fornecidos, faça uma análise inicial e recomende a lâmina de água ideal para esta cultura. Inclua também sugestões de manejo de irrigação.`;

    return await this.generateResponse(initialMessage, farmData, etcData);
  }
}

export default new GeminiAIService();
