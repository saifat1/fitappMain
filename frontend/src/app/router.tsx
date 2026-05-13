import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterByInvitePage from "../pages/RegisterByInvitePage";
import MePage from "../pages/MePage";
import NotFoundPage from "../pages/NotFoundPage";
import ClientsPage from "../pages/ClientsPage";
import InvitesPage from "../pages/InvitesPage";
import TrainingsPage from "../pages/TrainingsPage";
import TrainingDetailsPage from "../pages/TrainingDetailsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import TrainerRoute from "../components/TrainerRoute";
import AppLayout from "../widgets/AppLayout";
import RescheduleRequestsPage from "../pages/RescheduleRequestsPage";
import TrainerProfilePage from "../pages/TrainerProfilePage";
import RescheduleRequestDetailsPage from "../pages/RescheduleRequestDetailsPage";
import CreateRescheduleRequestPage from "../pages/CreateRescheduleRequestPage";
import ExerciseTemplatesPage from "../pages/ExerciseTemplatesPage";
import ExerciseTemplateDetailsPage from "../pages/ExerciseTemplateDetailsPage";
import MorePage from "../pages/MorePage";
import ClientBookingPage from "../pages/ClientBookingPage";
import TrainerAvailabilityPage from "../pages/TrainerAvailabilityPage";
import TrainerBookingRequestsPage from "../pages/TrainerBookingRequestsPage";
import ClientHistoryPage from "../pages/ClientHistoryPage";
import TrainerRegisterPage from "../pages/TrainerRegisterPage";
import TrainerSalaryReportPage from "../pages/TrainerSalaryReportPage";
import AnalyticsPage from "../pages/AnalyticsPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/me" replace />,
    },
    {
        path: "/trainer/register",
        element: <TrainerRegisterPage />,
    },
    {
        path: "/analytics",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <AnalyticsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/salary-report",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <AppLayout>
                        <TrainerSalaryReportPage />
                    </AppLayout>
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/clients/:clientId/history",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <AppLayout>
                        <ClientHistoryPage />
                    </AppLayout>
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/trainer/profile",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <AppLayout>
                        <TrainerProfilePage />
                    </AppLayout>
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/invite/:token",
        element: <RegisterByInvitePage />,
    },
    {
        path: "/me",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <MePage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <TrainingsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings/:trainingId",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <TrainingDetailsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/clients",
        element: (
            <TrainerRoute>
                <AppLayout>
                    <ClientsPage />
                </AppLayout>
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/invites",
        element: (
            <TrainerRoute>
                <AppLayout>
                    <InvitesPage />
                </AppLayout>
            </TrainerRoute>
        ),
    },
    {
        path: "/exercise-templates",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <AppLayout>
                        <ExerciseTemplatesPage />
                    </AppLayout>
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/exercise-templates/:templateId",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <AppLayout>
                        <ExerciseTemplateDetailsPage />
                    </AppLayout>
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/reschedule-requests",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <RescheduleRequestsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/reschedule-requests/:id",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <RescheduleRequestDetailsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings/:trainingId/reschedule-request",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CreateRescheduleRequestPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/more",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <MorePage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/client/booking",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientBookingPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/availability",
        element: (
            <TrainerRoute>
                <AppLayout>
                    <TrainerAvailabilityPage />
                </AppLayout>
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/booking-requests",
        element: (
            <TrainerRoute>
                <AppLayout>
                    <TrainerBookingRequestsPage />
                </AppLayout>
            </TrainerRoute>
        ),
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
