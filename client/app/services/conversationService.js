class ConversationService {
  constructor() {
    this.conversations = new Map();
  }

  getConversation(dashboardId) {
    return this.conversations.get(dashboardId) || [];
  }

  addMessage(dashboardId, question, answer) {
    const conversation = this.getConversation(dashboardId);
    conversation.push({ question, answer, timestamp: Date.now() });
    this.conversations.set(dashboardId, conversation);
  }

  clearConversation(dashboardId) {
    this.conversations.delete(dashboardId);
  }

  // Optionally persist to localStorage
  saveToStorage(dashboardId) {
    const conversation = this.getConversation(dashboardId);
    localStorage.setItem(`conversation_${dashboardId}`, JSON.stringify(conversation));
  }

  loadFromStorage(dashboardId) {
    const stored = localStorage.getItem(`conversation_${dashboardId}`);
    if (stored) {
      this.conversations.set(dashboardId, JSON.parse(stored));
    }
  }
}

export const conversationService = new ConversationService();
