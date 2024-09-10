import React, { useState, useEffect, useRef, useCallback } from 'react';  // Importa React e gli hooks necessari
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';  // Importa il componente Calendar e il localizzatore
import moment from 'moment';                                                    // Importa moment.js per la gestione delle date
import 'moment/locale/it';                                                      // Importa la localizzazione italiana di moment
import 'react-big-calendar/lib/css/react-big-calendar.css';  
import '../../Style/custom-calendar.css'                   // Importa i fogli di stile CSS per il calendario

moment.locale('it');  // Imposta la localizzazione di moment.js in italiano

const localizer = momentLocalizer(moment);  // Crea un localizzatore per BigCalendar

const messages = {    // Definisce le traduzioni italiane per il calendario
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

const mesiItaliani = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const giorniItaliani = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì',
    'Giovedì', 'Venerdì', 'Sabato'];

    export default function Calendar({ tasks, onSelectDate }) {
      const calendarRef = useRef(null);
      const [isCalendarOpen, setIsCalendarOpen] = useState(false);
      const [events, setEvents] = useState([]);
    
      useEffect(() => {
        const tasksByDate = tasks.reduce((acc, task) => {
          const date = moment(task.scheduledDate).format('YYYY-MM-DD');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(task);
          return acc;
        }, {});
    
        const newEvents = Object.entries(tasksByDate).map(([date, tasksForDate]) => ({
          title: `${tasksForDate.length} task${tasksForDate.length > 1 ? 's' : ''}`,
          start: new Date(date),
          end: new Date(date),
          allDay: true,
        }));
    
        setEvents(newEvents);
      }, [tasks]);

  const formats = {  // Definisce i formati personalizzati per il calendario
    monthHeaderFormat: (date) => `${mesiItaliani[date.getMonth()]} ${date.getFullYear()}`,
    dayFormat: (date) => `${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayHeaderFormat: (date) => `${giorniItaliani[date.getDay()]} ${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayRangeHeaderFormat: ({ start, end }) =>
      `${start.getDate()} ${mesiItaliani[start.getMonth()]} - ${end.getDate()} ${mesiItaliani[end.getMonth()]} ${end.getFullYear()}`,
    weekdayFormat: (date) => giorniItaliani[date.getDay()],
  };

  const handleSelectSlot = useCallback(({ start }) => {
    //console.log('Slot selezionato:', start);
    onSelectDate(start);
  }, [onSelectDate]);

  const handleSelectEvent = useCallback((event) => {
    console.log('Evento selezionato:', event.start);
    onSelectDate(event.start);
  }, [onSelectDate]);

  useEffect(() => {
    const calendar = calendarRef.current;

    if (calendar) {
      const touchStartHandler = (e) => {
        if (e.touches.length === 1) {
          e.preventDefault();
          const touch = e.touches[0];
          const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
          if (targetElement) {
            targetElement.click();
          }
        }
      };

      calendar.addEventListener('touchstart', touchStartHandler, { passive: false });

      return () => {
        calendar.removeEventListener('touchstart', touchStartHandler);
      };
    }
  }, []);

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className="flex flex-col items-center w-[340px] sm:w-full">
    <button 
      onClick={toggleCalendar}
      className="w-[260px] sm:w-[340px] mb-2 p-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all duration-300 ease-in-out"
    >
      {isCalendarOpen ? 'Chiudi Calendario' : 'Apri Calendario'}
    </button>
    
    <div 
      className={`w-[340px] sm:w-full overflow-hidden transition-all duration-500 ease-in-out ${
        isCalendarOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className='h-[500px] w-[340px] sm:w-full mt-2' ref={calendarRef}>                                        
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          longPressThreshold={10}
          views={['month']}
          messages={messages}
          formats={formats}
          culture='it'
          className='dark:text-white custom-calendar w-full h-full'
        />
      </div>
    </div>
    
    {isCalendarOpen && (
      <button 
        onClick={toggleCalendar}
        className="w-[260px] flex items-center justify-center sm:w-[340px] mt-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all duration-300 ease-in-out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>

      </button>
    )}
  </div>
)}