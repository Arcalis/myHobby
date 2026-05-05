import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Shield, FileText, Users, AlertCircle, Check, X } from 'lucide-react';
import { apiRequest } from '../../api/client';

export function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('moderation');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [eventsData, usersData] = await Promise.all([
          apiRequest('/api/admin/events'),
          apiRequest('/api/admin/users'),
        ]);

        setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      } catch (error) {
        console.error(error);
        setEvents([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const pendingEvents = events.filter((e) => e.status === 'pending');
  const approvedEvents = events.filter((e) => e.status === 'approved' || e.status === 'published');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Панель администратора</h1>
              <p className="text-muted-foreground">Управление платформой и модерация контента</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">На модерации</p>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground tabular-nums">{pendingEvents.length}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Всего мероприятий</p>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground tabular-nums">{events.length}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Пользователей</p>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground tabular-nums">{users.length}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Жалобы</p>
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground tabular-nums">0</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="moderation" className="gap-2">
              <FileText className="w-4 h-4" />
              Модерация ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <FileText className="w-4 h-4" />
              Все мероприятия
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <div className="mb-4">
              <h2 className="font-medium text-foreground">Мероприятия на модерации</h2>
              <p className="text-sm text-muted-foreground">
                Проверьте и одобрите или отклоните мероприятия от организаторов
              </p>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Нет мероприятий на модерации</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div key={event.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded text-xs font-medium">
                            На модерации
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {event.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-foreground mb-2">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>

                        <div className="grid sm:grid-cols-4 gap-4 text-sm border-t border-border pt-4">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Организатор</p>
                            <p className="text-foreground font-medium">{event.organizerName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Дата</p>
                            <p className="text-foreground font-medium">
                              {new Date(event.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Формат</p>
                            <p className="text-foreground font-medium capitalize">
                              {event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Мест</p>
                            <p className="text-foreground font-medium tabular-nums">{event.totalSeats}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="gap-2">
                          <Check className="w-4 h-4" />
                          Одобрить
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <X className="w-4 h-4" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="mb-4">
              <h2 className="font-medium text-foreground">Все мероприятия</h2>
              <p className="text-sm text-muted-foreground">Управление всеми мероприятиями платформы</p>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Название
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Организатор
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Дата
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Статус
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Записи
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {approvedEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{event.category}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{event.organizerName}</td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(event.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                            Опубликовано
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground tabular-nums">
                          {event.totalSeats - event.availableSeats}/{event.totalSeats}
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm">
                            Действия
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="mb-4">
              <h2 className="font-medium text-foreground">Пользователи системы</h2>
              <p className="text-sm text-muted-foreground">Управление пользователями и их ролями</p>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Пользователь
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Роль
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                        Мероприятий
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div className="font-medium text-foreground">{userItem.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{userItem.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium capitalize">
                            {userItem.role === 'organizer' ? 'Организатор' : 'Пользователь'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground tabular-nums">
                          {userItem.eventsCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm">
                            Управление
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}