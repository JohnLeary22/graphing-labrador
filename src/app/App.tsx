import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppRoot, StudentLayout, TeacherLayout } from '@/components/layout/Layouts'
import { Landing } from '@/pages/public/Landing'
import { StudentDashboard } from '@/pages/student/Dashboard'
import { LabsMap } from '@/pages/student/LabsMap'
import { LabDetail } from '@/pages/student/LabDetail'
import { GradientLessonPage } from '@/pages/student/GradientLessonPage'
import { Shop } from '@/pages/student/Shop'
import { Kennel } from '@/pages/student/Kennel'
import { Progress } from '@/pages/student/Progress'
import { Leaderboard } from '@/pages/student/Leaderboard'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import { StudentsList, StudentProfile } from '@/pages/teacher/Students'
import { LessonLibrary } from '@/pages/teacher/LessonLibrary'
import { Marking } from '@/pages/teacher/Marking'
import { RewardsSettings } from '@/pages/teacher/RewardsSettings'

// HashRouter keeps routing working on static hosts (e.g. GitHub Pages) without server rewrites.
export function App() {
  return (
    <AppRoot>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="labs" element={<LabsMap />} />
            <Route path="labs/:labId" element={<LabDetail />} />
            <Route path="lesson/gradient" element={<GradientLessonPage />} />
            <Route path="progress" element={<Progress />} />
            <Route path="kennel" element={<Kennel />} />
            <Route path="shop" element={<Shop />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="students/:studentId" element={<StudentProfile />} />
            <Route path="lessons" element={<LessonLibrary />} />
            <Route path="marking" element={<Marking />} />
            <Route path="rewards" element={<RewardsSettings />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  )
}
