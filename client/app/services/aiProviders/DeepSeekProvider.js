/**
 * DeepSeek Provider
 * Handles all communication with DeepSeek/Ollama API through the backend
 */
class DeepSeekProvider {
  constructor(dashboardId) {
    this.dashboardId = dashboardId;
    this.providerType = "deepseek";
  }

  async getAnswer(question, conversation, prePrompt) {
    try {
      // Build messages array - backend will handle the Ollama format conversion
      let messages = [{ role: "system", content: prePrompt }];

      // Add conversation history
      if (conversation && conversation.length > 0) {
        conversation.forEach((entry) => {
          messages.push({ role: "user", content: entry.question }, { role: "assistant", content: entry.answer });
        });
      }

      // Add current question
      messages.push({ role: "user", content: question });

      const response = await fetch(`/api/dashboards/${this.dashboardId}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          provider: this.providerType,
        }),
      });

      if (!response.ok) {
        return "Sorry, there was a problem retrieving the answer from the server.";
      }

      const data = await response.json();
      return data.prompt;
    } catch (error) {
      console.error("DeepSeek Error:", error.message);
      return "Sorry, there was a problem connecting to DeepSeek.";
    }
  }
}

export default DeepSeekProvider;
