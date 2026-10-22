import { useState } from 'react'
import { Coins, Check } from 'lucide-react'
import { Labrador } from '@/components/mascots/Labrador'
import { SHOP_ITEMS } from '@/data/curriculum/shop'
import { useStudent } from '@/hooks/useStudent'
import { buyItem } from '@/services/persistence/actions'
import type { Equipped, ItemCategory, ShopItem } from '@/types'

export const CATEGORY_LABEL: Record<ItemCategory, string> = { hat: 'Headwear', neckwear: 'Neckwear', eyewear: 'Eyewear', background: 'Backgrounds', character: 'Characters' }
export const slotOf = (c: ItemCategory): keyof Equipped | null => (c === 'character' ? null : c)

export function ItemPreview({ item, size = 110 }: { item: ShopItem; size?: number }) {
  const slot = slotOf(item.category)
  return <Labrador character={item.character ?? 'vector'} equipped={slot ? { [slot]: item.id } : {}} size={size} label={`Preview of ${item.name}`} />
}

export function Shop() {
  const me = useStudent()
  const [cat, setCat] = useState<ItemCategory | 'all'>('all')
  const [confirm, setConfirm] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const items = SHOP_ITEMS.filter((i) => cat === 'all' || i.category === cat)
  if (cat === 'all') items.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
  const history = me.transactions.filter((t) => t.key.startsWith('COINS:purchase:'))

  function buy(item: ShopItem) {
    const r = buyItem(me.id, item.id)
    setConfirm(null)
    setMsg(r.ok ? `Purchased ${item.name}. Equip it in My Kennel.` : r.error === 'owned' ? 'You already own that item.' : 'Not enough coins yet. Complete more activities to earn more.')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Reward Shop</h1>
          <p className="text-soft">Cosmetics only. Everything you need to learn is free. Coins come from answering questions: see "How rewards work" on your dashboard.</p>
        </div>
        <span className="chip !text-base"><Coins size={16} /> {me.coinsLabel} coins</span>
      </header>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-semibold">{msg}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {(['all', 'hat', 'neckwear', 'eyewear', 'background', 'character'] as const).map((c) => (
          <button key={c} className={`btn !py-1 text-sm ${cat === c ? '!bg-brand !text-brand-ink' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c === 'all' ? 'All' : CATEGORY_LABEL[c]}</button>
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const owned = me.owned.includes(item.id)
          const affordable = me.creative || me.coins >= item.price
          return (
            <li key={item.id} className="card flex flex-col items-center p-4 text-center">
              <ItemPreview item={item} />
              <h2 className="mt-2 font-bold">{item.name}</h2>
              <p className={`chip my-1 capitalize ${item.rarity === 'legendary' ? 'rarity-legendary' : ''}`}>{item.rarity}</p>
              <p className="flex-1 text-sm text-soft">{item.description}</p>
              <div className="mt-3 w-full">
                {owned ? (
                  <span className="btn w-full cursor-default opacity-80"><Check size={16} /> Owned</span>
                ) : confirm === item.id ? (
                  <div className="flex gap-2">
                    <button className="btn btn-primary flex-1" onClick={() => buy(item)}>Confirm {item.price}</button>
                    <button className="btn" onClick={() => setConfirm(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-accent w-full" disabled={!affordable} onClick={() => setConfirm(item.id)}>
                    <Coins size={16} /> {item.price}{affordable ? '' : ` (need ${item.price - me.coins} more)`}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <section className="card p-5" aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-2 font-display text-xl font-bold">Purchase history</h2>
        {history.length === 0 ? <p className="text-soft">No purchases yet.</p> : (
          <ul className="space-y-1 text-sm">{history.map((t) => <li key={t.id} className="flex justify-between"><span>{t.reason}</span><span>{t.amount} coins · {new Date(t.at).toLocaleDateString('en-AU')}</span></li>)}</ul>
        )}
      </section>
    </div>
  )
}
