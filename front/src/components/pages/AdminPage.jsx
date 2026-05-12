import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Shield,
  FileText,
  Users,
  AlertCircle,
  Check,
  X,
  Search,
  Eye,
  BadgeCheck,
  Ban,
  Clock3,
  UserCog,
  Trash2,
} from 'lucide-react';
import { apiRequest } from '../../api/client';

function formatDate(dateValue) {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU');
}

function getEventTitle(event) {
  return event.name || 'Без названия';
}

function getEventDescription(event) {
  return event.desription || '';
}

function getEventCategory(event) {
  return event.tag?.tag || 'Без категории';
}

function getEventOrganizer(event) {
  return event.organizer?.name || '—';
}

function getEventStatus(event) {
  if (event.deleted) return 'deleted';
  if (event.active === false) return 'hidden';
  if (event.approved === false) return 'pending';
  return 'approved';
}

function formatFormat(format) {
  if (format === 'online') return 'Онлайн';
  if (format === 'offline') return 'Оффлайн';
  if (format === 'hybrid') return 'Гибрид';
  return format || '—';
}

function StatusBadge({ event }) {
  const status = getEventStatus(event);

  if (status === 'deleted') {
    return (
      <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs font-medium">
        Удалено
      </span>
    );
  }

  if (status === 'hidden') {
    return (
      <span className="px-2 py-1 bg-slate-500/10 text-slate-600 rounded text-xs font-medium">
        Скрыто
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded text-xs font-medium">
        На модерации
      </span>
    );
  }

  return (
    <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
      Опубликовано
    </span>
  );
}

function AdminStatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-3xl font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

