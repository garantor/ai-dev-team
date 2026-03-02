/**
 * Formats an ISO date string into a more readable format.
 * @param isoDateString The date string (e.g., '2023-10-27T10:00:00.000Z').
 * @param options Intl.DateTimeFormatOptions for formatting.
 * @returns Formatted date string.
 */
export const formatDate = (
  isoDateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string provided.');
    }
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string to show only the date part.
 * @param isoDateString The date string.
 * @returns Formatted date string (e.g., 'Oct 27, 2023').
 */
export const formatOnlyDate = (isoDateString: string): string => {
  return formatDate(isoDateString, { year: 'numeric', month: 'short', day: 'numeric', hour: undefined, minute: undefined });
};

/**
 * Formats a date string to show only the time part.
 * @param isoDateString The date string.
 * @returns Formatted time string (e.g., '10:00 AM').
 */
export const formatOnlyTime = (isoDateString: string): string => {
  return formatDate(isoDateString, { year: undefined, month: undefined, day: undefined, hour: '2-digit', minute: '2-digit', hour12: true });
};
