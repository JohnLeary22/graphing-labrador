import { Link } from 'react-router-dom'
import { Labrador } from '@/components/mascots/Labrador'
import { CHARACTERS } from '@/data/curriculum/labs'
import { SHOP_ITEMS, itemById } from '@/data/curriculum/shop'
import { useStudent } from '@/hooks/useStudent'
import { equipItem, resetAppearance, setCharacter } from '@/services/persistence/actions'
import { CATEGORY_LABEL, slotOf } from './Shop'
import type { CharacterId, Equipped } from '@/types'

const SLOTS: (keyof Equipped)[] = ['hat', 'neckwear', 'eyewear', 'colour', 'background']

export function Kennel() {
  const me = useStudent()
  const char = CHARACTERS[me.appearance.character]
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold">My Kennel</h1>
        <p className="text-soft">Changes save automaticaly and appear everywhere in Graphing Labrador.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="card p-5 text-center lg:sticky lg:top-4 lg:self-start" aria-label="Preview">
          <Labrador character={me.appearance.character} equipped={me.appearance} size={260} idle />
          <h2 className="font-display text-xl font-bold">{char.nickname}</h2>
          <p className="text-sm text-soft">{char.name} · {char.personality}</p>
          <button className="btn mt-3" onClick={() => resetAppearance(me.id)}>Reset appearance</button>
        </section>
        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="chars-h">
            <h2 id="chars-h" className="mb-3 font-display text-lg font-bold">Characters</h2>
            <ul className="flex flex-wrap gap-3">
              {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
                const unlocked = me.unlockedCharacters.includes(id)
                const active = me.appearance.character === id
                return (
                  <li key={id}>
                    <button disabled={!unlocked} aria-pressed={active} onClick={() => setCharacter(me.id, id)} className={`btn flex-col !p-2 ${active ? '!border-brand' : ''}`}>
                      <Labrador character={id} size={72} showBackground={false} />
                      <span className="text-xs">{CHARACTERS[id].nickname}{unlocked ? '' : ' (locked)'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {me.unlockedCharacters.length < 5 && <p className="mt-2 text-sm text-soft">Unlock more in the <Link className="underline" to="/student/shop">shop</Link>.</p>}
          </section>
          {SLOTS.map((slot) => {
            const owned = SHOP_ITEMS.filter((i) => slotOf(i.category) === slot && me.owned.includes(i.id))
            const label = CATEGORY_LABEL[slot as keyof typeof CATEGORY_LABEL]
            const current = me.appearance[slot]
            return (
              <section key={slot} className="card p-5" aria-label={label}>
                <h2 className="mb-2 font-display text-lg font-bold">{label}</h2>
                {owned.length === 0 ? <p className="text-sm text-soft">Nothing owned yet.</p> : (
                  <div className="flex flex-wrap gap-2">
                    <button className="btn !py-1 text-sm" aria-pressed={!current} onClick={() => equipItem(me.id, slot, undefined)}>None</button>
                    {owned.map((i) => (
                      <button key={i.id} className={`btn !py-1 text-sm ${current === i.id ? '!border-brand !bg-surface-2' : ''}`} aria-pressed={current === i.id} onClick={() => equipItem(me.id, slot, current === i.id ? undefined : i.id)}>
                        {itemById(i.id)?.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
