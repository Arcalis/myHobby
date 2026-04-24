import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Home, ArrowLeft } from 'lucide-react';
export function NotFound() {
    return (<div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-semibold text-foreground tabular-nums">404</h1>
          <h2 className="text-xl font-medium text-foreground">Страница не найдена</h2>
          <p className="text-muted-foreground">
            Запрашиваемая страница не существует или была перемещена
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4"/>
              На главную
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4"/>
            Назад
          </Button>
        </div>
      </div>
    </div>);
}
