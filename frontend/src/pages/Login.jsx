import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const GOOGLE_CLIENT_ID =
   import.meta.env.VITE_GOOGLE_CLIENT_ID ||
   '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

const demoAccounts = [
   {
      role: 'Admin',
      email: 'admin@epic.com',
      password: 'admin123',
      icon: '👨‍🏫',
      desc: 'Manage papers and results'
   },
   {
      role: 'Student',
      email: 'student@epic.com',
      password: 'student123',
      icon: '👨‍🎓',
      desc: 'Take IELTS practice tests'
   }
];

export default function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const navigate = useNavigate();

// Using centralized api config

const finishLogin = (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN' || user.role === 'TEACHER') {
         navigate('/admin/dashboard');
      } else {
         navigate('/student/dashboard');
      }
   };

   useEffect(() => {
      const loadGoogle = () => {
         if (!window.google || !GOOGLE_CLIENT_ID) return;

         window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
               try {
                  setLoading(true);
                  setError('');

                  const res = await axios.post(`${API_URL}/api/auth/google`, {
                     credential: response.credential
                  });

                  finishLogin(res.data.token, res.data.user);
               } catch (err) {
                  console.error('Google login error:', err);
                  setError('Google login failed. Please try again.');
               } finally {
                  setLoading(false);
               }
            }
         });

         const button = document.getElementById('google-login-button');

         if (button) {
            button.innerHTML = '';

            window.google.accounts.id.renderButton(button, {
               theme: 'outline',
               size: 'large',
               width: 440,
               text: 'continue_with',
               shape: 'rectangular'
            });
         }
      };

      if (!document.getElementById('google-script')) {
         const script = document.createElement('script');
         script.id = 'google-script';
         script.src = 'https://accounts.google.com/gsi/client';
         script.async = true;
         script.defer = true;
         script.onload = loadGoogle;
         document.body.appendChild(script);
      } else {
         loadGoogle();
      }
   }, []);

   const login = async (loginEmail = email, loginPassword = password) => {
      setLoading(true);
      setError('');

      try {
         const res = await axios.post(`${API_URL}/api/auth/login`, {
            email: loginEmail,
            password: loginPassword
         });

         finishLogin(res.data.token, res.data.user);
      } catch (err) {
         console.error('Login error:', err);
         setError('Invalid email or password. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const handleLogin = async (e) => {
      e.preventDefault();
      await login();
   };

   const useDemoAccount = (account) => {
      setEmail(account.email);
      setPassword(account.password);
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          font-size: 15px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          color: #1e293b;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .login-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }

        .signin-btn {
          width: 100%;
          padding: 15px;
          background: #1a1a2e;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .signin-btn:hover:not(:disabled) {
          background: #2d2d5e;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(26,26,46,0.35);
        }

        .signin-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .demo-card {
          width: 100%;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .demo-card:hover {
          border-color: #4f46e5;
          background: #f5f3ff;
          transform: translateY(-1px);
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

         <div
            style={{
               display: 'flex',
               height: '100vh',
               width: '100vw',
               overflow: 'hidden',
               animation: 'fadeIn 0.4s ease'
            }}
         >
            <div
               style={{
                  width: '45%',
                  background: '#1a1a2e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 50px',
                  position: 'relative',
                  overflow: 'hidden'
               }}
            >
               <div
                  style={{
                     position: 'absolute',
                     width: 500,
                     height: 500,
                     borderRadius: '50%',
                     background: 'rgba(79,70,229,0.08)',
                     top: -150,
                     right: -150
                  }}
               />

               <div
                  style={{
                     position: 'absolute',
                     width: 350,
                     height: 350,
                     borderRadius: '50%',
                     background: 'rgba(245,158,11,0.06)',
                     bottom: -100,
                     left: -100
                  }}
               />

               <img
                  src="/logo.png"
                  alt="EPIC Campus"
                  style={{
                     width: 220,
                     filter: 'brightness(0) invert(1)',
                     objectFit: 'contain',
                     marginBottom: 12,
                     position: 'relative'
                  }}
               />

               <div
                  style={{
                     width: 60,
                     height: 2,
                     background: 'rgba(245,158,11,0.5)',
                     marginBottom: 16,
                     borderRadius: 2,
                     position: 'relative'
                  }}
               />

               <p
                  style={{
                     fontSize: 12,
                     color: '#f59e0b',
                     fontStyle: 'italic',
                     marginBottom: 40,
                     textAlign: 'center',
                     letterSpacing: '0.1em',
                     textTransform: 'uppercase',
                     position: 'relative'
                  }}
               >
                  IELTS Computer Based Test Platform
               </p>

               <div style={{ width: '100%', maxWidth: 320, position: 'relative' }}>
                  {[
                     { icon: '🎯', title: 'Strict Exam Control', desc: 'Real CBT exam conditions' },
                     { icon: '🤖', title: 'AI-Powered Marking', desc: 'EPIC AI examiner feedback' },
                     { icon: '📊', title: 'Instant Band Scores', desc: 'IELTS band estimates after tests' },
                     { icon: '📚', title: 'Reading Practice Tests', desc: 'Academic-style IELTS workflow' }
                  ].map((item) => (
                     <div key={item.title} className="feature-card">
                        <span style={{ fontSize: 20, minWidth: 28 }}>{item.icon}</span>
                        <div>
                           <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
                              {item.title}
                           </div>
                           <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                              {item.desc}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               <p
                  style={{
                     position: 'absolute',
                     bottom: 24,
                     color: 'rgba(255,255,255,0.25)',
                     fontSize: 11,
                     letterSpacing: '0.05em'
                  }}
               >
                  EPIC Campus · We Create Your Future
               </p>
            </div>

            <div
               style={{
                  width: '55%',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 80px',
                  position: 'relative'
               }}
            >
               <div
                  style={{
                     position: 'absolute',
                     top: 28,
                     right: 32,
                     background: '#f0fdf4',
                     border: '1px solid #bbf7d0',
                     borderRadius: 20,
                     padding: '6px 14px',
                     fontSize: 12,
                     color: '#16a34a',
                     fontWeight: 600,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 6
                  }}
               >
                  <span
                     style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#16a34a'
                     }}
                  />
                  System Online
               </div>

               <div style={{ width: '100%', maxWidth: 440 }}>
                  <div style={{ marginBottom: 30 }}>
                     <h2
                        style={{
                           fontFamily: "'Playfair Display', serif",
                           fontSize: 38,
                           fontWeight: 700,
                           color: '#1a1a2e',
                           marginBottom: 8,
                           lineHeight: 1.2
                        }}
                     >
                        Welcome back
                     </h2>

                     <p style={{ color: '#64748b', fontSize: 15 }}>
                        Sign in to your EPIC IELTS account to continue.
                     </p>
                  </div>

                  {error && (
                     <div
                        style={{
                           background: '#fef2f2',
                           border: '1px solid #fecaca',
                           borderRadius: 10,
                           padding: '14px 16px',
                           marginBottom: 22,
                           display: 'flex',
                           alignItems: 'center',
                           gap: 10
                        }}
                     >
                        <span>⚠️</span>
                        <span style={{ color: '#dc2626', fontSize: 14 }}>{error}</span>
                     </div>
                  )}

                  <form onSubmit={handleLogin}>
                     <div style={{ marginBottom: 18 }}>
                        <label
                           style={{
                              display: 'block',
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: 8
                           }}
                        >
                           Email address
                        </label>

                        <input
                           className="login-input"
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="student@epic.com"
                           required
                        />
                     </div>

                     <div style={{ marginBottom: 16 }}>
                        <label
                           style={{
                              display: 'block',
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: 8
                           }}
                        >
                           Password
                        </label>

                        <div style={{ position: 'relative' }}>
                           <input
                              className="login-input"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              required
                              style={{ paddingRight: 48 }}
                           />

                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                 position: 'absolute',
                                 right: 14,
                                 top: '50%',
                                 transform: 'translateY(-50%)',
                                 background: 'none',
                                 border: 'none',
                                 cursor: 'pointer',
                                 color: '#94a3b8',
                                 fontSize: 16
                              }}
                           >
                              {showPassword ? '🙈' : '👁️'}
                           </button>
                        </div>
                     </div>

                     <div
                        style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           marginBottom: 28
                        }}
                     >
                        <label
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 13,
                              color: '#64748b',
                              cursor: 'pointer'
                           }}
                        >
                           <input
                              type="checkbox"
                              style={{ accentColor: '#4f46e5', width: 14, height: 14 }}
                           />
                           Remember me
                        </label>

                        <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>
                           Forgot password?
                        </span>
                     </div>

                     <button type="submit" className="signin-btn" disabled={loading}>
                        {loading ? (
                           <>
                              <span
                                 style={{
                                    width: 18,
                                    height: 18,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                 }}
                              />
                              Signing in...
                           </>
                        ) : (
                           'Sign In →'
                        )}
                     </button>
                  </form>

                  <div style={{ marginTop: 20, marginBottom: 10 }}>
                     <div id="google-login-button" style={{ display: 'flex', justifyContent: 'center' }}></div>
                  </div>

                  <div
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        margin: '24px 0'
                     }}
                  >
                     <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                     <span style={{ fontSize: 12, color: '#94a3b8' }}>Quick Login</span>
                     <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>

                  <div
                     style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        marginBottom: 24
                     }}
                  >
                     {demoAccounts.map((account) => (
                        <button
                           key={account.email}
                           type="button"
                           className="demo-card"
                           onClick={() => useDemoAccount(account)}
                        >
                           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 23 }}>{account.icon}</span>
                              <div>
                                 <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                                    {account.role}
                                 </div>
                                 <div style={{ fontSize: 11, color: '#64748b' }}>{account.desc}</div>
                              </div>
                           </div>

                           <div
                              style={{
                                 marginTop: 10,
                                 fontSize: 11,
                                 color: '#94a3b8',
                                 lineHeight: 1.5
                              }}
                           >
                              {account.email}
                           </div>
                        </button>
                     ))}
                  </div>

                  <p
                     style={{
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#94a3b8',
                        lineHeight: 1.6
                     }}
                  >
                     Click a Quick Login card to fill details, then press Sign In.
                  </p>
               </div>
            </div>
         </div>
      </>
   );
}