'use client'
import { useState } from 'react'
import SwotAnalysisForm from './SwotAnalysisForm'
import DevelopmentGoalsForm from './DevelopmentGoalsForm'
import DevelopmentActivitiesForm from './DevelopmentActivitiesForm'
import ImplementationPlanForm from './ImplementationPlanForm'
import ReviewSubmitForm from './ReviewSubmitForm'

export default function IdpFormWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<any>({})

  const steps = [
    { label: 'Analisis SWOT', comp: SwotAnalysisForm },
    { label: 'Tujuan Pengembangan', comp: DevelopmentGoalsForm },
    { label: 'Rencana Kegiatan', comp: DevelopmentActivitiesForm },
    { label: 'Implementasi', comp: ImplementationPlanForm },
    { label: 'Review & Submit', comp: ReviewSubmitForm }
  ]

  const StepComponent = steps[step].comp

  const handleChange = (value: any) => {
    setData({ ...data, [steps[step].label]: value })
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h1 className="text-2xl font-bold">Form Individual Development Plan (IDP)</h1>
      <StepComponent data={data[steps[step].label]} onChange={handleChange} onSubmit={() => alert('Submitted!')} />

      <div className="flex justify-between pt-4">
        <button
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Sebelumnya
        </button>

        <button
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : alert('Selesai!')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {step < steps.length - 1 ? 'Berikutnya' : 'Selesai'}
        </button>
      </div>
    </div>
  )
}
