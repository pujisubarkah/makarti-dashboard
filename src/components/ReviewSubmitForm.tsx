'use client'

export interface ReviewSubmitFormProps {
  data: unknown;
  onSubmit?: (mode?: 'create' | 'update') => void;
  tahun?: number;
  setTahun?: (n: number) => void;
  submitting?: boolean;
  currentIdpId?: number | null;
}

export default function ReviewSubmitForm({ data, onSubmit, tahun, setTahun, submitting, currentIdpId }: ReviewSubmitFormProps) {
  // Debug log
  console.log('ReviewSubmitForm - currentIdpId:', currentIdpId)
  
  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Review & Submit</h2>

      <div className="flex items-center justify-center gap-3">
        <label className="text-sm font-medium">Tahun:</label>
        <input
          type="number"
          min={2000}
          max={2100}
          value={tahun ?? new Date().getFullYear()}
          onChange={(e) => setTahun?.(Number(e.target.value))}
          className="w-24 border rounded px-2 py-1"
        />
      </div>

      {/* Status Indicator */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {currentIdpId 
            ? `Editing IDP (ID: ${currentIdpId}) - Pilih Submit untuk buat baru atau Update untuk edit existing`
            : 'Creating new IDP - Gunakan Submit IDP untuk menyimpan'
          }
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
        <pre className="bg-blue-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap text-blue-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      
      <div className="flex justify-center gap-4 pt-2">
        {/* Submit IDP Button (Create New) */}
        <button
          onClick={() => onSubmit?.('create')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition flex items-center gap-2"
          disabled={submitting}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {submitting ? 'Menyimpan...' : 'Submit IDP'}
        </button>

        {/* Update IDP Button (Update Existing) - Only show if currentIdpId exists */}
        {currentIdpId && (
          <button
            onClick={() => onSubmit?.('update')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
            disabled={submitting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {submitting ? 'Memperbarui...' : 'Update IDP'}
          </button>
        )}
      </div>
    </div>
  )
}
