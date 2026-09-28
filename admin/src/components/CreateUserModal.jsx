import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  Clock, 
  FileText, 
  Tag, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Globe, 
  Phone, 
  Lock, 
  Mail, 
  User, 
  Calendar as CalendarIcon,
  Heart
} from 'lucide-react';
import { registerUser } from '../services/api';

const CATEGORIES = ['Doctor', 'Lawyer', 'Barber', 'Consultant', 'Fitness', 'Beauty', 'Tutor', 'General'];

const SUGGESTED_TITLES = {
  Doctor: ['General Practitioner (MD)', 'Specialist Physician', 'Clinical Consultant', 'Dentist / Dental Surgeon', 'Pediatrician'],
  Lawyer: ['Corporate Attorney', 'Legal Counsel & Advisor', 'Litigation Specialist', 'Notary & Property Solicitor'],
  Barber: ['Master Barber & Stylist', 'Grooming Specialist', 'Senior Hair Stylist', 'Celebrity Stylist'],
  Consultant: ['Senior Business Consultant', 'Financial Advisor', 'Strategy & Operations Lead', 'Management Consultant'],
  Fitness: ['Certified Fitness Coach', 'Personal Trainer & Nutritionist', 'Strength & Conditioning Specialist'],
  Beauty: ['Licensed Esthetician', 'Professional Makeup Artist', 'Skincare Specialist', 'Spa & Wellness Director'],
  Tutor: ['Academic Tutor & Educator', 'Senior Language Instructor', 'STEM Education Specialist', 'Test Prep Specialist'],
  General: ['Professional Consultant', 'Independent Specialist', 'Creative Director', 'Operations Specialist']
};

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [step, setStep] = useState(1);

  // Step 1: Personal & Account Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');

  // Step 2: Creator Service Details
  const [category, setCategory] = useState('Doctor');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('15000');
  const [slotDuration, setSlotDuration] = useState('30');
  const [consultationMode, setConsultationMode] = useState('VIRTUAL');
  const [officeAddress, setOfficeAddress] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in Full Name, Email, and Password.');
      return;
    }
    if (role === 'CREATOR') {
      // Set default title suggestion if not set
      if (!title) {
        setTitle(SUGGESTED_TITLES[category]?.[0] || `${fullName}'s Service`);
      }
      setStep(2);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const activeCategory = category === 'Other' ? (customCategory || 'General') : category;
      const creatorPayload = role === 'CREATOR' ? {
        category: activeCategory,
        title: title || `${fullName}'s Service`,
        bio: bio || 'Welcome to my SlotSync booking page. Schedule your appointment below!',
        hourly_rate: parseFloat(hourlyRate) || 0.0,
        slot_duration_minutes: parseInt(slotDuration, 10) || 30,
        consultation_mode: consultationMode,
        office_address: (consultationMode === 'IN_PERSON' || consultationMode === 'BOTH') ? officeAddress : null,
        currency: 'NGN',
        timezone: timezone || 'Africa/Lagos'
      } : {};

      const payload = {
        email: email.trim(),
        password: password,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        marital_status: maritalStatus || null,
        role: role,
        currency: 'NGN',
        ...creatorPayload
      };

      await registerUser(payload);
      setSuccessMsg(`Successfully created ${role} account for ${fullName}!`);

      setTimeout(() => {
        if (onUserCreated) onUserCreated();
        handleClose();
      }, 1200);

    } catch (err) {
      setError(err.message || 'Failed to create account. Please verify the information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setTimeout(() => {
      setStep(1);
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setRole('CLIENT');
      setGender('Male');
      setDateOfBirth('');
      setMaritalStatus('Single');
      setCategory('Doctor');
      setCustomCategory('');
      setTitle('');
      setBio('');
      setHourlyRate('15000');
      setSlotDuration('30');
      setConsultationMode('VIRTUAL');
      setOfficeAddress('');
      setError(null);
      setSuccessMsg(null);
      setLoading(false);
    }, 200);
  };

  const suggestions = SUGGESTED_TITLES[category] || [];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '560px', 
          maxHeight: '88vh', 
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(79,70,229,0.25)',
              flexShrink: 0
            }}>
              <UserPlus size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-main)' }}>
                {role === 'CREATOR' && step === 2 ? 'Creator Service Profile' : 'Create New Account'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {role === 'CREATOR' 
                  ? (step === 1 ? 'Step 1 of 2: Personal & Login Credentials' : 'Step 2 of 2: Service & Rate Configuration')
                  : 'Register a pre-activated account in the system'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '50%',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-step progress bar for Creators */}
        {role === 'CREATOR' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '9999px',
              background: '#4f46e5',
            }} />
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '9999px',
              background: step === 2 ? '#4f46e5' : '#e2e8f0',
              transition: 'background 0.3s ease'
            }} />
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ─── STEP 1: Personal & Login Credentials ─── */}
        {step === 1 && (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Account Role Selector */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'CLIENT', label: 'Client', sub: 'Standard User' },
                  { id: 'CREATOR', label: 'Creator', sub: 'Service Provider' },
                  { id: 'ADMIN', label: 'Admin', sub: 'System Admin' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      border: role === r.id ? '2px solid #4f46e5' : '1px solid var(--border-color)',
                      background: role === r.id ? '#eef2ff' : 'var(--bg-input)',
                      color: role === r.id ? '#4f46e5' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.675rem', color: role === r.id ? '#6366f1' : 'var(--text-dim)', marginTop: '0.1rem' }}>{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={13} style={{ color: '#4f46e5' }} /> Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Anayolico Caleb"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={13} style={{ color: '#4f46e5' }} /> Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone and Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} style={{ color: '#10b981' }} /> Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+234 801 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={13} style={{ color: '#ef4444' }} /> Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Profile Details: Gender, Date of Birth, Marital Status */}
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: '12px',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                PERSONAL DETAILS (OPTIONAL)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marital Status</label>
                  <select
                    className="form-control"
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '0.5rem' }}>
              {role === 'CREATOR' ? (
                <button
                  type="submit"
                  className="btn-upgrade"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>Continue to Creator Setup</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-upgrade"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : `Create ${role} Account`}
                </button>
              )}
            </div>
          </form>
        )}

        {/* ─── STEP 2: Creator Service & Onboarding ─── */}
        {step === 2 && role === 'CREATOR' && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Category & Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={13} style={{ color: '#4f46e5' }} /> Category / Profession
                </label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    if (SUGGESTED_TITLES[newCat]?.[0]) {
                      setTitle(SUGGESTED_TITLES[newCat][0]);
                    }
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>
              </div>

              {category === 'Other' ? (
                <div className="form-group">
                  <label className="form-label">Custom Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Electrician, Chef..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={13} style={{ color: '#4f46e5' }} /> Service Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. General Practitioner (MD)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Title Suggestions Pills */}
            {suggestions.length > 0 && category !== 'Other' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '-0.35rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '0.2rem' }}>Suggestions:</span>
                {suggestions.slice(0, 3).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setTitle(sugg)}
                    style={{
                      background: title === sugg ? '#eef2ff' : 'var(--bg-input)',
                      border: title === sugg ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      color: title === sugg ? '#4f46e5' : 'var(--text-muted)',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}

            {/* Hourly Rate (₦) and Slot Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>₦</span> Hourly Rate (₦/hr)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 800,
                    color: 'var(--text-dim)'
                  }}>
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    className="form-control"
                    placeholder="15000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={{ paddingLeft: '2rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} style={{ color: '#6366f1' }} /> Slot Duration
                </label>
                <select
                  className="form-control"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes (1 Hour)</option>
                </select>
              </div>
            </div>

            {/* Consultation Mode and Office Address */}
            <div style={{ display: 'grid', gridTemplateColumns: consultationMode === 'VIRTUAL' ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={13} style={{ color: '#0ea5e9' }} /> Consultation Mode
                </label>
                <select
                  className="form-control"
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value)}
                >
                  <option value="VIRTUAL">Virtual (Online Video/Audio)</option>
                  <option value="IN_PERSON">In-Person (Office / Clinic)</option>
                  <option value="BOTH">Both (Virtual & Office)</option>
                </select>
              </div>

              {(consultationMode === 'IN_PERSON' || consultationMode === 'BOTH') && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} style={{ color: '#ef4444' }} /> Office Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 14 Victoria Island, Lagos"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={13} style={{ color: '#6366f1' }} /> Bio / Offering Description Note
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe services, specializations, qualifications, and client booking guidelines..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem' }}
              />
            </div>

            {/* Navigation & Submit Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-details-link"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="btn-upgrade"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
                disabled={loading}
              >
                {loading ? 'Creating Creator...' : 'Create Creator Account & Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
