import { useEffect, useRef } from 'react'

const G = {
  purple: '#A06CD5', darkPurple: '#7B4FA8', dark: '#1a1a1a', cream: '#F7F4EF',
  border: '#e0dcd7', start: '#3AAFB9', stop: '#C60F7B',
  green: '#22c55f', blue: '#3AAFB9',
}
const font = "'Montserrat', sans-serif"

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
    <div style={{ fontFamily: font, background: G.cream, color: G.dark, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .hero-anim { animation: fadeInUp 0.8s ease both; }
        .hero-anim-1 { animation: fadeInUp 0.8s ease 0.15s both; }
        .hero-anim-2 { animation: fadeInUp 0.8s ease 0.28s both; }
        .hero-anim-3 { animation: fadeInUp 0.8s ease 0.4s both; }
        .btn-primary { background:${G.purple}; color:#fff; border:none; padding:1rem 2.5rem; font-size:1rem; letter-spacing:0.2em; font-weight:600; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-block; transition:opacity 0.2s; border-radius:3px; }
        .btn-primary:hover { opacity:0.88; }
        .btn-outline { background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.5); padding:1rem 2.5rem; font-size:1rem; letter-spacing:0.2em; font-weight:600; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-block; transition:all 0.2s; border-radius:3px; }
        .btn-outline:hover { background:rgba(255,255,255,0.15); }
        .feature-card:hover { border-color:${G.purple}; box-shadow:0 4px 16px rgba(160,108,213,0.1); }
      `}</style>

      {/* NAV */}
      <nav style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.05em' }}>Deal Breakers</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', letterSpacing: '0.15em', textDecoration: 'none', fontWeight: 600 }}>HOW IT WORKS</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onLogin&&onLogin();}} style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '0.15em', textDecoration: 'none', padding: '0.5rem 1.2rem', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 3, fontWeight: 600 }}>LOG IN</a>
          <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} style={{ background: '#fff', color: G.purple, padding: '0.5rem 1.2rem', fontSize: '0.85rem', letterSpacing: '0.15em', borderRadius: 3, fontWeight: 600, textDecoration: 'none', border: 'none' }}>SIGN UP FREE</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', padding: 'clamp(4rem,10vw,7rem) 1.5rem clamp(3rem,8vw,5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <div className="hero-anim" style={{ fontSize: '0.85rem', letterSpacing: '0.38em', color: 'rgba(255,255,255,0.6)', marginBottom: '1.2rem', fontWeight: 600 }}>A FRAMEWORK FOR HONEST CONVERSATION</div>
          <h1 className="hero-anim" style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: '1.5rem' }}>Deal Breakers</h1>
          <div className="hero-anim-1" style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.4)', margin: '0 auto 2rem', borderRadius: 2 }} />
          <p className="hero-anim-1" style={{ fontSize: 'clamp(1.05rem,3vw,1.3rem)', color: 'rgba(255,255,255,0.85)', maxWidth: 640, margin: '0 auto 2.8rem', lineHeight: 1.6 }}>
            Starting and stopping behaviours that compromise your relationship — addressed with structure, honesty, and respect.
          </p>
          <div className="hero-anim-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} style={{ background: '#fff', color: G.purple, padding: '1rem 2.5rem', fontSize: '1rem', letterSpacing: '0.2em', fontWeight: 700, borderRadius: 3, textDecoration: 'none', border: 'none' }}>SIGN UP FREE →</a>
            <a href="#how-it-works" className="btn-outline">HOW IT WORKS</a>
          </div>
          <div className="hero-anim-3" style={{ marginTop: '3rem', display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Free', 'No subscription ever'], ['Private', 'Your data stays yours'], ['Structured', 'A real framework']].map(([t, s]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 600 }}>{t}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.3rem' }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PREMISE */}
      <div style={{ maxWidth: 860, margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ borderLeft: `3px solid ${G.purple}`, background: '#fff', padding: '2rem 2.2rem', color: '#444', fontSize: 'clamp(1.05rem,3vw,1.15rem)', lineHeight: 1.6, fontStyle: 'italic', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          "Deal breakers are the presence or the lack of specific actions or behaviours that one or both partners find intolerable. Left unchecked, they become the root of irreparable damage to the relationship."
        </div>
      </div>

      {/* WHAT IS IT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: G.purple, marginBottom: '1rem', fontWeight: 700 }}>WHAT IS DEAL BREAKERS</div>
        <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '1.2rem' }}>A structured exercise for couples who want to stop avoiding hard conversations.</h2>
        <p style={{ fontSize: '1.12rem', color: '#444', lineHeight: 1.6, maxWidth: 720 }}>
          Most couples know what needs to change. The problem isn't awareness — it's the conversation itself. Without structure, requests become accusations. Without accountability, commitments fade. Deal Breakers gives you both a clear, respectful framework to ask for what you need, respond honestly, and actually follow through.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          {[
            { icon: '◇', color: G.purple, title: 'Shared Dashboard', body: 'Both partners see the same requests, responses, and commitments in one private space.' },
            { icon: '△', color: G.start, title: 'START Requests', body: 'Ask your partner to begin a behaviour that matters to you — with a clear deadline and consequence.' },
            { icon: '▽', color: G.stop, title: 'STOP Requests', body: 'Name what needs to stop — specifically, respectfully, and in your own words.' },
            { icon: '✓', color: G.green, title: 'Action Plans & Deadlines', body: 'Responses come with real commitments: steps, dates, and daily reminders to keep both partners accountable.' },
            { icon: '✦', color: G.blue, title: 'Built-in Review', body: 'On the deadline date, you review together. A guided process determines what happens next.' },
            { icon: '@', color: '#777', title: 'Email Notifications', body: 'Both partners are notified at every step — submissions, responses, reminders, and review prompts.' },
          ].map(f => (
            <div key={f.title} className="feature-card" style={{ background: '#fff', border: `1px solid ${G.border}`, padding: '1.8rem', borderRadius: 4, transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>{f.icon}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</div>
              <div style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: G.border }} />

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: G.purple, marginBottom: '1rem', fontWeight: 700 }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '0.5rem' }}>Five Steps. One Round. Both Sides Heard.</h2>
        <div style={{ marginTop: '2.5rem' }}>
          {[
            { n: '1', title: 'Sign Up and Invite Your Partner', desc: 'Create your account, then send your partner a personalised email invite. Once they sign up you\'re automatically connected to a shared dashboard.' },
            { n: '2', title: 'Choose Who Goes First and Start Round 1', desc: 'Either partner can go first. The requesting partner fills in one START behaviour and one STOP behaviour they need from their partner — using guided templates.' },
            { n: '3', title: 'Partner B Responds', desc: 'Partner B is notified by email with a direct link. They can Accept, Propose a Compromise, or Reject each request — and if they accept, they write a clear action plan with a deadline.' },
            { n: '4', title: 'Daily Check-ins Keep Commitments Alive', desc: 'Both partners receive daily reminder emails until the deadline. Small daily accountability compounds into real change.' },
            { n: '5', title: 'Review on the Deadline Date', desc: 'Was it fulfilled? Did they try? Are you willing to try again? The review section walks you through a guided process and determines what happens next — including whether to restart, reassess, or seek further support.' },
          ].map((s, i) => (
            <div key={s.n} ref={el => stepsRef.current[i] = el} style={{ display: 'flex', gap: '1.5rem', padding: '1.8rem 0', borderBottom: `1px solid ${G.border}`, ...fadeInUp, transitionDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '2.5rem', color: G.purple, fontWeight: 700, lineHeight: 1, flexShrink: 0, width: 48, textAlign: 'right' }}>{s.n}</div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.title}</div>
                <div style={{ fontSize: '1rem', color: '#444', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOCKUPS */}
      <div style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: G.purple, marginBottom: '1rem', fontWeight: 700 }}>INSIDE THE APP</div>
          <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 600, marginBottom: '0.5rem' }}>Everything in One Place</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              {
                delay: '0s', header: '△ START REQUEST', headerColor: G.start,
                content: (
                  <div>
                    <div style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: '#aaa', marginBottom: '0.6rem', fontWeight: 600 }}>TEMPLATE</div>
                    <div style={{ fontSize: '0.95rem', color: '#777', fontStyle: 'italic', lineHeight: 1.6, borderBottom: `1px solid ${G.border}`, paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>I need you to [action] by [deadline] in order to [reason]...</div>
                    <div style={{ borderLeft: `3px solid ${G.start}`, paddingLeft: '0.8rem', fontSize: '1rem', color: G.dark, lineHeight: 1.6 }}>I need you to put your phone away during dinner by Friday in order to be more present with our family.</div>
                    <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#aaa', textAlign: 'right' }}>Partner B will be notified ↓</div>
                  </div>
                )
              },
              {
                delay: '0.15s', header: '◇ PARTNER B RESPONDS', headerColor: G.purple,
                content: (
                  <div>
                    <div style={{ borderLeft: `3px solid ${G.start}`, background: G.cream, padding: '0.8rem 1rem', marginBottom: '0.8rem', borderRadius: 3 }}>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: G.start, marginBottom: '0.3rem', fontWeight: 600 }}>START</div>
                      <div style={{ fontSize: '0.95rem', color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>"I need you to put your phone away during dinner..."</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      {['Accept', 'Compromise', 'Reject'].map((p, i) => (
                        <div key={p} style={{ flex: 1, padding: '0.5rem 0.3rem', fontSize: '0.82rem', border: `1px solid ${G.border}`, textAlign: 'center', color: i === 0 ? '#fff' : '#777', background: i === 0 ? G.green : '#fff', fontFamily: 'inherit', borderRadius: 3, fontWeight: 500 }}>{p}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.4rem', fontWeight: 500 }}>Action plan:</div>
                    <div style={{ borderLeft: `3px solid ${G.start}`, paddingLeft: '0.8rem', fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>Step 1: Phone stays in bedroom during meals. Deadline: Sunday 13 April.</div>
                  </div>
                )
              },
              {
                delay: '0.3s', header: 'DASHBOARD — ROUND 1', headerColor: G.darkPurple,
                content: (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sarah & James</div>
                      <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', padding: '3px 10px', background: '#f0eaff', color: G.purple, border: `1px solid ${G.purple}40`, borderRadius: 3, fontWeight: 600 }}>IN PROGRESS</span>
                    </div>
                    {[
                      { type: 'start', color: G.start, label: 'START', text: '"Put phone away during dinner..."' },
                      { type: 'stop', color: G.stop, label: 'STOP', text: '"Interrupting me mid-sentence..."' },
                    ].map(r => (
                      <div key={r.type} style={{ borderLeft: `3px solid ${r.color}`, background: G.cream, padding: '0.8rem 1rem', marginBottom: '0.7rem', borderRadius: 3 }}>
                        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: r.color, marginBottom: '0.3rem', fontWeight: 600 }}>{r.label}</div>
                        <div style={{ fontSize: '0.95rem', color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>{r.text}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>Deadline: 13 April · Daily reminders active</div>
                  </div>
                )
              },
            ].map((m, i) => (
              <div key={i} ref={el => mockupsRef.current[i] = el} style={{ border: `1px solid ${G.border}`, overflow: 'hidden', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', ...fadeInUp, transitionDelay: m.delay }}>
                <div style={{ background: `linear-gradient(135deg, ${m.headerColor || G.purple} 0%, ${G.darkPurple} 100%)`, padding: '0.9rem 1.2rem', fontSize: '0.8rem', letterSpacing: '0.18em', color: '#fff', fontWeight: 600 }}>{m.header}</div>
                <div style={{ padding: '1.4rem' }}>{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: G.border }} />

      {/* WHO IS IT FOR */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: G.purple, marginBottom: '1rem', fontWeight: 700 }}>WHO IS IT FOR</div>
        <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '1.2rem' }}>For Couples Who Still Believe It's Worth Trying.</h2>
        <p style={{ fontSize: '1.12rem', color: '#444', lineHeight: 1.6, maxWidth: 720, marginBottom: '2.5rem' }}>
          Deal Breakers isn't couples therapy. It's a tool for couples who want to have difficult conversations without them becoming arguments — who know what needs to change but don't know how to ask for it without things going sideways. It works alongside a counsellor, but can also be used independently.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
          {[
            { color: G.purple, title: 'Couples in Conflict', desc: 'Who feel stuck in the same arguments and need a new way through.' },
            { color: G.start, title: 'Couples in Counselling', desc: 'As a structured tool to carry the work from session into daily life.' },
            { color: G.stop, title: 'Couples Rebuilding Trust', desc: 'Who need concrete commitments and accountability, not just words.' },
            { color: G.green, title: 'Proactive Couples', desc: 'Who want to address things before they become relationship-defining problems.' },
          ].map(w => (
            <div key={w.title} style={{ borderTop: `3px solid ${w.color}`, paddingTop: '1.2rem', background: '#fff', padding: '1.5rem', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{w.title}</div>
              <div style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ background: 'linear-gradient(135deg, #A06CD5 0%, #7B4FA8 100%)', padding: 'clamp(4rem,10vw,6rem) 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.5)', marginBottom: '1.2rem', fontWeight: 600 }}>FREE TO USE — NO SUBSCRIPTION</div>
        <h2 style={{ color: '#fff', fontSize: 'clamp(2rem,7vw,3rem)', fontWeight: 700, marginBottom: '1.2rem', lineHeight: 1.15 }}>Start your first round today.</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.12rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>No subscription. No therapist required. Just honesty and a structure that holds.</p>
        <a href="#" onClick={(e)=>{e.preventDefault();onSignUp&&onSignUp();}} style={{ background: '#fff', color: G.purple, padding: '1rem 2.8rem', fontSize: '1rem', letterSpacing: '0.2em', fontWeight: 700, borderRadius: 3, textDecoration: 'none', border: 'none', display: 'inline-block' }}>SIGN UP FREE →</a>
      </div>

      {/* FOOTER */}
      <div style={{ background: G.darkPurple, padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>DEAL BREAKERS</div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem', letterSpacing: '0.1em' }}>A FRAMEWORK FOR HONEST CONVERSATION</div>
      </div>
    </div>
  )
}
