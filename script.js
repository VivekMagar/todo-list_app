document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initWeather();
    initMap();
    initCalculator();
    initTodo();
});

/* =========================================
   CLOCK WIDGET
========================================= */
function initClock() {
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');

    const updateClock = () => {
        const now = new Date();
        
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    };

    updateClock();
    setInterval(updateClock, 1000);
}

/* =========================================
   MAP WIDGET
========================================= */
function initMap() {
    const mapElement = document.getElementById('map');
    const locationLabel = document.getElementById('map-location-label');
    const directionsLink = document.getElementById('map-directions-link');
    const viewButtons = document.querySelectorAll('.map-view-btn');
    const locationButton = document.getElementById('map-location-btn');
    const streetViewButton = document.getElementById('street-view-btn');

    if (!mapElement || typeof L === 'undefined') return;

    const defaultLocation = [51.5074, -0.1278];
    const map = L.map(mapElement, { zoomControl: true }).setView(defaultLocation, 11);
    const layers = {
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri'
        })
    };

    let activeLayer = layers.street;
    let currentLocation = defaultLocation;
    activeLayer.addTo(map);

    const updateLocationLinks = (coordinates) => {
        const [latitude, longitude] = coordinates;
        const locationQuery = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
        directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${locationQuery}`;
        streetViewButton.dataset.coordinates = locationQuery;
    };

    const setCurrentLocation = (coordinates, label = 'Selected location') => {
        currentLocation = coordinates;
        map.setView(coordinates, Math.max(map.getZoom(), 13));
        locationLabel.textContent = label;
        updateLocationLinks(coordinates);
    };

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const layerName = button.dataset.mapLayer;
            if (layerName === 'street' || layerName === 'satellite') {
                map.removeLayer(activeLayer);
                activeLayer = layers[layerName].addTo(map);
                viewButtons.forEach(viewButton => viewButton.classList.remove('active'));
                button.classList.add('active');
            }
        });
    });

    locationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            locationLabel.textContent = 'Location unavailable';
            return;
        }

        locationButton.classList.add('loading');
        navigator.geolocation.getCurrentPosition(
            position => {
                const coordinates = [position.coords.latitude, position.coords.longitude];
                setCurrentLocation(coordinates, 'Your location');
                locationButton.classList.remove('loading');
            },
            () => {
                locationLabel.textContent = 'Location permission needed';
                locationButton.classList.remove('loading');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    streetViewButton.addEventListener('click', () => {
        const [latitude, longitude] = currentLocation;
        const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
        window.open(streetViewUrl, '_blank', 'noopener,noreferrer');
    });

    map.on('click', event => {
        setCurrentLocation([event.latlng.lat, event.latlng.lng]);
    });

    updateLocationLinks(defaultLocation);
}

/* =========================================
   WEATHER WIDGET
========================================= */
function initWeather() {
    const citySelect = document.getElementById('city-select');
    const tempEl = document.getElementById('temperature');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');

    // Mapping Open-Meteo weather codes to FontAwesome icons
    const weatherIcons = {
        0: '<i class="fa-solid fa-sun"></i>', // Clear sky
        1: '<i class="fa-solid fa-cloud-sun"></i>', // Mainly clear
        2: '<i class="fa-solid fa-cloud"></i>', // Partly cloudy
        3: '<i class="fa-solid fa-cloud"></i>', // Overcast
        45: '<i class="fa-solid fa-smog"></i>', // Fog
        48: '<i class="fa-solid fa-smog"></i>', // Depositing rime fog
        51: '<i class="fa-solid fa-cloud-rain"></i>', // Drizzle Light
        53: '<i class="fa-solid fa-cloud-rain"></i>', // Drizzle Moderate
        55: '<i class="fa-solid fa-cloud-showers-heavy"></i>', // Drizzle Dense
        61: '<i class="fa-solid fa-cloud-rain"></i>', // Rain Slight
        63: '<i class="fa-solid fa-cloud-rain"></i>', // Rain Moderate
        65: '<i class="fa-solid fa-cloud-showers-heavy"></i>', // Rain Heavy
        71: '<i class="fa-regular fa-snowflake"></i>', // Snow Slight
        73: '<i class="fa-regular fa-snowflake"></i>', // Snow Moderate
        75: '<i class="fa-solid fa-snowflake"></i>', // Snow Heavy
        95: '<i class="fa-solid fa-cloud-bolt"></i>', // Thunderstorm
    };

    const weatherDescriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
        55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 95: 'Thunderstorm'
    };

    const fetchWeather = async (lat, lon) => {
        try {
            iconEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            
            if(data && data.current_weather) {
                const cw = data.current_weather;
                tempEl.textContent = `${Math.round(cw.temperature)}°C`;
                
                const wCode = cw.weathercode;
                iconEl.innerHTML = weatherIcons[wCode] || '<i class="fa-solid fa-cloud"></i>';
                descEl.textContent = weatherDescriptions[wCode] || 'Unknown';
            }
        } catch (error) {
            console.error("Error fetching weather:", error);
            tempEl.textContent = "--";
            descEl.textContent = "Failed to load";
            iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }
    };

    citySelect.addEventListener('change', (e) => {
        const [lat, lon] = e.target.value.split(',');
        fetchWeather(lat, lon);
    });

    // Initial fetch for selected option
    const initialCoords = citySelect.value.split(',');
    fetchWeather(initialCoords[0], initialCoords[1]);
}

/* =========================================
   CALCULATOR WIDGET
========================================= */
function initCalculator() {
    const display = document.getElementById('calc-display');
    const buttons = document.querySelectorAll('.calc-btn');
    
    let currentInput = '0';
    let previousInput = '';
    let operation = null;

    const updateDisplay = () => {
        if(currentInput.length > 12) {
            display.textContent = Number(currentInput).toExponential(4);
        } else {
            display.textContent = currentInput;
        }
    };

    const handleNumber = (num) => {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else {
            if (num === '.' && currentInput.includes('.')) return;
            currentInput += num;
        }
        updateDisplay();
    };

    const handleOperation = (op) => {
        if (currentInput === '') return;
        if (previousInput !== '') {
            calculate();
        }
        operation = op;
        previousInput = currentInput;
        currentInput = '';
    };

    const calculate = () => {
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case 'add': computation = prev + current; break;
            case 'subtract': computation = prev - current; break;
            case 'multiply': computation = prev * current; break;
            case 'divide': 
                if(current === 0) { computation = "Error"; break; }
                computation = prev / current; 
                break;
            default: return;
        }
        
        currentInput = computation.toString();
        operation = null;
        previousInput = '';
        updateDisplay();
    };

    const handleAction = (action) => {
        switch(action) {
            case 'clear':
                currentInput = '0';
                previousInput = '';
                operation = null;
                break;
            case 'delete':
                if (currentInput.length === 1 || currentInput === "Error") {
                    currentInput = '0';
                } else {
                    currentInput = currentInput.slice(0, -1);
                }
                break;
            case 'calculate':
                calculate();
                break;
        }
        updateDisplay();
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('num-btn')) {
                handleNumber(btn.dataset.number);
            } else if (btn.classList.contains('op-btn')) {
                handleOperation(btn.dataset.action);
            } else if (btn.classList.contains('act-btn') || btn.classList.contains('eq-btn')) {
                handleAction(btn.dataset.action);
            }
        });
    });
}

/* =========================================
   TODO WIDGET
========================================= */
function initTodo() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('dashboardTodos')) || [
        { id: 1, text: 'Welcome to your new dashboard!', completed: false }
    ];

    const saveTodos = () => {
        localStorage.setItem('dashboardTodos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${todo.text}</span>
                <button class="todo-delete" data-id="${todo.id}"><i class="fa-solid fa-trash"></i></button>
            `;
            
            todoList.appendChild(li);
        });
    };

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            todos.push({
                id: Date.now(),
                text,
                completed: false
            });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    });

    todoList.addEventListener('click', (e) => {
        // Handle Delete
        if (e.target.closest('.todo-delete')) {
            const btn = e.target.closest('.todo-delete');
            const id = parseInt(btn.dataset.id);
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
        }
        // Handle Checkbox
        else if (e.target.classList.contains('todo-checkbox')) {
            const id = parseInt(e.target.dataset.id);
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = e.target.checked;
                saveTodos();
                renderTodos();
            }
        }
    });

    renderTodos();
}
