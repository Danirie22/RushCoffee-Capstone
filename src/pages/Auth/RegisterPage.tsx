import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        // Redirect to home with auth=register query param to open the modal
        navigate('/?auth=register', { replace: true });
    }, [navigate]);

    return null; // Render nothing while redirecting
};

export default RegisterPage;
