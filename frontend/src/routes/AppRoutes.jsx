import { lazy, Suspense } from 'react';

import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import { PublicLayout } from '../components/layout/PublicLayout';

import { DashboardShell } from '../components/layout/DashboardShell';

import { ProtectedRoute } from '../components/common/ProtectedRoute';

import { DashboardSkeleton } from '../components/ui/Skeleton';

/* ─────────────────────────────────────────────
   PUBLIC PAGES
───────────────────────────────────────────── */

const Landing = lazy(() =>
  import('../pages/public/Landing')
);

const About = lazy(() =>
  import('../pages/public/About')
);

const Contact = lazy(() =>
  import('../pages/public/Contact')
);

const Login = lazy(() =>
  import('../pages/auth/Login')
);

const Register = lazy(() =>
  import('../pages/auth/Register')
);

/* ─────────────────────────────────────────────
   STUDENT
───────────────────────────────────────────── */

const StudentDashboard = lazy(() =>
  import('../pages/student/StudentDashboard')
);

const AttendancePage = lazy(() =>
  import('../pages/student/AttendancePage')
);

const TimetablePage = lazy(() =>
  import('../pages/student/TimetablePage')
);

const NotificationsPage = lazy(() =>
  import('../pages/student/NotificationsPage')
);

const CampusPage = lazy(() =>
  import('../pages/student/CampusPage')
);

const StudentAIPortal = lazy(() =>
  import('../pages/student/StudentAIPortal')
);

const StudentResultsPage = lazy(() =>
  import('../pages/student/StudentResultsPage')
);

const StudentNoticesPage = lazy(() =>
  import('../pages/student/StudentNoticesPage')
);

/* ─────────────────────────────────────────────
   FACULTY
───────────────────────────────────────────── */

const FacultyDashboard = lazy(() =>
  import('../pages/faculty/FacultyDashboard')
);

const FacultyNotices = lazy(() =>
  import('../pages/faculty/FacultyNotices')
);

const FacultyAttendance = lazy(() =>
  import('../pages/faculty/FacultyAttendance')
);

const FacultyTimetable = lazy(() =>
  import('../pages/faculty/FacultyTimetable')
);

const FacultyResultsPage = lazy(() =>
  import('../pages/faculty/FacultyResultsPage')
);

const FacultyAIAssistant = lazy(() =>
  import('../pages/faculty/FacultyAIAssistant')
);

/* ─────────────────────────────────────────────
   ADMIN
───────────────────────────────────────────── */

const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard')
);

const ManageStudents = lazy(() =>
  import('../pages/admin/ManageStudents')
);

const ManageFaculty = lazy(() =>
  import('../pages/admin/ManageFaculty')
);

const ManageNotices = lazy(() =>
  import('../pages/admin/ManageNotices')
);

const AnalyticsPage = lazy(() =>
  import('../pages/admin/AnalyticsPage')
);

const AdminAuditPage = lazy(() =>
  import('../pages/admin/AdminAuditPage')
);

const AdminAICommandCenter = lazy(() =>
  import('../pages/admin/AdminAICommandCenter')
);

/* ─────────────────────────────────────────────
   SHARED
───────────────────────────────────────────── */

const ProfilePage = lazy(() =>
  import('../pages/shared/ProfilePage')
);

const EventsPage = lazy(() =>
  import('../pages/shared/EventsPage')
);

const EventDetailPage = lazy(() =>
  import('../pages/shared/EventDetailPage')
);

const FileManagerPage = lazy(() =>
  import('../pages/shared/FileManagerPage')
);

/* ─────────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────────── */

