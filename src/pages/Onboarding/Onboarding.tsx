import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User, Briefcase, Building2, Wallet, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './Onboarding.css';

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    account_type: '',
    profession: '',
    industry: '',
    income_range: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...formData,
          updated_at: new Date()
        });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Choose Account Type',
      description: 'Are you a freelancer or a business owner?',
      icon: <User />,
      options: ['Freelancer', 'Small Business', 'Agency'],
      key: 'account_type'
    },
    {
      id: 2,
      title: 'What is your profession?',
      description: 'This helps us tailor your experience.',
      icon: <Briefcase />,
      options: ['Software Dev', 'Designer', 'Marketing', 'Consultant', 'Other'],
      key: 'profession'
    },
    {
      id: 3,
      title: 'Industry & Sector',
      description: 'Select the industry you operate in.',
      icon: <Building2 />,
      options: ['Technology', 'E-commerce', 'Creative Arts', 'Education', 'Health'],
      key: 'industry'
    },
    {
      id: 4,
      title: 'Estimated Monthly Income',
      description: 'This helps us with tax suggestions.',
      icon: <Wallet />,
      options: ['₦0 - ₦500k', '₦500k - ₦1.5M', '₦1.5M - ₦5M', '₦5M+'],
      key: 'income_range'
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="onboarding-page">
      <div className="onboarding-card glass">
        <div className="step-indicator">
          {steps.map((s) => (
            <div key={s.id} className={`step-dot ${step >= s.id ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-header">
          <div className="step-icon">
            {currentStep.icon}
          </div>
          <h1>{currentStep.title}</h1>
          <p>{currentStep.description}</p>
        </div>

        <div className="options-grid">
          {currentStep.options.map((option) => (
            <button
              key={option}
              className={`option-btn glass ${formData[currentStep.key as keyof typeof formData] === option ? 'selected' : ''}`}
              onClick={() => setFormData({ ...formData, [currentStep.key]: option })}
            >
              <span>{option}</span>
              {formData[currentStep.key as keyof typeof formData] === option && <Check size={18} />}
            </button>
          ))}
        </div>

        <div className="onboarding-footer">
          {step > 1 && (
            <button onClick={handleBack} className="btn-text">
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <button
            onClick={step === steps.length ? handleSubmit : handleNext}
            className="btn btn-primary"
            disabled={!formData[currentStep.key as keyof typeof formData] || loading}
          >
            <span>{step === steps.length ? 'Finish' : 'Continue'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
