import { GoogleGenerativeAI } from "@google/generative-ai";
import kcStore from "@/data/kcData.js";
import cropDatabase from "@/data/cropDatabase.js";

class GeminiAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    this.modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash-lite";
    this.enableSearch = import.meta.env.VITE_GEMINI_ENABLE_SEARCH === "true";

    this.systemPrompt = `Voce e a Demeter AI, especialista em irrigacao para produtores rurais no Brasil.

REGRAS DE ACURACIA:
- Use primeiro os dados da fazenda e do calculo recebidos no contexto.
- Nunca invente numeros de ETc, ETo, Kc, eficiencia ou area.
- Quando houver ETc e eficiencia, considere:
  - Lamina liquida (mm/dia) = ETc
  - Lamina bruta (mm/dia) = ETc / eficiencia do sistema
- Se um dado essencial estiver faltando, diga claramente qual dado esta ausente e siga com recomendacao conservadora.
- Se houver incerteza relevante, apresente a recomendacao como faixa e explique a premissa.

ESTILO DE RESPOSTA:
- Responda sempre em portugues brasileiro.
- Seja direto, didatico e pratico para tomada de decisao no campo.
- Inclua unidades (mm/dia, ha, %).
- Evite jargao tecnico desnecessario.
- Nao use JSON, tags, blocos de codigo ou marcacoes tecnicas.
- Nao use markdown em formato de tabela.`;

    this.model = null;
    if (!this.apiKey) {
      console.warn("Gemini AI desabilitado: VITE_GEMINI_API_KEY nao configurada.");
      return;
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);

    const modelConfig = {
      model: this.modelName,
      systemInstruction: this.systemPrompt,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 700,
        responseMimeType: "text/plain",
      },
    };

    if (this.enableSearch) {
      modelConfig.tools = [{ googleSearch: {} }];
    }

    this.model = this.genAI.getGenerativeModel(modelConfig);
  }

  async generateResponse(userMessage, farmData = null, etcData = null, chatHistory = []) {
    try {
      const trimmedUserMessage = String(userMessage || "").trim();
      if (!trimmedUserMessage) {
        throw new Error("Mensagem vazia.");
      }

      if (!this.model) {
        throw new Error("Servico de IA nao configurado.");
      }

      const farmContext = this.buildFarmContext(farmData);
      const etcContext = this.buildEtcContext(etcData, farmContext.irrigationInfo);
      const historyContext = this.buildChatHistoryContext(chatHistory);

      const contextMessage = [
        "Contexto operacional para resposta:",
        farmContext.text,
        etcContext,
        historyContext,
        `Pergunta do usuario: ${trimmedUserMessage}`,
        "Responda em texto natural, sem codigos, em no maximo 8 linhas quando a pergunta for objetiva.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const result = await this.model.generateContent(contextMessage);
      const response = await result.response;
      return this.cleanModelResponse(response.text());
    } catch (error) {
      console.error("Erro ao gerar resposta do Gemini:", error);
      throw new Error("Erro ao comunicar com a IA. Tente novamente.");
    }
  }

  getCropKc(cropName) {
    if (!cropName) return null;

    const normalizedCropName = this.normalizeText(cropName);
    const crop = kcStore.kcValues.find((item) => {
      return this.normalizeText(item.cultura) === normalizedCropName;
    });

    return crop ? crop.kc : null;
  }

  getCropInfo(cropName) {
    if (!cropName) return null;

    const normalizedCropName = this.normalizeText(cropName);
    return (
      kcStore.kcValues.find((item) => {
        return this.normalizeText(item.cultura) === normalizedCropName;
      }) || null
    );
  }

  getSoilInfo(soilType) {
    if (!soilType) return null;

    const normalizedInput = this.normalizeText(soilType);
    const soilMapping = {
      arenoso: "Arenoso",
      argiloso: "Argiloso",
      humoso: "Franco",
      franco: "Franco",
    };

    const mappedSoilType = soilMapping[normalizedInput];
    if (mappedSoilType) {
      return kcStore.soilTypes[mappedSoilType] || null;
    }

    const soilKey = Object.keys(kcStore.soilTypes).find((key) => {
      return this.normalizeText(key) === normalizedInput;
    });

    return soilKey ? kcStore.soilTypes[soilKey] : null;
  }

  getIrrigationInfo(systemType) {
    if (!systemType) return null;

    const normalizedSystemType = this.normalizeText(systemType);
    const systemKey = Object.keys(kcStore.irrigationSystems).find((key) => {
      return this.normalizeText(key) === normalizedSystemType;
    });

    return systemKey ? kcStore.irrigationSystems[systemKey] : null;
  }

  getCropDatabaseInfo(cropName) {
    if (!cropName) return null;

    const normalizedCropName = this.normalizeText(cropName).replace(/\s+/g, "");
    const cropKey = Object.keys(cropDatabase.culturas).find((key) => {
      return this.normalizeText(key).replace(/\s+/g, "") === normalizedCropName;
    });

    return cropKey ? cropDatabase.culturas[cropKey] : null;
  }

  async getInitialRecommendation(farmData, etcData) {
    const cropName = farmData?.crop || "a cultura";
    const initialMessage = `Faca uma recomendacao inicial de irrigacao para ${cropName} com:
1) lamina liquida e bruta estimadas (se possivel),
2) frequencia sugerida,
3) principal risco agronomico no cenario atual,
4) proximo ajuste pratico para o produtor.`;

    return await this.generateResponse(initialMessage, farmData, etcData);
  }

  buildFarmContext(farmData) {
    if (!farmData) {
      return { text: "Dados da fazenda: nao informados.", irrigationInfo: null };
    }

    const cropInfo = this.getCropInfo(farmData.crop);
    const soilInfo = this.getSoilInfo(farmData.soilType);
    const irrigationInfo = this.getIrrigationInfo(farmData.irrigationType);
    const cropDbInfo = this.getCropDatabaseInfo(farmData.crop);

    let text = `Dados da fazenda:\n- Nome: ${farmData.name || "nao informado"}\n- Localizacao: ${farmData.location || "nao informada"}\n- Area: ${farmData.area || "nao informada"} ha\n- Cultura: ${farmData.crop || "nao informada"}${cropInfo ? ` (Kc base: ${cropInfo.kc})` : ""}\n- Tipo de solo: ${farmData.soilType || "nao informado"}${soilInfo ? ` (retencao ${soilInfo.retencao}, drenagem ${soilInfo.drenagem})` : ""
      }\n- Sistema de irrigacao: ${farmData.irrigationType || "nao informado"}${irrigationInfo ? ` (eficiencia ${Math.round(irrigationInfo.eficiencia * 100)}%)` : ""
      }`;

    if (cropDbInfo) {
      text += `\nInformacoes agronomicas da cultura:\n- Ciclo: ${cropDbInfo.ciclo}\n- Demanda hidrica: ${cropDbInfo.demandaHidrica}\n- Caracteristicas: ${cropDbInfo.caracteristicas}\n- Recomendacao base: ${cropDbInfo.recomendacoes}`;
    }

    return { text, irrigationInfo };
  }

  buildEtcContext(etcData, irrigationInfo) {
    if (!etcData) {
      return "Dados de evapotranspiracao: nao informados.";
    }

    const etc = this.toFiniteNumber(etcData.etc);
    const eto = this.toFiniteNumber(etcData.eto);
    const kc = this.toFiniteNumber(etcData.kc);
    const radiation = this.toFiniteNumber(etcData.radiation) ?? 15;
    const efficiency = irrigationInfo?.eficiencia;
    const grossDepth = etc && efficiency ? etc / efficiency : null;

    return `Dados de evapotranspiracao:\n- ETc: ${etc !== null ? etc.toFixed(2) : "nao calculado"} mm/dia\n- ETo: ${eto !== null ? eto.toFixed(2) : "nao calculado"} mm/dia\n- Kc usado no calculo: ${kc !== null ? kc.toFixed(2) : "nao definido"}\n- Radiacao solar: ${radiation.toFixed(2)} MJ/m2/dia\n- Data do calculo: ${etcData.date || new Date().toISOString().split("T")[0]}\n${grossDepth
        ? `- Lamina bruta estimada por eficiencia do sistema: ${grossDepth.toFixed(2)} mm/dia`
        : "- Lamina bruta estimada: indisponivel (faltou ETc ou eficiencia)."
      }`;
  }

  buildChatHistoryContext(chatHistory = []) {
    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
      return "";
    }

    const recentHistory = chatHistory.slice(-10);
    const historyLines = recentHistory.map((message) => {
      const role = message?.type === "user-message" ? "Usuario" : "IA";
      const text = String(message?.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400);
      return `- ${role}: ${text}`;
    });

    return `Historico recente:\n${historyLines.join("\n")}`;
  }

  cleanModelResponse(rawText) {
    let cleanResponse = String(rawText || "");
    cleanResponse = cleanResponse.replace(/\[ALTERACAO_SUGERIDA\].*?(?=\s|$)/gi, "");
    cleanResponse = cleanResponse.replace(/\{[^}]*"irrigationType"[^}]*\}/gi, "");
    cleanResponse = cleanResponse.replace(/```[\s\S]*?```/g, "");
    cleanResponse = cleanResponse.replace(/`[^`]*`/g, "");
    cleanResponse = cleanResponse.replace(/<\/?[^>]+(>|$)/g, "");
    cleanResponse = cleanResponse.replace(/\n{3,}/g, "\n\n");
    return cleanResponse.trim();
  }

  normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
}

export default new GeminiAIService();