export function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('moderation');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEvents, setSearchEvents] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const [eventsData, usersData] = await Promise.all([
        apiRequest('/api/events/admin'),
        apiRequest('/api/users'),
      ]);

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error(error);
      setEvents([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const pendingEvents = useMemo(
    () => events.filter((e) => getEventStatus(e) === 'pending'),
    [events]
  );

  const approvedEvents = useMemo(
    () => events.filter((e) => getEventStatus(e) === 'approved'),
    [events]
  );

  const hiddenEvents = useMemo(
    () => events.filter((e) => getEventStatus(e) === 'hidden'),
    [events]
  );

  const deletedEvents = useMemo(
    () => events.filter((e) => getEventStatus(e) === 'deleted'),
    [events]
  );

  const filteredPendingEvents = useMemo(() => {
    const q = searchEvents.toLowerCase().trim();
    return pendingEvents.filter((event) => {
      if (!q) return true;
      return (
        getEventTitle(event).toLowerCase().includes(q) ||
        getEventDescription(event).toLowerCase().includes(q) ||
        getEventCategory(event).toLowerCase().includes(q) ||
        getEventOrganizer(event).toLowerCase().includes(q)
      );
    });
  }, [pendingEvents, searchEvents]);

  const filteredAllEvents = useMemo(() => {
    const q = searchEvents.toLowerCase().trim();
    return events.filter((event) => {
      if (!q) return true;
      return (
        getEventTitle(event).toLowerCase().includes(q) ||
        getEventDescription(event).toLowerCase().includes(q) ||
        getEventCategory(event).toLowerCase().includes(q) ||
        getEventOrganizer(event).toLowerCase().includes(q)
      );
    });
  }, [events, searchEvents]);

  const filteredUsers = useMemo(() => {
    const q = searchUsers.toLowerCase().trim();
    return users.filter((item) => {
      if (!q) return true;
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.role || '').toLowerCase().includes(q)
      );
    });
  }, [users, searchUsers]);

  const approveEvent = async (id) => {
    try {
      setActionLoadingId(id);
      await apiRequest(`/api/events/approve/${id}`, {
        method: 'PATCH',
      });
      await loadAdminData();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteEvent = async (id) => {
    try {
      setActionLoadingId(id);
      await apiRequest(`/api/events/${id}`, {
        method: 'DELETE',
      });
      await loadAdminData();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const changeUserRole = async (id, role) => {
    try {
      setActionLoadingId(id);
      await apiRequest(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: { role },
      });
      await loadAdminData();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const blockUser = async (id) => {
    try {
      setActionLoadingId(id);
      await apiRequest(`/api/users/${id}/block`, {
        method: 'PATCH',
      });
      await loadAdminData();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

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
          <AdminStatCard label="На модерации" value={pendingEvents.length} icon={FileText} />
          <AdminStatCard label="Всего мероприятий" value={events.length} icon={FileText} />
          <AdminStatCard label="Пользователей" value={users.length} icon={Users} />
          <AdminStatCard label="Жалобы" value={0} icon={AlertCircle} />
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <AdminStatCard label="Опубликовано" value={approvedEvents.length} icon={BadgeCheck} />
          <AdminStatCard label="Скрыто" value={hiddenEvents.length} icon={Clock3} />
          <AdminStatCard label="Удалено" value={deletedEvents.length} icon={Ban} />
          <AdminStatCard label="Активные" value={events.filter((e) => !e.deleted).length} icon={Check} />
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

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchEvents}
                  onChange={(e) => setSearchEvents(e.target.value)}
                  placeholder="Поиск по названию, описанию, категории или организатору..."
                  className="pl-10"
                />
              </div>
              {searchEvents && (
                <Button variant="outline" onClick={() => setSearchEvents('')}>
                  Сбросить
                </Button>
              )}
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : filteredPendingEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Нет мероприятий на модерации</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-card border border-border rounded-lg p-6 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3 flex-wrap">
                          <StatusBadge event={event} />
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {getEventCategory(event)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-foreground mb-2">
                            {getEventTitle(event)}
                          </h3>
                          {getEventDescription(event) ? (
                            <p className="text-sm text-muted-foreground">
                              {getEventDescription(event)}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid sm:grid-cols-4 gap-4 text-sm border-t border-border pt-4">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Организатор</p>
                            <p className="text-foreground font-medium">{getEventOrganizer(event)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Дата</p>
                            <p className="text-foreground font-medium">{formatDate(event.date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Формат</p>
                            <p className="text-foreground font-medium">{formatFormat(event.format)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Мест</p>
                            <p className="text-foreground font-medium tabular-nums">
                              {event.count_members ?? '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => approveEvent(event.id)}
                          disabled={actionLoadingId === event.id}
                        >
                          <Check className="w-4 h-4" />
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => deleteEvent(event.id)}
                          disabled={actionLoadingId === event.id}
                        >
                          <X className="w-4 h-4" />
                          Удалить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          onClick={() => window.open(`/events/${event.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                          Открыть
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

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchEvents}
                  onChange={(e) => setSearchEvents(e.target.value)}
                  placeholder="Поиск по названию, описанию, категории или организатору..."
                  className="pl-10"
                />
              </div>
              {searchEvents && (
                <Button variant="outline" onClick={() => setSearchEvents('')}>
                  Сбросить
                </Button>
              )}
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : filteredAllEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Мероприятия не найдены</p>
              </div>
            ) : (
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
                      {filteredAllEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{getEventTitle(event)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {getEventCategory(event)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {getEventOrganizer(event)}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge event={event} />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground tabular-nums">
                            {typeof event.members === 'number' && typeof event.count_members === 'number'
                              ? `${event.members}/${event.count_members}`
                              : event.count_members ?? '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/events/${event.id}`, '_blank')}
                              >
                                Открыть
                              </Button>

                              {/* 🔥 TOGGLE APPROVE */}
                              {getEventStatus(event) !== 'deleted' && (
                                <Button
                                  size="sm"
                                  variant={event.approved ? "outline" : "default"}
                                  onClick={async () => {
                                    try {
                                      setActionLoadingId(event.id);

                                      await apiRequest(`/api/events/approve/${event.id}`, {
                                        method: 'PATCH',
                                      });

                                      setEvents((prev) =>
                                        prev.map((e) =>
                                          e.id === event.id
                                            ? { ...e, approved: !e.approved }
                                            : e
                                        )
                                      );
                                    } catch (error) {
                                      console.error(error);
                                    } finally {
                                      setActionLoadingId(null);
                                    }
                                  }}
                                  disabled={actionLoadingId === event.id}
                                >
                                  {event.approved ? 'Снять' : 'Одобрить'}
                                </Button>
                              )}

                              {getEventStatus(event) !== 'deleted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteEvent(event.id)}
                                  disabled={actionLoadingId === event.id}
                                >
                                  Удалить
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="mb-4">
              <h2 className="font-medium text-foreground">Пользователи системы</h2>
              <p className="text-sm text-muted-foreground">Управление пользователями и их ролями</p>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  placeholder="Поиск по имени, email или роли..."
                  className="pl-10"
                />
              </div>
              {searchUsers && (
                <Button variant="outline" onClick={() => setSearchUsers('')}>
                  Сбросить
                </Button>
              )}
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Пользователи не найдены</p>
              </div>
            ) : (
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
                          Статус
                        </th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{userItem.name || '—'}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  ID: {userItem.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{userItem.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={userItem.role || 'user'}
                              onChange={(e) => changeUserRole(userItem.id, e.target.value)}
                              className="rounded-md border border-border bg-input-background px-3 py-2 text-sm"
                              disabled={actionLoadingId === userItem.id}
                            >
                              <option value="user">Пользователь</option>
                              <option value="organizer">Организатор</option>
                              <option value="admin">Администратор</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {userItem.blocked ? (
                              <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs font-medium">
                                Заблокирован
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                                Активен
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => blockUser(userItem.id)}
                                disabled={actionLoadingId === userItem.id || userItem.blocked}
                              >
                                {userItem.blocked ? 'Уже заблокирован' : 'Заблокировать'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/users/${userItem.id}`, '_blank')}
                              >
                                Профиль
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setActionLoadingId(userItem.id);
                                    await apiRequest(`/api/users/${userItem.id}`, {
                                      method: 'DELETE',
                                    });
                                    await loadAdminData();
                                  } catch (error) {
                                    console.error(error);
                                  } finally {
                                    setActionLoadingId(null);
                                  }
                                }}
                                disabled={actionLoadingId === userItem.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}