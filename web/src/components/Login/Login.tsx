import { useState } from 'react';
import './Login.css';
import loginBg from '../../assets/login-bg.png';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate a brief delay for UX
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 400);
  };

  return (
    <div className="login-container">
      <div className="login-card-split">
        {/* Left Side: Image Panel */}
        <div className="login-image-panel" style={{ backgroundImage: `url(${loginBg})` }}>
          <div className="image-overlay">
            <h2>Welcome!</h2>
            <p>Enter your personal details and start<br/>your campus journey with us.</p>
          </div>
        </div>
        
        {/* Right Side: Form Panel */}
        <div className="login-form-panel">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to continue.</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email or Student ID</label>
              <input 
                type="text" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or Student ID" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                required 
              />
            </div>
            
            <div className="form-options">
              <div className="spacer"></div>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className={`login-button ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In \u2192'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

