import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            ⛅ Sky<span>Bot</span>
          </Link>

          <div className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link to="/" className={isActive('/')}>🏠 Home</Link>
                <Link to="/chat" className={isActive('/chat')}>💬 Chat</Link>
                <Link to="/history" className={isActive('/history')}>📋 History</Link>
                <Link to="/about" className={isActive('/about')}>ℹ️ About</Link>
                <div className="nav-user">
                  <div className="nav-avatar">{initials}</div>
                  <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/about" className={isActive('/about')}>ℹ️ About</Link>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>🏠 Home</Link>
            <Link to="/chat" className={isActive('/chat')} onClick={() => setMenuOpen(false)}>💬 Chat</Link>
            <Link to="/history" className={isActive('/history')} onClick={() => setMenuOpen(false)}>📋 History</Link>
            <Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>ℹ️ About</Link>
            <button className="btn btn-danger btn-sm" style={{marginTop:8}} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>ℹ️ About</Link>
            <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </>
  );
}
