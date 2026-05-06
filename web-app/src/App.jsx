import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1C1C26',
              color: '#F0F0F5',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#F5A623',
                secondary: '#0A0A0F',
              },
            },
            error: {
              iconTheme: {
                primary: '#E84040',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
