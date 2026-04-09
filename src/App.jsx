import { useState, useEffect, useCallback } from 'react'
import { sb, callEmail, genToken } from './supabase.js'

// ─── Styles ────────────────────────────────────────────────────────────────
const G = {
  purple: '#A06CD5', darkPurple: '#7B4FA8', dark: '#1a1a1a', cream: '#F7F4EF',
  border: '#e0dcd7', start: '#3AAFB9', stop: '#C60F7B',
  green: '#22c55f', blue: '#3AAFB9',
}
const font = "'Montserrat', sans-serif"

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: ${font}; background: ${G.cream}; color: ${G.dark}; min-height: 100vh; overflow-x: hidden; }
  input, textarea, select, button { font-family: inherit; }
  button { cursor: pointer; }
  textarea { resize: vertical; }
  input[type="date"] { color-scheme: light; }
  @media (max-width: 480px) { .stepper-label { display: none !important; } }
`

// ─── Shared UI ─────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = 'primary', disabled, style = {}, small }) => {
  const base = {
    border: 'none', letterSpacing: '0.15em', cursor: disabled ? 'default' : 'pointer',
    padding: small ? '0.55rem 1.2rem' : '1rem 2rem',
    fontSize: small ? '0.82rem' : '0.9rem', fontWeight: 600,
    transition: 'all 0.2s', fontFamily: 'inherit', borderRadius: 3,
    width: small ? 'auto' : '100%',
  }
  const variants = {
    primary: { background: disabled ? '#ddd' : G.purple, color: disabled ? '#aaa' : '#fff' },
    outline: { background: '#fff', color: G.purple, border: `1px solid ${G.purple}` },
  }
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '1.2rem' }}>
    {label && <div style={{ fontSize: '0.8rem', letterSpacing: '0.18em', color: '#777', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</div>}
    {children}
  </div>
)

const Input = ({ id, type = 'text', placeholder, value, onChange, onKeyDown, autoFocus, autoComplete, borderColor }) => (
  <input
    id={id} type={type} placeholder={placeholder} value={value}
    onChange={onChange} onKeyDown={onKeyDown} autoFocus={autoFocus}
    autoComplete={autoComplete}
    style={{
      width: '100%', border: 'none',
      borderBottom: `2px solid ${borderColor || G.purple}`,
      background: 'transparent', padding: '0.5rem 0.2rem',
      fontSize: 'clamp(1rem, 4vw, 1.1rem)', color: G.dark, outline: 'none',
    }}
  />
)

const TextArea = ({ id, placeholder, value, onChange, rows = 4, borderColor }) => (
  <textarea
    id={id} placeholder={placeholder} value={value} onChange={onChange} rows={rows}
    style={{
      width: '100%', border: 'none',
      borderBottom: `2px solid ${borderColor || G.purple}`,
      background: 'transparent', padding: '0.5rem 0.2rem',
      fontSize: 'clamp(0.95rem, 3.5vw, 1rem)', color: G.dark, outline: 'none',
      lineHeight: 1.8, resize: 'vertical',
    }}
  />
)

const Card = ({ children, style = {}, borderLeft }) => (
  <div style={{
    background: '#fff', border: `1px solid ${G.border}`, borderRadius: 4,
    borderLeft: borderLeft ? `3px solid ${borderLeft}` : undefined,
    padding: 'clamp(1.2rem, 5vw, 1.8rem)', marginBottom: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', ...style,
  }}>{children}</div>
)

const CardTitle = ({ children, color }) => (
  <div style={{ fontSize: '0.8rem', letterSpacing: '0.25em', color: color || G.purple, marginBottom: '0.8rem', fontWeight: 700 }}>{children}</div>
)

const DescBox = ({ children, color }) => (
  <div style={{
    background: '#fff', borderLeft: `4px solid ${color || G.purple}`,
    padding: '0.9rem 1.1rem', marginBottom: '1.2rem',
    fontSize: 'clamp(0.92rem, 3.5vw, 1rem)', color: '#555', lineHeight: 1.8,
  }}>{children}</div>
)

const InfoBox = ({ children }) => (
  <div style={{
    borderTop: `2px solid ${G.purple}`, borderBottom: `2px solid ${G.purple}`,
    padding: '1.2rem 1.5rem', margin: '1.2rem 0',
    fontStyle: 'italic', color: '#555', textAlign: 'center',
    fontSize: 'clamp(0.92rem, 3.5vw, 1rem)', lineHeight: 1.8,
  }}>{children}</div>
)

const ErrorMsg = ({ msg }) => msg ? <div style={{ color: '#c0392b', fontSize: '0.88rem', marginTop: '0.4rem' }}>{msg}</div> : null

const SuccessBox = ({ children }) => (
  <div style={{ background: '#EDF7ED', border: '1px solid #90C090', padding: '1rem', color: '#2d6a2d', fontSize: '0.95rem', lineHeight: 1.7, marginTop: '0.8rem' }}>{children}</div>
)

const WarnBox = ({ children }) => (
  <div style={{ background: '#FDF0F0', border: '1px solid #C9A0A0', padding: '1rem', color: '#7a3a3a', fontSize: '0.95rem', lineHeight: 1.7, marginTop: '0.8rem' }}>{children}</div>
)

const ReqBlock = ({ text, type }) => (
  <div style={{
    borderLeft: `4px solid ${type === 'start' ? G.start : G.stop}`,
    background: G.cream, padding: '0.8rem 1rem', marginBottom: '0.8rem',
  }}>
    <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: type === 'start' ? G.start : G.stop, marginBottom: '0.4rem' }}>
      {type === 'start' ? '△ START' : '▽ STOP'}
    </div>
    <div style={{ fontSize: '0.97rem', color: '#333', fontStyle: 'italic', lineHeight: 1.7 }}>"{text}"</div>
  </div>
)

const Pill = ({ label, active, activeClass, onClick }) => {
  const activeColors = {
    accept: { background: G.green, borderColor: G.green, color: '#fff' },
    compromise: { background: G.purple, borderColor: G.purple, color: '#fff' },
    reject: { background: '#C9A0A0', borderColor: '#C9A0A0', color: '#fff' },
  }
  const style = {
    flex: 1, minWidth: 80, padding: '0.7rem 0.5rem', textAlign: 'center',
    border: `2px solid ${G.border}`, background: '#fff', color: '#555', borderRadius: 3,
    fontSize: 'clamp(0.88rem, 3vw, 0.95rem)', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.2s', fontWeight: 500,
    ...(active && activeClass ? activeColors[activeClass] : {}),
  }
  return <button style={style} onClick={onClick}>{label}</button>
}

const Stepper = ({ steps, current }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
    {steps.map((s, i) => (
      <div key={s.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', flexShrink: 0,
            background: current === i ? s.color : current > i ? s.color : '#fff',
            color: current === i ? '#fff' : current > i ? s.color : '#bbb',
            border: `2px solid ${current >= i ? s.color : '#ddd'}`,
          }}>
            {current > i ? '✓' : s.icon}
          </div>
          <div className="stepper-label" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: current === i ? s.color : '#aaa', whiteSpace: 'nowrap' }}>
            {s.label.toUpperCase()}
          </div>
        </div>
        {i < steps.length - 1 && (
          <div style={{ width: 'clamp(14px,4vw,30px)', height: 1, background: current > i ? G.purple : '#ddd', margin: '0 2px', marginBottom: '1.2rem', flexShrink: 0 }} />
        )}
      </div>
    ))}
  </div>
)

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(window.location.search)
  const initialToken = params.get('token')
  const initialReset = params.get('type') === 'recovery'
  const initialTab = params.get('tab') === 'signup' ? 'signup' : 'login'

  const [view, setView] = useState(() => {
    if (initialReset) return 'reset-password'
    if (initialToken) return 'invite-signup'
    return 'auth'
  })
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [partnership, setPartnership] = useState(null)
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [rounds, setRounds] = useState([])
  const [activeRound, setActiveRound] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authTab, setAuthTab] = useState(initialTab)
  const [roundStep, setRoundStep] = useState(0)
  const [inviteToken] = useState(initialToken)
  const [invitePartnerName, setInvitePartnerName] = useState('')

  // Review state
  const [revStart, setRevStart] = useState('')
  const [revStartReas, setRevStartReas] = useState('')
  const [revStartWill, setRevStartWill] = useState('')
  const [revStop, setRevStop] = useState('')
  const [revStopReas, setRevStopReas] = useState('')
  const [revStopWill, setRevStopWill] = useState('')

  const loadUserData = useCallback(async (uid) => {
    const { data: prof } = await sb.from('profiles').select('*').eq('id', uid).single()
    setProfile(prof)

    const { data: part } = await sb.from('partnerships')
      .select('*, partner_a:profiles!partnerships_partner_a_id_fkey(id,name,email), partner_b:profiles!partnerships_partner_b_id_fkey(id,name,email)')
      .or(`partner_a_id.eq.${uid},partner_b_id.eq.${uid}`)
      .maybeSingle()

    setPartnership(part ?? null)
    if (part) {
      const pProf = part.partner_a_id === uid ? part.partner_b : part.partner_a
      setPartnerProfile(pProf)
      const { data: rds } = await sb.from('rounds').select('*').eq('partnership_id', part.id).order('created_at', { ascending: false })
      setRounds(rds ?? [])

      const roundParam = params.get('round')
      if (roundParam && rds) {
        const found = rds.find(r => r.id === roundParam)
        if (found) setActiveRound(found)
      }
    }
    setView('dashboard')
    setLoading(false)
  }, [])

  useEffect(() => {
    // Password recovery — stay on reset-password view, no session lookup needed.
    if (initialReset) return

    // Invite flow — fetch the inviter's name for the welcome card.
    if (initialToken) {
      sb.from('partnerships')
        .select('*, profiles!partnerships_partner_a_id_fkey(name)')
        .eq('invite_token', initialToken).single()
        .then(({ data }) => {
          if (data) setInvitePartnerName(data.profiles?.name ?? 'Your partner')
        })
    }

    // If a session already exists, jump straight to the dashboard.
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        loadUserData(session.user.id)
      }
    })
  }, [])

  // Auth handlers
  const doLogin = async (e) => {
    e.preventDefault()
    const email = document.getElementById('f-email').value.trim()
    const pw = document.getElementById('f-pw').value
    if (!email || !pw) return setError('Please fill in all fields.')
    setLoading(true); setError('')
    const { error: err, data } = await sb.auth.signInWithPassword({ email, password: pw })
    if (err) { setError(err.message); setLoading(false); return }
    setUser(data.user)
    await loadUserData(data.user.id)
  }

  const doSignup = async (e) => {
    e.preventDefault()
    const name = document.getElementById('f-name').value.trim()
    const email = document.getElementById('f-email').value.trim()
    const pw = document.getElementById('f-pw').value
    const pw2 = document.getElementById('f-pw2').value
    if (!name || !email || !pw || !pw2) return setError('Please fill in all fields.')
    if (pw !== pw2) return setError('Passwords do not match.')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true); setError('')
    const { error: err, data } = await sb.auth.signUp({ email, password: pw, options: { data: { name } } })
    if (err) { setError(err.message); setLoading(false); return }
    if (!data.session) { setError('Account created — please log in.'); setLoading(false); return }
    setUser(data.user)
    await loadUserData(data.user.id)
  }

  const doInviteSignup = async (e) => {
    e.preventDefault()
    const name = document.getElementById('f-name').value.trim()
    const email = document.getElementById('f-email').value.trim()
    const pw = document.getElementById('f-pw').value
    const pw2 = document.getElementById('f-pw2').value
    if (!name || !email || !pw || !pw2) return setError('Please fill in all fields.')
    if (pw !== pw2) return setError('Passwords do not match.')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true); setError('')
    const { error: err, data } = await sb.auth.signUp({ email, password: pw, options: { data: { name } } })
    if (err) { setError(err.message); setLoading(false); return }
    if (!data.session) { setError('Account created — please log in.'); setLoading(false); return }
    setUser(data.user)
    // Accept the invite via SECURITY DEFINER function (bypasses RLS)
    await sb.rpc('accept_invite', { invite_token_param: inviteToken, accepting_user_id: data.user.id })
    await loadUserData(data.user.id)
  }

  const doResetPassword = async (e) => {
    e.preventDefault()
    const pw = document.getElementById('f-pw').value
    const pw2 = document.getElementById('f-pw2').value
    if (!pw || !pw2) return setError('Please fill in both fields.')
    if (pw !== pw2) return setError('Passwords do not match.')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true); setError('')
    const { error: err } = await sb.auth.updateUser({ password: pw })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: { session } } = await sb.auth.getSession()
    if (session) { setUser(session.user); await loadUserData(session.user.id) }
  }

  const showForgotPassword = async () => {
    const email = prompt('Enter your email address:')
    if (!email) return
    await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}?type=recovery` })
    alert('Password reset email sent — check your inbox.')
  }

  const doLogout = async () => {
    await sb.auth.signOut()
    window.location.href = '/'
  }

  const sendInvite = async () => {
    const inviteEmail = document.getElementById('f-invite-email').value.trim()
    if (!inviteEmail) return setError('Please enter your partner\'s email address.')
    setLoading(true); setError('')
    const token = genToken()
    const { error: err } = await sb.from('partnerships').insert({
      partner_a_id: user.id, invite_email: inviteEmail,
      invite_token: token, status: 'pending',
    })
    if (err) { setError(err.message); setLoading(false); return }
    await callEmail('invite', {
      partnerAName: profile?.name ?? 'Your partner',
      inviteEmail, inviteToken: token,
    })
    await loadUserData(user.id)
  }

  const revokeInvite = async () => {
    if (!partnership || partnership.status !== 'pending') return
    if (!confirm('Revoke this invite? Any draft rounds you have started will also be deleted.')) return
    setLoading(true); setError('')
    const { error: err } = await sb.from('partnerships').delete().eq('id', partnership.id)
    if (err) { setError(err.message); setLoading(false); return }
    await loadUserData(user.id)
    setLoading(false)
  }

  const startNewRound = async (requesterId) => {
    // While the invite is pending the responder is unknown — leave it null
    // and backfill it when the partner accepts the invite (see doInviteSignup).
    const responderId = partnership.partner_b_id
      ? (requesterId === partnership.partner_a_id ? partnership.partner_b_id : partnership.partner_a_id)
      : null
    const roundNum = (rounds?.length ?? 0) + 1
    const { data, error: err } = await sb.from('rounds').insert({
      partnership_id: partnership.id,
      requester_id: requesterId,
      responder_id: responderId,
      status: 'draft',
      round_number: roundNum,
    }).select().single()
    if (err) { setError(err.message); return }
    setActiveRound(data)
    setRounds(prev => [data, ...prev])
    setRoundStep(0)
    setView('round-create')
  }

  const openRound = (roundId) => {
    const r = rounds.find(r => r.id === roundId)
    if (!r) return
    setActiveRound(r)
    const iRequested = r.requester_id === user.id
    if (r.status === 'draft' && iRequested) { setRoundStep(0); setView('round-create') }
    else if (r.status === 'submitted' && !iRequested) setView('round-respond')
    else if (r.status === 'in_progress' || r.status === 'responded') setView('round-view')
    else setView('round-view')
  }

  const saveStart = async () => {
    const val = document.getElementById('f-start').value.trim()
    if (!val) return setError('Please fill in your START request.')
    setError('')
    await sb.from('rounds').update({ start_request: val }).eq('id', activeRound.id)
    setActiveRound(prev => ({ ...prev, start_request: val }))
    setRoundStep(1)
  }

  const saveStop = async () => {
    const val = document.getElementById('f-stop').value.trim()
    if (!val) return setError('Please fill in your STOP request.')
    setError('')
    await sb.from('rounds').update({ stop_request: val }).eq('id', activeRound.id)
    setActiveRound(prev => ({ ...prev, stop_request: val }))
    setRoundStep(2)
  }

  const submitRound = async () => {
    if (!activeRound.start_request || !activeRound.stop_request) return setError('Both requests must be filled in.')
    if (!activeRound.responder_id) return setError('Your partner needs to accept the invite before you can submit this round.')
    setLoading(true); setError('')
    await sb.from('rounds').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', activeRound.id)
    const responder = activeRound.responder_id === partnership.partner_a_id ? partnership.partner_a : partnership.partner_b
    await callEmail('round_submitted', {
      responderName: responder?.name, responderEmail: responder?.email,
      requesterName: profile?.name, roundId: activeRound.id, roundNumber: activeRound.round_number,
    })
    await loadUserData(user.id)
    setView('dashboard')
  }

  const setRespField = async (type, field, val) => {
    const update = { [`${type}_${field}`]: val }
    await sb.from('rounds').update(update).eq('id', activeRound.id)
    setActiveRound(prev => ({ ...prev, ...update }))
  }

  const submitResponse = async () => {
    if (!activeRound.start_response || !activeRound.stop_response) return setError('Please respond to both requests.')
    setLoading(true); setError('')
    const startPlan = document.getElementById('f-start-plan')?.value ?? activeRound.start_action_plan ?? ''
    const stopPlan = document.getElementById('f-stop-plan')?.value ?? activeRound.stop_action_plan ?? ''
    const startDl = document.getElementById('f-start-deadline')?.value || activeRound.start_deadline || null
    const stopDl = document.getElementById('f-stop-deadline')?.value || activeRound.stop_deadline || null
    const startComp = document.getElementById('f-start-compromise')?.value ?? activeRound.start_compromise_text ?? ''
    const stopComp = document.getElementById('f-stop-compromise')?.value ?? activeRound.stop_compromise_text ?? ''

    const status = (startDl || stopDl) ? 'in_progress' : 'responded'
    const update = {
      status, responded_at: new Date().toISOString(),
      start_action_plan: startPlan, stop_action_plan: stopPlan,
      start_deadline: startDl, stop_deadline: stopDl,
      start_compromise_text: startComp, stop_compromise_text: stopComp,
    }
    await sb.from('rounds').update(update).eq('id', activeRound.id)
    setActiveRound(prev => ({ ...prev, ...update }))

    const requester = activeRound.requester_id === partnership.partner_a_id ? partnership.partner_a : partnership.partner_b
    await callEmail('response_received', {
      requesterName: requester?.name, requesterEmail: requester?.email,
      responderName: profile?.name, roundId: activeRound.id,
      startResponse: activeRound.start_response, stopResponse: activeRound.stop_response,
    })

    const deadline = startDl || stopDl
    if (deadline) {
      for (const p of [partnership.partner_a, partnership.partner_b]) {
        if (!p) continue
        const other = p.id === partnership.partner_a?.id ? partnership.partner_b : partnership.partner_a
        await callEmail('daily_checkin', {
          partnerName: p.name, partnerEmail: p.email,
          otherPartnerName: other?.name, roundId: activeRound.id, deadline,
        })
      }
    }
    await loadUserData(user.id)
    setView('dashboard')
  }

  const completeReview = async () => {
    setLoading(true)
    await sb.from('rounds').update({ status: 'complete' }).eq('id', activeRound.id)
    const deadline = activeRound.start_deadline || activeRound.stop_deadline
    for (const p of [partnership.partner_a, partnership.partner_b]) {
      if (!p) continue
      const other = p.id === partnership.partner_a?.id ? partnership.partner_b : partnership.partner_a
      await callEmail('deadline_review', {
        partnerName: p.name, partnerEmail: p.email,
        otherPartnerName: other?.name, roundId: activeRound.id, deadline,
      })
    }
    await loadUserData(user.id)
    setView('dashboard')
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  // ─── Views ─────────────────────────────────────────────────────────────
  if (view === 'loading') return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: font, color: '#C8A96E', fontStyle: 'italic' }}>Loading...</div>

  const pA = profile?.name ?? 'You'
  const pB = partnerProfile?.name ?? 'Your Partner'
  const uid = user?.id

  const AppContent = () => (
    <>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', padding: '1.6rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>A FRAMEWORK FOR HONEST CONVERSATION</div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 7vw, 2.8rem)', fontWeight: 700 }}>Deal Breakers</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.88rem, 3vw, 1rem)', fontStyle: 'italic', marginTop: '0.4rem' }}>
          Starting and stopping behaviours that compromise your relationship.
        </p>
      </div>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '1.5rem clamp(0.8rem,4vw,1rem)', paddingBottom: '3rem' }}>

        {/* ── Auth ─────────────────────────────────────────────────── */}
        {view === 'auth' && (
          <>
            <Card style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', borderBottom: `2px solid ${G.border}`, marginBottom: '1.5rem' }}>
                {['login', 'signup'].map(t => (
                  <button key={t} onClick={() => { setAuthTab(t); setError('') }} style={{
                    flex: 1, padding: '0.7rem', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: `2px solid ${authTab === t ? G.purple : 'transparent'}`,
                    color: authTab === t ? G.purple : '#aaa',
                    fontSize: '0.82rem', letterSpacing: '0.15em', marginBottom: '-2px', fontFamily: 'inherit',
                  }}>{t === 'login' ? 'LOG IN' : 'SIGN UP'}</button>
                ))}
              </div>
              <form onSubmit={authTab === 'login' ? doLogin : doSignup}>
                {authTab === 'signup' && <Field label="YOUR NAME"><Input id="f-name" placeholder="First name" autoComplete="name" /></Field>}
                <Field label="EMAIL"><Input id="f-email" type="email" placeholder="your@email.com" autoComplete="email" /></Field>
                <Field label="PASSWORD"><Input id="f-pw" type="password" placeholder="••••••••" autoComplete={authTab === 'login' ? 'current-password' : 'new-password'} /></Field>
                {authTab === 'signup' && <Field label="CONFIRM PASSWORD"><Input id="f-pw2" type="password" placeholder="••••••••" autoComplete="new-password" /></Field>}
                <ErrorMsg msg={error} />
                <Btn disabled={loading} style={{ marginTop: '0.8rem' }}>
                  {loading ? '...' : authTab === 'login' ? 'LOG IN →' : 'CREATE ACCOUNT →'}
                </Btn>
              </form>
              {authTab === 'login' && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button onClick={showForgotPassword} style={{ background: 'none', border: 'none', color: G.purple, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
                    Forgot password?
                  </button>
                </div>
              )}
            </Card>
            <InfoBox>"Deal breakers, addressed with honesty and respect, are not the end of a relationship — they are a chance to rebuild it on solid ground."</InfoBox>
          </>
        )}

        {/* ── Invite signup ─────────────────────────────────────────── */}
        {view === 'invite-signup' && (
          <Card style={{ marginTop: '1.5rem' }}>
            <CardTitle>YOU'VE BEEN INVITED</CardTitle>
            <h2 style={{ fontWeight: 400, fontSize: 'clamp(1.2rem,5vw,1.5rem)', marginBottom: '0.5rem' }}>
              {invitePartnerName} has invited you
            </h2>
            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Create your account to join the Deal Breakers dashboard. You'll be connected automatically.
            </p>
            <form onSubmit={doInviteSignup}>
              <Field label="YOUR NAME"><Input id="f-name" placeholder="First name" autoFocus /></Field>
              <Field label="EMAIL"><Input id="f-email" type="email" placeholder="your@email.com" /></Field>
              <Field label="PASSWORD"><Input id="f-pw" type="password" placeholder="Choose a password" /></Field>
              <Field label="CONFIRM PASSWORD"><Input id="f-pw2" type="password" placeholder="Confirm password" /></Field>
              <ErrorMsg msg={error} />
              <Btn disabled={loading}>{loading ? '...' : 'JOIN & CONTINUE →'}</Btn>
            </form>
          </Card>
        )}

        {/* ── Reset password ─────────────────────────────────────────── */}
        {view === 'reset-password' && (
          <Card style={{ marginTop: '1.5rem' }}>
            <CardTitle>RESET YOUR PASSWORD</CardTitle>
            <h2 style={{ fontWeight: 400, fontSize: 'clamp(1.2rem,5vw,1.4rem)', marginBottom: '1rem' }}>Choose a new password</h2>
            <form onSubmit={doResetPassword}>
              <Field label="NEW PASSWORD"><Input id="f-pw" type="password" placeholder="New password" autoFocus /></Field>
              <Field label="CONFIRM PASSWORD"><Input id="f-pw2" type="password" placeholder="Confirm new password" /></Field>
              <ErrorMsg msg={error} />
              <Btn disabled={loading}>{loading ? '...' : 'UPDATE PASSWORD →'}</Btn>
            </form>
          </Card>
        )}

        {/* ── Dashboard ─────────────────────────────────────────────── */}
        {view === 'dashboard' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.2rem 0 1rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: '#aaa' }}>WELCOME BACK</div>
                <div style={{ fontSize: '1.15rem' }}>{profile?.name}</div>
              </div>
              <Btn variant="outline" small onClick={doLogout}>LOG OUT</Btn>
            </div>

            {!partnership ? (
              <>
                <Card>
                  <CardTitle>INVITE YOUR PARTNER</CardTitle>
                  <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.2rem' }}>
                    Send your partner a personalised invite link. Once they sign up you'll be connected and can begin the exercise.
                  </p>
                  <Field label="PARTNER'S EMAIL ADDRESS">
                    <Input id="f-invite-email" type="email" placeholder="partner@email.com" />
                  </Field>
                  <ErrorMsg msg={error} />
                  <Btn disabled={loading} onClick={sendInvite}>{loading ? 'Sending...' : 'SEND INVITATION →'}</Btn>
                </Card>
                <InfoBox>"Deal breakers, addressed with honesty and respect, are not the end of a relationship — they are a chance to rebuild it on solid ground."</InfoBox>
              </>
            ) : (
              <>
                {/* Partnership status */}
                <Card>
                  <CardTitle>YOUR PARTNERSHIP</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem', background: G.cream, border: `1px solid ${G.border}` }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: partnerProfile ? G.dark : '#aaa', color: G.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {partnerProfile ? (partnerProfile.name?.[0] ?? '?').toUpperCase() : '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{partnerProfile?.name ?? partnership.invite_email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{partnerProfile?.email ?? 'Invite pending'}</div>
                      <span style={{
                        display: 'inline-block', fontSize: '0.6rem', letterSpacing: '0.15em', padding: '2px 8px', marginTop: '0.3rem',
                        background: partnerProfile ? '#EDF7ED' : '#FDF6EC',
                        color: partnerProfile ? '#2d6a2d' : '#996633',
                        border: `1px solid ${partnerProfile ? '#90C090' : '#F0D090'}`,
                      }}>{partnerProfile ? 'CONNECTED' : 'INVITE PENDING'}</span>
                    </div>
                  </div>
                  {!partnerProfile && (
                    <div style={{ marginTop: '1rem' }}>
                      <Btn variant="outline" small disabled={loading} onClick={revokeInvite}>
                        {loading ? '...' : 'REVOKE INVITE'}
                      </Btn>
                    </div>
                  )}
                </Card>

                {/* Start round buttons */}
                {partnerProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    <Btn onClick={() => startNewRound(uid)}>+ NEW ROUND — I GO FIRST</Btn>
                    <Btn variant="outline" onClick={() => startNewRound(partnerProfile.id)}>
                      + NEW ROUND — {pB.toUpperCase()} GOES FIRST
                    </Btn>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    <Btn onClick={() => startNewRound(uid)}>+ START DRAFTING YOUR FIRST ROUND</Btn>
                    <p style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '0.2rem' }}>
                      You can prepare your START and STOP requests now. You'll be able to submit them once your partner accepts the invite.
                    </p>
                  </div>
                )}

                {/* Rounds list */}
                {rounds.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: '#aaa', marginBottom: '0.8rem' }}>ROUNDS</div>
                    {rounds.map(r => {
                      const iRequested = r.requester_id === uid
                      const myTurn = (r.status === 'draft' && iRequested) || (r.status === 'submitted' && !iRequested)
                      const statusColors = { complete: '#EDF7ED', responded: '#EDF4F7', in_progress: '#EDF4F7', submitted: '#FDF6EC', draft: '#FDF6EC' }
                      const statusText = { complete: '#2d6a2d', responded: '#1a5a7a', in_progress: '#1a5a7a', submitted: '#996633', draft: '#996633' }
                      return (
                        <div key={r.id} style={{ border: `1px solid ${G.border}`, background: '#fff', marginBottom: '0.8rem' }}>
                          <div style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', color: '#fff', padding: '0.7rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', letterSpacing: '0.1em' }}>
                            <span>ROUND {r.round_number}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              {myTurn && <span style={{ color: G.start, fontSize: '0.72rem' }}>● YOUR TURN</span>}
                              <span style={{
                                fontSize: '0.6rem', letterSpacing: '0.12em', padding: '2px 8px',
                                background: statusColors[r.status] ?? '#eee',
                                color: statusText[r.status] ?? '#555',
                                border: '1px solid currentColor',
                              }}>{r.status.toUpperCase().replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.7rem' }}>
                              {iRequested ? 'You are requesting' : `${partnerProfile?.name ?? pB} is requesting`}
                            </div>
                            {r.start_request
                              ? <ReqBlock text={r.start_request.substring(0, 100) + (r.start_request.length > 100 ? '...' : '')} type="start" />
                              : <ReqBlock text="Not yet filled in" type="start" />}
                            {r.stop_request
                              ? <ReqBlock text={r.stop_request.substring(0, 100) + (r.stop_request.length > 100 ? '...' : '')} type="stop" />
                              : <ReqBlock text="Not yet filled in" type="stop" />}
                            <Btn small variant="primary" onClick={() => openRound(r.id)} style={{ marginTop: '0.6rem' }}>
                              {r.status === 'draft' && iRequested ? 'CONTINUE FILLING IN →'
                                : r.status === 'submitted' && !iRequested ? 'RESPOND NOW →'
                                  : 'VIEW & REVIEW →'}
                            </Btn>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
                {rounds.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '2rem 0' }}>
                    {partnerProfile ? 'No rounds yet. Start your first round above.' : 'No drafts yet. Start preparing your first round above.'}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Round create ──────────────────────────────────────────── */}
        {view === 'round-create' && (
          <>
            <Btn variant="outline" small onClick={() => setView('dashboard')} style={{ marginBottom: '1rem' }}>← BACK</Btn>
            <Stepper
              steps={[
                { id: 'start', label: 'Start', icon: '△', color: G.start },
                { id: 'stop', label: 'Stop', icon: '▽', color: G.stop },
                { id: 'submit', label: 'Submit', icon: '✦', color: G.purple },
              ]}
              current={roundStep}
            />

            {roundStep === 0 && (
              <>
                <DescBox color={G.start}>
                  <strong>△ START Request —</strong> Describe a behaviour you need your partner to <strong>START</strong> doing. Be specific: what, by when, why it matters, and the consequence if it doesn't happen.
                </DescBox>
                <Card style={{ background: '#FFF8F4', border: `1px dashed ${G.start}` }}>
                  <CardTitle color={G.start}>TEMPLATE</CardTitle>
                  <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#666', lineHeight: 1.8 }}>
                    I need you to [action] by [deadline] in order to [reason]. It is important to me because [motivation]. If this does not happen, [consequence].
                  </p>
                </Card>
                <Card>
                  <CardTitle color={G.start}>YOUR START REQUEST</CardTitle>
                  <TextArea id="f-start" rows={6} placeholder="I need you to start..." borderColor={G.start} defaultValue={activeRound?.start_request ?? ''} />
                </Card>
                <ErrorMsg msg={error} />
                <Btn onClick={saveStart}>NEXT: STOP REQUEST →</Btn>
              </>
            )}

            {roundStep === 1 && (
              <>
                <DescBox color={G.stop}>
                  <strong>▽ STOP Request —</strong> Describe a behaviour you need your partner to <strong>STOP</strong> doing. Specific, time-bound, and focused on the behaviour — not the person.
                </DescBox>
                <Card style={{ background: '#FDF4FF', border: `1px dashed ${G.stop}` }}>
                  <CardTitle color={G.stop}>TEMPLATE</CardTitle>
                  <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#666', lineHeight: 1.8 }}>
                    I need you to STOP [behaviour] by [deadline] in order to [reason]. It is important to me because [motivation]. If this does not happen, [consequence].
                  </p>
                </Card>
                <Card>
                  <CardTitle color={G.stop}>YOUR STOP REQUEST</CardTitle>
                  <TextArea id="f-stop" rows={6} placeholder="I need you to stop..." borderColor={G.stop} defaultValue={activeRound?.stop_request ?? ''} />
                </Card>
                <ErrorMsg msg={error} />
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <Btn variant="outline" onClick={() => setRoundStep(0)}>← BACK</Btn>
                  <Btn onClick={saveStop}>NEXT: REVIEW & SUBMIT →</Btn>
                </div>
              </>
            )}

            {roundStep === 2 && (
              <>
                <DescBox>
                  <strong>✦ Review & Submit —</strong> Review your requests before sending. Once submitted your partner will be notified by email.
                </DescBox>
                {activeRound?.start_request && <ReqBlock text={activeRound.start_request} type="start" />}
                {activeRound?.stop_request && <ReqBlock text={activeRound.stop_request} type="stop" />}
                {!activeRound?.responder_id && (
                  <Card style={{ background: '#FDF6EC', border: `1px dashed ${G.purple}`, marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#7a5a1a', lineHeight: 1.7, margin: 0 }}>
                      <strong>Waiting on your partner —</strong> your invite is still pending. You can keep editing this draft, and you'll be able to submit it as soon as your partner accepts the invite.
                    </p>
                  </Card>
                )}
                <ErrorMsg msg={error} />
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                  <Btn variant="outline" onClick={() => setRoundStep(1)}>← BACK</Btn>
                  <Btn disabled={loading || !activeRound?.responder_id} onClick={submitRound}>
                    {loading ? 'Submitting...' : !activeRound?.responder_id ? 'AWAITING PARTNER' : 'SUBMIT TO PARTNER →'}
                  </Btn>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Round respond ─────────────────────────────────────────── */}
        {view === 'round-respond' && (
          <>
            <Btn variant="outline" small onClick={() => setView('dashboard')} style={{ marginBottom: '1rem' }}>← BACK</Btn>
            <DescBox>
              <strong>◇ Respond to Round {activeRound?.round_number} —</strong> Review each request. Accept, Compromise, or Reject. If you accept or compromise, write a clear action plan with a deadline.
            </DescBox>

            {['start', 'stop'].map(type => {
              const isStart = type === 'start'
              const color = isStart ? G.start : G.stop
              const label = isStart ? '△ START REQUEST' : '▽ STOP REQUEST'
              const req = isStart ? activeRound?.start_request : activeRound?.stop_request
              const resp = isStart ? activeRound?.start_response : activeRound?.stop_response
              const plan = isStart ? activeRound?.start_action_plan : activeRound?.stop_action_plan
              const dl = isStart ? activeRound?.start_deadline : activeRound?.stop_deadline
              const comp = isStart ? activeRound?.start_compromise_text : activeRound?.stop_compromise_text
              const setResp = (val) => setRespField(type, 'response', val)
              const planId = `f-${type}-plan`
              const dlId = `f-${type}-deadline`
              const compId = `f-${type}-compromise`

              return (
                <Card key={type}>
                  <CardTitle color={color}>{label}</CardTitle>
                  {req && <ReqBlock text={req} type={type} />}
                  <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '0.8rem' }}>Your response:</p>
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: resp === 'accepted' || resp === 'compromised' ? '1rem' : 0 }}>
                    <Pill label="Accept" active={resp === 'accepted'} activeClass="accept" onClick={() => setResp('accepted')} />
                    <Pill label="Compromise" active={resp === 'compromised'} activeClass="compromise" onClick={() => setResp('compromised')} />
                    <Pill label="Reject" active={resp === 'rejected'} activeClass="reject" onClick={() => setResp('rejected')} />
                  </div>
                  {resp === 'compromised' && (
                    <div style={{ marginTop: '0.8rem' }}>
                      <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '0.4rem' }}>Describe your compromise:</p>
                      <TextArea id={compId} placeholder="I would be willing to commit if..." rows={3} borderColor={G.purple} defaultValue={comp ?? ''} />
                    </div>
                  )}
                  {resp === 'rejected' && (
                    <div style={{ marginTop: '0.8rem' }}>
                      <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '0.4rem' }}>Reason for rejection:</p>
                      <TextArea id={compId} placeholder="I am unable to commit because..." rows={3} borderColor="#C9A0A0" defaultValue={comp ?? ''} />
                    </div>
                  )}
                  {(resp === 'accepted' || resp === 'compromised') && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '0.4rem' }}>Your action plan (specific steps):</p>
                      <TextArea id={planId} rows={4} placeholder="Step 1: ...\nStep 2: ..." borderColor={color} defaultValue={plan ?? ''} />
                      <p style={{ fontSize: '0.88rem', color: '#555', margin: '0.8rem 0 0.4rem' }}>Deadline:</p>
                      <input type="date" id={dlId} defaultValue={dl ?? ''} style={{ width: '100%', border: 'none', borderBottom: `2px solid ${color}`, background: 'transparent', padding: '0.4rem 0.2rem', fontSize: '1rem', fontFamily: 'inherit', color: G.dark, outline: 'none' }} />
                    </div>
                  )}
                </Card>
              )
            })}

            <ErrorMsg msg={error} />
            <Btn disabled={loading} onClick={submitResponse}>{loading ? 'Saving...' : 'SUBMIT RESPONSE →'}</Btn>
          </>
        )}

        {/* ── Round view ─────────────────────────────────────────────── */}
        {view === 'round-view' && activeRound && (
          <>
            <Btn variant="outline" small onClick={() => setView('dashboard')} style={{ marginBottom: '1rem' }}>← BACK</Btn>
            <div style={{ border: `1px solid ${G.border}`, background: '#fff' }}>
              <div style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', color: '#fff', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                <span>ROUND {activeRound.round_number}</span>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', padding: '2px 8px', background: activeRound.status === 'complete' ? '#EDF7ED' : '#EDF4F7', color: activeRound.status === 'complete' ? '#2d6a2d' : '#1a5a7a', border: '1px solid currentColor' }}>
                  {activeRound.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <div style={{ padding: '1.2rem' }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: '#aaa', marginBottom: '1rem' }}>
                  {activeRound.requester_id === uid ? `You requested · ${pB} responded` : `${pB} requested · You responded`}
                </div>

                {['start', 'stop'].map(type => {
                  const isStart = type === 'start'
                  const color = isStart ? G.start : G.stop
                  const label = isStart ? '△ START' : '▽ STOP'
                  const req = isStart ? activeRound.start_request : activeRound.stop_request
                  const resp = isStart ? activeRound.start_response : activeRound.stop_response
                  const plan = isStart ? activeRound.start_action_plan : activeRound.stop_action_plan
                  const dl = isStart ? activeRound.start_deadline : activeRound.stop_deadline
                  const comp = isStart ? activeRound.start_compromise_text : activeRound.stop_compromise_text
                  const respLabel = { accepted: '✓ Accepted', compromised: '~ Compromised', rejected: '✗ Rejected' }
                  const respColor = { accepted: G.green, compromised: G.purple, rejected: '#C9A0A0' }

                  return (
                    <div key={type} style={{ marginBottom: '1.2rem' }}>
                      <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color, marginBottom: '0.5rem' }}>{label}</div>
                      {req && <ReqBlock text={req} type={type} />}
                      {resp && <div style={{ fontSize: '0.9rem', color: respColor[resp], marginTop: '0.4rem' }}>{respLabel[resp]}</div>}
                      {comp && <div style={{ fontSize: '0.88rem', color: '#666', fontStyle: 'italic', marginTop: '0.3rem' }}>"{comp}"</div>}
                      {plan && <div style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.5rem' }}><strong>Action plan:</strong> {plan}</div>}
                      {dl && <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.3rem' }}>Deadline: {fmtDate(dl)}</div>}
                    </div>
                  )
                })}

                {activeRound.status !== 'complete' && (activeRound.start_response || activeRound.stop_response) && (
                  <Btn onClick={() => setView('round-review')}>COMPLETE REVIEW →</Btn>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Review ────────────────────────────────────────────────── */}
        {view === 'round-review' && activeRound && (
          <>
            <Btn variant="outline" small onClick={() => setView('round-view')} style={{ marginBottom: '1rem' }}>← BACK</Btn>
            <DescBox>
              <strong>✦ Review —</strong> Complete this together on the deadline date. Answer honestly — the goal is clarity, not blame.
            </DescBox>

            {[['start', revStart, setRevStart, revStartReas, setRevStartReas, revStartWill, setRevStartWill],
              ['stop', revStop, setRevStop, revStopReas, setRevStopReas, revStopWill, setRevStopWill]].map(
              ([type, rev, setRev, reas, setReas, will, setWill]) => {
                const isStart = type === 'start'
                const color = isStart ? G.start : G.stop
                const label = isStart ? '△ START — REVIEW' : '▽ STOP — REVIEW'
                const req = isStart ? activeRound.start_request : activeRound.stop_request
                const resp = isStart ? activeRound.start_response : activeRound.stop_response
                const dl = isStart ? activeRound.start_deadline : activeRound.stop_deadline
                if (resp === 'rejected') return (
                  <Card key={type} borderLeft={color}>
                    <CardTitle color={color}>{label}</CardTitle>
                    <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.95rem' }}>This request was rejected — no review needed.</p>
                  </Card>
                )
                return (
                  <Card key={type} borderLeft={color}>
                    <CardTitle color={color}>{label}{dl ? ` · DUE ${fmtDate(dl)}` : ''}</CardTitle>
                    {req && <ReqBlock text={req} type={type} />}
                    <p style={{ fontSize: '0.97rem', fontWeight: 600, marginBottom: '0.6rem' }}>Was this request fulfilled by the deadline?</p>
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                      <Pill label="Yes ✓" active={rev === 'yes'} activeClass="accept" onClick={() => setRev('yes')} />
                      <Pill label="No ✗" active={rev === 'no'} activeClass="reject" onClick={() => setRev('no')} />
                    </div>
                    {rev === 'yes' && <SuccessBox>✓ Request fulfilled. Well done to both partners.</SuccessBox>}
                    {rev === 'no' && (
                      <>
                        <p style={{ fontSize: '0.97rem', fontWeight: 600, marginBottom: '0.6rem' }}>Did your partner take reasonable steps to try?</p>
                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                          <Pill label="Yes" active={reas === 'yes'} activeClass="accept" onClick={() => setReas('yes')} />
                          <Pill label="No" active={reas === 'no'} activeClass="reject" onClick={() => setReas('no')} />
                        </div>
                        {reas === 'yes' && (
                          <>
                            <p style={{ fontSize: '0.97rem', fontWeight: 600, marginBottom: '0.6rem' }}>Are you willing to give them another opportunity?</p>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <Pill label="Yes — restart" active={will === 'yes'} activeClass="accept" onClick={() => setWill('yes')} />
                              <Pill label="No" active={will === 'no'} activeClass="reject" onClick={() => setWill('no')} />
                            </div>
                            {will === 'yes' && <SuccessBox>↻ Restart this request with a rephrased version and a new final deadline.</SuccessBox>}
                            {will === 'no' && <WarnBox>This may signal an incompatibility that warrants a deeper conversation — consider seeking professional support.</WarnBox>}
                          </>
                        )}
                        {reas === 'no' && <WarnBox>This request was not fulfilled and no reasonable effort was made. Worth discussing honestly — possibly with a counsellor.</WarnBox>}
                      </>
                    )}
                  </Card>
                )
              }
            )}

            <Card style={{ border: `1px solid ${G.purple}` }}>
              <CardTitle>NEXT STEPS</CardTitle>
              <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.8 }}>
                Once this round is complete, swap roles. {pB} becomes the Requesting Partner and {pA} becomes the Responding Partner.
              </p>
            </Card>
            <Btn disabled={loading} onClick={completeReview}>{loading ? 'Saving...' : 'MARK ROUND COMPLETE →'}</Btn>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#aaa', fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.8 }}>
          Your responses are private until you choose to share them.<br />
          Approach this exercise with honesty, patience, and good faith.
        </div>
      </div>
    </>
  )

  return <AppContent />
}
