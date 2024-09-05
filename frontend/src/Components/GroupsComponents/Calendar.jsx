import React, { useEffect, useRef, useCallback } from 'react';                  // Importa React e gli hooks necessari
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

const mesiItaliani = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', // Array con i nomi dei mesi in italiano
                      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const giorniItaliani = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì',   // Array con i nomi dei giorni in italiano
                        'Giovedì', 'Venerdì', 'Sabato'];

export default function Calendar({ tasks, onSelectDate }) {  // Definizione del componente Calendar
  const calendarRef = useRef(null);    // Crea un riferimento per l'elemento DOM del calendario

  const tasksByDate = tasks.reduce((acc, task) => {   // Raggruppa le task per data
    const date = moment(task.scheduledDate).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  const events = Object.entries(tasksByDate).map(([date, tasksForDate]) => ({    // Crea gli eventi per il calendario
    title: `${tasksForDate.length} task${tasksForDate.length > 1 ? 's' : ''}`,
    start: new Date(date),
    end: new Date(date),
    allDay: true,
  }));

  const formats = {  // Definisce i formati personalizzati per il calendario
    monthHeaderFormat: (date) => `${mesiItaliani[date.getMonth()]} ${date.getFullYear()}`,
    dayFormat: (date) => `${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayHeaderFormat: (date) => `${giorniItaliani[date.getDay()]} ${date.getDate()} ${mesiItaliani[date.getMonth()]}`,
    dayRangeHeaderFormat: ({ start, end }) =>
      `${start.getDate()} ${mesiItaliani[start.getMonth()]} - ${end.getDate()} ${mesiItaliani[end.getMonth()]} ${end.getFullYear()}`,
    weekdayFormat: (date) => giorniItaliani[date.getDay()],
  };

  const handleSelectSlot = useCallback(({ start }) => {     // Gestisce la selezione di uno slot nel calendario
    console.log('Slot selezionato:', start);
    onSelectDate(start);
  }, [onSelectDate]);

  const handleSelectEvent = useCallback((event) => {  // Gestisce la selezione di un evento nel calendario
    console.log('Evento selezionato:', event.start);
    onSelectDate(event.start);
  }, [onSelectDate]);
// Effetto per gestire gli eventi touch su mobile
useEffect(() => {                               
  const calendar = calendarRef.current;  // Ottiene il riferimento all'elemento DOM del calendario

  if (calendar) {                                // Verifica se il riferimento al calendario esiste
    const touchStartHandler = (e) => {           // Definisce una funzione per gestire l'evento touchstart
      if (e.touches.length === 1) {              // Verifica se c'è esattamente un punto di contatto
        e.preventDefault();                      // Previene il comportamento predefinito del touch
        const touch = e.touches[0];              // Ottiene il primo (e unico) punto di contatto
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);  // Trova l'elemento DOM nella posizione del touch
        if (targetElement) {                     // Se un elemento è stato trovato nella posizione del touch
          targetElement.click();                 // Simula un click su quell'elemento
        }
      }
    };

    calendar.addEventListener('touchstart', touchStartHandler, { passive: false });  // Aggiunge l'event listener al calendario

    return () => {                               // Funzione di cleanup
      calendar.removeEventListener('touchstart', touchStartHandler);  // Rimuove l'event listener quando il componente si smonta
    };
  }
}, []);  // Array di dipendenze vuoto, l'effetto si esegue solo al mount



  return (
    // Renderizza il contenitore del calendario
    <div className='h-[500px]' ref={calendarRef}>                                        
      <BigCalendar                                 // Renderizza il componente BigCalendar
        localizer={localizer}                      // Passa il localizzatore
        events={events}                            // Passa gli eventi
        startAccessor="start"                      // Specifica la proprietà di inizio evento
        endAccessor="end"                          // Specifica la proprietà di fine evento
        onSelectSlot={handleSelectSlot}            // Gestisce la selezione di uno slot
        onSelectEvent={handleSelectEvent}          // Gestisce la selezione di un evento
        selectable={true}                          // Permette la selezione di slot
        longPressThreshold={10}                    // Imposta la soglia per il press lungo
        views={['month', 'week', 'day']}
        messages={messages}                        // Passa le traduzioni
        formats={formats}                          // Passa i formati personalizzati
        culture='it'                               // Imposta la cultura (lingua)
        className='dark:text-white custom-calendar'              // Applica stili per il tema scuro
      />
    </div>
  );
}