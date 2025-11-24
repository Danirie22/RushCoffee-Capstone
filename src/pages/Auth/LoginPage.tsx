import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        // Redirect to home with auth=login query param to open the modal
        navigate('/?auth=login', { replace: true });
    }, [navigate]);

    return null; // Render nothing while redirecting
};

export default LoginPage;