import axios from 'axios';

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  replyToMessageId?: number;
}

export interface TelegramUser {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

class TelegramService {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Check if Telegram service is configured
   */
  isConfigured(): boolean {
    return !!this.botToken && this.botToken !== 'your-telegram-bot-token';
  }

  /**
   * Send message to Telegram user
   */
  async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Telegram bot not configured, skipping message:', message.text);
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'HTML',
        reply_to_message_id: message.replyToMessageId,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  /**
   * Send transaction notification to player
   */
  async sendTransactionNotification(
    telegramId: string,
    transactionUuid: string,
    type: 'created' | 'processed' | 'updated',
    data?: any
  ): Promise<boolean> {
    let message = '';

    switch (type) {
      case 'created':
        message = `✅ Your transaction has been created successfully!\n\n` +
                 `Transaction ID: ${transactionUuid}\n` +
                 `Type: ${data?.type || 'N/A'}\n` +
                 `Amount: ${data?.amount || 'N/A'} ${data?.currency || 'USD'}\n` +
                 `Status: ${data?.status || 'Pending'}\n\n` +
                 `We'll process your request shortly. You'll receive updates as we work on it.`;
        break;

      case 'processed':
        message = `🎉 Your transaction has been processed!\n\n` +
                 `Transaction ID: ${transactionUuid}\n` +
                 `Status: ${data?.status || 'Completed'}\n\n` +
                 `${data?.agentNotes ? `Notes: ${data.agentNotes}\n\n` : ''}` +
                 `Thank you for using our service!`;
        break;

      case 'updated':
        message = `📝 Your transaction has been updated!\n\n` +
                 `Transaction ID: ${transactionUuid}\n` +
                 `Status: ${data?.status || 'Updated'}\n\n` +
                 `${data?.adminNotes ? `Admin Notes: ${data.adminNotes}\n\n` : ''}` +
                 `Please check your transaction status for more details.`;
        break;
    }

    return this.sendMessage({
      chatId: telegramId,
      text: message,
    });
  }

  /**
   * Send welcome message to new player
   */
  async sendWelcomeMessage(telegramId: string, languageCode: string = 'en'): Promise<boolean> {
    // User requested to remove this welcome message
    return true;
  }

  /**
   * Send error message to player
   */
  async sendErrorMessage(telegramId: string, error: string): Promise<boolean> {
    const message = `❌ An error occurred while processing your request:\n\n${error}\n\nPlease try again or contact support if the problem persists.`;

    return this.sendMessage({
      chatId: telegramId,
      text: message,
    });
  }

  /**
   * Send agent assignment notification
   */
  async sendAgentAssignmentNotification(
    agentTelegramId: string,
    transactionUuid: string,
    playerInfo: string
  ): Promise<boolean> {
    const message = `🔔 New transaction assigned to you!\n\n` +
                   `Transaction ID: ${transactionUuid}\n` +
                   `Player: ${playerInfo}\n\n` +
                   `Please process this transaction as soon as possible.`;

    return this.sendMessage({
      chatId: agentTelegramId,
      text: message,
    });
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      return response.data.result;
    } catch (error) {
      console.error('Failed to get bot info:', error);
      return null;
    }
  }

  /**
   * Set webhook for receiving updates
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, {
        url: webhookUrl,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Failed to set webhook:', error);
      return false;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/deleteWebhook`);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();
