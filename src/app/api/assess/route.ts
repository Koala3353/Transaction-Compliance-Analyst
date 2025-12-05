import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { RiskAssessmentSchema, TransactionInput, RiskAssessment } from '@/lib/types';
import {
  HIGH_RISK_COUNTRIES,
  MEDIUM_RISK_COUNTRIES,
  HIGH_RISK_PURPOSES,
  MEDIUM_RISK_PURPOSES,
  HIGH_RISK_COUNTERPARTY_TYPES,
  MEDIUM_RISK_COUNTERPARTY_TYPES,
  THRESHOLDS,
  RISK_POINTS,
  DOCUMENT_REQUIREMENTS,
} from '@/lib/rules';

const SYSTEM_PROMPT = `You are an expert AML/KYC compliance analyst for Ripe, a global stablecoin-to-fiat payment network serving freelancers, SMBs, and remittance recipients across Southeast Asia and APAC.

Your role is to analyze transactions and provide structured risk assessments based on the following MOCK COMPLIANCE RULES:

## RISK MATRIX

### High-Risk Countries (25 points source, 20 points destination):
${HIGH_RISK_COUNTRIES.join(', ')}

### Medium-Risk Countries (12 points source, 10 points destination):
${MEDIUM_RISK_COUNTRIES.join(', ')}

### High-Risk Transaction Purposes (20 points):
${HIGH_RISK_PURPOSES.join(', ')}

### Medium-Risk Transaction Purposes (10 points):
${MEDIUM_RISK_PURPOSES.join(', ')}

### High-Risk Counterparty Types (20 points):
${HIGH_RISK_COUNTERPARTY_TYPES.join(', ')}

### Medium-Risk Counterparty Types (8 points):
${MEDIUM_RISK_COUNTERPARTY_TYPES.join(', ')}

## AMOUNT THRESHOLDS
- Over $50,000: +20 points (High Amount)
- Over $10,000: +10 points (Elevated Amount)
- Near $9,500 (structuring indicator): +15 points

## CUSTOMER FLAGS
- New Customer: +10 points
- Politically Exposed Person (PEP): +25 points

## PATTERN DETECTION
- Structuring (multiple sub-$10k transfers): +30 points
- Round-trip transactions: +25 points
- Unusual frequency patterns: +15 points
- Sudden volume increase: +15 points

## RISK LEVEL THRESHOLDS
- Low Risk: 0-25 points
- Medium Risk: 26-50 points
- High Risk: 51-75 points
- Critical Risk: 76-100 points

## ESCALATION RULES
- 0-25: Proceed with Standard Checks
- 26-50: Enhanced Due Diligence Required
- 51-75: Escalate to Level 2 Compliance Review
- 76-90: Escalate to Level 3 / Senior Compliance
- 91-100: Block Transaction - Pending Full Review

## DOCUMENT REQUIREMENTS
Based on triggered rules, require appropriate documentation:
- High amounts: Source of Funds Statement, Bank Statements
- High-risk countries: Enhanced Due Diligence Report, Proof of Residency
- Business transactions: Business Registration, Contracts/Invoices
- PEP: PEP Declaration, Source of Wealth, Senior Management Approval
- Structuring: Transaction History Explanation, Internal SAR
- New customers: Onboarding Form, References

You MUST respond with a valid JSON object matching this exact schema:
{
  "transactionId": "string (provided)",
  "timestamp": "ISO date string",
  "riskScore": number (0-100),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "triggeredRules": [
    {
      "ruleId": "string (unique identifier like COUNTRY_HIGH_RISK_SRC)",
      "ruleName": "string (human readable name)",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "string (detailed explanation)",
      "pointsAdded": number
    }
  ],
  "rationale": "string (2-3 sentence summary of why this risk level)",
  "checklistItems": [
    {
      "id": "string",
      "document": "string (document name)",
      "required": boolean,
      "priority": "mandatory" | "recommended" | "optional",
      "reason": "string (why this document is needed)"
    }
  ],
  "escalationStatus": "proceed_standard" | "enhanced_due_diligence" | "escalate_level_2" | "escalate_level_3" | "block_pending_review",
  "nextSteps": ["array of action items"],
  "processingRecommendation": "string (clear guidance for ops team)"
}

Be precise, consistent, and realistic in your assessments. Always explain your reasoning clearly.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: TransactionInput = body;

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate transaction ID if not provided
    const transactionId = input.transactionId || `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Build the transaction analysis prompt
    const userPrompt = `Analyze the following transaction for AML/KYC compliance risk:

Transaction ID: ${transactionId}
Amount: ${input.amount} ${input.currency}
Source Jurisdiction: ${input.sourceJurisdiction}
Destination Jurisdiction: ${input.destinationJurisdiction}
Transaction Purpose: ${input.purpose}
Counterparty Type: ${input.counterpartyType}
Counterparty Name: ${input.counterpartyName || 'Not provided'}
New Customer: ${input.isNewCustomer ? 'Yes' : 'No'}
Politically Exposed Person (PEP): ${input.isPEP ? 'Yes' : 'No'}
Frequency/History Signals: ${input.frequencySignals || 'None specified'}
Additional Notes: ${input.additionalNotes || 'None'}

Apply the mock AML/KYC rules from your system instructions and provide a complete structured risk assessment.
Respond ONLY with a valid JSON object, no additional text or markdown formatting.`;

    const startTime = Date.now();
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const processingTime = Date.now() - startTime;
    const responseText = completion.choices[0]?.message?.content || '';

    // Parse and validate the response
    let assessment: RiskAssessment;
    
    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      const parsed = JSON.parse(cleanedResponse);
      
      // Validate against schema
      const validationResult = RiskAssessmentSchema.safeParse(parsed);
      
      if (!validationResult.success) {
        console.error('Schema validation failed:', validationResult.error);
        // Attempt to create a fallback response
        assessment = createFallbackAssessment(input, transactionId, parsed);
      } else {
        assessment = validationResult.data;
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', responseText);
      // Create a fallback assessment based on rule engine
      assessment = createFallbackAssessment(input, transactionId);
    }

    return NextResponse.json({
      success: true,
      assessment,
      processingTimeMs: processingTime,
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process transaction assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback assessment using local rule engine
function createFallbackAssessment(
  input: TransactionInput, 
  transactionId: string,
  partialResponse?: Partial<RiskAssessment>
): RiskAssessment {
  let riskScore = 0;
  const triggeredRules: RiskAssessment['triggeredRules'] = [];
  const checklistItems: RiskAssessment['checklistItems'] = [];
  let checklistId = 1;

  // Always add KYC
  checklistItems.push({
    id: `DOC-${checklistId++}`,
    document: 'Proof of Identity (KYC)',
    required: true,
    priority: 'mandatory',
    reason: 'Standard KYC requirement for all transactions',
  });

  // Check source country
  if (HIGH_RISK_COUNTRIES.includes(input.sourceJurisdiction)) {
    riskScore += RISK_POINTS.HIGH_RISK_SOURCE_COUNTRY;
    triggeredRules.push({
      ruleId: 'COUNTRY_HIGH_RISK_SRC',
      ruleName: 'High-Risk Source Country',
      severity: 'high',
      description: `Source jurisdiction ${input.sourceJurisdiction} is classified as high-risk`,
      pointsAdded: RISK_POINTS.HIGH_RISK_SOURCE_COUNTRY,
    });
  } else if (MEDIUM_RISK_COUNTRIES.includes(input.sourceJurisdiction)) {
    riskScore += RISK_POINTS.MEDIUM_RISK_SOURCE_COUNTRY;
    triggeredRules.push({
      ruleId: 'COUNTRY_MEDIUM_RISK_SRC',
      ruleName: 'Medium-Risk Source Country',
      severity: 'medium',
      description: `Source jurisdiction ${input.sourceJurisdiction} has elevated AML risk`,
      pointsAdded: RISK_POINTS.MEDIUM_RISK_SOURCE_COUNTRY,
    });
  }

  // Check destination country
  if (HIGH_RISK_COUNTRIES.includes(input.destinationJurisdiction)) {
    riskScore += RISK_POINTS.HIGH_RISK_DEST_COUNTRY;
    triggeredRules.push({
      ruleId: 'COUNTRY_HIGH_RISK_DST',
      ruleName: 'High-Risk Destination Country',
      severity: 'high',
      description: `Destination jurisdiction ${input.destinationJurisdiction} is classified as high-risk`,
      pointsAdded: RISK_POINTS.HIGH_RISK_DEST_COUNTRY,
    });
    DOCUMENT_REQUIREMENTS.HIGH_RISK_COUNTRY.forEach(doc => {
      checklistItems.push({
        id: `DOC-${checklistId++}`,
        document: doc.document,
        required: true,
        priority: doc.priority,
        reason: `Required for transactions involving high-risk jurisdiction ${input.destinationJurisdiction}`,
      });
    });
  }

  // Check amount
  if (input.amount >= THRESHOLDS.AMOUNT_HIGH_RISK) {
    riskScore += RISK_POINTS.AMOUNT_OVER_50K;
    triggeredRules.push({
      ruleId: 'AMOUNT_HIGH',
      ruleName: 'High Transaction Amount',
      severity: 'high',
      description: `Transaction amount of ${input.amount} ${input.currency} exceeds $50,000 threshold`,
      pointsAdded: RISK_POINTS.AMOUNT_OVER_50K,
    });
    DOCUMENT_REQUIREMENTS.HIGH_AMOUNT.forEach(doc => {
      checklistItems.push({
        id: `DOC-${checklistId++}`,
        document: doc.document,
        required: true,
        priority: doc.priority,
        reason: 'Required for high-value transactions',
      });
    });
  } else if (input.amount >= THRESHOLDS.AMOUNT_MEDIUM_RISK) {
    riskScore += RISK_POINTS.AMOUNT_OVER_10K;
    triggeredRules.push({
      ruleId: 'AMOUNT_ELEVATED',
      ruleName: 'Elevated Transaction Amount',
      severity: 'medium',
      description: `Transaction amount of ${input.amount} ${input.currency} exceeds $10,000 threshold`,
      pointsAdded: RISK_POINTS.AMOUNT_OVER_10K,
    });
  }

  // Check purpose
  if (HIGH_RISK_PURPOSES.includes(input.purpose)) {
    riskScore += RISK_POINTS.HIGH_RISK_PURPOSE;
    triggeredRules.push({
      ruleId: 'PURPOSE_HIGH_RISK',
      ruleName: 'High-Risk Transaction Purpose',
      severity: 'high',
      description: `Transaction purpose "${input.purpose}" is classified as high-risk`,
      pointsAdded: RISK_POINTS.HIGH_RISK_PURPOSE,
    });
  } else if (MEDIUM_RISK_PURPOSES.includes(input.purpose)) {
    riskScore += RISK_POINTS.MEDIUM_RISK_PURPOSE;
    triggeredRules.push({
      ruleId: 'PURPOSE_MEDIUM_RISK',
      ruleName: 'Medium-Risk Transaction Purpose',
      severity: 'medium',
      description: `Transaction purpose "${input.purpose}" requires additional scrutiny`,
      pointsAdded: RISK_POINTS.MEDIUM_RISK_PURPOSE,
    });
  }

  // Check counterparty type
  if (HIGH_RISK_COUNTERPARTY_TYPES.includes(input.counterpartyType)) {
    riskScore += RISK_POINTS.HIGH_RISK_COUNTERPARTY;
    triggeredRules.push({
      ruleId: 'COUNTERPARTY_HIGH_RISK',
      ruleName: 'High-Risk Counterparty Type',
      severity: 'high',
      description: `Counterparty type "${input.counterpartyType}" is classified as high-risk`,
      pointsAdded: RISK_POINTS.HIGH_RISK_COUNTERPARTY,
    });
  }

  // Check PEP status
  if (input.isPEP) {
    riskScore += RISK_POINTS.PEP;
    triggeredRules.push({
      ruleId: 'PEP_FLAG',
      ruleName: 'Politically Exposed Person',
      severity: 'critical',
      description: 'Counterparty or beneficial owner is a Politically Exposed Person',
      pointsAdded: RISK_POINTS.PEP,
    });
    DOCUMENT_REQUIREMENTS.PEP.forEach(doc => {
      checklistItems.push({
        id: `DOC-${checklistId++}`,
        document: doc.document,
        required: true,
        priority: doc.priority,
        reason: 'Required for transactions involving PEPs',
      });
    });
  }

  // Check new customer
  if (input.isNewCustomer) {
    riskScore += RISK_POINTS.NEW_CUSTOMER;
    triggeredRules.push({
      ruleId: 'NEW_CUSTOMER',
      ruleName: 'New Customer Flag',
      severity: 'low',
      description: 'Customer has limited transaction history',
      pointsAdded: RISK_POINTS.NEW_CUSTOMER,
    });
    DOCUMENT_REQUIREMENTS.NEW_CUSTOMER.forEach(doc => {
      checklistItems.push({
        id: `DOC-${checklistId++}`,
        document: doc.document,
        required: doc.priority === 'mandatory',
        priority: doc.priority,
        reason: 'Required for new customer onboarding',
      });
    });
  }

  // Check frequency signals
  if (input.frequencySignals?.includes('sub-10k')) {
    riskScore += RISK_POINTS.STRUCTURING_DETECTED;
    triggeredRules.push({
      ruleId: 'STRUCTURING',
      ruleName: 'Potential Structuring Detected',
      severity: 'critical',
      description: 'Multiple transactions just under reporting threshold suggest potential structuring',
      pointsAdded: RISK_POINTS.STRUCTURING_DETECTED,
    });
    DOCUMENT_REQUIREMENTS.STRUCTURING.forEach(doc => {
      checklistItems.push({
        id: `DOC-${checklistId++}`,
        document: doc.document,
        required: true,
        priority: doc.priority,
        reason: 'Required due to potential structuring activity',
      });
    });
  }

  // Cap score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel: RiskAssessment['riskLevel'];
  if (riskScore <= THRESHOLDS.SCORE_LOW_MAX) {
    riskLevel = 'low';
  } else if (riskScore <= THRESHOLDS.SCORE_MEDIUM_MAX) {
    riskLevel = 'medium';
  } else if (riskScore <= THRESHOLDS.SCORE_HIGH_MAX) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  // Determine escalation status
  let escalationStatus: RiskAssessment['escalationStatus'];
  if (riskScore <= 25) {
    escalationStatus = 'proceed_standard';
  } else if (riskScore <= 50) {
    escalationStatus = 'enhanced_due_diligence';
  } else if (riskScore <= 75) {
    escalationStatus = 'escalate_level_2';
  } else if (riskScore <= 90) {
    escalationStatus = 'escalate_level_3';
  } else {
    escalationStatus = 'block_pending_review';
  }

  // Generate rationale
  const topRules = triggeredRules.slice(0, 3).map(r => r.ruleName).join(', ');
  const rationale = triggeredRules.length > 0
    ? `This transaction has been assessed as ${riskLevel.toUpperCase()} risk (score: ${riskScore}/100) due to: ${topRules}. ${triggeredRules.length > 3 ? `Additionally, ${triggeredRules.length - 3} other risk factors were identified.` : ''}`
    : `This transaction has been assessed as LOW risk with no significant risk factors identified.`;

  // Generate next steps
  const nextSteps = [];
  if (riskLevel === 'low') {
    nextSteps.push('Complete standard verification checks');
    nextSteps.push('Process transaction within normal SLA');
  } else if (riskLevel === 'medium') {
    nextSteps.push('Complete enhanced due diligence review');
    nextSteps.push('Verify all required documentation');
    nextSteps.push('Document review findings before approval');
  } else {
    nextSteps.push('Escalate to senior compliance officer');
    nextSteps.push('Collect all mandatory documentation');
    nextSteps.push('Consider filing SAR if warranted');
    nextSteps.push('Do not process until full review complete');
  }

  return {
    transactionId,
    timestamp: new Date().toISOString(),
    riskScore: partialResponse?.riskScore ?? riskScore,
    riskLevel: partialResponse?.riskLevel ?? riskLevel,
    triggeredRules: partialResponse?.triggeredRules ?? triggeredRules,
    rationale: partialResponse?.rationale ?? rationale,
    checklistItems: partialResponse?.checklistItems ?? checklistItems,
    escalationStatus: partialResponse?.escalationStatus ?? escalationStatus,
    nextSteps: partialResponse?.nextSteps ?? nextSteps,
    processingRecommendation: partialResponse?.processingRecommendation ?? 
      `${riskLevel.toUpperCase()} RISK: ${escalationStatus.replace(/_/g, ' ').toUpperCase()}`,
  };
}
