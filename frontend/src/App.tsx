import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import LeadsPage from './pages/LeadsPage';

// Landing Page Placeholder (using existing App component logic)
function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container">
          <div className="logo text-blue-600 font-bold text-2xl">ReplyPilot</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
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
            <a href="/dashboard" className="btn btn-large btn-primary">Start Your Free Trial</a>
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

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ReplyPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout children={<DashboardHome />} />} />
        <Route path="/dashboard/leads" element={<DashboardLayout children={<LeadsPage />} />} />
        
        {/* Placeholder Routes */}
        <Route path="/dashboard/appointments" element={<DashboardLayout children={<div className="p-8 text-center text-gray-500">Appointments view coming soon...</div>} />} />
        <Route path="/dashboard/sequences" element={<DashboardLayout children={<div className="p-8 text-center text-gray-500">Follow-up Sequences view coming soon...</div>} />} />
        <Route path="/dashboard/settings" element={<DashboardLayout children={<div className="p-8 text-center text-gray-500">Settings view coming soon...</div>} />} />
        
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
