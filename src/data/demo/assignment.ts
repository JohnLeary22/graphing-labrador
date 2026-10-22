import { GRADIENT_LESSON_ID } from '@/data/lessons/gradient'

/** Demo assignment: due date is relative to the first load so the demo never shows an expired deadline. */
const DUE_KEY = 'graphing-labrador-demo-due'
function dueDate(): Date {
  let raw = localStorage.getItem(DUE_KEY)
  if (!raw) {
    raw = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
    localStorage.setItem(DUE_KEY, raw)
  }
  return new Date(raw)
}

export const DEMO_ASSIGNMENT = {
  id: 'asg-gradient',
  title: 'Understanding Gradient',
  lessonId: GRADIENT_LESSON_ID,
  classId: 'class-9a',
  get due() {
    return dueDate()
  },
}
