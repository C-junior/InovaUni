export const cropDatabase = {
  "culturas": {
    "milho": {
      "nome": "Milho",
      "kc": 1.2,
      "ciclo": "120-150 dias",
      "demandaHidrica": "500-800 mm",
      "caracteristicas": "Cultura de alta demanda hídrica, sensível ao estresse hídrico durante floração",
      "recomendacoes": "Irrigar com maior frequência durante pendoamento e enchimento de grãos"
    },
    "soja": {
      "nome": "Soja", 
      "kc": 1.15,
      "ciclo": "100-140 dias",
      "demandaHidrica": "450-700 mm",
      "caracteristicas": "Leguminosa com boa eficiência no uso da água",
      "recomendacoes": "Manter solo úmido durante floração e enchimento de vagens"
    },
    "feijao": {
      "nome": "Feijão",
      "kc": 1.05,
      "ciclo": "65-100 dias", 
      "demandaHidrica": "300-500 mm",
      "caracteristicas": "Ciclo curto, sensível ao encharcamento",
      "recomendacoes": "Irrigações leves e frequentes, evitar excesso de água"
    },
    "tomate": {
      "nome": "Tomate",
      "kc": 1.15,
      "ciclo": "120-150 dias",
      "demandaHidrica": "600-1000 mm", 
      "caracteristicas": "Alta demanda hídrica, sensível à variação de umidade",
      "recomendacoes": "Irrigação constante e uniforme, evitar estresse hídrico"
    },
    "cafe": {
      "nome": "Café",
      "kc": 1.0,
      "ciclo": "Perene",
      "demandaHidrica": "1200-1800 mm/ano",
      "caracteristicas": "Cultura perene, demanda varia com estação",
      "recomendacoes": "Irrigar principalmente no período seco, reduzir antes da colheita"
    }
  },
  "regioes": {
    "cerrado": {
      "caracteristicas": "Clima tropical, estação seca definida",
      "precipitacao": "1200-1800 mm/ano",
      "recomendacoes": "Irrigação essencial no período seco (maio-setembro)"
    },
    "nordeste": {
      "caracteristicas": "Clima semiárido, baixa precipitação",
      "precipitacao": "300-800 mm/ano", 
      "recomendacoes": "Irrigação obrigatória durante todo o ano"
    },
    "sul": {
      "caracteristicas": "Clima subtropical, chuvas bem distribuídas",
      "precipitacao": "1200-2000 mm/ano",
      "recomendacoes": "Irrigação suplementar em períodos de estiagem"
    }
  }
};

export default cropDatabase;