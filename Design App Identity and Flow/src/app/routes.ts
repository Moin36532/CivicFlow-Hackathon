import { createBrowserRouter } from 'react-router';
import { LandingPage } from '@/app/pages/LandingPage';
import { Dashboard } from '@/app/pages/Dashboard';
import { ReportIssue } from '@/app/pages/ReportIssue';
import { GovernmentIssue } from '@/app/pages/GovernmentIssue';
import { VolunteerIssue } from '@/app/pages/VolunteerIssue';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/report',
    Component: ReportIssue,
  },
  {
    path: '/issue/government/:id',
    Component: GovernmentIssue,
  },
  {
    path: '/issue/volunteer/:id',
    Component: VolunteerIssue,
  },
]);
