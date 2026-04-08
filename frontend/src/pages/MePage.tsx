import { useAuth } from "../features/auth/model/AuthContext";

export default function MePage() {
    const { currentUser } = useAuth();

    return (
        <div className="page-card">
            <h2>Текущий пользователь</h2>

            {currentUser ? (
                <div className="user-info">
                    <div>
                        <strong>ID:</strong> {currentUser.id}
                    </div>
                    <div>
                        <strong>Email:</strong> {currentUser.email}
                    </div>
                    <div>
                        <strong>Role:</strong> {currentUser.role}
                    </div>
                    <div>
                        <strong>Имя:</strong> {currentUser.firstName}
                    </div>
                    <div>
                        <strong>Фамилия:</strong> {currentUser.lastName}
                    </div>
                </div>
            ) : (
                <p>Пользователь не загружен</p>
            )}
        </div>
    );
}