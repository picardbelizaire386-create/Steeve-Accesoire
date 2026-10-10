import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  KeyRound,
  MapPin,
  Sparkles
} from 'lucide-react';
import { validateHaitianPhone, formatHaitianPhoneInput } from '../utils/haitiValidation';

export const AuthModal: React.FC = () => {
  const { activeModal, setActiveModal, login, register, loginWithGoogle } = useCommerce();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or +509 Phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+509 ');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification state (for high security account creation)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('509246');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Validation feedback
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  if (activeModal !== 'auth') return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'Vide', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Trop faible (min 8 caractères)', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Moyen (ajoutez chiffres & majuscules)', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Bon mot de passe', color: 'bg-indigo-500' };
    return { score: 4, label: 'Très robuste & sécurisé', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handlePhoneChange = (val: string) => {
    const formatted = formatHaitianPhoneInput(val);
    setPhone(formatted);
    const check = validateHaitianPhone(formatted);
    if (!check.isValid && formatted.length > 5) {
      setPhoneError(check.error || null);
    } else {
      setPhoneError(null);
    }
  };

  const handleInitiateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setLoginError(null);

    if (!firstName.trim() || !lastName.trim()) {
      alert('Le nom complet (prénom et nom de famille) est obligatoire.');
      return;
    }

    // Phone validation strictly (+509)
    const phoneCheck = validateHaitianPhone(phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error || 'Numéro haïtien (+509) invalide.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      alert('Veuillez renseigner une adresse e-mail valide.');
      return;
    }

    if (password.length < 8) {
      alert('Pour la sécurité de votre compte, le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Les deux mots de passe saisis ne correspondent pas.');
      return;
    }

    if (!agreeTerms) {
      alert('Veuillez accepter les conditions générales de vente et de livraison aux Cayes.');
      return;
    }

    // Step 2 of registration: OTP verification for serious customer authentication
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setIsVerifyingOtp(true);
  };

  const handleConfirmOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '509246' && otpCode.trim() !== '123456') {
      setOtpError('Code de sécurité incorrect. Saisissez le code affiché ci-dessous.');
      return;
    }

    const success = register({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    if (success) {
      setIsVerifyingOtp(false);
      setActiveModal(null);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Veuillez renseigner votre adresse e-mail ou votre numéro haïtien (+509).');
      return;
    }
    if (!password) {
      setLoginError('Veuillez renseigner votre mot de passe.');
      return;
    }

    const success = login(loginIdentifier, password);
    if (success) {
      setActiveModal(null);
    } else {
      setLoginError('Identifiant ou mot de passe incorrect. Assurez-vous d\'avoir créé un compte ou utilisez la démo ci-dessous.');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Veuillez saisir votre adresse e-mail.');
      return;
    }
    setForgotPasswordSent(true);
  };

  const handleQuickDemoCustomer = () => {
    login('client@example.com', 'customer');
    setActiveModal(null);
  };

  const handleQuickDemoAdmin = () => {
    login('admin@novacommerce.com', 'admin');
    setActiveModal('admin');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {isVerifyingOtp 
                  ? 'Vérification de Sécurité (+509)'
                  : isForgotPasswordView 
                  ? 'Récupération de mot de passe'
                  : isRegisterMode 
                  ? 'Créer mon compte sécurisé' 
                  : 'Connexion Espace Client'}
              </h3>
              <p className="text-[11px] text-slate-300">
                STEEVE ACCESSOIRE · Les Cayes (Sud d&apos;Haïti)
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Territory & Prefix Badge Guarantee */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 flex items-center gap-2 text-amber-900 text-[11px] font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            Boutique exclusive Haïti : indicatif <strong>(+509)</strong> exigé · Achats & livraisons réservés à la <strong>commune des Cayes</strong>.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* VIEW 1: FORGOT PASSWORD */}
          {forgotPasswordSent ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Instructions transmises</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Un code de réinitialisation sécurisé a été généré pour <strong>{email}</strong>.
              </p>
              <button
                onClick={() => {
                  setForgotPasswordSent(false);
                  setIsForgotPasswordView(false);
                }}
                className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Retour à la connexion
              </button>
            </div>
          ) : isForgotPasswordView ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Saisissez votre e-mail enregistré pour recevoir votre lien de récupération sécurisé :
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre-email@exemple.com"
                    className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordView(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          ) : isVerifyingOtp ? (
            /* VIEW 2: OTP VERIFICATION (SECURE REGISTRATION STEP) */
            <form onSubmit={handleConfirmOtpAndRegister} className="space-y-4 text-xs">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-indigo-950">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Validation du numéro haïtien (+509)</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Pour sécuriser votre compte et garantir l&apos;acheminement de vos commandes aux Cayes, confirmez le code de sécurité envoyé à <strong>{phone}</strong>.
                </p>
              </div>

              {/* Simulated OTP Display for Demo */}
              <div className="p-2.5 bg-slate-100 border border-dashed border-slate-300 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                  Code de sécurité SMS / WhatsApp simulé :
                </span>
                <span className="font-mono text-base font-extrabold tracking-widest text-slate-900">
                  {generatedOtp}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Saisissez le code à 6 chiffres *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Ex : 509246"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyingOtp(false)}
                  className="w-1/3 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Valider et Activer mon Compte
                </button>
              </div>
            </form>
          ) : (
            /* VIEW 3: STANDARD LOGIN OR REGISTRATION */
            <div className="space-y-4">
              
              {/* Google Authentication Button (1-Click) */}
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle();
                  setActiveModal(null);
                }}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isRegisterMode ? "S'inscrire avec Google" : 'Continuer avec Google'}</span>
              </button>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <div className="flex-1 border-t border-slate-200"></div>
                <span>ou avec e-mail & téléphone (+509)</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
              )}

              {/* FORM: REGISTER OR LOGIN */}
              <form 
                onSubmit={isRegisterMode ? handleInitiateRegistration : handleLoginSubmit} 
                className="space-y-3 text-xs"
              >
                {isRegisterMode ? (
                  <>
                    {/* Full Name */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jean-Luc"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Pierre"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Strict Haitian Phone Number (+509 only) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">
                          Numéro Haïtien (+509) *
                        </label>
                        <span className="text-[10px] text-indigo-600 font-bold">
                          Préfixe +509 exigé
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="+509 3844 5566"
                          className={`w-full p-2.5 pl-8 bg-slate-50 border rounded-lg font-mono font-medium outline-none focus:bg-white ${
                            phoneError ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-indigo-600'
                          }`}
                          required
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      {phoneError ? (
                        <p className="text-[10px] text-rose-600 mt-1 font-medium">{phoneError}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ex : +509 3xxx xxxx (Digicel) ou +509 4xxx xxxx (Natcom)
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Adresse e-mail *</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client.cayes@exemple.com"
                          className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    {/* Password with Strength Indicator */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mot de passe sécurisé *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 caractères avec majuscule & chiffre"
                          className="w-full p-2.5 pl-8 pr-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      {password && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Sécurité du mot de passe :</span>
                            <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                            <div className={`h-full flex-1 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                            <div className={`h-full flex-1 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                            <div className={`h-full flex-1 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                            <div className={`h-full flex-1 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Confirmer le mot de passe *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className="w-full p-2.5 pl-8 pr-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Cayes Territory Acknowledgement */}
                    <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        J&apos;atteste être en Haïti et reconnais que les livraisons s&apos;effectuent exclusivement dans la <strong>commune des Cayes (Sud)</strong> sous 24h avec paiement MonCash/Natcash vérifié.
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors mt-2 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Créer mon compte & Valider par code</span>
                    </button>
                  </>
                ) : (
                  /* LOGIN FORM */
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Adresse e-mail ou Numéro Haïtien (+509) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="client@example.com ou +509 3844 5566"
                          className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600 font-medium"
                          required
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Connectez-vous soit avec votre adresse e-mail, soit avec votre numéro (+509).
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Mot de passe *</label>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordView(true)}
                          className="text-[11px] text-indigo-600 hover:underline font-medium"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 pl-8 pr-8 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors mt-2"
                    >
                      Se connecter en toute sécurité
                    </button>
                  </>
                )}

                {/* Switch between Login and Register */}
                <div className="pt-2 text-center text-xs text-slate-500">
                  {isRegisterMode ? (
                    <span>
                      Vous possédez déjà un compte client ?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setLoginError(null);
                        }}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Se connecter
                      </button>
                    </span>
                  ) : (
                    <span>
                      Pas encore de compte client ?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(true);
                          setLoginError(null);
                        }}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        S&apos;inscrire avec un numéro (+509)
                      </button>
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Quick Demo Shortcuts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Accès rapide démonstration (Comptes Cayes Sud)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleQuickDemoCustomer}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Client Cayes (+509)</span>
              </button>
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-900" />
                <span>Admin Principal</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
