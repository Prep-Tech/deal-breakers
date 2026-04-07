import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const INTERNAL_SECRET = import.meta.env.VITE_INTERNAL_SECRET ?? 'dev-secret'

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function callEmail(type, payload) {
  try {
    const { data: { session } } = await sb.auth.getSession()
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ type, payload }),
    })
  } catch (e) {
    console.warn('Email error:', e)
  }
}

export function genToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
