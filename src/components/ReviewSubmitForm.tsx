'use client'

export interface ReviewSubmitFormProps {
  data: unknown;
  onSubmit?: () => void;
}

export default function ReviewSubmitForm({ data, onSubmit }: ReviewSubmitFormProps) {
  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Review & Submit</h2>
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
        <pre className="bg-blue-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap text-blue-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      <div className="flex justify-center pt-2">
        <button
          onClick={() => onSubmit?.()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
        >
          Submit IDP
        </button>
      </div>
    </div>
  )
}
