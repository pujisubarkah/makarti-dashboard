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

export default function IdpFormWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, StepData>>({})

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
  );
}
