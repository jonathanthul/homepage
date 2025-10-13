document.addEventListener('DOMContentLoaded', () => {
    // Fetch relevant elements from the html
    const container = document.getElementById('calendar');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const todayBtn = document.getElementById('today-btn')

    // Declare colors
    const siteBgColor = '#0017e7';
    const textColor = '#ffffff';

    // Initialize TUI Calendar
    const calendar = new tui.Calendar(container, {
        defaultView: 'month',
        useCreationPopup: false, // Stops the popup for creating a new element when clicking in the calendar
        useDetailPopup: true, // Allows the detail popup with event info
        isReadOnly: true, // Not sure if this isn't redundant when useCreationPopup is true
        taskView: false, // removes the "task" bar in day view
        scheduleView: ['time'], // removes other bars above the hourly day view
            week: {
            daynames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            startDayOfWeek: 1,
            hourStart: 0,
            hourEnd: 24,
            hourDisplayFormat: 'HH:mm',
            },
        month: {
            startDayOfWeek: 1, // Start on Monday
            daynames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            visibleWeeksCount: 2, // show only the next two weeks
            moreView: { // Controls the "more events" view that can be opened when there's too many events to fit in one day 
            backgroundColor: '#0017e7', // your site blue
            color: '#ffffff',           // white text
        },
        },
         theme: {
            // Set the main calendar background color to match the site
            'common.backgroundColor': siteBgColor,
            'common.dayname.color':textColor,
            'common.holiday.color': textColor,
            'common.saturday.color': textColor,
            'common.today.backgroundColor': '#0017e7',
            'common.border': '1px solid #ffffff', // You can set this to 'none' or a very light color
            'month.dayname.borderLeft': 'none',
            'month.dayname.borderRight': 'none',
            'month.moreView.backgroundColor': '#0017e7', 
        },
        gridSelection: {
            enableDblClick: false,
            enableClick: false,
        },
    });

    // Run it once at load and whenever the window resizes
    window.addEventListener('resize', adjustCalendarView);
    adjustCalendarView();

    // 3. Fetch and load the events from the JSON file
    const fetchEvents = async () => {
        try {
            const response = await fetch('../assets/data/events.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const events = await response.json();
            
            // TUI Calendar calls events "schedules"
            calendar.createSchedules(events); 

            console.log('Events loaded successfully!');
        } catch (error) {
            console.error('There was a problem fetching the events:', error);
        }
    };


    // switch between views on desktop/mobile
    function adjustCalendarView() {
        if (window.innerWidth < 900) {
            // Mobile: show week view
            calendar.changeView('day', true);
        } else {
            // Desktop/tablet: show month view
            calendar.changeView('month', true);
        }
    }

    // Go to previous day
    prevBtn.addEventListener('click', () => {
        calendar.prev();   // moves calendar to previous date (in day view)
    });

    // Go to next day
    nextBtn.addEventListener('click', () => {
        calendar.next();   // moves calendar to next date (in day view)
    });

    // Go to today
    todayBtn.addEventListener('click', () => {
        calendar.today();
    });

    // Initial setup
    fetchEvents();
});