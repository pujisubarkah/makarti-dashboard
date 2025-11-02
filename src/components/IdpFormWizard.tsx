'use client'
import { useState, useEffect } from 'react'
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

type ImportedGoal = {
  kompetensi?: string;
  alasan?: string;
  target?: string;
  indikator?: string;
};

type ImportedActivity = {
  judul?: string;
  jenis?: string;
  penyelenggara?: string;
  type?: string;
};

type AiSuggestions = {
  goals?: Goal[];
  activities?: Activity[];
};

type IdpRecord = {
  id?: number;
  tahun: number;
  strength?: string;
  weakness?: string;
  opportunities?: string;
  threats?: string;
  goals?: Goal[];
  activities?: Activity[];
  plans?: Plan[];
  implementation?: Plan[];
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export default function IdpFormWizard({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, StepData>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tahun, setTahun] = useState<number>(new Date().getFullYear())
  const [autoLoading, setAutoLoading] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [prevLoading, setPrevLoading] = useState(false)
  const [prevList, setPrevList] = useState<IdpRecord[] | null>(null)
  const [previewItem, setPreviewItem] = useState<IdpRecord | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editKind, setEditKind] = useState<'goal' | 'activity' | null>(null)
  const [editItem, setEditItem] = useState<ImportedGoal | ImportedActivity | null>(null)

  const steps = [
    { label: 'Analisis SWOT', comp: SwotAnalysisForm },
    { label: 'Tujuan Pengembangan', comp: DevelopmentGoalsForm },
    { label: 'Rencana Kegiatan', comp: DevelopmentActivitiesForm },
    { label: 'Implementasi', comp: ImplementationPlanForm },
    { label: 'Review & Submit', comp: ReviewSubmitForm }
  ]

  // Handlers for each form
  const handleSwotChange = (value: SwotForm) => {
    setData(prev => ({ ...prev, [steps[0].label]: value }));
  };

  const handleGoalsChange = (value: Goal[]) => {
    setData(prev => ({ ...prev, [steps[1].label]: value }));
  };

  const handleActivitiesChange = (value: Activity[]) => {
    setData(prev => ({ ...prev, [steps[2].label]: value }));
  };

  const handleImplementationChange = (value: Plan[]) => {
    setData(prev => ({ ...prev, [steps[3].label]: value }));
  };

  // Import single suggestion into current form (append) with simple deduplication
  const importGoal = (goal: ImportedGoal) => {
    setData(prev => {
      const cur = (prev[steps[1].label] as Goal[]) ?? []
      // Simple dedupe: match by kompetensi (case-insensitive) or exact JSON
      const exists = cur.some(g => {
        try {
          const a = (g.kompetensi || '').toString().toLowerCase().trim()
          const b = (goal.kompetensi || '').toString().toLowerCase().trim()
          if (a && b && a === b) return true
        } catch {}
        try {
          return JSON.stringify(g) === JSON.stringify(goal)
        } catch { return false }
      })
      if (exists) {
        alert('Goal serupa sudah ada di form — impor dibatalkan.')
        return prev
      }
      // Normalize to strict Goal shape (non-optional fields)
      const normalized: Goal = {
        kompetensi: goal.kompetensi ?? '',
        alasan: goal.alasan ?? '',
        target: goal.target ?? '',
        indikator: goal.indikator ?? ''
      }
      alert('Goal berhasil diimpor ke form')
      return { ...prev, [steps[1].label]: [...cur, normalized] }
    })
  }

  const importActivity = (act: ImportedActivity) => {
    setData(prev => {
      const cur = (prev[steps[2].label] as Activity[]) ?? []
      // Deduplicate by judul/title (case-insensitive) or exact JSON
      const exists = cur.some(a => {
        try {
          const x = (a.judul || '').toString().toLowerCase().trim()
          const y = (act.judul || '').toString().toLowerCase().trim()
          if (x && y && x === y) return true
        } catch {}
        try {
          return JSON.stringify(a) === JSON.stringify(act)
        } catch { return false }
      })
      if (exists) {
        alert('Activity serupa sudah ada di form — impor dibatalkan.')
        return prev
      }
      // Normalize to Activity shape (ensure strings)
      const normalizedAct = {
        judul: act.judul ?? (act as { title?: string }).title ?? '',
        jenis: act.jenis ?? act.type ?? '',
        penyelenggara: act.penyelenggara ?? ''
      }
      alert('Activity berhasil diimpor ke form')
      return { ...prev, [steps[2].label]: [...cur, normalizedAct] }
    })
  }

  const gatherPayload = () => {
    return {
      swot: data[steps[0].label] as SwotForm | undefined,
      goals: data[steps[1].label] as Goal[] | undefined,
      activities: data[steps[2].label] as Activity[] | undefined,
      implementation: data[steps[3].label] as Plan[] | undefined
    }
  }

  // Auto-load previous IDP if available so user doesn't start from zero
  useEffect(() => {
    // Run only on client
    if (typeof window === 'undefined') return;

    const loadPrevious = async () => {
      try {
        const rawUserId = localStorage.getItem('id')
        const user_id = rawUserId ? Number(rawUserId) : undefined
        if (!user_id) return

        // Don't overwrite existing in-memory edits
        if (Object.keys(data).length > 0) return

        setAutoLoading(true)

        // Try current year first, then previous year (IDP "sebelumnya")
        const yearsToTry = [tahun, tahun - 1]
        let found: { item: IdpRecord; year: number } | null = null
        for (const y of yearsToTry) {
          try {
            const resp = await fetch(`/api/idp?user_id=${user_id}&tahun=${y}`)
            if (!resp.ok) continue
            const body = await resp.json()
            const item = Array.isArray(body) ? body[0] : body
            if (item) {
              found = { item, year: y }
              break
            }
          } catch (e) {
            console.warn('Failed fetch for year', y, e)
          }
        }

        if (found) {
          const idp = found.item
          console.log('Loading previous IDP data:', idp)
          
          // Populate form fields with existing IDP data
          setTahun(found.year)
          setData({
            [steps[0].label]: {
              strength: idp.strength ?? '',
              weakness: idp.weakness ?? '',
              opportunities: idp.opportunities ?? '',
              threats: idp.threats ?? ''
            },
            [steps[1].label]: idp.goals ?? [],
            [steps[2].label]: idp.activities ?? [],
            [steps[3].label]: idp.plans ?? idp.implementation ?? []
          })
          
          console.log('Form data after loading:', {
            swot: data[steps[0].label],
            goals: data[steps[1].label],
            activities: data[steps[2].label],
            implementation: data[steps[3].label]
          })
        }
      } catch (err) {
        console.error('Auto-load IDP failed', err)
      } finally {
        setAutoLoading(false)
      }
    }

    loadPrevious()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Submit IDP to backend
  const submitIdp = async () => {
    try {
      setSubmitting(true)
      const payload = gatherPayload()

      // Attempt to get current user id from localStorage
      const rawUserId = typeof window !== 'undefined' ? localStorage.getItem('id') : null
      const user_id = rawUserId ? Number(rawUserId) : undefined
      if (!user_id) {
        alert('Tidak dapat menemukan user id. Silakan login ulang.')
        setSubmitting(false)
        return
      }

      const body = {
        user_id,
        tahun,
        strength: payload.swot?.strength,
        weakness: payload.swot?.weakness,
        opportunities: payload.swot?.opportunities,
        threats: payload.swot?.threats,
        goals: payload.goals ?? null,
        activities: payload.activities ?? null,
        plans: payload.implementation ?? null,
      }

      console.log('Submitting IDP:', body)

      const res = await fetch('/api/idp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const respData = await res.json()
        console.log('IDP create response', respData)
        alert('IDP berhasil disimpan.')
        // close modal via callback if provided
        if (onClose) onClose()
      } else {
        const err = await res.json().catch(() => null)
        console.error('Submit IDP failed', err)
        alert('Gagal menyimpan IDP: ' + (err?.error || err?.message || res.status))
      }
    } catch (e) {
      console.error('Submit error', e)
      alert('Terjadi kesalahan saat mengirim IDP')
    } finally {
      setSubmitting(false)
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

  // Load specific IDP into form
  const loadIdpIntoForm = async (idpId: number) => {
    try {
      if (Object.keys(data).length > 0) {
        const ok = confirm('Form Anda berisi perubahan yang belum disimpan. Memuat IDP sebelumnya akan menimpa perubahan ini. Lanjutkan?')
        if (!ok) return
      }

      const resp = await fetch(`/api/idp/${idpId}`)
      if (!resp.ok) throw new Error('Gagal memuat IDP')
      const idp: IdpRecord = await resp.json()
      
      console.log('Loading IDP into form:', idp)
      
      setTahun(idp.tahun ?? tahun)
      setData({
        [steps[0].label]: {
          strength: idp.strength ?? '',
          weakness: idp.weakness ?? '',
          opportunities: idp.opportunities ?? '',
          threats: idp.threats ?? ''
        },
        [steps[1].label]: idp.goals ?? [],
        [steps[2].label]: idp.activities ?? [],
        [steps[3].label]: idp.plans ?? idp.implementation ?? []
      })
      
      setShowLoadModal(false)
      alert('IDP berhasil dimuat ke form. Silakan lanjutkan pengisian dan jangan lupa menyimpan.')
    } catch (e) {
      console.error('Load IDP failed', e)
      alert('Gagal memuat IDP')
    }
  }

  return (
    <div>
      {autoLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">Memuat IDP sebelumnya...</p>
          </div>
        </div>
      )}

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
          onDataChange={handleImplementationChange}
        />
      ) : step === 4 ? (
        <ReviewSubmitForm
          data={data}
          onSubmit={submitIdp}
          tahun={tahun}
          setTahun={setTahun}
          submitting={submitting}
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
            onClick={async () => {
              // Open modal and fetch previous IDPs
              setShowLoadModal(true)
              try {
                const rawUserId = typeof window !== 'undefined' ? localStorage.getItem('id') : null
                const user_id = rawUserId ? Number(rawUserId) : undefined
                if (!user_id) {
                  alert('Tidak dapat menemukan user id. Silakan login.')
                  setShowLoadModal(false)
                  return
                }
                setPrevLoading(true)
                const resp = await fetch(`/api/idp?user_id=${user_id}`)
                if (!resp.ok) throw new Error('Gagal memuat data sebelumnya')
                const body: IdpRecord[] | IdpRecord = await resp.json()
                // Expect array; if single object, put into array
                const list = Array.isArray(body) ? body : [body]
                setPrevList(list)
                setPreviewItem(null)
              } catch (e) {
                console.error('Load previous list failed', e)
                alert('Gagal memuat daftar IDP sebelumnya')
                setShowLoadModal(false)
              } finally {
                setPrevLoading(false)
              }
            }}
            className="px-3 py-2 bg-yellow-500 text-white rounded-md text-sm disabled:opacity-50"
          >
            Muat IDP Sebelumnya
          </button>
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
            disabled={aiLoading || submitting}
            aria-disabled={aiLoading || submitting}
            title={aiLoading ? 'Menunggu analisis AI selesai' : submitting ? 'Mengirim IDP...' : undefined}
          >
            {step < steps.length - 1 ? 'Berikutnya' : (submitting ? 'Mengirim...' : 'Selesai')}
          </button>
        </div>
      </div>

      {/* AI Result Modal (rich) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAiModal(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Hasil Analisis AI</h3>
                <p className="text-sm text-gray-500">Saran yang dihasilkan berdasarkan input SWOT dan rencana Anda.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm text-gray-600 px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={async () => {
                    if (!aiResult) return
                    try {
                      await navigator.clipboard.writeText(aiResult)
                      alert('AI result copied to clipboard')
                    } catch (e) {
                      console.error('copy failed', e)
                    }
                  }}
                >Copy JSON</button>
                <button className="text-sm text-gray-600" onClick={() => setShowAiModal(false)}>Tutup</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                if (!aiResult) return <div className="col-span-1 text-gray-600">Tidak ada hasil.</div>
                try {
                  const parsed: unknown = JSON.parse(aiResult);
                  let suggestions: AiSuggestions | null = null;
                  if (parsed && typeof parsed === 'object') {
                    const obj = parsed as Record<string, unknown>;
                    if (obj.suggestions && typeof obj.suggestions === 'object') {
                      suggestions = obj.suggestions as AiSuggestions;
                    } else {
                      suggestions = obj as AiSuggestions;
                    }
                  }

                  const goals: Goal[] = Array.isArray(suggestions?.goals) ? suggestions.goals : []
                  const activities: Activity[] = Array.isArray(suggestions?.activities) ? suggestions.activities : []

                  return (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Goals (Tujuan)</h4>
                          {goals.length > 0 && (
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                onClick={() => handleGoalsChange(goals)}
                              >Apply All Goals</button>
                            </div>
                          )}
                        </div>

                        {goals.length === 0 ? (
                          <div className="text-gray-500">Tidak ada saran goals yang terstruktur.</div>
                        ) : (
                          goals.map((g, i) => (
                            <div key={`goal-${i}`} className="p-3 border rounded-md shadow-sm hover:shadow-md transition">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="text-sm text-gray-700 font-semibold">{g.kompetensi || `Goal ${i+1}`}</div>
                                  {g.alasan && <div className="text-xs text-gray-500 mt-1">Alasan: {g.alasan}</div>}
                                  {g.target && <div className="text-xs text-gray-500 mt-1">Target: {g.target}</div>}
                                  {g.indikator && <div className="text-xs text-gray-500 mt-1">Indikator: {g.indikator}</div>}
                                </div>
                                <button
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                  onClick={() => importGoal(g)}
                                >Import</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Activities (Rencana Kegiatan)</h4>
                          {activities.length > 0 && (
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                onClick={() => handleActivitiesChange(activities)}
                              >Apply All Activities</button>
                            </div>
                          )}
                        </div>

                        {activities.length === 0 ? (
                          <div className="text-gray-500">Tidak ada saran activities yang terstruktur.</div>
                        ) : (
                          activities.map((a, i) => (
                            <div key={`act-${i}`} className="p-3 border rounded-md shadow-sm hover:shadow-md transition">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="text-sm text-gray-700 font-semibold">{a.judul || `Activity ${i+1}`}</div>
                                  <div className="text-xs text-gray-500 mt-1">Jenis: {a.jenis || '-'}</div>
                                  {a.penyelenggara && <div className="text-xs text-gray-500 mt-1">Penyelenggara: {a.penyelenggara}</div>}
                                </div>
                                <button
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                  onClick={() => importActivity(a)}
                                >Import</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )
                } catch {
                  // fallback: show raw text
                  return <div className="col-span-1 text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</div>
                }
              })()}
            </div>

            {/* Raw JSON / fallback view */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700">Raw / JSON</h5>
              <pre className="mt-2 p-3 bg-gray-50 rounded max-h-48 overflow-auto text-xs">{aiResult}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Edit-before-import Modal */}
      {editModalOpen && editItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-xl w-full p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit sebelum import</h3>
              <button className="text-sm text-gray-600" onClick={() => setEditModalOpen(false)}>Tutup</button>
            </div>

            <div className="mt-4 space-y-3">
              {editKind === 'goal' && (
                <>
                  <label className="block">
                    <div className="text-xs text-gray-600">Kompetensi</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedGoal).kompetensi ?? ''} onChange={(e) => setEditItem({ ...editItem, kompetensi: e.target.value })} />
                  </label>
                  <label className="block">
                    <div className="text-xs text-gray-600">Alasan</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedGoal).alasan ?? ''} onChange={(e) => setEditItem({ ...editItem, alasan: e.target.value })} />
                  </label>
                  <label className="block">
                    <div className="text-xs text-gray-600">Target</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedGoal).target ?? ''} onChange={(e) => setEditItem({ ...editItem, target: e.target.value })} />
                  </label>
                  <label className="block">
                    <div className="text-xs text-gray-600">Indikator</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedGoal).indikator ?? ''} onChange={(e) => setEditItem({ ...editItem, indikator: e.target.value })} />
                  </label>
                </>
              )}

              {editKind === 'activity' && (
                <>
                  <label className="block">
                    <div className="text-xs text-gray-600">Judul</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedActivity).judul ?? (editItem as ImportedActivity & { title?: string }).title ?? ''} onChange={(e) => setEditItem({ ...editItem, judul: e.target.value })} />
                  </label>
                  <label className="block">
                    <div className="text-xs text-gray-600">Jenis</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedActivity).jenis ?? ''} onChange={(e) => setEditItem({ ...editItem, jenis: e.target.value })} />
                  </label>
                  <label className="block">
                    <div className="text-xs text-gray-600">Penyelenggara</div>
                    <input className="w-full border rounded px-2 py-1" value={(editItem as ImportedActivity).penyelenggara ?? ''} onChange={(e) => setEditItem({ ...editItem, penyelenggara: e.target.value })} />
                  </label>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setEditModalOpen(false)}>Batal</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => {
                try {
                  if (editKind === 'goal') {
                    importGoal(editItem as ImportedGoal)
                  } else if (editKind === 'activity') {
                    importActivity(editItem as ImportedActivity)
                  }
                } catch (error) {
                  console.error('Import edited failed', error)
                  alert('Gagal mengimpor item')
                } finally {
                  setEditModalOpen(false)
                }
              }}>Import & Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Previous IDP Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLoadModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pilih IDP Sebelumnya</h3>
              <button className="text-sm text-gray-600" onClick={() => setShowLoadModal(false)}>Tutup</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Left Column - IDP List */}
              <div className="overflow-hidden">
                <h4 className="font-medium mb-2">Daftar IDP</h4>
                {prevLoading && <div className="text-center py-4">Memuat...</div>}
                {!prevLoading && (!prevList || prevList.length === 0) && (
                  <div className="text-gray-500 text-center py-4">Tidak ada IDP sebelumnya.</div>
                )}

                {!prevLoading && prevList && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {prevList.map((p) => (
                      <div key={p.id} className="p-3 border rounded hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">Tahun: {p.tahun ?? '-'}</div>
                            <div className="text-xs text-gray-500">
                              {p.status ?? ''} • {new Date(p.created_at || p.updated_at || Date.now()).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-2">
                            <button 
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                              onClick={async () => {
                                try {
                                  const resp = await fetch(`/api/idp/${p.id}`)
                                  if (!resp.ok) throw new Error('Gagal memuat IDP')
                                  const body: IdpRecord = await resp.json()
                                  setPreviewItem(body)
                                } catch (e) {
                                  console.error('Preview failed', e)
                                  alert('Gagal memuat preview')
                                }
                              }}
                            >
                              Preview
                            </button>
                            <button 
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                              onClick={() => p.id && loadIdpIntoForm(p.id)}
                            >
                              Load
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="overflow-hidden">
                <h4 className="font-medium mb-2">Preview</h4>
                {!previewItem ? (
                  <div className="text-gray-500 text-center py-8">Pilih IDP untuk melihat preview.</div>
                ) : (
                  <div className="border rounded p-4 max-h-96 overflow-y-auto">
                    <div className="mb-4">
                      <div className="text-sm font-semibold">Tahun: {previewItem.tahun}</div>
                      <div className="text-xs text-gray-500">
                        {previewItem.status} • {new Date(previewItem.created_at || previewItem.updated_at || Date.now()).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">SWOT Analysis</h5>
                        <div className="text-sm space-y-1">
                          <div><strong>Strength:</strong> {previewItem.strength || '-'}</div>
                          <div><strong>Weakness:</strong> {previewItem.weakness || '-'}</div>
                          <div><strong>Opportunities:</strong> {previewItem.opportunities || '-'}</div>
                          <div><strong>Threats:</strong> {previewItem.threats || '-'}</div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">Development Goals</h5>
                        {Array.isArray(previewItem.goals) && previewItem.goals.length > 0 ? (
                          <div className="space-y-2">
                            {previewItem.goals.map((g: Goal, i: number) => (
                              <div key={`pv-goal-${i}`} className="p-2 border rounded text-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold">{g.kompetensi || `Goal ${i+1}`}</div>
                                    {g.alasan && <div className="text-xs text-gray-500 mt-1">Alasan: {g.alasan}</div>}
                                    {g.target && <div className="text-xs text-gray-500">Target: {g.target}</div>}
                                    {g.indikator && <div className="text-xs text-gray-500">Indikator: {g.indikator}</div>}
                                  </div>
                                  <button 
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded ml-2"
                                    onClick={() => {
                                      setEditKind('goal')
                                      setEditItem({ ...g })
                                      setEditModalOpen(true)
                                    }}
                                  >
                                    Import
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Tidak ada goals.</div>
                        )}
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">Development Activities</h5>
                        {Array.isArray(previewItem.activities) && previewItem.activities.length > 0 ? (
                          <div className="space-y-2">
                            {previewItem.activities.map((a: Activity, i: number) => (
                              <div key={`pv-act-${i}`} className="p-2 border rounded text-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold">{a.judul || `Activity ${i+1}`}</div>
                                    <div className="text-xs text-gray-500 mt-1">Jenis: {a.jenis || '-'}</div>
                                    {a.penyelenggara && <div className="text-xs text-gray-500">Penyelenggara: {a.penyelenggara}</div>}
                                  </div>
                                  <button 
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded ml-2"
                                    onClick={() => {
                                      setEditKind('activity')
                                      setEditItem({ ...a })
                                      setEditModalOpen(true)
                                    }}
                                  >
                                    Import
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Tidak ada activities.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}