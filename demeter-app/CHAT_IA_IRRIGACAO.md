# Chat IA para Consultoria em Irrigação

## Funcionalidade

O sistema agora integra um chat com IA especializada em irrigação que utiliza o Google Gemini AI para fornecer recomendações personalizadas sobre manejo de água.

## Como Funciona

1. **Cálculo ETo**: Na página de uma fazenda, preencha os dados meteorológicos e clique em "Calcular ETo"
2. **Visualização dos Resultados**: Veja os resultados do cálculo de evapotranspiração
3. **Consulta com IA**: Após o cálculo, clique em "Conversar com Especialista IA" para abrir o chat
4. **Recomendações Personalizadas**: A IA analisa seus dados e fornece recomendações específicas para irrigação

## Dados Utilizados

### Cálculo ETo

O sistema utiliza o formulário de cálculo original que permite:
- **Dados da API meteorológica** (automático)
- **Entrada manual** de dados meteorológicos
- **Radiação Solar**: Configurável pelo usuário
- **Localização fixa**: Palmas (TO) - Latitude 10°S, Altitude 230m

### Coeficientes de Cultura (Kc)

- Milho: 1.2
- Soja: 1.15
- Trigo: 1.15
- Arroz: 1.2
- Feijão: 1.05
- Algodão: 1.15
- Cana-de-açúcar: 1.25
- Café: 1.0
- Tomate: 1.15
- Batata: 1.15
- Outras culturas: 1.0 (padrão)

## Especialista IA

O chat utiliza o modelo Gemini 2.0 Flash configurado como especialista em:

- Análise de dados de evapotranspiração
- Recomendações de lâmina de água
- Estratégias de manejo de irrigação
- Otimização da eficiência hídrica

## Funcionalidades do Chat

- **Recomendação Inicial**: Análise automática dos dados calculados
- **Perguntas Personalizadas**: Faça perguntas específicas sobre irrigação
- **Contexto Completo**: A IA tem acesso a todos os dados da fazenda e cálculos
- **Respostas Técnicas**: Explicações detalhadas e profissionais

## Configuração

A chave da API do Gemini está configurada no arquivo `src/services/geminiAI.js`:

```javascript
this.apiKey = "AIzaSyAQwXT0qKdZufq7AMSaKHa5fgGb43NM3AU";
```

## Arquivos Modificados/Criados

- `src/services/geminiAI.js` - Serviço de integração com Gemini AI
- `src/components/AIChat.vue` - Componente do chat
- `src/views/CalcView.vue` - Modificado para integrar o chat
- `package.json` - Adicionada dependência `@google/generative-ai`

## Uso

1. Navegue até uma fazenda
2. Preencha os dados meteorológicos (ou use dados da API)
3. Clique em "Calcular ETo"
4. Visualize os resultados do cálculo
5. Clique em "Conversar com Especialista IA"
6. Interaja com o especialista IA no chat
7. Faça perguntas específicas sobre irrigação
8. Use as recomendações para otimizar seu manejo de água
