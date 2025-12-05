'use client';

import { AuditLogEntry } from '@/lib/types';

interface AuditLogProps {
  entries: AuditLogEntry[];
  onSelectEntry: (entry: AuditLogEntry) => void;
}

export default function AuditLog({ entries, onSelectEntry }: AuditLogProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Audit Log
          </h3>
        </div>
        <div className="px-6 py-12 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium">No assessments yet</p>
          <p className="text-sm mt-1">Submit a transaction to see the audit log</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Audit Log ({entries.length} assessments)
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-800">
                      {entry.transactionId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(entry.result.riskLevel)}`}>
                      {entry.result.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {entry.input.amount} {entry.input.currency} • {entry.input.sourceJurisdiction} → {entry.input.destinationJurisdiction}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{entry.result.riskScore}</div>
                  <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
