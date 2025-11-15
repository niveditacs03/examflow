export interface CandidateFormData {
    // Personal Information
    fullName: string;
    fatherName: string;
    motherName: string;
    dateOfBirth: string;
    gender: string;
    
    // Contact Information
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    
    // Exam Details
    examName: string;
    examCategory: string;
    
    // Educational Qualification
    qualification: string;
    passingYear: string;
    percentage: string;
    
    // Exam Center Preference
    preferredCenter1: string;
    preferredCenter2: string;
    preferredCenter3: string;
    
    // Identity Proof
    aadharNumber: string;
    
    // Photo
    photoURL: string;
  }
  
  export interface CandidateData {
    id: string;
    registrationNumber: string;
    fullName: string;
    fatherName: string;
    dateOfBirth: Date;
    examName: string;
    examCategory: string;
    assignedCenter: string;
    examDate: string;
    reportingTime: string;
    registrationHash: string;
    photoURL: string;
    blockchainId: string;
  }
  