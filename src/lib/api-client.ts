import { ApiResponse } from "../../shared/types"

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const json = (await res.json()) as ApiResponse<T> & { detail?: string }
  if (!res.ok || !json.success || json.data === undefined) {
    const msg = json.error || 'Request failed'
    const detail = json.detail ? ` (${json.detail})` : ''
    throw new Error(msg + detail)
  }
  return json.data
}