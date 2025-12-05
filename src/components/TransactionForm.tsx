'use client';

import { TransactionInput, CURRENCIES, TRANSACTION_PURPOSES, COUNTERPARTY_TYPES, FREQUENCY_SIGNALS } from '@/lib/types';
import { ALL_COUNTRIES } from '@/lib/rules';
import { DemoScenario } from '@/lib/types';
import { DEMO_SCENARIOS } from '@/lib/demo-scenarios';

interface TransactionFormProps {
  onSubmit: (input: TransactionInput) => void;
  isLoading: boolean;
}

export default function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const input: TransactionInput = {
      amount: parseFloat(formData.get('amount') as string) || 0,
      currency: formData.get('currency') as string,
      sourceJurisdiction: formData.get('sourceJurisdiction') as string,
      destinationJurisdiction: formData.get('destinationJurisdiction') as string,
      purpose: formData.get('purpose') as string,
      counterpartyType: formData.get('counterpartyType') as string,
      counterpartyName: formData.get('counterpartyName') as string || undefined,
      isNewCustomer: formData.get('isNewCustomer') === 'on',
      isPEP: formData.get('isPEP') === 'on',
      frequencySignals: formData.get('frequencySignals') as string || undefined,
      additionalNotes: formData.get('additionalNotes') as string || undefined,
    };

    onSubmit(input);
  };

  const loadDemoScenario = (scenario: DemoScenario) => {
    const form = document.getElementById('transaction-form') as HTMLFormElement;
    if (!form) return;

    const input = scenario.input;
    
    (form.elements.namedItem('amount') as HTMLInputElement).value = String(input.amount || '');
    (form.elements.namedItem('currency') as HTMLSelectElement).value = input.currency || 'USD';
    (form.elements.namedItem('sourceJurisdiction') as HTMLSelectElement).value = input.sourceJurisdiction || '';
    (form.elements.namedItem('destinationJurisdiction') as HTMLSelectElement).value = input.destinationJurisdiction || '';
    (form.elements.namedItem('purpose') as HTMLSelectElement).value = input.purpose || '';
    (form.elements.namedItem('counterpartyType') as HTMLSelectElement).value = input.counterpartyType || '';
    (form.elements.namedItem('counterpartyName') as HTMLInputElement).value = input.counterpartyName || '';
    (form.elements.namedItem('isNewCustomer') as HTMLInputElement).checked = input.isNewCustomer || false;
    (form.elements.namedItem('isPEP') as HTMLInputElement).checked = input.isPEP || false;
    (form.elements.namedItem('frequencySignals') as HTMLSelectElement).value = input.frequencySignals || '';
    (form.elements.namedItem('additionalNotes') as HTMLTextAreaElement).value = input.additionalNotes || '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Transaction Details
        </h2>
        <p className="text-blue-100 text-sm mt-1">Enter transaction parameters for compliance review</p>
      </div>

      {/* Demo Scenarios */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Demo Scenarios:</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadDemoScenario(scenario)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                scenario.expectedRisk === 'low' 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : scenario.expectedRisk === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
              title={scenario.description}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form id="transaction-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Amount & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              placeholder="e.g. 15000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              name="currency"
              required
              defaultValue="USD"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jurisdictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Jurisdiction <span className="text-red-500">*</span>
            </label>
            <select
              name="sourceJurisdiction"
              required
              defaultValue=""
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              <option value="" disabled>Select country...</option>
              {ALL_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Jurisdiction <span className="text-red-500">*</span>
            </label>
            <select
              name="destinationJurisdiction"
              required
              defaultValue=""
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              <option value="" disabled>Select country...</option>
              {ALL_COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Purpose & Counterparty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Purpose <span className="text-red-500">*</span>
            </label>
            <select
              name="purpose"
              required
              defaultValue=""
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              <option value="" disabled>Select purpose...</option>
              {TRANSACTION_PURPOSES.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counterparty Type <span className="text-red-500">*</span>
            </label>
            <select
              name="counterpartyType"
              required
              defaultValue=""
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              <option value="" disabled>Select type...</option>
              {COUNTERPARTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counterparty Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Counterparty Name
          </label>
          <input
            type="text"
            name="counterpartyName"
            placeholder="e.g. Acme Corp, John Smith"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isNewCustomer"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">New Customer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPEP"
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              Politically Exposed Person (PEP)
              <span className="ml-1 text-xs text-red-500">⚠️</span>
            </span>
          </label>
        </div>

        {/* Frequency Signals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency / History Signals
          </label>
          <select
            name="frequencySignals"
            defaultValue=""
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
          >
            <option value="">None / Not applicable</option>
            {FREQUENCY_SIGNALS.map(signal => (
              <option key={signal} value={signal}>{signal}</option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="additionalNotes"
            rows={3}
            placeholder="Any additional context or observations..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing Transaction...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Analyze Transaction Risk
            </>
          )}
        </button>
      </form>
    </div>
  );
}
