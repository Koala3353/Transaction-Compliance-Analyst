'use client';

import { RiskAssessment } from '@/lib/types';

interface RiskDashboardProps {
  assessment: RiskAssessment;
  processingTimeMs: number;
  onNewAssessment: () => void;
}

export default function RiskDashboard({ assessment, processingTimeMs, onNewAssessment }: RiskDashboardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-500', text: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-200' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-700', bgLight: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'high': return { bg: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200' };
      case 'critical': return { bg: 'bg-red-600', text: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-200' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700', bgLight: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'mandatory': return '🔴';
      case 'recommended': return '🟡';
      case 'optional': return '🟢';
      default: return '⚪';
    }
  };

  const getEscalationBadge = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      'proceed_standard': { label: 'Proceed with Standard Checks', color: 'bg-green-100 text-green-800' },
      'enhanced_due_diligence': { label: 'Enhanced Due Diligence Required', color: 'bg-yellow-100 text-yellow-800' },
      'escalate_level_2': { label: 'Escalate to Level 2 Review', color: 'bg-orange-100 text-orange-800' },
      'escalate_level_3': { label: 'Escalate to Level 3 / Senior Compliance', color: 'bg-red-100 text-red-800' },
      'block_pending_review': { label: 'BLOCK - Pending Full Review', color: 'bg-red-600 text-white' },
    };
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const colors = getRiskColor(assessment.riskLevel);
  const escalation = getEscalationBadge(assessment.escalationStatus);

  return (
    <div className="space-y-6">
      {/* Main Risk Card */}
      <div className={`bg-white rounded-2xl shadow-xl border-2 ${colors.border} overflow-hidden`}>
        {/* Header with Risk Score */}
        <div className={`${colors.bg} px-6 py-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 uppercase tracking-wide">Compliance Risk Assessment</p>
              <p className="text-xs opacity-60 mt-1">Transaction ID: {assessment.transactionId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Processed in {processingTimeMs}ms</p>
              <p className="text-xs opacity-60">{new Date(assessment.timestamp).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Risk Score Display */}
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-bold">{assessment.riskScore}</span>
                <span className="text-2xl opacity-80">/100</span>
              </div>
              <p className="text-xl font-semibold mt-1 uppercase tracking-wider">
                {assessment.riskLevel} Risk
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-lg ${escalation.color} font-medium text-sm`}>
                {escalation.label}
              </div>
            </div>
          </div>

          {/* Risk Score Bar */}
          <div className="mt-4">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${assessment.riskScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs opacity-60 mt-1">
              <span>Low (0-25)</span>
              <span>Medium (26-50)</span>
              <span>High (51-75)</span>
              <span>Critical (76+)</span>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className={`px-6 py-4 ${colors.bgLight} border-b ${colors.border}`}>
          <h3 className={`font-semibold ${colors.text} mb-2 flex items-center gap-2`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Risk Assessment Rationale
          </h3>
          <p className="text-gray-700">{assessment.rationale}</p>
        </div>

        {/* Processing Recommendation */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Processing Recommendation
          </h3>
          <p className="text-gray-700 font-medium">{assessment.processingRecommendation}</p>
        </div>
      </div>

      {/* Triggered Rules */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Triggered Risk Rules ({assessment.triggeredRules.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {assessment.triggeredRules.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No risk rules triggered</p>
            </div>
          ) : (
            assessment.triggeredRules.map((rule, idx) => (
              <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                        {rule.severity.toUpperCase()}
                      </span>
                      <h4 className="font-semibold text-gray-800">{rule.ruleName}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Rule ID: {rule.ruleId}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-bold text-red-600">+{rule.pointsAdded}</span>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Documentation Checklist */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <h3 className="font-bold text-blue-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Required Documentation ({assessment.checklistItems.filter(i => i.required).length} mandatory)
          </h3>
          <p className="text-sm text-blue-600 mt-1">Complete these documents before settlement approval</p>
        </div>
        <div className="divide-y divide-gray-100">
          {assessment.checklistItems.map((item, idx) => (
            <div key={idx} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
              <span className="text-lg">{getPriorityIcon(item.priority)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{item.document}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    item.priority === 'mandatory' ? 'bg-red-100 text-red-700' :
                    item.priority === 'recommended' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{item.reason}</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
          <h3 className="font-bold text-purple-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Next Steps
          </h3>
        </div>
        <div className="px-6 py-4">
          <ol className="space-y-2">
            {assessment.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewAssessment}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Assessment
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>
    </div>
  );
}
