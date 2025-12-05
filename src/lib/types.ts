import { z } from 'zod';

// ============================================
// Transaction Input Types
// ============================================

export interface TransactionInput {
  transactionId?: string;
  amount: number;
  currency: string;
  sourceJurisdiction: string;
  destinationJurisdiction: string;
  purpose: string;
  counterpartyType: string;
  counterpartyName?: string;
  isNewCustomer?: boolean;
  isPEP?: boolean;
  frequencySignals?: string;
  additionalNotes?: string;
}

// ============================================
// Risk Assessment Response Schema (Zod)
// ============================================

export const TriggeredRuleSchema = z.object({
  ruleId: z.string(),
  ruleName: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  pointsAdded: z.number(),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  document: z.string(),
  required: z.boolean(),
  priority: z.enum(['mandatory', 'recommended', 'optional']),
  reason: z.string(),
});

export const RiskAssessmentSchema = z.object({
  transactionId: z.string(),
  timestamp: z.string(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  triggeredRules: z.array(TriggeredRuleSchema),
  rationale: z.string(),
  checklistItems: z.array(ChecklistItemSchema),
  escalationStatus: z.enum([
    'proceed_standard',
    'enhanced_due_diligence',
    'escalate_level_2',
    'escalate_level_3',
    'block_pending_review',
  ]),
  nextSteps: z.array(z.string()),
  processingRecommendation: z.string(),
});

// Infer types from schemas
export type TriggeredRule = z.infer<typeof TriggeredRuleSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

// ============================================
// Audit Log Types
// ============================================

export interface AuditLogEntry {
  id: string;
  transactionId: string;
  timestamp: string;
  input: TransactionInput;
  result: RiskAssessment;
  processingTimeMs: number;
}

// ============================================
// UI State Types
// ============================================

export type AssessmentStep = 'input' | 'processing' | 'result';

export interface AppState {
  currentStep: AssessmentStep;
  transactionInput: TransactionInput | null;
  assessment: RiskAssessment | null;
  auditLog: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Demo Scenario Type
// ============================================

export interface DemoScenario {
  name: string;
  description: string;
  expectedRisk: 'low' | 'medium' | 'high';
  input: Partial<TransactionInput>;
}

// ============================================
// Constants
// ============================================

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'SGD', 'PHP', 'THB', 'IDR', 'MYR', 'VND', 'INR',
  'USDC', 'USDT', 'DAI', 'BUSD',
] as const;

export const TRANSACTION_PURPOSES = [
  'Payroll',
  'Remittance',
  'Trade Finance',
  'Investment',
  'Gambling',
  'Freelance Payment',
  'E-commerce',
  'B2B Payment',
  'Loan Repayment',
  'Charity/Donation',
  'Real Estate',
  'Shell Company Transfer',
  'Crypto Trading',
  'Other',
] as const;

export const COUNTERPARTY_TYPES = [
  'Individual Freelancer',
  'Small Business (SMB)',
  'Medium Enterprise',
  'Large Corporate',
  'NGO/Non-Profit',
  'Government Entity',
  'Financial Institution',
  'Crypto Exchange',
  'Shell Company',
  'Unknown/Unverified',
] as const;

export const FREQUENCY_SIGNALS = [
  'First transaction',
  'Regular monthly pattern',
  'Multiple sub-10k transfers in 24h',
  'Multiple sub-10k transfers in 7 days',
  'Sudden increase in transaction volume',
  'Round-trip transactions detected',
  'Unusual timing pattern',
  'No previous history',
] as const;
