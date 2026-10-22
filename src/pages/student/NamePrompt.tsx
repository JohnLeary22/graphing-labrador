import { useState } from 'react'
import type { FormEvent } from 'react'
import { Labrador } from '@/components/mascots/Labrador'
import { setStudentName } from '@/services/persistence/actions'

export function NamePrompt({ studentId }: { studentId: string }) {
  const [name, setName] = useState('')
  const valid = name.trim().length > 0
  function submit(e: FormEvent) {
    e.preventDefault()
    if (valid) setStudentName(studentId, name)
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
        <button type="submit" className="btn btn-primary mt-5 w-full !py-3 text-base" disabled={!valid}>Continue</button>
        <p className="mt-3 text-xs text-soft">Saved in this browser only. This is demonstration data, not an account.</p>
      </form>
    </div>
  )
}
