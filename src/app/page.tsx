'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TransactionForm from '@/components/TransactionForm';
import RiskDashboard from '@/components/RiskDashboard';
import AuditLog from '@/components/AuditLog';
import { TransactionInput, RiskAssessment, AuditLogEntry, AssessmentStep } from '@/lib/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('input');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [processingTimeMs, setProcessingTimeMs] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<TransactionInput | null>(null);

  const handleSubmit = useCallback(async (input: TransactionInput) => {
    setIsLoading(true);
    setError(null);
    setLastInput(input);
    setCurrentStep('processing');

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process assessment');
      }

      setAssessment(data.assessment);
      setProcessingTimeMs(data.processingTimeMs);
      setCurrentStep('result');

      // Add to audit log
      const logEntry: AuditLogEntry = {
        id: uuidv4(),
        transactionId: data.assessment.transactionId,
        timestamp: data.assessment.timestamp,
        input,
        result: data.assessment,
        processingTimeMs: data.processingTimeMs,
      };
      setAuditLog(prev => [logEntry, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewAssessment = useCallback(() => {
    setCurrentStep('input');
    setAssessment(null);
    setError(null);
  }, []);

  const handleSelectAuditEntry = useCallback((entry: AuditLogEntry) => {
    setAssessment(entry.result);
    setProcessingTimeMs(entry.processingTimeMs);
    setLastInput(entry.input);
    setCurrentStep('result');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Transaction Compliance Analyst</h1>
                <p className="text-sm text-gray-500">AI-Powered AML/KYC Risk Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Powered by</span>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">OpenAI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center gap-4">
          {[
            { step: 'input', label: 'Transaction Details', icon: '📝' },
            { step: 'processing', label: 'AI Analysis', icon: '🤖' },
            { step: 'result', label: 'Risk Assessment', icon: '📊' },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === item.step 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : currentStep === 'result' || (currentStep === 'processing' && idx === 0)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <span>{item.icon}</span>
                <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
              </div>
              {idx < 2 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  (currentStep === 'result') || (currentStep === 'processing' && idx === 0)
                    ? 'bg-green-300' 
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Error Processing Assessment</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form or Result */}
          <div className="lg:col-span-2">
            {currentStep === 'input' || currentStep === 'processing' ? (
              <TransactionForm onSubmit={handleSubmit} isLoading={isLoading} />
            ) : assessment && (
              <RiskDashboard 
                assessment={assessment} 
                processingTimeMs={processingTimeMs}
                onNewAssessment={handleNewAssessment}
              />
            )}
          </div>

          {/* Right Column - Audit Log */}
          <div className="lg:col-span-1">
            <AuditLog entries={auditLog} onSelectEntry={handleSelectAuditEntry} />
            
            {/* Info Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About This Tool
                </h3>
              </div>
              <div className="px-6 py-4 text-sm text-gray-600 space-y-3">
                <p>
                  This tool simulates <strong>Ripe&apos;s</strong> first-line compliance review for 
                  stablecoin-to-fiat transactions across Southeast Asia and APAC.
                </p>
                <p>
                  It applies mock <strong>AML/KYC rules</strong> including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>High-risk country detection</li>
                  <li>Amount threshold monitoring</li>
                  <li>Structuring pattern detection</li>
                  <li>PEP screening</li>
                  <li>Counterparty risk assessment</li>
                </ul>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  ⚠️ This is a demo tool using mock rules. Not for production compliance use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Transaction Compliance Analyst • Built for Ripe Global Payments
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Mock AML/KYC Rules</span>
              <span>•</span>
              <span>OpenAI Powered</span>
              <span>•</span>
              <span>Demo Environment</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
