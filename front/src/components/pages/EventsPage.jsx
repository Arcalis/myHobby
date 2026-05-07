import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { apiRequest } from '../../api/client';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await apiRequest('/api/events');
        const items = Array.isArray(data) ? data : data.events || [];
        setEvents(items);
      } catch (error) {
        console.error(error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formats = ['online', 'offline', 'hybrid'];
  const categories = [...new Set(events.map((event) => event.category))];
  const ages = [...new Set(events.map((event) => event.ageCategory))];

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      event.organizerName.toLowerCase().includes(q);

    const matchesFormat =
      selectedFormats.length === 0 || selectedFormats.includes(event.format);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(event.category);

    const matchesAge =
      selectedAges.length === 0 || selectedAges.includes(event.ageCategory);

    return matchesSearch && matchesFormat && matchesCategory && matchesAge;
  });

  const toggleFilter = (value, selected, setter) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFormats([]);
    setSelectedCategories([]);
    setSelectedAges([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-foreground mb-6">
            Каталог мероприятий
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border border-border bg-input-background"
              />
            </div>

            {(searchQuery ||
              selectedFormats.length > 0 ||
              selectedCategories.length > 0 ||
              selectedAges.length > 0) && (
              <Button variant="outline" onClick={clearFilters} className="shrink-0">
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[230px,1fr] gap-8">
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-medium text-foreground">Фильтры</h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Формат проведения
                </h3>
                <div className="space-y-2">
                  {formats.map((format) => (
                    <div key={format} className="flex items-center gap-2">
                      <Checkbox
                        id={`format-${format}`}
                        checked={selectedFormats.includes(format)}
                        onCheckedChange={() =>
                          toggleFilter(format, selectedFormats, setSelectedFormats)
                        }
                      />
                      <Label
                        htmlFor={`format-${format}`}
                        className="text-sm text-muted-foreground capitalize cursor-pointer"
                      >
                        {format === 'online'
                          ? 'Онлайн'
                          : format === 'offline'
                            ? 'Оффлайн'
                            : 'Гибрид'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Категория</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() =>
                          toggleFilter(
                            category,
                            selectedCategories,
                            setSelectedCategories
                          )
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">
                  Возрастная категория
                </h3>
                <div className="space-y-2">
                  {ages.map((age) => (
                    <div key={age} className="flex items-center gap-2">
                      <Checkbox
                        id={`age-${age}`}
                        checked={selectedAges.includes(age)}
                        onCheckedChange={() =>
                          toggleFilter(age, selectedAges, setSelectedAges)
                        }
                      />
                      <Label
                        htmlFor={`age-${age}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {age}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Найдено мероприятий:{' '}
                <span className="font-medium text-foreground">
                  {filteredEvents.length}
                </span>
              </p>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка мероприятий...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Мероприятия не найдены</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 w-[20%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Мероприятие
                        </th>
                        <th className="px-4 py-3 w-[14%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Дата и время
                        </th>
                        <th className="px-4 py-3 w-[10%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Формат
                        </th>
                        <th className="px-4 py-3 w-[20%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Место
                        </th>
                        <th className="px-4 py-3 w-[8%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Возраст
                        </th>
                        <th className="px-4 py-3 w-[8%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Мест
                        </th>
                        <th className="px-4 py-3 w-[18%]"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1 min-w-0">
                              <Link
                                to={`/events/${event.id}`}
                                className="block font-medium text-foreground hover:text-primary transition-colors"
                              >
                                {event.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {event.organizerName}
                              </p>
                              <span className="inline-block text-xs py-0.5 bg-primary/10 text-primary rounded">
                                {event.category}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2 text-sm text-foreground min-w-0">
                              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 leading-tight">
                                <div className="font-medium whitespace-nowrap">
                                  {new Date(event.date).toLocaleDateString('ru-RU')}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="text-sm text-foreground whitespace-nowrap">
                              {event.format === 'online'
                                ? 'Онлайн'
                                : event.format === 'offline'
                                  ? 'Оффлайн'
                                  : 'Гибрид'}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="text-sm text-foreground whitespace-nowrap">
                              {event.ageCategory}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-foreground tabular-nums">
                                {event.availableSeats}/{event.totalSeats}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <Link to={`/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="whitespace-nowrap">
                                Подробнее
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}