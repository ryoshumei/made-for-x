/**
 * Quick action tag definitions for mail generator pages
 * Each tag provides a preset prompt text that users can quickly insert
 */

export type PageContext = 'email' | 'reply' | 'chat';

export interface QuickActionTag {
  id: string;
  label: string;
  icon: string;
  promptText: string;
}

export interface PageTags {
  pageContext: PageContext;
  tags: QuickActionTag[];
}

/**
 * Tags for /mail-generator (email composition)
 */
export const emailTags: QuickActionTag[] = [
  {
    id: 'email-meeting',
    label: '会議依頼',
    icon: '📅',
    promptText: '会議の日程調整メールを作成してください。',
  },
  {
    id: 'email-thanks',
    label: 'お礼',
    icon: '🙏',
    promptText: '感謝のメールを作成してください。',
  },
  {
    id: 'email-apology',
    label: 'お詫び',
    icon: '🙇',
    promptText: 'お詫びのメールを作成してください。',
  },
  {
    id: 'email-inquiry',
    label: '問い合わせ',
    icon: '❓',
    promptText: '問い合わせメールを作成してください。',
  },
  {
    id: 'email-report',
    label: '報告',
    icon: '📊',
    promptText: '報告メールを作成してください。',
  },
];

/**
 * Tags for /mail-generator/reply
 */
export const replyTags: QuickActionTag[] = [
  {
    id: 'reply-accept',
    label: '承諾',
    icon: '✅',
    promptText: '承諾の返信を作成してください。',
  },
  {
    id: 'reply-decline',
    label: '辞退',
    icon: '🙅',
    promptText: '丁寧にお断りする返信を作成してください。',
  },
  {
    id: 'reply-reschedule',
    label: '日程変更',
    icon: '📅',
    promptText: '日程変更のお願いの返信を作成してください。',
  },
  {
    id: 'reply-confirm',
    label: '確認',
    icon: '🔍',
    promptText: '詳細を確認する返信を作成してください。',
  },
  {
    id: 'reply-thanks',
    label: 'お礼',
    icon: '🙏',
    promptText: '感謝の返信を作成してください。',
  },
];

/**
 * Tags for /mail-generator/chat
 */
export const chatTags: QuickActionTag[] = [
  {
    id: 'chat-progress',
    label: '進捗報告',
    icon: '📈',
    promptText: 'チームへの進捗報告メッセージを作成してください。',
  },
  {
    id: 'chat-question',
    label: '質問',
    icon: '❓',
    promptText: '同僚への質問メッセージを作成してください。',
  },
  {
    id: 'chat-reminder',
    label: 'リマインド',
    icon: '⏰',
    promptText: '優しいリマインドメッセージを作成してください。',
  },
  {
    id: 'chat-appreciation',
    label: '感謝',
    icon: '🎉',
    promptText: 'チームメンバーへの感謝メッセージを作成してください。',
  },
  {
    id: 'chat-announcement',
    label: 'お知らせ',
    icon: '📢',
    promptText: 'チャンネルへのお知らせメッセージを作成してください。',
  },
];

/**
 * Get tags for a specific page context
 */
export function getTagsByContext(context: PageContext): QuickActionTag[] {
  switch (context) {
    case 'email':
      return emailTags;
    case 'reply':
      return replyTags;
    case 'chat':
      return chatTags;
    default:
      return [];
  }
}

/**
 * All page tag configurations
 */
export const allPageTags: PageTags[] = [
  { pageContext: 'email', tags: emailTags },
  { pageContext: 'reply', tags: replyTags },
  { pageContext: 'chat', tags: chatTags },
];
