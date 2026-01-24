'use client';

import { PageContext, QuickActionTag, getTagsByContext } from '@/config/quick-action-tags';

interface QuickActionTagsProps {
  pageContext: PageContext;
  onTagClick: (promptText: string) => void;
  disabled?: boolean;
}

/**
 * QuickActionTags component displays clickable tags that insert preset prompts
 * and tracks click analytics
 */
export default function QuickActionTags({
  pageContext,
  onTagClick,
  disabled = false,
}: QuickActionTagsProps) {
  const tags = getTagsByContext(pageContext);

  const handleTagClick = async (tag: QuickActionTag) => {
    if (disabled) return;

    // Insert the prompt text into the textarea
    onTagClick(tag.promptText);

    // Track the click asynchronously (fire and forget)
    try {
      await fetch('/api/tag-clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagId: tag.id,
          pageContext,
        }),
      });
    } catch (error) {
      // Silently fail - analytics shouldn't block UX
      console.error('Failed to track tag click:', error);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">クイック入力:</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagClick(tag)}
            disabled={disabled}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-700"
          >
            <span className="mr-1.5">{tag.icon}</span>
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
