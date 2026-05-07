import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const features = [
  { icon: '⚡', title: 'Real-Time Weather', desc: 'Get instant, accurate weather data for any city powered by OpenWeatherMap.' },
  { icon: '🤖', title: 'AI-Powered Chat', desc: 'Ask SkyBot anything in natural language — it understands your context and answers intelligently.' },
  { icon: '📅', title: '5-Day Forecast', desc: 'Plan ahead with detailed daily forecasts including temperature, humidity, and conditions.' },
  { icon: '🌍', title: 'Global Coverage', desc: 'Search any city on Earth and get accurate local weather data instantly.' },
  { icon: '💾', title: 'Chat History', desc: 'All your conversations are saved so you can revisit or continue previous chats.' },
  { icon: '📱', title: 'Mobile-First', desc: 'Fully responsive design that works beautifully on any device, any screen size.' },
];

const techs = ['React 18', 'Node.js', 'Express.js', 'Google Gemini AI', 'OpenWeatherMap', 'JWT Auth', 'Vite', 'CSS3'];

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="about-page">
      <div className="container">
        <div className="about-hero">
          <h1>About <span>SkyBot</span></h1>
          <p>
            SkyBot is an AI-powered weather assistant that combines real-time meteorological data
            with the power of Google Gemini AI to deliver accurate, conversational weather insights
            in any language — anywhere in the world.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            {isAuthenticated
              ? <Link to="/chat" className="btn btn-primary btn-lg">💬 Start Chatting</Link>
              : <Link to="/register" className="btn btn-primary btn-lg">🚀 Get Started Free</Link>
            }
            <Link to={isAuthenticated ? '/' : '/login'} className="btn btn-secondary btn-lg">
              {isAuthenticated ? '🏠 Go Home' : '🔑 Sign In'}
            </Link>
          </div>
        </div>

        <div className="stats-row">
          {[
            { num: '200K+', desc: 'Cities Supported' },
            { num: 'AI', desc: 'Gemini Powered' },
            { num: '5-Day', desc: 'Forecast Range' },
            { num: '24/7', desc: 'Always Available' },
          ].map(s => (
            <div key={s.num} className="glass-card stat-box">
              <div className="stat-num">{s.num}</div>
              <div className="stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="section">
          <h2 className="section-title" style={{ textAlign: 'center' }}>✨ <span>Features</span></h2>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="glass-card feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section" style={{ textAlign: 'center' }}>
          <h2 className="section-title">🛠️ Built <span>With</span></h2>
          <div className="tech-grid">
            {techs.map(t => <div key={t} className="tech-badge">{t}</div>)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
