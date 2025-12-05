# Transaction Compliance Analyst

An AI-powered transaction risk analyst that simulates Ripe's initial compliance review for stablecoin-to-fiat transactions across Southeast Asia and APAC.

![Risk Assessment Dashboard](https://via.placeholder.com/800x400?text=Transaction+Compliance+Analyst)

## 🎯 Features

### Core Functionality
- **AI-Powered Risk Analysis**: Uses Gemini AI with detailed AML/KYC rules encoded in the system prompt
- **Structured Risk Assessment**: Returns risk scores (0-100), triggered rules, rationale, and documentation checklists
- **JSON Schema Validation**: Runtime validation of AI responses using Zod with graceful fallbacks
- **Fallback Rule Engine**: Local rule processing if AI response is malformed

### Risk Detection
- **High-Risk Countries**: Cayman Islands, Nigeria, sanctioned regions, offshore finance hubs
- **Transaction Amount Thresholds**: $10,000 (elevated) and $50,000 (high-risk) monitoring
- **Structuring Detection**: Multiple sub-$10k transfers pattern recognition
- **PEP Screening**: Politically Exposed Person flagging
- **Counterparty Risk**: Shell companies, crypto exchanges, unknown entities
- **Purpose-Based Risk**: Gambling, investment, shell company transfers

### User Interface
- **Multi-Step Flow**: Transaction input → AI analysis → Risk assessment
- **Risk Score Visualization**: Color-coded scores with progress bars
- **Documentation Checklist**: Dynamic list of required documents with priorities
- **Audit Logging**: Session-based transaction history with click-to-review
- **Demo Scenarios**: Pre-built low/medium/high risk examples

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transaction-compliance-analyst
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/transaction-compliance-analyst&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20Key%20for%20risk%20analysis&envLink=https://platform.openai.com/api-keys)

### Manual Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add the environment variable:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy!

## 📋 Demo Scenarios

The app includes 6 pre-built demo scenarios:

| Scenario | Risk Level | Description |
|----------|------------|-------------|
| ✅ Standard Payroll | Low | US → Singapore, $3,500 monthly salary |
| ⚠️ E-commerce B2B | Medium | Philippines → Thailand, $15k trade finance |
| 🔴 Offshore Investment | High | Nigeria → Cayman Islands, $75k investment |
| 🔴 Structuring Pattern | High | Russia → UAE, multiple sub-$10k transfers |
| ⚠️ Cross-border Remittance | Medium | Singapore → Philippines, family support |
| 🔴 PEP Gambling | Critical | Venezuela → Malta, $50k gambling transfer |

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/assess/route.ts    # Gemini API integration & fallback engine
│   ├── page.tsx               # Main application page
│   └── layout.tsx             # Root layout
├── components/
│   ├── TransactionForm.tsx    # Transaction input form with demos
│   ├── RiskDashboard.tsx      # Risk assessment display
│   └── AuditLog.tsx           # Session transaction history
└── lib/
    ├── types.ts               # TypeScript types & Zod schemas
    ├── rules.ts               # Mock AML/KYC rule configuration
    └── demo-scenarios.ts      # Pre-built demo transactions
```

## 📊 Risk Assessment Response Schema

```typescript
{
  transactionId: string;
  timestamp: string;
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  triggeredRules: [{
    ruleId: string;
    ruleName: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    pointsAdded: number;
  }];
  rationale: string;
  checklistItems: [{
    id: string;
    document: string;
    required: boolean;
    priority: "mandatory" | "recommended" | "optional";
    reason: string;
  }];
  escalationStatus: 
    | "proceed_standard"
    | "enhanced_due_diligence"
    | "escalate_level_2"
    | "escalate_level_3"
    | "block_pending_review";
  nextSteps: string[];
  processingRecommendation: string;
}
```

## 🎛️ Risk Point Allocations

| Risk Factor | Points |
|-------------|--------|
| High-risk source country | +25 |
| High-risk destination country | +20 |
| Amount > $50,000 | +20 |
| Amount > $10,000 | +10 |
| High-risk purpose (gambling, investment) | +20 |
| High-risk counterparty (shell company) | +20 |
| Politically Exposed Person (PEP) | +25 |
| Structuring pattern detected | +30 |
| New customer | +10 |

## 📈 Risk Level Thresholds

| Score Range | Level | Escalation Status |
|-------------|-------|-------------------|
| 0-25 | Low | Proceed with Standard Checks |
| 26-50 | Medium | Enhanced Due Diligence Required |
| 51-75 | High | Escalate to Level 2 Review |
| 76-90 | Critical | Escalate to Level 3 / Senior Compliance |
| 91-100 | Critical | Block Transaction - Pending Full Review |

## 🔧 Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod
- **Deployment**: Vercel

## ⚠️ Disclaimer

This is a **demo tool** using mock compliance rules. It is **NOT** intended for production compliance use. Real AML/KYC compliance requires:

- Actual sanctions list integration (OFAC, EU, UN)
- Real-time PEP database screening
- Licensed compliance software
- Qualified compliance officers
- Regulatory approval and auditing

## 📄 License

MIT License - See LICENSE file for details

---

Built for the Ripe Transaction Compliance Analyst Bounty
