import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import WelcomePage from "../pages/WelcomePage";
import RegisterByInvitePage from "../pages/RegisterByInvitePage";
import MePage from "../pages/MePage";
import NotFoundPage from "../pages/NotFoundPage";
import ClientsPage from "../pages/ClientsPage";
import ClientCreatePage from "../pages/ClientCreatePage";
import ClientDetailsPage from "../pages/ClientDetailsPage";
import ClientQuestionnairePage from "../pages/ClientQuestionnairePage";
import ClientMeasurementsPage from "../pages/ClientMeasurementsPage";
import ClientMyQuestionnairePage from "../pages/ClientMyQuestionnairePage";
import ClientMyMeasurementsPage from "../pages/ClientMyMeasurementsPage";
import InvitesPage from "../pages/InvitesPage";
import TrainingsPage from "../pages/TrainingsPage";
import TrainingCreatePage from "../pages/TrainingCreatePage";
import TrainingDetailsPage from "../pages/TrainingDetailsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import RootRedirect from "../components/RootRedirect";
import TrainerRoute from "../components/TrainerRoute";
import AppLayout from "../widgets/AppLayout";
import RescheduleRequestsPage from "../pages/RescheduleRequestsPage";
import TrainerProfilePage from "../pages/TrainerProfilePage";
import RescheduleRequestDetailsPage from "../pages/RescheduleRequestDetailsPage";
import CreateRescheduleRequestPage from "../pages/CreateRescheduleRequestPage";
import ExerciseTemplatesPage from "../pages/ExerciseTemplatesPage";
import ExerciseTemplateCreatePage from "../pages/ExerciseTemplateCreatePage";
import ExerciseTemplateDetailsPage from "../pages/ExerciseTemplateDetailsPage";
import MorePage from "../pages/MorePage";
import ClientBookingPage from "../pages/ClientBookingPage";
import TrainerAvailabilityPage from "../pages/TrainerAvailabilityPage";
import TrainerBookingRequestsPage from "../pages/TrainerBookingRequestsPage";
import ClientHistoryPage from "../pages/ClientHistoryPage";
import TrainerRegisterPage from "../pages/TrainerRegisterPage";
import TrainerSalaryReportPage from "../pages/TrainerSalaryReportPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import LegalDocumentPage from "../pages/LegalDocumentPage";
import LegalConsentsPage from "../pages/LegalConsentsPage";
import NotificationsPage from "../pages/NotificationsPage";
import ClientProfilePage from "../pages/ClientProfilePage";
import SubscriptionPage from "../pages/SubscriptionPage";
import TestPaymentPage from "../pages/TestPaymentPage";
import PricingPage from "../pages/PricingPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },
    {
        path: "/legal/consents",
        element: (
            <ProtectedRoute>
                <LegalConsentsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/legal/terms",
        element: <LegalDocumentPage />,
    },
    {
        path: "/legal/privacy",
        element: <LegalDocumentPage />,
    },
    {
        path: "/legal/personal-data-consent",
        element: <LegalDocumentPage />,
    },
    {
        path: "/legal/health-data",
        element: <LegalDocumentPage />,
    },
    {
        path: "/legal/offer",
        element: <LegalDocumentPage />,
    },
    {
        path: "/legal/refund",
        element: <LegalDocumentPage />,
    },
    {
        path: "/pricing",
        element: <PricingPage />,
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
        path: "/welcome",
        element: <WelcomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
    },
    {
        path: "/reset-password",
        element: <ResetPasswordPage />,
    },
    {
        path: "/trainer/profile",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <TrainerProfilePage />
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/subscription",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <SubscriptionPage />
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/subscription/test-pay/:paymentId",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <TestPaymentPage />
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
                <MePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings",
        element: (
            <ProtectedRoute>
                <TrainingsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings/new",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <TrainingCreatePage />
                </TrainerRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings/:trainingId",
        element: (
            <ProtectedRoute>
                <TrainingDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/clients",
        element: (
            <TrainerRoute>
                <ClientsPage />
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/clients/new",
        element: (
            <TrainerRoute>
                <ClientCreatePage />
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/clients/:clientId",
        element: (
            <TrainerRoute>
                <ClientDetailsPage />
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/clients/:clientId/questionnaire",
        element: (
            <TrainerRoute>
                <ClientQuestionnairePage />
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/clients/:clientId/measurements",
        element: (
            <TrainerRoute>
                <ClientMeasurementsPage />
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
        path: "/exercise-templates/new",
        element: (
            <ProtectedRoute>
                <TrainerRoute>
                    <ExerciseTemplateCreatePage />
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
                <RescheduleRequestsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/reschedule-requests/:id",
        element: (
            <ProtectedRoute>
                <RescheduleRequestDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainings/:trainingId/reschedule-request",
        element: (
            <ProtectedRoute>
                <CreateRescheduleRequestPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/notifications",
        element: (
            <ProtectedRoute>
                <NotificationsPage />
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
                <ClientBookingPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/client/profile",
        element: (
            <ProtectedRoute>
                <ClientProfilePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/client/questionnaire",
        element: (
            <ProtectedRoute>
                <ClientMyQuestionnairePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/client/measurements",
        element: (
            <ProtectedRoute>
                <ClientMyMeasurementsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/trainer/availability",
        element: (
            <TrainerRoute>
                <TrainerAvailabilityPage />
            </TrainerRoute>
        ),
    },
    {
        path: "/trainer/booking-requests",
        element: (
            <TrainerRoute>
                <TrainerBookingRequestsPage />
            </TrainerRoute>
        ),
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
