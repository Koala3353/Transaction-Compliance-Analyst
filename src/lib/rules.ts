// ============================================
// Mock AML/KYC Risk Rules Engine
// ============================================

// High-risk countries (sanctions, AML concerns, offshore finance hubs)
export const HIGH_RISK_COUNTRIES = [
  'Cayman Islands',
  'Nigeria',
  'Iran',
  'North Korea',
  'Syria',
  'Russia',
  'Belarus',
  'Myanmar',
  'Afghanistan',
  'Yemen',
  'Venezuela',
  'Panama',
  'British Virgin Islands',
  'Seychelles',
  'Vanuatu',
  'Marshall Islands',
];

// Medium-risk countries
export const MEDIUM_RISK_COUNTRIES = [
  'Philippines',
  'Indonesia',
  'Vietnam',
  'Thailand',
  'Mexico',
  'Colombia',
  'UAE',
  'Qatar',
  'Bahrain',
  'Malta',
  'Cyprus',
  'Mauritius',
  'Bahamas',
];

// Low-risk countries (strong AML frameworks)
export const LOW_RISK_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Singapore',
  'Japan',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Switzerland',
  'New Zealand',
  'Hong Kong',
  'South Korea',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
];

// High-risk transaction purposes
export const HIGH_RISK_PURPOSES = [
  'Gambling',
  'Investment',
  'Shell Company Transfer',
  'Crypto Trading',
  'Real Estate',
];

// Medium-risk transaction purposes
export const MEDIUM_RISK_PURPOSES = [
  'Trade Finance',
  'B2B Payment',
  'Loan Repayment',
  'Charity/Donation',
];

// High-risk counterparty types
export const HIGH_RISK_COUNTERPARTY_TYPES = [
  'Shell Company',
  'Crypto Exchange',
  'Unknown/Unverified',
];

// Medium-risk counterparty types
export const MEDIUM_RISK_COUNTERPARTY_TYPES = [
  'Large Corporate',
  'Financial Institution',
];

// ============================================
// Threshold Configurations
// ============================================

export const THRESHOLDS = {
  // Amount thresholds (in USD equivalent)
  AMOUNT_HIGH_RISK: 50000,
  AMOUNT_MEDIUM_RISK: 10000,
  AMOUNT_STRUCTURING_SINGLE: 9500, // Just under reporting threshold
  AMOUNT_STRUCTURING_TOTAL: 30000, // Total in short period
  
  // Risk score thresholds
  SCORE_LOW_MAX: 25,
  SCORE_MEDIUM_MAX: 50,
  SCORE_HIGH_MAX: 75,
  // Above 75 = Critical
  
  // Frequency thresholds
  TRANSACTIONS_24H_SUSPICIOUS: 3,
  TRANSACTIONS_7D_SUSPICIOUS: 10,
};

// ============================================
// Risk Point Allocations
// ============================================

export const RISK_POINTS = {
  // Country risks
  HIGH_RISK_SOURCE_COUNTRY: 25,
  HIGH_RISK_DEST_COUNTRY: 20,
  MEDIUM_RISK_SOURCE_COUNTRY: 12,
  MEDIUM_RISK_DEST_COUNTRY: 10,
  SANCTIONED_COUNTRY: 50,
  
  // Amount risks
  AMOUNT_OVER_50K: 20,
  AMOUNT_OVER_10K: 10,
  AMOUNT_NEAR_THRESHOLD: 15, // Structuring indicator
  
  // Purpose risks
  HIGH_RISK_PURPOSE: 20,
  MEDIUM_RISK_PURPOSE: 10,
  
  // Counterparty risks
  HIGH_RISK_COUNTERPARTY: 20,
  MEDIUM_RISK_COUNTERPARTY: 8,
  NEW_CUSTOMER: 10,
  PEP: 25,
  
  // Pattern risks
  STRUCTURING_DETECTED: 30,
  UNUSUAL_FREQUENCY: 15,
  ROUND_TRIP_DETECTED: 25,
  SUDDEN_VOLUME_INCREASE: 15,
};

