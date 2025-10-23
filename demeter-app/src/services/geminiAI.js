import { GoogleGenerativeAI } from "@google/generative-ai";
import kcStore from "@/data/kcData.js";
import cropDatabase from "@/data/cropDatabase.js";

class GeminiAIService {
  constructor() {
    this.apiKey = "AIzaSyAQwXT0qKdZufq7AMSaKHa5fgGb43NM3AU";
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Debug: verificar se os dados foram carregados
    console.log('KcStore carregado:', kcStore);
    console.log('KcValues disponíveis:', kcStore.kcValues);
    console.log('CropDatabase carregado:', cropDatabase);
    console.log('Culturas disponíveis:', cropDatabase.culturas);
    
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
    
    REGRAS IMPORTANTES:
    - SEMPRE use os dados fornecidos da fazenda (nome, localização, área, cultura, solo, sistema de irrigação)
    - NUNCA diga que dados estão "indefinidos" se eles foram fornecidos
    - Use os valores de Kc, características do solo e eficiência do sistema que estão nos dados
    - Seja breve e objetivo, use frases curtas
    - Informe a lâmina de água (mm/dia) pronta para uso
    - Se faltar algum dado específico, busque informação complementar
    - Foque na solução prática para o produtor`;
  }

  async generateResponse(userMessage, farmData = null, etcData = null) {
    try {
      // Debug: log dos dados recebidos
      console.log('Dados da fazenda recebidos:', farmData);
      console.log('Dados ETC recebidos:', etcData);
      
      let contextMessage = this.systemPrompt + "\n\n";

      // Enriquece dados da fazenda com informações do store
      if (farmData) {
        const cropInfo = this.getCropInfo(farmData.crop);
        const soilInfo = this.getSoilInfo(farmData.soilType);
        const irrigationInfo = this.getIrrigationInfo(farmData.irrigationSystem);
        const cropDbInfo = this.getCropDatabaseInfo(farmData.crop);
        
        contextMessage += `Dados da Fazenda:
        - Nome: ${farmData.name || 'Não informado'}
        - Localização: ${farmData.location || 'Não informada'}
        - Área: ${farmData.area || 'Não informada'} hectares
        - Cultura: ${farmData.crop || 'Não informada'}${cropInfo ? ` (Kc: ${cropInfo.kc})` : ''}
        - Tipo de Solo: ${farmData.soilType || 'Não informado'}${soilInfo ? ` (Retenção: ${soilInfo.retencao}, Drenagem: ${soilInfo.drenagem})` : ''}
        - Sistema de Irrigação: ${farmData.irrigationSystem || 'Não informado'}${irrigationInfo ? ` (Eficiência: ${irrigationInfo.eficiencia * 100}%)` : ''}`;
        
        // Adiciona informações detalhadas da cultura se disponível
        if (cropDbInfo) {
          contextMessage += `\n\nInformações da Cultura ${farmData.crop}:
        - Demanda Hídrica: ${cropDbInfo.demandaHidrica}
        - Ciclo: ${cropDbInfo.ciclo}
        - Características: ${cropDbInfo.caracteristicas}
        - Recomendações: ${cropDbInfo.recomendacoes}`;
        }
        
        contextMessage += '\n\n';
      }

      if (etcData) {
        // Define radiação solar padrão como 15 MJ/m²/dia se não estiver definida
        const radiationValue = etcData.radiation ?? 15;
        
        contextMessage += `Dados de Evapotranspiração:
        - ETc calculado: ${etcData.etc ?? 'Não calculado'} mm/dia
        - ETo: ${etcData.eto ?? 'Não calculado'} mm/dia
        - Kc (Coeficiente da cultura): ${etcData.kc ?? 'Não definido'}
        - Radiação solar: ${radiationValue} MJ/m²/dia
        - Data do cálculo: ${etcData.date ?? new Date().toISOString().split('T')[0]}\n\n`;
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

  getCropKc(cropName) {
    if (!cropName) return null;
    
    const crop = kcStore.kcValues.find(item => 
      item.cultura.toLowerCase() === cropName.toLowerCase()
    );
    
    return crop ? crop.kc : null;
  }

  getCropInfo(cropName) {
    if (!cropName) return null;
    
    console.log('Buscando crop info para:', cropName);
    console.log('KcStore disponível:', kcStore.kcValues);
    
    const crop = kcStore.kcValues.find(item => 
      item.cultura.toLowerCase() === cropName.toLowerCase()
    );
    
    console.log('Crop encontrado:', crop);
    return crop;
  }

  getSoilInfo(soilType) {
    if (!soilType) return null;
    
    return kcStore.soilTypes[soilType];
  }

  getIrrigationInfo(systemType) {
    if (!systemType) return null;
    
    return kcStore.irrigationSystems[systemType];
  }

  getCropDatabaseInfo(cropName) {
    if (!cropName) return null;
    
    const cropKey = cropName.toLowerCase().replace(/\s+/g, '');
    console.log('Buscando crop database info para:', cropName, 'key:', cropKey);
    console.log('CropDatabase disponível:', cropDatabase.culturas);
    
    const cropInfo = cropDatabase.culturas[cropKey];
    console.log('CropDatabase info encontrada:', cropInfo);
    return cropInfo;
  }

  async getInitialRecommendation(farmData, etcData) {
    const cropName = farmData?.crop || 'a cultura';
    const initialMessage = `Com base nos dados fornecidos, faça uma análise e recomende a lâmina de água ideal para ${cropName}. 
    Se precisar de dados como Kc ou características da cultura, busque essa informação.`;

    return await this.generateResponse(initialMessage, farmData, etcData);
  }
}

export default new GeminiAIService();
