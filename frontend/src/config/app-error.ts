export type AppErrorCode =
  | 'missing-config'
  | 'push-registration-failed'
  | 'backend-unreachable'
  | 'backend-rejected'

/** An error the page can explain in the user's language; `detail` holds the technical information. */
export class AppError extends Error {
  readonly code: AppErrorCode
  readonly detail: string

  constructor(code: AppErrorCode, detail: string) {
    super(`${code}: ${detail}`)
    this.name = 'AppError'
    this.code = code
    this.detail = detail
  }
}
