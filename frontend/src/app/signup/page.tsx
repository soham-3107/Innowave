"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Compass, 
  Fish, 
  Microscope, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  ShieldAlert, 
  Anchor, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

const REGIONS = [
  { key: "mumbai", name: "Mumbai Coast (Arabian Sea)" },
  { key: "goa", name: "Goa Coast (Arabian Sea)" },
  { key: "kochi", name: "Kochi Coast (Arabian Sea)" },
  { key: "chennai", name: "Chennai Coast (Bay of Bengal)" },
  { key: "veraval", name: "Veraval / Gujarat Coast (Arabian Sea)" },
  { key: "vizag", name: "Visakhapatnam Coast (Bay of Bengal)" }
];

const GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say"
];

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+960", label: "Maldives (+960)" },
  { code: "+971", label: "UAE (+971)" }
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  // Selected Role (Fisherman by default)
  const [role, setRole] = useState<UserRole>("fisherman");

  // Base Fields
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [defaultRegion, setDefaultRegion] = useState("mumbai");
  
  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyCountryCode, setEmergencyCountryCode] = useState("+91");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Passwords
  // NOTE: Standard email/password authentication is implemented.
  // Phone-OTP authentication via SMS gateway (e.g. Twilio/Karix) can replace or augment this in future iterations.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-specific Dynamic Fields
  // 1. Fisherman
  const [boatName, setBoatName] = useState("");
  const [boatRegistration, setBoatRegistration] = useState("");
  const [homePort, setHomePort] = useState("");

  // 2. Researcher
  const [institutionName, setInstitutionName] = useState("");
  const [researchInterest, setResearchInterest] = useState("");

  // 3. Government Official
  const [departmentName, setDepartmentName] = useState("");
  const [designation, setDesignation] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    const cleanEmergencyPhone = emergencyContactPhone.replace(/\D/g, "");
    if (!emergencyContactName.trim() || cleanEmergencyPhone.length !== 10) {
      setErrorMessage("Please provide a valid 10-digit emergency contact phone number for maritime safety dispatch.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    // Role-specific validation
    if (role === "fisherman" && (!boatName.trim() || !boatRegistration.trim() || !homePort.trim())) {
      setErrorMessage("Please complete all boat details (Boat Name, Registration No., and Home Port).");
      return;
    }
    if (role === "researcher" && (!institutionName.trim() || !researchInterest.trim())) {
      setErrorMessage("Please enter your research institution and primary area of interest.");
      return;
    }
    if (role === "official" && (!departmentName.trim() || !designation.trim() || !jurisdiction.trim())) {
      setErrorMessage("Please fill in your department name, designation, and maritime jurisdiction.");
      return;
    }

    // Build role details JSON object
    const roleDetailsObj: any = {};
    if (role === "fisherman") {
      roleDetailsObj.boat_name = boatName.trim();
      roleDetailsObj.boat_registration = boatRegistration.trim().toUpperCase();
      roleDetailsObj.home_port = homePort.trim();
    } else if (role === "researcher") {
      roleDetailsObj.institution_name = institutionName.trim();
      roleDetailsObj.research_interest = researchInterest.trim();
    } else if (role === "official") {
      roleDetailsObj.department_name = departmentName.trim();
      roleDetailsObj.designation = designation.trim();
      roleDetailsObj.jurisdiction = jurisdiction.trim();
    }

    setIsSubmitting(true);

    const fullPhone = `${countryCode} ${cleanPhone}`;
    const fullEmergencyPhone = `${emergencyCountryCode} ${cleanEmergencyPhone}`;

    const res = await signup({
      full_name: fullName.trim(),
      phone: fullPhone,
      email: email.trim().toLowerCase(),
      gender,
      role,
      default_region: defaultRegion,
      emergency_contact_name: emergencyContactName.trim(),
      emergency_contact_phone: fullEmergencyPhone,
      password,
      role_details: roleDetailsObj
    });

    setIsSubmitting(false);

    if (res.success) {
      // Redirect to main dashboard with user's default coastal zone pre-selected
      router.push("/");
    } else {
      setErrorMessage(res.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-blue-900 to-indigo-900 p-2.5 rounded-2xl border border-blue-400/30 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="h-7 w-7 text-white animate-spin-slow" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-wider text-blue-950 font-sans block leading-none">
                INNOWAVE
              </span>
              <span className="text-[11px] text-slate-500 font-mono tracking-tight">
                Autonomous Marine Intelligence Suite
              </span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-2">
            Create Your Maritime Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Access personalized potential fishing zones, telemetry, radar overlays, and AI safety navigation tailored to your role.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: ROLE SELECTOR TILES */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider font-mono">
                1. Select Your Operational Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 🎣 Fisherman Card */}
                <button
                  type="button"
                  onClick={() => setRole("fisherman")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                    role === "fisherman"
                      ? "border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/10 shadow-xs"
                      : "border-stone-200 bg-[#FAF8F5] hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {role === "fisherman" && (
                    <div className="absolute top-2.5 right-2.5 text-blue-900">
                      <CheckCircle2 className="h-4 w-4 fill-blue-900 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${role === "fisherman" ? "bg-blue-900 text-white" : "bg-white text-blue-900 border border-stone-200"}`}>
                      <Fish className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-xs text-blue-950">Fisherman</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    For boat owners, deep-sea mariners, and trawler captains.
                  </p>
                </button>

                {/* 🔬 Researcher Card */}
                <button
                  type="button"
                  onClick={() => setRole("researcher")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                    role === "researcher"
                      ? "border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/10 shadow-xs"
                      : "border-stone-200 bg-[#FAF8F5] hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {role === "researcher" && (
                    <div className="absolute top-2.5 right-2.5 text-teal-700">
                      <CheckCircle2 className="h-4 w-4 fill-teal-700 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${role === "researcher" ? "bg-teal-700 text-white" : "bg-white text-teal-700 border border-stone-200"}`}>
                      <Microscope className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">Researcher</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    For oceanographers, marine biologists, and academic institutions.
                  </p>
                </button>

                {/* 🏛️ Official Card */}
                <button
                  type="button"
                  onClick={() => setRole("official")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                    role === "official"
                      ? "border-indigo-900 bg-indigo-50/60 ring-2 ring-indigo-900/10 shadow-xs"
                      : "border-stone-200 bg-[#FAF8F5] hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {role === "official" && (
                    <div className="absolute top-2.5 right-2.5 text-indigo-900">
                      <CheckCircle2 className="h-4 w-4 fill-indigo-900 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${role === "official" ? "bg-indigo-900 text-white" : "bg-white text-indigo-900 border border-stone-200"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">Govt Official</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    For Coast Guard, Port Authorities, and Fisheries Departments.
                  </p>
                </button>

              </div>
            </div>

            {/* STEP 2: BASE PROFILE FIELDS */}
            <div className="space-y-4 pt-2 border-t border-stone-200/80">
              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider font-mono">
                2. Base Profile Information
              </label>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Capt. Rajesh Patil"
                    className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Contact Row: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-[#FAF8F5] border border-stone-200 text-xs text-slate-800 rounded-xl px-2 py-2.5 focus:border-blue-900 focus:outline-none cursor-pointer font-mono font-bold"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1 flex items-center">
                      <Phone className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9820154321"
                        className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rajesh.patil@innowave.in"
                      className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & Default Coastal Zone Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all cursor-pointer font-sans"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Coastal Region */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Coastal Zone / Sector <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 h-4 w-4 text-blue-900 pointer-events-none" />
                    <select
                      value={defaultRegion}
                      onChange={(e) => setDefaultRegion(e.target.value)}
                      className="w-full bg-[#FAF8F5] focus:bg-white text-xs font-bold text-blue-950 pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all cursor-pointer font-sans"
                    >
                      {REGIONS.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Pre-selects your primary operational sector on the Marine Radar.
                  </p>
                </div>
              </div>

            </div>

            {/* STEP 3: EMERGENCY CONTACT (MARITIME SAFETY) */}
            <div className="space-y-4 pt-2 border-t border-stone-200/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  3. Emergency Contact (SOS Dispatch)
                </label>
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono">
                  Coast Guard Protocol
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Your registered emergency contact automatically receives an urgent SMS with your last known live GPS coordinates, sector danger score, and map link whenever the distress SOS signal is activated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emergency Contact Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Sunita Patil (Spouse / Kin)"
                    className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-sans"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={emergencyCountryCode}
                      onChange={(e) => setEmergencyCountryCode(e.target.value)}
                      className="bg-[#FAF8F5] border border-stone-200 text-xs text-slate-800 rounded-xl px-2 py-2.5 focus:border-blue-900 focus:outline-none cursor-pointer font-mono font-bold"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9820198765"
                      className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 px-3 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: CONDITIONAL ROLE-SPECIFIC FIELDS */}
            <div className="space-y-4 pt-2 border-t border-stone-200/80 animate-in fade-in duration-200">
              
              {/* === IF FISHERMAN === */}
              {role === "fisherman" && (
                <div className="bg-blue-50/50 border border-blue-200/80 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-blue-900" />
                    <span className="font-bold text-xs text-blue-950 uppercase tracking-wider font-mono">
                      4. Vessel & Harbor Details (Fisherman)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Boat / Vessel Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={boatName}
                        onChange={(e) => setBoatName(e.target.value)}
                        placeholder="e.g. Matsya Sagar IV"
                        className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Boat Registration No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={boatRegistration}
                        onChange={(e) => setBoatRegistration(e.target.value)}
                        placeholder="e.g. IND-MH-01-MM-4820"
                        className="w-full bg-white text-xs font-mono font-bold text-blue-950 uppercase px-3 py-2 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Home Port / Coastal District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={homePort}
                      onChange={(e) => setHomePort(e.target.value)}
                      placeholder="e.g. Sassoon Docks, Mumbai (or Malpe, Kochi, Veraval)"
                      className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none font-sans"
                    />
                  </div>
                </div>
              )}

              {/* === IF RESEARCHER === */}
              {role === "researcher" && (
                <div className="bg-teal-50/50 border border-teal-200/80 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Microscope className="h-4 w-4 text-teal-800" />
                    <span className="font-bold text-xs text-teal-950 uppercase tracking-wider font-mono">
                      4. Research Credentials (Academic)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Institution / Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Central Marine Fisheries Research Institute (CMFRI) / INCOIS"
                      className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-teal-700 focus:outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Area of Research Interest <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={researchInterest}
                      onChange={(e) => setResearchInterest(e.target.value)}
                      placeholder="e.g. Pelagic Fish Migration Patterns, Ocean Chlorophyll Front Dynamics, and Acoustic Biomass Estimation."
                      className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-teal-700 focus:outline-none font-sans resize-none"
                    />
                  </div>
                </div>
              )}

              {/* === IF GOVERNMENT OFFICIAL === */}
              {role === "official" && (
                <div className="bg-indigo-50/50 border border-indigo-200/80 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-900" />
                    <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider font-mono">
                      4. Department & Enforcement Jurisdiction
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        placeholder="e.g. Indian Coast Guard (ICG) / Dept of Fisheries"
                        className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-indigo-900 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Assistant Director of Marine Enforcement"
                        className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-indigo-900 focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Maritime Jurisdiction (State / District) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="e.g. Maharashtra & Goa Maritime Boundary Zone"
                      className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-xl border border-stone-200 focus:border-indigo-900 focus:outline-none font-sans"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* STEP 5: SECURITY (PASSWORD CREATION) */}
            <div className="space-y-4 pt-2 border-t border-stone-200/80">
              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider font-mono">
                5. Password & Security
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] focus:bg-white text-xs text-slate-900 pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-850 hover:to-indigo-850 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Maritime Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Enter Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-stone-150">
              <p className="text-xs text-slate-600">
                Already registered?{" "}
                <Link href="/login" className="font-bold text-blue-900 hover:underline">
                  Log in to your account
                </Link>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
