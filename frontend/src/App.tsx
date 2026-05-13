import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from "./features/auth/model/AuthContext";
import { AppAnalyticsTracker } from "./features/analytics/ui/AppAnalyticsTracker";

function App() {
    return (
        <AuthProvider>
            <AppAnalyticsTracker />
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;