import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function pct(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

/** Turn database error codes (raised in SQL functions) into friendly messages. */
export function friendlyError(message: string | undefined | null): string {
  if (!message) return "Something went wrong. Please try again.";
  const map: Record<string, string> = {
    NO_QUESTIONS: "There are no published questions for this selection yet. Try another skill or level.",
    NOT_AUTHENTICATED: "Please sign in again.",
    NOT_AUTHORIZED: "You don't have permission to do that.",
    ATTEMPT_NOT_FOUND: "This quiz could not be found.",
    ATTEMPT_ALREADY_SUBMITTED: "This quiz has already been submitted.",
    TIME_IS_UP: "Time is up — your quiz will be submitted.",
    ALREADY_ANSWERED: "You've already answered this question.",
    INVALID_CLASS_CODE: "That class code wasn't found. Check it with your teacher.",
    PACKAGE_NOT_AVAILABLE: "This assessment is not available.",
    "Invalid login credentials": "Incorrect email or password.",
    "User already registered": "An account with this email already exists. Try signing in.",
  };
  for (const [code, text] of Object.entries(map)) if (message.includes(code)) return text;
  return message;
}
