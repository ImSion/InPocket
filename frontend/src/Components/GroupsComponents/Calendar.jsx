import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/it';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Imposta la localizzazione su italiano
moment.locale('it');

const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Tutto il giorno',
  previous: 'Precedente',
  next: 'Successivo',
  today: 'Oggi',
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  noEventsInRange: 'Non ci sono eventi in questo intervallo.',
  showMore: total => `+ Vedi altri (${total})`
};

// Traduzioni forzate per mesi e giorni
const mesiItaliani = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const giorniItaliani = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export default function Calendar({ tasks, onSelectDate }) {
  // Raggruppa le task per data usando scheduledDate invece di createdAt
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = moment(task.scheduledDate).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Crea gli eventi per il calendario con il conteggio delle task
  const events = Object.entries(tasksByDate).map(([date, tasksForDate]) => ({
    title: `${tasksForDate.length} task${tasksForDate.length > 1 ? 's' : ''}`,
    start: new Date(date),
    end: new Date(date),
    allDay: true,
  }));

  const formats = {
    monthHeaderFormat: (date) => `${mesiItaliani[date.getMonth()]} ${date.getFullYear()}`,
    dayFormat: (date) => `${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayHeaderFormat: (date) => `${giorniItaliani[date.getDay()]} ${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayRangeHeaderFormat: ({ start, end }) =>
      `${start.getDate()} ${mesiItaliani[start.getMonth()]} - ${end.getDate()} ${mesiItaliani[end.getMonth()]} ${end.getFullYear()}`,
    weekdayFormat: (date) => giorniItaliani[date.getDay()],
  };

  return (
    <div className='h-[500px]'>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={({ start }) => onSelectDate(start)}
        onSelectEvent={(event) => onSelectDate(event.start)}
        selectable
        views={['month', 'week', 'day']}
        messages={messages}
        formats={formats}
        culture='it'
      />
    </div>
  );
}