function PageLoader() {
  return (
    <div className="min-h-[500px] bg-[#050914] px-4 py-8 md:px-8">
      <DashboardSkeleton />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE TRANSITION
───────────────────────────────────────────── */

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -6,
      }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   WRAPPER
───────────────────────────────────────────── */

function Wrap(element) {
  return (
    <PageTransition>
      {element}
    </PageTransition>
  );
}

/* ─────────────────────────────────────────────
   APP ROUTES
───────────────────────────────────────────── */

export function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>

      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <Routes
          location={location}
          key={location.pathname}
        >

          {/* ───────────────── PUBLIC ───────────────── */}

          <Route element={<PublicLayout />}>

            <Route
              path="/"
              element={Wrap(<Landing />)}
            />

            <Route
              path="/about"
              element={Wrap(<About />)}
            />

            <Route
              path="/contact"
              element={Wrap(<Contact />)}
            />
          </Route>

          <Route
            path="/login"
            element={Wrap(<Login />)}
          />

          <Route
            path="/register"
            element={Wrap(<Register />)}
          />

          {/* ───────────────── STUDENT ───────────────── */}

          <Route
            element={
              <ProtectedRoute
                roles={['student']}
              />
            }
          >
            <Route
              path="/student"
              element={<DashboardShell />}
            >
              <Route
                index
                element={
                  <Navigate
                    to="dashboard"
                    replace
                  />
                }
              />

              <Route
                path="dashboard"
                element={Wrap(
                  <StudentDashboard />
                )}
              />

              <Route
                path="attendance"
                element={Wrap(
                  <AttendancePage />
                )}
              />

              <Route
                path="timetable"
                element={Wrap(
                  <TimetablePage />
                )}
              />

              <Route
                path="events"
                element={Wrap(<EventsPage />)}
              />

              <Route
                path="events/:eventId"
                element={Wrap(
                  <EventDetailPage />
                )}
              />

              <Route
                path="notices"
                element={Wrap(
                  <StudentNoticesPage />
                )}
              />

              <Route
                path="files"
                element={Wrap(
                  <FileManagerPage />
                )}
              />

              <Route
                path="notifications"
                element={Wrap(
                  <NotificationsPage />
                )}
              />

              <Route
                path="campus"
                element={Wrap(<CampusPage />)}
              />

              <Route
                path="results"
                element={Wrap(
                  <StudentResultsPage />
                )}
              />

              <Route
                path="ai-results"
                element={Wrap(
                  <StudentAIPortal />
                )}
              />

              <Route
                path="profile"
                element={Wrap(<ProfilePage />)}
              />
            </Route>
          </Route>

          {/* ───────────────── FACULTY ───────────────── */}

          <Route
            element={
              <ProtectedRoute
                roles={['faculty']}
              />
            }
          >
            <Route
              path="/faculty"
              element={<DashboardShell />}
            >
              <Route
                index
                element={
                  <Navigate
                    to="dashboard"
                    replace
                  />
                }
              />

              <Route
                path="dashboard"
                element={Wrap(
                  <FacultyDashboard />
                )}
              />

              <Route
                path="notices"
                element={Wrap(
                  <FacultyNotices />
                )}
              />

              <Route
                path="events"
                element={Wrap(<EventsPage />)}
              />

              <Route
                path="events/:eventId"
                element={Wrap(
                  <EventDetailPage />
                )}
              />

              <Route
                path="notifications"
                element={Wrap(
                  <NotificationsPage />
                )}
              />

              <Route
                path="files"
                element={Wrap(
                  <FileManagerPage />
                )}
              />

              <Route
                path="attendance"
                element={Wrap(
                  <FacultyAttendance />
                )}
              />

              <Route
                path="timetable"
                element={Wrap(
                  <FacultyTimetable />
                )}
              />

              <Route
                path="results"
                element={Wrap(
                  <FacultyResultsPage />
                )}
              />

              <Route
                path="ai-results"
                element={Wrap(
                  <FacultyAIAssistant />
                )}
              />

              <Route
                path="profile"
                element={Wrap(<ProfilePage />)}
              />
            </Route>
          </Route>

          {/* ───────────────── ADMIN ───────────────── */}

          <Route
            element={
              <ProtectedRoute
                roles={['admin']}
              />
            }
          >
            <Route
              path="/admin"
              element={<DashboardShell />}
            >
              <Route
                index
                element={
                  <Navigate
                    to="dashboard"
                    replace
                  />
                }
              />

              <Route
                path="dashboard"
                element={Wrap(
                  <AdminDashboard />
                )}
              />

              <Route
                path="students"
                element={Wrap(
                  <ManageStudents />
                )}
              />

              <Route
                path="faculty"
                element={Wrap(
                  <ManageFaculty />
                )}
              />

              <Route
                path="notices"
                element={Wrap(
                  <ManageNotices />
                )}
              />

              <Route
                path="events"
                element={Wrap(<EventsPage />)}
              />

              <Route
                path="events/:eventId"
                element={Wrap(
                  <EventDetailPage />
                )}
              />

              <Route
                path="notifications"
                element={Wrap(
                  <NotificationsPage />
                )}
              />

              <Route
                path="audit"
                element={Wrap(
                  <AdminAuditPage />
                )}
              />

              <Route
                path="files"
                element={Wrap(
                  <FileManagerPage />
                )}
              />

              <Route
                path="analytics"
                element={Wrap(
                  <AnalyticsPage />
                )}
              />

              <Route
                path="results"
                element={Wrap(
                  <FacultyResultsPage />
                )}
              />

              <Route
                path="ai-results"
                element={Wrap(
                  <AdminAICommandCenter />
                )}
              />

              <Route
                path="profile"
                element={Wrap(<ProfilePage />)}
              />
            </Route>
          </Route>

          {/* ───────────────── FALLBACK ───────────────── */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}