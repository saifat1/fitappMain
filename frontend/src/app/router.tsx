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
import RescheduleRequestDetailsPage from "../pages/RescheduleRequestDetailsPage";
import CreateRescheduleRequestPage from "../pages/CreateRescheduleRequestPage";
import ExerciseTemplatesPage from "../pages/ExerciseTemplatesPage";
import ExerciseTemplateDetailsPage from "../pages/ExerciseTemplateDetailsPage";
import MorePage from "../pages/MorePage";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/me" replace />,
    },
    {
        path: "/login",
        element: <LoginPage />,
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
                    <ExerciseTemplatesPage />
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/exercise-templates/:templateId",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <ExerciseTemplateDetailsPage />
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
        path: "*",
        element: <NotFoundPage />,
    },
]);