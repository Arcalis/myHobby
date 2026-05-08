import { useEffect, useMemo, useState } from 'react';
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
  const [tagsMap, setTagsMap] = useState({});
  const [agesMap, setAgesMap] = useState({});

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [eventsData, tagsData, agesData] = await Promise.all([
          apiRequest('/api/events'),
          apiRequest('/api/events/tags'),
          apiRequest('/api/events/ages'),
        ]);

        setTagsMap(Object.fromEntries(tagsData.map((t) => [t.id, t.tag])));
        setAgesMap(Object.fromEntries(agesData.map((a) => [a.id, a.age_category])));

        setEvents(Array.isArray(eventsData) ? eventsData : []);
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

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.tag_id).filter(Boolean))],
    [events]
  );

  const ages = useMemo(
    () => [...new Set(events.map((event) => event.age_id).filter(Boolean))],
    [events]
  );

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();

    const categoryLabel = tagsMap[event.tag_id] || '';
    const ageLabel = agesMap[event.age_id] || '';
    const title = event.name || '';
    const description = event.desription || '';
    const author = event.author || '';

    const matchesSearch =
      searchQuery === '' ||
      title.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      author.toLowerCase().includes(q) ||
      categoryLabel.toLowerCase().includes(q) ||
      ageLabel.toLowerCase().includes(q);

    const matchesFormat =
      selectedFormats.length === 0 || selectedFormats.includes(event.format);

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(event.tag_id);

    const matchesAge =
      selectedAges.length === 0 || selectedAges.includes(event.age_id);

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
                className="pl-10 w-full border border-border bg-card"
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
                <h3 className="text-sm font-medium text-foreground">Формат проведения</h3>
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
                  {categories.map((tagId) => (
                    <div key={tagId} className="flex items-center gap-2">
                      <Checkbox className="border-2 border-muted-foreground data-[state=unchecked]:border-muted-foreground/50"
                        id={`category-${tagId}`}
                        checked={selectedCategories.includes(tagId)}
                        onCheckedChange={() =>
                          toggleFilter(tagId, selectedCategories, setSelectedCategories)
                      
                        }
                      />
                      <Label
                        htmlFor={`category-${tagId}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {tagsMap[tagId] || tagId}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Возрастная категория</h3>
                <div className="space-y-2">
                  {ages.map((ageId) => (
                    <div key={ageId} className="flex items-center gap-2">
                      <Checkbox className="border-2 border-muted-foreground data-[state=unchecked]:border-muted-foreground/50"
                        id={`age-${ageId}`}
                        checked={selectedAges.includes(ageId)}
                        onCheckedChange={() =>
                          toggleFilter(ageId, selectedAges, setSelectedAges)
                        }
                      />
                      <Label
                        htmlFor={`age-${ageId}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {agesMap[ageId] || ageId}
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
                <span className="font-medium text-foreground">{filteredEvents.length}</span>
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
                        <th className="px-4 py-3 w-[14%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Возраст
                        </th>
                        <th className="px-4 py-3 w-[8%] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Мест
                        </th>
                        <th className="px-4 py-3 w-[14%]"></th>
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
                                {event.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {event.author}
                              </p>
                              <span className="inline-block text-xs py-0.5 px-2 bg-primary/10 text-primary rounded">
                                {tagsMap[event.tag_id] || 'Без категории'}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2 text-sm text-foreground min-w-0">
                              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 leading-tight">
                                <div className="font-medium whitespace-nowrap">
                                  {event.date
                                    ? new Date(event.date).toLocaleDateString('ru-RU')
                                    : '—'}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  {event.time || '—'}
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
                              <span>{event.address || '—'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="text-sm text-foreground whitespace-nowrap">
                              {agesMap[event.age_id] || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-foreground tabular-nums">
                                {event.members ?? 0}/{event.count_members ?? 0}
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