// ============================================
// Document Requirements by Risk Trigger
// ============================================

export const DOCUMENT_REQUIREMENTS = {
  ALWAYS_REQUIRED: [
    { document: 'Proof of Identity (KYC)', priority: 'mandatory' as const },
  ],
  
  HIGH_AMOUNT: [
    { document: 'Source of Funds Statement', priority: 'mandatory' as const },
    { document: 'Bank Statement (last 3 months)', priority: 'mandatory' as const },
  ],
  
  HIGH_RISK_COUNTRY: [
    { document: 'Enhanced Due Diligence Report', priority: 'mandatory' as const },
    { document: 'Proof of Residency', priority: 'mandatory' as const },
    { document: 'Purpose of Transaction Declaration', priority: 'mandatory' as const },
  ],
  
  BUSINESS_TRANSACTION: [
    { document: 'Business Registration / Articles of Incorporation', priority: 'mandatory' as const },
    { document: 'Contracts / Invoices', priority: 'mandatory' as const },
    { document: 'Beneficial Ownership Declaration', priority: 'recommended' as const },
  ],
  
  PAYROLL: [
    { document: 'Employment Contract', priority: 'mandatory' as const },
    { document: 'Payroll List / Schedule', priority: 'mandatory' as const },
  ],
  
  INVESTMENT: [
    { document: 'Investment Agreement', priority: 'mandatory' as const },
    { document: 'Accredited Investor Certification', priority: 'recommended' as const },
    { document: 'Source of Wealth Declaration', priority: 'mandatory' as const },
  ],
  
  PEP: [
    { document: 'PEP Declaration Form', priority: 'mandatory' as const },
    { document: 'Enhanced Source of Wealth Documentation', priority: 'mandatory' as const },
    { document: 'Senior Management Approval', priority: 'mandatory' as const },
  ],
  
  NEW_CUSTOMER: [
    { document: 'Customer Onboarding Form', priority: 'mandatory' as const },
    { document: 'Reference from Existing Customer/Bank', priority: 'recommended' as const },
  ],
  
  STRUCTURING: [
    { document: 'Transaction History Explanation', priority: 'mandatory' as const },
    { document: 'Suspicious Activity Report (internal)', priority: 'mandatory' as const },
  ],
  
  REMITTANCE: [
    { document: 'Relationship to Beneficiary Declaration', priority: 'mandatory' as const },
    { document: 'Beneficiary ID Copy', priority: 'recommended' as const },
  ],
};

// ============================================
// Escalation Rules
// ============================================

export const ESCALATION_RULES = {
  PROCEED_STANDARD: { maxScore: 25, label: 'Proceed with Standard Checks' },
  ENHANCED_DUE_DILIGENCE: { maxScore: 50, label: 'Enhanced Due Diligence Required' },
  ESCALATE_LEVEL_2: { maxScore: 75, label: 'Escalate to Level 2 Compliance Review' },
  ESCALATE_LEVEL_3: { maxScore: 90, label: 'Escalate to Level 3 / Senior Compliance' },
  BLOCK_PENDING_REVIEW: { maxScore: 100, label: 'Block Transaction - Pending Full Review' },
};

// ============================================
// All Countries List (for dropdowns)
// ============================================

export const ALL_COUNTRIES = [
  // Low Risk
  ...LOW_RISK_COUNTRIES,
  // Medium Risk
  ...MEDIUM_RISK_COUNTRIES,
  // High Risk
  ...HIGH_RISK_COUNTRIES,
  // Additional common countries
  'India',
  'China',
  'Brazil',
  'South Africa',
  'Kenya',
  'Ghana',
  'Egypt',
  'Morocco',
  'Saudi Arabia',
  'Israel',
  'Turkey',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Romania',
  'Bulgaria',
  'Croatia',
  'Slovenia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Ireland',
  'Portugal',
  'Spain',
  'Italy',
  'Greece',
  'Austria',
  'Belgium',
  'Luxembourg',
].sort();
