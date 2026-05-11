/**
 * Web-compatible alert and confirm dialogs.
 *
 * React Native's Alert.alert doesn't work reliably in PWAs.
 * These use native browser dialogs which always work.
 */

/** Show a simple message dialog */
export function showAlert(title: string, message?: string): void {
  window.alert(message ? `${title}\n\n${message}` : title);
}

/**
 * Show a confirm dialog. Returns true if user clicks OK.
 * @param title - The title/question
 * @param message - Optional additional detail
 */
export function showConfirm(title: string, message?: string): boolean {
  return window.confirm(message ? `${title}\n\n${message}` : title);
}
