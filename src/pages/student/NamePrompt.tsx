import { useState } from 'react'
import type { FormEvent } from 'react'
import { Labrador } from '@/components/mascots/Labrador'
import { setStudentName } from '@/services/persistence/actions'

export const CREATIVE_MODE_DESCRIPTION = 'This is implemented for EDUC2151 only - unlimited coins are granted to workshop rewards'

export function NamePrompt({ studentId }: { studentId: string }) {
  const [name, setName] = useState('')
  const [creative, setCreative] = useState(false)
  const valid = name.trim().length > 0
  function submit(e: FormEvent) {
    e.preventDefault()
    if (valid) setStudentName(studentId, name, creative)
  }
  return (
    <div className="graph-paper grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md bg-surface/95 p-8 text-center shadow-xl">
        <div className="flex justify-center"><Labrador character="vector" size={140} idle expression="happy" /></div>
        <h1 className="mt-4 font-display text-3xl font-extrabold">My name is...</h1>
        <label className="mt-5 block text-left">
          <span className="mb-1 block text-sm text-soft">Your preferred name</span>
          <input className="input w-full text-lg" value={name} maxLength={30} autoFocus autoComplete="off" onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-surface-2 p-3 text-left">
          <input id="creative-mode" type="checkbox" className="mt-1 size-4" checked={creative} onChange={(e) => setCreative(e.target.checked)} aria-describedby="creative-mode-desc" />
          <div>
            <label htmlFor="creative-mode" className="cursor-pointer font-semibold">Creative mode</label>
            <p id="creative-mode-desc" className="text-sm text-soft">{CREATIVE_MODE_DESCRIPTION}</p>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-5 w-full !py-3 text-base" disabled={!valid}>Continue</button>
        <p className="mt-3 text-xs text-soft">Saved in this browser only. This is demonstration data, not an account.</p>
      </form>
    </div>
  )
}
