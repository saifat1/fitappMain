import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";

export default function MorePage() {
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    return (
        <div className="more-page">
            <section className="more-panel">
                <div className="more-panel-header">
                    <h1 className="more-title">Ещё</h1>
                    <p className="more-subtitle">Второстепенные разделы и служебные действия.</p>
                </div>

                <div className="more-list">
                    {isTrainer && (
                        <Link to="/trainer/invites" className="more-link-card">
                            <span>Приглашения</span>
                            <strong>›</strong>
                        </Link>
                    )}

                    <Link to="/me" className="more-link-card">
                        <span>Профиль</span>
                        <strong>›</strong>
                    </Link>
                </div>
            </section>
        </div>
    );
}