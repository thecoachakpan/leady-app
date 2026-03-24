import { Link } from 'react-router-dom';
import { Users, Receipt, ArrowRight, ShieldCheck, Zap, CheckCircle2, ChevronDown, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Landing.css';

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-page">
      <div className="yoco-header-wrapper">
        <nav className={`landing-nav yoco-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
          <div className="nav-container">
            <div className="logo yoco-logo">
              <div className="logo-icon">L</div>
              <span className="logo-text">Leady</span>
            </div>
            <div className="nav-links yoco-nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#faq" className="nav-link">FAQ</a>
              <Link to="/auth?mode=login" className="yoco-btn-text">Login</Link>
              <Link to="/auth?mode=signup" className="yoco-btn-outline">Get started</Link>
            </div>
          </div>
        </nav>

        <header className="hero-section yoco-hero">
          <div className="hero-content yoco-content">
            <div className="yoco-trust-badge">
              <Star size={16} fill="#fff" />
              <span><strong className="yoco-cyan-text">5,431</strong> freelancers run smarter with Leady</span>
            </div>
            
            <h1 className="yoco-title">
              EFFORTLESS INVOICING,<br/>
              FASTER PAYMENTS<br/>
              AND <span className="yoco-cyan-text">ZERO HASSLE</span>
            </h1>
            
            <p className="yoco-subtitle">
              Market leader in professional invoicing, automatic payment receipts, 
              and client management, all in one place.
            </p>
            
            <div className="yoco-actions">
              <Link to="/auth?mode=signup" className="btn yoco-btn-primary">
                <span>Sign up</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#features" className="yoco-btn-secondary">EXPLORE FEATURES</a>
            </div>
          </div>
          
          <div className="hero-visual yoco-visual">
            <div className="yoco-masonry">
              <div className="yoco-masonry-item item-1 glass-dark">
                <div className="yoco-mock-header"></div>
                <div className="yoco-mock-line"></div>
                <div className="yoco-mock-line w-half"></div>
                <div className="yoco-mock-amount">₦450K</div>
              </div>
              <div className="yoco-masonry-item item-2 glass-dark">
                <ShieldCheck size={40} color="#00d2fe" />
                <div className="mt-sm yoco-mock-text">Secure & Verified</div>
              </div>
              <div className="yoco-masonry-item item-3 glass-dark">
                <Receipt size={32} color="#fff" />
                <div className="yoco-receipt-lines">
                  <div className="yoco-r-line"></div>
                  <div className="yoco-r-line"></div>
                  <div className="yoco-r-line"></div>
                </div>
              </div>
              <div className="yoco-masonry-item item-4 glass-dark">
                <div className="yoco-avatar-group">
                  <div className="y-avatar bg-1"></div>
                  <div className="y-avatar bg-2"></div>
                  <div className="y-avatar bg-3"></div>
                </div>
                <div className="yoco-mock-text">Client Management</div>
              </div>
              <div className="yoco-masonry-item item-5 glass-dark">
                <div className="yoco-status">
                  <CheckCircle2 size={16} color="#00d2fe" />
                  <span>Invoice Paid</span>
                </div>
              </div>
              <div className="yoco-masonry-item item-6 glass-dark">
                <Zap size={32} color="#00d2fe" />
              </div>
            </div>
          </div>
        </header>
      </div>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">One app for your better financial experience</h2>
          <p>Everything you need to get paid faster, designed specifically for modern freelancers.</p>
        </div>
        <div className="bento-grid">
          <div className="bento-card bento-wide glass">
            <div className="feature-icon"><Zap size={32} /></div>
            <h2>Lightning Fast Invoicing</h2>
            <p>Generate professional invoices and customized receipts with just a few clicks. Your clients will love how easy it is to pay you. Focus on your work, not formatting spreadsheets.</p>
          </div>
          <div className="bento-card glass">
            <div className="feature-icon"><Users size={32} /></div>
            <h2>Client Management</h2>
            <p>Keep all your client details, history, and balances neatly organized in one dashboard.</p>
          </div>
          <div className="bento-card glass">
            <div className="feature-icon"><Receipt size={32} /></div>
            <h2>Auto Receipts</h2>
            <p>Never manually write a receipt again. When marked paid, Leady instantly generates it.</p>
          </div>
          <div className="bento-card bento-wide glass" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <div className="feature-icon"><ShieldCheck size={32} /></div>
              <h2>Secure & Reliable</h2>
              <p>Built with enterprise-grade security using Supabase. Your financial data and client information are always encrypted and purely safely isolated. Rest easy knowing your business is safe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Why do Nigerian freelancers trust Leady?</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card glass">
            <div className="stars"><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/></div>
            <p className="testimonial-text">"In under 10 minutes, I signed up and sent my first invoice. My regular word documents broke so often. This is a lifesaver."</p>
            <p className="testimonial-author">— Tunde, Graphic Designer</p>
          </div>
          <div className="testimonial-card glass">
            <div className="stars"><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/></div>
            <p className="testimonial-text">"Got my invoice paid in two days because the receipt generation gave my clients confidence. Never getting stranded with spreadsheets again!"</p>
            <p className="testimonial-author">— Amaka, Content Writer</p>
          </div>
          <div className="testimonial-card glass">
            <div className="stars"><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/><Star fill="#f59e0b" color="#f59e0b"/></div>
            <p className="testimonial-text">"Switching to Leady was the best business decision I have made. Client management has never been smoother."</p>
            <p className="testimonial-author">— David, Software Engineer</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How Leady Works</h2>
          <p>Get started in minutes and streamline your entire invoicing process.</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create your profile</h3>
            <p>Sign up for free and add your business details. Setup takes less than 2 minutes.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Send an invoice</h3>
            <p>Add your client, itemize your services, and send a professional invoice directly.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get Paid & Generate Receipts</h3>
            <p>Mark invoices as paid and Leady automatically generates and sends a receipt to your client.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Start for free, upgrade when you need to.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card glass feature-card">
            <div className="pricing-header">
              <h3>Freelancer</h3>
              <div className="price">₦0<span>/month</span></div>
              <p>Perfect for getting started</p>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="var(--success)" /> Up to 5 Invoices per month</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> 3 Clients</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Standard Email Support</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Basic Templates</li>
            </ul>
            <Link to="/auth?mode=signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started Free</Link>
          </div>

          <div className="pricing-card glass feature-card popular">
            <div className="popular-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price">₦5,000<span>/month</span></div>
              <p>For growing businesses</p>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="var(--success)" /> Unlimited Invoices</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Unlimited Clients</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Priority Support</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Remove Leady Branding</li>
              <li><CheckCircle2 size={18} color="var(--success)" /> Custom Branding</li>
            </ul>
            <Link to="/auth?mode=signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started Free</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Got questions? We've got answers.</p>
        </div>
        <div className="faq-container">
          {[
            {
              q: "Is Leady really free?",
              a: "Yes! Our Freelancer plan is completely free and includes everything you need to start sending professional invoices. You only pay if you need to upgrade to Pro for unlimited invoices and clients."
            },
            {
              q: "Can I use Leady outside of Nigeria?",
              a: "While Leady is optimized for Nigerian businesses (with NGN as the default currency), you can change your default currency in settings and use it anywhere in the world."
            },
            {
              q: "How secure is my data?",
              a: "Security is our top priority. We use enterprise-grade encryption provided by Supabase. Your financial data and client information are completely isolated and secure."
            },
            {
              q: "Does Leady handle the payment processing?",
              a: "Currently, Leady is purely for invoicing and receipt generation. You still collect payments via your preferred method (bank transfer, Paystack, etc.) and mark the invoice as paid in Leady to generate the receipt."
            }
          ].map((faq, index) => (
            <div key={index} className={`faq-item glass ${activeFaq === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <ChevronDown size={20} className="faq-icon" />
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container glass">
          <h2>Ready to streamline your invoicing?</h2>
          <p>Join thousands of freelancers getting paid faster with Leady.</p>
          <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">
            <span>Create Your Free Account</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">L</div>
              <span className="logo-text">Leady</span>
            </div>
            <p>The effortless invoicing and receipt generation platform for modern freelancers.</p>
            <div className="social-links">
              {/* Add social links here if needed */}
            </div>
          </div>
          
          <div className="footer-links">
            <div className="link-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how-it-works">How it works</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="link-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Blog</a>
            </div>
            <div className="link-column">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Leady Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
