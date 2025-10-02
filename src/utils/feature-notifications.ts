// Feature notifications and UI tags utilities

// Privacy policy update date
export const PRIVACY_POLICY_UPDATE_DATE = '2025-07-23';

// Chat feature release date (for NEW tag display)
export const CHAT_FEATURE_RELEASE_DATE = '2025-07-23';

// Number of days to show the update notification
export const UPDATE_NOTIFICATION_DAYS = 60;

/**
 * Check if the privacy policy update notification should be shown
 * @returns true if within 60 days of the update date
 */
export function shouldShowUpdateNotification(): boolean {
  const updateDate = new Date(PRIVACY_POLICY_UPDATE_DATE);
  const currentDate = new Date();
  const daysDifference = Math.floor(
    (currentDate.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDifference >= 0 && daysDifference <= UPDATE_NOTIFICATION_DAYS;
}

/**
 * Check if the "NEW" tag for chat feature should be shown
 * @returns true if within 60 days of the chat feature release date
 */
export function shouldShowNewTag(): boolean {
  const releaseDate = new Date(CHAT_FEATURE_RELEASE_DATE);
  const currentDate = new Date();
  const daysDifference = Math.floor(
    (currentDate.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDifference >= 0 && daysDifference <= UPDATE_NOTIFICATION_DAYS;
}

/**
 * Get formatted update date for display
 * @returns formatted date string in Japanese format
 */
export function getFormattedUpdateDate(): string {
  const updateDate = new Date(PRIVACY_POLICY_UPDATE_DATE);
  const year = updateDate.getFullYear();
  const month = String(updateDate.getMonth() + 1).padStart(2, '0');
  const day = String(updateDate.getDate()).padStart(2, '0');

  return `${year}年${month}月${day}日`;
}
