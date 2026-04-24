import { Outlet } from 'react-router';
import { Header } from './layout/Header';
import { AuthProvider } from '../context/AuthContext';
export function Root() {
    return (<AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </AuthProvider>);
}
