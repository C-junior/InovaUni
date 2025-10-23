<template>
  <div class="ai-chat-container">
    <!-- Header do Chat -->
    <div class="chat-header">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Especialista em Irrigação IA</h3>
          <p class="text-sm text-gray-600">Assistente para otimização da lâmina de água</p>
        </div>
      </div>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Área de Mensagens -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" class="message" :class="message.type">
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.text)"></div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="isLoading" class="message ai-message">
        <div class="message-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input de Mensagem -->
    <div class="chat-input">
      <div class="input-container">
        <input
          v-model="newMessage"
          @keypress.enter="sendMessage"
          :disabled="isLoading"
          placeholder="Digite sua pergunta sobre irrigação..."
          class="message-input"
        />
        <button 
          @click="sendMessage" 
          :disabled="isLoading || !newMessage.trim()"
          class="send-button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import geminiAI from '@/services/geminiAI'

export default {
  name: 'AIChat',
  props: {
    farmData: {
      type: Object,
      required: true
    },
    etcData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      isLoading: false,
      messageIdCounter: 1
    }
  },
  async mounted() {
    await this.initializeChat()
  },
  methods: {
    async initializeChat() {
      // Adiciona mensagem de boas-vindas
      this.addMessage('ai', 'Olá! Sou seu especialista em irrigação. Analisei os dados da sua fazenda e calculei a evapotranspiração. Vou gerar uma recomendação inicial para você.')
      
      this.isLoading = true
      try {
        const initialRecommendation = await geminiAI.getInitialRecommendation(this.farmData, this.etcData)
        this.addMessage('ai', initialRecommendation)
      } catch {
        this.addMessage('ai', 'Desculpe, ocorreu um erro ao gerar a recomendação inicial. Você pode fazer perguntas específicas sobre irrigação que tentarei ajudar.')
      } finally {
        this.isLoading = false
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.isLoading) return

      const userMessage = this.newMessage.trim()
      this.addMessage('user', userMessage)
      this.newMessage = ''
      
      this.isLoading = true
      try {
        const response = await geminiAI.generateResponse(userMessage, this.farmData, this.etcData)
        this.addMessage('ai', response)
      } catch {
        this.addMessage('ai', 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.')
      } finally {
        this.isLoading = false
      }
    },

    addMessage(type, text) {
      this.messages.push({
        id: this.messageIdCounter++,
        type: type === 'user' ? 'user-message' : 'ai-message',
        text,
        timestamp: new Date()
      })
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    formatMessage(text) {
      // Converte quebras de linha em <br> e formata texto básico
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  @apply flex flex-col h-full bg-white rounded-lg shadow-lg;
  max-height: 600px;
}

.chat-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
  min-height: 400px;
}

.message {
  @apply flex;
}

.user-message {
  @apply justify-end;
}

.ai-message {
  @apply justify-start;
}

.message-content {
  @apply max-w-xs lg:max-w-md px-4 py-2 rounded-lg;
}

.user-message .message-content {
  @apply bg-blue-500 text-white rounded-br-none;
}

.ai-message .message-content {
  @apply bg-gray-200 text-gray-800 rounded-bl-none;
}

.message-text {
  @apply text-sm leading-relaxed;
}

.message-time {
  @apply text-xs opacity-70 mt-1;
}

.chat-input {
  @apply p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg;
}

.input-container {
  @apply flex space-x-2;
}

.message-input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.send-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.loading-dots {
  @apply flex space-x-1;
}

.loading-dots span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
  animation-delay: calc(var(--i) * 0.2s);
}

.loading-dots span:nth-child(1) { --i: 0; }
.loading-dots span:nth-child(2) { --i: 1; }
.loading-dots span:nth-child(3) { --i: 2; }
</style>