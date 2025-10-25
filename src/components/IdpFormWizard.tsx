'use client'
import { useState } from 'react'
import SwotAnalysisForm from './SwotAnalysisForm'
import DevelopmentGoalsForm from './DevelopmentGoalsForm'
import DevelopmentActivitiesForm from './DevelopmentActivitiesForm'
import ImplementationPlanForm from './ImplementationPlanForm'
import ReviewSubmitForm from './ReviewSubmitForm'



type SwotForm = {
  strength: string;
  weakness: string;
  opportunities: string;
  threats: string;
};
type Goal = {
  kompetensi: string;
  alasan: string;
  target: string;
  indikator: string;
};
// Update the import path below to the correct relative path where Activity is defined
import { Activity } from '../../types/activity';
// Update the import path below to the correct relative path where Plan is defined
import type { Plan } from '../../types/plan';
type StepData = SwotForm | Goal[] | Activity[] | Plan[];

type AiSuggestions = {
  goals?: Goal[];
  activities?: Activity[];
};

export default function IdpFormWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, StepData>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)

  const steps = [
    { label: 'Analisis SWOT', comp: SwotAnalysisForm },
    { label: 'Tujuan Pengembangan', comp: DevelopmentGoalsForm },
    { label: 'Rencana Kegiatan', comp: DevelopmentActivitiesForm },
    { label: 'Implementasi', comp: ImplementationPlanForm },
    { label: 'Review & Submit', comp: ReviewSubmitForm }
  ]


  const handleSwotChange = (value: SwotForm) => {
    setData({ ...data, [steps[0].label]: value });
  };

  const handleGoalsChange = (value: Goal[]) => {
    setData({ ...data, [steps[1].label]: value });
  };

  const handleActivitiesChange = (value: Activity[]) => {
    setData({ ...data, [steps[2].label]: value });
  };

  const gatherPayload = () => {
    return {
      swot: data[steps[0].label] as SwotForm | undefined,
      goals: data[steps[1].label] as Goal[] | undefined,
      activities: data[steps[2].label] as Activity[] | undefined,
      implementation: data[steps[3].label] as Plan[] | undefined
    }
  }

  const analyzeWithAi = async () => {
    const payload = gatherPayload();
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'idp_analysis', payload })
      });
      if (!res.ok) throw new Error('AI API error');
      const body = await res.json();
      // Try to extract structured suggestions. API may return { result: '...', suggestions: {...} } or direct object
      let suggestions: AiSuggestions | null = null;
      if (body.suggestions) suggestions = body.suggestions;
      else if (body.result) {
        // result may be text or JSON string
        try {
          const parsed = JSON.parse(body.result);
          suggestions = parsed;
        } catch {
          // not JSON
        }
      } else if (typeof body === 'object') {
        suggestions = body;
      }

      // If we have structured suggestions, try to apply to form
      if (suggestions) {
        // Auto-apply goals
        if (suggestions.goals && Array.isArray(suggestions.goals)) {
          // Ensure shape matches Goal[] (kompetensi, alasan, target, indikator)
          handleGoalsChange(suggestions.goals as Goal[]);
        }
        // Auto-apply activities
        if (suggestions.activities && Array.isArray(suggestions.activities)) {
          handleActivitiesChange(suggestions.activities as Activity[]);
        }
        setAiResult(JSON.stringify(suggestions, null, 2));
      } else {
        // Fallback: show textual result if available
        setAiResult(body.result || JSON.stringify(body));
      }
      setShowAiModal(true);
    } catch (err) {
      console.error('AI analysis failed', err);
      setAiResult('Terjadi kesalahan saat meminta analisis AI.');
      setShowAiModal(true);
    } finally {
      setAiLoading(false);
    }
  }


  return (
    <div>
      {step === 0 ? (
        <SwotAnalysisForm
          data={data[steps[0].label] as SwotForm}
          onChange={handleSwotChange}
        />
      ) : step === 1 ? (
        <DevelopmentGoalsForm
          data={data[steps[1].label] as Goal[]}
          onChange={handleGoalsChange}
        />
      ) : step === 2 ? (
        <DevelopmentActivitiesForm
          data={data[steps[2].label] as Activity[]}
          onChange={handleActivitiesChange}
        />
      ) : step === 3 ? (
        <ImplementationPlanForm
          data={data[steps[3].label] as Plan[]}
        />
      ) : step === 4 ? (
        <ReviewSubmitForm
          data={data}
        />
      ) : null}

      <div className="flex justify-between pt-4">
        <button
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          aria-disabled={aiLoading}
          title={aiLoading ? 'Menunggu analisis AI selesai' : undefined}
        >
          Sebelumnya
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={analyzeWithAi}
            disabled={aiLoading}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4"></circle>
                  <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="4" strokeLinecap="round"></path>
                </svg>
                Analisis...
              </>
            ) : (
              'Analisis dengan AI'
            )}
          </button>

          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : alert('Selesai!')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={aiLoading}
            aria-disabled={aiLoading}
            title={aiLoading ? 'Menunggu analisis AI selesai' : undefined}
          >
            {step < steps.length - 1 ? 'Berikutnya' : 'Selesai'}
          </button>
        </div>
      </div>

      {/* AI Result Modal (simple) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAiModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Hasil Analisis AI</h3>
              <button className="text-sm text-gray-600" onClick={() => setShowAiModal(false)}>Tutup</button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {aiResult || 'Tidak ada hasil.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
