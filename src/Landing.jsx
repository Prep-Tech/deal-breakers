import { useEffect, useRef } from 'react'

const G = {
  gold: '#C8A96E', dark: '#1C1C1C', cream: '#F7F4EF',
  border: '#E5DDD0', start: '#E8A87C', stop: '#C9A0C5',
  green: '#A8C5A0', blue: '#7EB8C9',
}



export default function Landing({ onSignUp, onLogin }) {
  const stepsRef = useRef([])
  const mockupsRef = useRef([])

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1'
          e.target.style.transform = 'translateY(0)'
        }
      })
    }, { threshold: 0.15 })

    stepsRef.current.forEach(el => el && io.observe(el))
    mockupsRef.current.forEach(el => el && io.observe(el))

    return () => { io.disconnect() }
  }, [])

  const fadeInUp = { opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease' }

  return (
    <div style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", background: G.cream, color: G.dark, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .hero-anim { animation: fadeInUp 0.8s ease both; }
        .hero-anim-1 { animation: fadeInUp 0.8s ease 0.15s both; }
        .hero-anim-2 { animation: fadeInUp 0.8s ease 0.28s both; }
        .hero-anim-3 { animation: fadeInUp 0.8s ease 0.4s both; }
        .btn-gold { background:${G.gold}; color:${G.dark}; border:none; padding:0.9rem 2.2rem; font-size:0.85rem; letter-spacing:0.2em; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-block; transition:opacity 0.2s; }
        .btn-gold:hover { opacity:0.88; }
        .btn-outline { background:transparent; color:${G.gold}; border:1px solid ${G.gold}; padding:0.9rem 2.2rem; font-size:0.85rem; letter-spacing:0.2em; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-block; transition:all 0.2s; }
        .btn-outline:hover { background:${G.gold}; color:${G.dark}; }
        .feature-card:hover { border-color:${G.gold}; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: G.dark, padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #333` }}>
        <div style={{ color: G.gold, fontSize: '1rem', letterSpacing: '0.1em' }}>Deal Breakers</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '0.15em', textDecoration: 'none' }}>HOW IT WORKS</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onLogin&&onLogin();}} style={{ color: G.gold, fontSize: '0.75rem', letterSpacing: '0.15em', textDecoration: 'none', padding: '0.5rem 1rem', border: `1px solid ${G.gold}` }}>LOG IN</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} className="btn-gold" style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>SIGN UP FREE</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: G.dark, padding: 'clamp(4rem,10vw,7rem) 1.5rem clamp(3rem,8vw,5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg,${G.gold} 0,${G.gold} 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,${G.gold} 0,${G.gold} 1px,transparent 1px,transparent 60px)` }} />
        <div style={{ position: 'relative' }}>
          <div className="hero-anim" style={{ fontSize: '0.7rem', letterSpacing: '0.38em', color: '#555', marginBottom: '1rem' }}>A FRAMEWORK FOR HONEST CONVERSATION</div>
          <h1 className="hero-anim" style={{ fontSize: 'clamp(3.2rem,11vw,6rem)', fontWeight: 400, color: G.gold, lineHeight: 1.02, marginBottom: '1.5rem' }}>Deal Breakers</h1>
          <div className="hero-anim-1" style={{ width: 60, height: 2, background: G.gold, margin: '0 auto 2rem', opacity: 0.5 }} />
          <p className="hero-anim-1" style={{ fontSize: 'clamp(1rem,3vw,1.3rem)', color: '#aaa', fontStyle: 'italic', maxWidth: 580, margin: '0 auto 2.8rem', lineHeight: 1.85 }}>
            Starting and stopping behaviours that compromise your relationship — addressed with structure, honesty, and respect.
          </p>
          <div className="hero-anim-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} className="btn-gold">SIGN UP FREE →</a>
            <a href="#how-it-works" className="btn-outline">HOW IT WORKS</a>
          </div>
          <div className="hero-anim-3" style={{ marginTop: '3rem', display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Free', 'No subscription ever'], ['Private', 'Your data stays yours'], ['Structured', 'A real framework']].map(([t, s]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ color: G.gold, fontSize: '1.1rem', fontWeight: 400 }}>{t}</div>
                <div style={{ color: '#555', fontSize: '0.8rem', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PREMISE */}
      <div style={{ maxWidth: 860, margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ borderTop: `2px solid ${G.gold}`, borderBottom: `2px solid ${G.gold}`, padding: '1.8rem 2rem', fontStyle: 'italic', color: '#444', textAlign: 'center', fontSize: 'clamp(1rem,3vw,1.15rem)', lineHeight: 1.9 }}>
          "Deal breakers are the presence or the lack of specific actions or behaviours that one or both partners find intolerable. Left unchecked, they become the root of irreparable damage to the relationship."
        </div>
      </div>

      {/* WHAT IS IT */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.3em', color: G.gold, marginBottom: '0.8rem' }}>WHAT IS DEAL BREAKERS</div>
        <h2 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.2rem' }}>A structured exercise for couples who want to stop avoiding hard conversations.</h2>
        <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.9, maxWidth: 680 }}>
          Most couples know what needs to change. The problem isn't awareness — it's the conversation itself. Without structure, requests become accusations. Without accountability, commitments fade. Deal Breakers gives you both a clear, respectful framework to ask for what you need, respond honestly, and actually follow through.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.2rem', marginTop: '3rem' }}>
          {[
            { icon: '◇', color: G.gold, bg: '#F7F4EF', title: 'Shared dashboard', body: 'Both partners see the same requests, responses, and commitments in one private space.' },
            { icon: '△', color: G.start, bg: '#FFF8F4', title: 'START requests', body: 'Ask your partner to begin a behaviour that matters to you — with a clear deadline and consequence.' },
            { icon: '▽', color: G.stop, bg: '#FDF4FF', title: 'STOP requests', body: 'Name what needs to stop — specifically, respectfully, and in your own words.' },
            { icon: '✓', color: G.green, bg: '#F0FFF4', title: 'Action plans & deadlines', body: 'Responses come with real commitments: steps, dates, and daily reminders to keep both partners accountable.' },
            { icon: '✦', color: G.blue, bg: '#F0F8FF', title: 'Built-in review', body: 'On the deadline date, you review together. The decision tree guides what happens next.' },
            { icon: '@', color: '#888', bg: '#F7F4EF', title: 'Email notifications', body: 'Both partners are notified at every step — submissions, responses, reminders, and review prompts.' },
          ].map(f => (
            <div key={f.title} className="feature-card" style={{ background: '#fff', border: `1px solid ${G.border}`, padding: '1.6rem', transition: 'border-color 0.2s' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '0.9rem' }}>{f.icon}</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.8 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: G.border }} />

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.3em', color: G.gold, marginBottom: '0.8rem' }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '0.5rem' }}>Five steps. One round. Both sides heard.</h2>
        <div style={{ marginTop: '2.5rem' }}>
          {[
            { n: '1', title: 'Sign up and invite your partner', desc: 'Create your account, then send your partner a personalised email invite. Once they sign up you\'re automatically connected to a shared dashboard.' },
            { n: '2', title: 'Choose who goes first and start Round 1', desc: 'Either partner can go first. The requesting partner fills in one START behaviour and one STOP behaviour they need from their partner — using guided templates.' },
            { n: '3', title: 'Partner B responds', desc: 'Partner B is notified by email with a direct link. They can Accept, Propose a Compromise, or Reject each request — and if they accept, they write a clear action plan with a deadline.' },
            { n: '4', title: 'Daily check-ins keep commitments alive', desc: 'Both partners receive daily reminder emails until the deadline. Small daily accountability compounds into real change.' },
            { n: '5', title: 'Review on the deadline date', desc: 'Was it fulfilled? Did they try? Are you willing to try again? The review section walks you through the decision tree and determines what happens next — including whether to restart, reassess, or seek further support.' },
          ].map((s, i) => (
            <div key={s.n} ref={el => stepsRef.current[i] = el} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: `1px solid ${G.border}`, ...fadeInUp, transitionDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '2.5rem', color: G.gold, fontWeight: 400, lineHeight: 1, flexShrink: 0, width: 48, textAlign: 'right' }}>{s.n}</div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.4rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.8 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOCKUPS */}
      <div style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.3em', color: G.gold, marginBottom: '0.8rem' }}>INSIDE THE APP</div>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 400, marginBottom: '0.5rem' }}>Everything in one place</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              {
                delay: '0s', header: '△ START REQUEST',
                content: (
                  <div>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: '#aaa', marginBottom: '0.5rem' }}>TEMPLATE</div>
                    <div style={{ fontSize: '0.82rem', color: '#888', fontStyle: 'italic', lineHeight: 1.7, borderBottom: `1px solid ${G.border}`, paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>I need you to [action] by [deadline] in order to [reason]...</div>
                    <div style={{ borderBottom: `2px solid ${G.start}`, padding: '0.4rem 0', fontSize: '0.9rem', color: G.dark, lineHeight: 1.7 }}>I need you to put your phone away during dinner by Friday in order to be more present with our family.</div>
                    <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: '#aaa', textAlign: 'right' }}>Partner B will be notified ↓</div>
                  </div>
                )
              },
              {
                delay: '0.15s', header: '◇ PARTNER B RESPONDS',
                content: (
                  <div>
                    <div style={{ borderLeft: `4px solid ${G.start}`, background: G.cream, padding: '0.7rem 0.9rem', marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: G.start, marginBottom: '0.3rem' }}>START</div>
                      <div style={{ fontSize: '0.83rem', color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>"I need you to put your phone away during dinner..."</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      {['Accept', 'Compromise', 'Reject'].map((p, i) => (
                        <div key={p} style={{ flex: 1, padding: '0.4rem 0.3rem', fontSize: '0.75rem', border: `1px solid ${G.border}`, textAlign: 'center', color: i === 0 ? '#fff' : '#888', background: i === 0 ? G.green : '#fff', fontFamily: 'inherit' }}>{p}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: '0.4rem' }}>Action plan:</div>
                    <div style={{ borderBottom: `2px solid ${G.start}`, padding: '0.4rem 0', fontSize: '0.85rem', color: '#333', lineHeight: 1.6 }}>Step 1: Phone stays in bedroom during meals. Deadline: Sunday 13 April.</div>
                  </div>
                )
              },
              {
                delay: '0.3s', header: 'DASHBOARD — ROUND 1',
                content: (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Sarah & James</div>
                      <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', padding: '2px 8px', background: '#EDF4F7', color: '#1a5a7a', border: '1px solid #90C0D0' }}>IN PROGRESS</span>
                    </div>
                    {[
                      { type: 'start', color: G.start, label: 'START', text: '"Put phone away during dinner..."' },
                      { type: 'stop', color: G.stop, label: 'STOP', text: '"Interrupting me mid-sentence..."' },
                    ].map(r => (
                      <div key={r.type} style={{ borderLeft: `4px solid ${r.color}`, background: G.cream, padding: '0.7rem 0.9rem', marginBottom: '0.7rem' }}>
                        <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: r.color, marginBottom: '0.3rem' }}>{r.label}</div>
                        <div style={{ fontSize: '0.85rem', color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>{r.text}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.4rem' }}>Deadline: 13 April · Daily reminders active</div>
                  </div>
                )
              },
            ].map((m, i) => (
              <div key={i} ref={el => mockupsRef.current[i] = el} style={{ border: `1px solid ${G.border}`, overflow: 'hidden', ...fadeInUp, transitionDelay: m.delay }}>
                <div style={{ background: G.dark, padding: '0.75rem 1.1rem', fontSize: '0.7rem', letterSpacing: '0.18em', color: G.gold }}>{m.header}</div>
                <div style={{ padding: '1.2rem' }}>{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: G.border }} />

      {/* WHO IS IT FOR */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.3em', color: G.gold, marginBottom: '0.8rem' }}>WHO IS IT FOR</div>
        <h2 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.2rem' }}>For couples who still believe it's worth trying.</h2>
        <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.9, maxWidth: 680, marginBottom: '2.5rem' }}>
          Deal Breakers isn't couples therapy. It's a tool for couples who want to have difficult conversations without them becoming arguments — who know what needs to change but don't know how to ask for it without things going sideways. It works alongside a counsellor, but can also be used independently.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.2rem' }}>
          {[
            { color: G.gold, title: 'Couples in conflict', desc: 'Who feel stuck in the same arguments and need a new way through.' },
            { color: G.start, title: 'Couples in counselling', desc: 'As a structured tool to carry the work from session into daily life.' },
            { color: G.stop, title: 'Couples rebuilding trust', desc: 'Who need concrete commitments and accountability, not just words.' },
            { color: G.green, title: 'Proactive couples', desc: 'Who want to address things before they become relationship-defining problems.' },
          ].map(w => (
            <div key={w.title} style={{ borderTop: `2px solid ${w.color}`, paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500, marginBottom: '0.4rem' }}>{w.title}</div>
              <div style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.7 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ background: G.dark, padding: 'clamp(4rem,10vw,6rem) 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.35em', color: '#555', marginBottom: '1rem' }}>FREE TO USE — NO SUBSCRIPTION</div>
        <h2 style={{ color: G.gold, fontSize: 'clamp(2rem,7vw,3.8rem)', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.1 }}>Start your first round today.</h2>
        <p style={{ color: '#888', fontStyle: 'italic', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>No subscription. No therapist required. Just honesty and a structure that holds.</p>
        <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} className="btn-gold" style={{ fontSize: '0.9rem', padding: '1rem 2.8rem' }}>SIGN UP FREE →</a>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#111', padding: '1.8rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.2em', color: '#333' }}>DEAL BREAKERS</div>
        <div style={{ fontSize: '0.75rem', color: '#333', marginTop: '0.3rem', letterSpacing: '0.1em' }}>A FRAMEWORK FOR HONEST CONVERSATION</div>
      </div>
    </div>
  )
}
