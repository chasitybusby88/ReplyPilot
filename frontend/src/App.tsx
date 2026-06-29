import './App.css'

function App() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container">
          <div className="logo text-blue-600 font-bold text-2xl">ReplyPilot</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact" className="btn btn-primary">Get Started</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <h1 className="hero-title">Stop Losing Leads to Slow Response Times</h1>
          <p className="hero-subtitle">
            Capture, qualify, and follow up with your home service leads instantly using AI. 
            Book 2-3x more estimates every month without lifting a finger.
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-large btn-primary">Start Your Free Trial</a>
            <a href="#features" className="btn btn-large btn-secondary">Learn More</a>
          </div>
        </div>
      </header>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything You Need to Scale</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📥</div>
              <h3>Lead Capture</h3>
              <p>Instantly capture leads from your website forms and Facebook Ads in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Response</h3>
              <p>AI replies to every lead via text and email within 60 seconds, 24/7.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Quote Qualification</h3>
              <p>AI asks the right questions to qualify leads based on service type, budget, and urgency.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Follow-up Sequences</h3>
              <p>Automated 7-14 day nurture sequences keep your business top-of-mind until they book.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Appointment Reminders</h3>
              <p>Reduce no-shows with automated text and email reminders for every estimate.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Missed-Call Text-Back</h3>
              <p>Never lose a call again. ReplyPilot instantly texts back missed calls with a booking link.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Setup Fee</h3>
              <div className="price">$500 – $2,000</div>
              <p className="price-detail">One-time investment</p>
              <ul className="price-features">
                <li>Custom AI Training</li>
                <li>CRM Integration</li>
                <li>Workflow Automation Setup</li>
              </ul>
            </div>
            <div className="pricing-card featured">
              <div className="badge">Most Popular</div>
              <h3>Monthly Subscription</h3>
              <div className="price">$300 – $1,500<span>/mo</span></div>
              <p className="price-detail">Tiered by lead volume</p>
              <ul className="price-features">
                <li>Unlimited AI Responses</li>
                <li>Unlimited Follow-ups</li>
                <li>Real-time Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="cta-section">
        <div className="container">
          <h2>Ready to Supercharge Your Lead Follow-up?</h2>
          <p>Join dozens of home service contractors who are booking more jobs with ReplyPilot.</p>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Business Email" required />
            <button type="submit" className="btn btn-large btn-primary">Get a Demo</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ReplyPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
