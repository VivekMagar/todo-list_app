document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initCalculatorNavigation();
    initCalculatorSearch();
    initBmiCalculator();
    initToolPage();

    if (document.getElementById('time')) {
        initClock();
        initWeather();
        initMap();
    }
});

// Apply the saved color theme and expose a keyboard-accessible switch on Home.
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    let theme = localStorage.getItem('everydayToolsTheme') || 'light';

    const applyTheme = () => {
        document.documentElement.dataset.theme = theme;
        if (toggle) {
            const isDark = theme === 'dark';
            toggle.querySelector('i').className = `fa-solid ${isDark ? 'fa-moon' : 'fa-sun'}`;
            toggle.setAttribute('aria-checked', String(isDark));
            toggle.setAttribute('aria-label', `${isDark ? 'Dark' : 'Light'} mode. Activate to switch to ${isDark ? 'light' : 'dark'} mode.`);
        }
    };

    applyTheme();
    toggle?.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('everydayToolsTheme', theme);
        applyTheme();
    });
}

// Calculator links live in one list so menu categories stay in sync.
const calculatorLinks = [
    { name: 'Mortgage Calculator', url: 'mortgage-calculator.html', category: 'Finance' },
    { name: 'Loan Calculator', url: 'loan-calculator.html', category: 'Finance' },
    { name: 'Compound Interest Calculator', url: 'compound-interest-calculator.html', category: 'Finance' },
    { name: 'BMI Calculator', url: 'bmi-calculator.html', category: 'Health & Fitness' },
    { name: 'Calorie Calculator', url: 'calorie-calculator.html', category: 'Health & Fitness' },
    { name: 'BMR Calculator', url: 'bmr-calculator.html', category: 'Health & Fitness' },
    { name: 'Percentage Calculator', url: 'percentage-calculator.html', category: 'Math' },
    { name: 'Fraction Calculator', url: 'fraction-calculator.html', category: 'Math' },
    { name: 'Age Calculator', url: 'age-calculator.html', category: 'Date & Time' },
    { name: 'Date Difference Calculator', url: 'date-difference-calculator.html', category: 'Date & Time' }
];

const categoryMenuData = [
    { name: 'Pet Calculator', slug: 'pet', items: [{ name: 'Pet Age Calculator', id: 'pet-age-calculator' }, { name: 'Pet Food Calculator', id: 'pet-food-calculator' }] },
    { name: 'Chemistry Calculator', slug: 'chemistry', items: [{ name: 'Molarity Calculator', id: 'molarity-calculator' }, { name: 'Dilution Calculator', id: 'dilution-calculator' }] },
    { name: 'Astronomy & Space Calculator', slug: 'astronomy-space', items: [{ name: 'Planetary Weight Calculator', id: 'planetary-weight-calculator' }, { name: 'Light Travel Time Calculator', id: 'light-travel-time-calculator' }] },
    { name: 'Food & Cooking Calculator', slug: 'food-cooking', items: [{ name: 'Recipe Scaler Calculator', id: 'recipe-scaler-calculator' }, { name: 'Cooking Unit Converter', id: 'cooking-unit-converter' }] },
    { name: 'Map, Distance & Navigation Calculator', slug: 'map-distance-navigation', items: [{ name: 'Coordinate Distance Calculator', id: 'coordinate-distance-calculator' }, { name: 'Travel Time Calculator', id: 'travel-time-calculator' }] },
    { name: 'Gaming & Esports Calculator', slug: 'gaming-esports', items: [{ name: 'K/D Ratio Calculator', id: 'kd-ratio-calculator' }, { name: 'eDPI Calculator', id: 'edpi-calculator' }] }
];

const categoryCalculatorLinks = categoryMenuData.flatMap(group => group.items.map(item => ({
    ...item,
    category: group.name
})));

function initCalculatorSearch() {
    const form = document.getElementById('calculator-search-form');
    const input = document.getElementById('calculator-search');
    const results = document.getElementById('calculator-search-results');
    const status = document.getElementById('search-results-status');
    const resultList = document.getElementById('search-results-list');
    if (!form || !input || !results || !status || !resultList) return;

    const searchableCalculators = [
        ...calculatorLinks,
        ...categoryCalculatorLinks.map(item => ({
            name: item.name,
            url: `tool-page.html?tool=${item.id}`,
            category: item.category
        }))
    ];

    const updateResults = () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
            results.hidden = true;
            resultList.innerHTML = '';
            return [];
        }

        const matches = searchableCalculators.filter(item =>
            item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
        );
        const visibleMatches = matches.slice(0, 6);
        results.hidden = false;
        status.textContent = matches.length
            ? `Showing ${visibleMatches.length} of ${matches.length} calculators`
            : 'No calculators found. Try another search.';
        resultList.innerHTML = visibleMatches.map(item => `
            <li><a href="${item.url}"><span>${item.name}</span><small>${item.category}</small></a></li>
        `).join('');
        return visibleMatches;
    };

    input.addEventListener('input', updateResults);
    form.addEventListener('submit', event => {
        event.preventDefault();
        const [firstMatch] = updateResults();
        if (firstMatch) window.location.assign(firstMatch.url);
    });
}

// Build both accessible navigation dropdowns from their category data.
function initCalculatorNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!navToggle || !nav) return;

    const calculatorGroups = [...new Set(calculatorLinks.map(item => item.category))].map(category => ({
        name: category,
        url: `${category.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')}-calculators.html`,
        items: calculatorLinks.filter(item => item.category === category).map(item => ({ name: item.name, url: item.url }))
    }));
    const categoryGroups = categoryMenuData.map(group => ({
        name: group.name,
        url: `tool-page.html?category=${group.slug}`,
        items: group.items.map(item => ({ name: item.name, url: `tool-page.html?tool=${item.id}` }))
    }));

    const menus = [
        initNavigationDropdown('calculator-menu', 'calculators-trigger', 'calculator-menu-panel', 'calculators-menu-columns', calculatorGroups),
        initNavigationDropdown('category-menu', 'categories-trigger', 'categories-menu-panel', 'categories-menu-columns', categoryGroups)
    ].filter(Boolean);

    navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
        nav.classList.toggle('is-open', !expanded);
        if (expanded) menus.forEach(menu => menu.close());
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const openMenu = menus.find(menu => menu.trigger.getAttribute('aria-expanded') === 'true');
        if (openMenu) {
            openMenu.close();
            openMenu.restoreFocus = true;
            openMenu.trigger.focus();
        }
    });
}

function initNavigationDropdown(menuId, triggerId, panelId, columnsId, groups) {
    const menu = document.getElementById(menuId);
    const trigger = document.getElementById(triggerId);
    const panel = document.getElementById(panelId);
    const columns = document.getElementById(columnsId);
    if (!menu || !trigger || !panel || !columns) return null;

    columns.innerHTML = groups.map((group, index) => `
        <section class="calculator-category">
            <div class="calculator-category-heading">
                <a href="${group.url}">${group.name}</a>
                <button class="category-toggle" type="button" aria-expanded="false" aria-controls="${columnsId}-category-${index}" aria-label="Show ${group.name} calculators">
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
            </div>
            <ul id="${columnsId}-category-${index}" class="calculator-category-links" hidden>
                ${group.items.map(item => `<li><a href="${item.url}">${item.name}</a></li>`).join('')}
            </ul>
        </section>`).join('');

    let openTimer;
    let closeTimer;
    let hideTimer;
    let restoreFocus = false;
    const isMobile = () => window.matchMedia('(max-width: 850px)').matches;
    const categoryLists = columns.querySelectorAll('.calculator-category-links');
    const categoryButtons = columns.querySelectorAll('.category-toggle');
    categoryLists.forEach(list => { list.hidden = isMobile(); });

    const open = () => {
        clearTimeout(closeTimer);
        clearTimeout(hideTimer);
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => panel.classList.add('is-open'));
        trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
        clearTimeout(openTimer);
        panel.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        hideTimer = window.setTimeout(() => { panel.hidden = true; }, 180);
    };
    const scheduleOpen = () => {
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = window.setTimeout(open, 150);
    };
    const scheduleClose = () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
            if (!menu.contains(document.activeElement) && !menu.matches(':hover')) close();
        }, 150);
    };

    menu.addEventListener('mouseenter', () => { if (!isMobile()) scheduleOpen(); });
    menu.addEventListener('mouseleave', () => { if (!isMobile()) scheduleClose(); });
    menu.addEventListener('focusin', event => {
        if (restoreFocus && event.target === trigger) {
            restoreFocus = false;
            return;
        }
        if (!isMobile()) open();
    });
    menu.addEventListener('focusout', event => {
        if (!isMobile() && !menu.contains(event.relatedTarget)) scheduleClose();
    });
    trigger.addEventListener('click', () => {
        if (!isMobile()) return;
        if (trigger.getAttribute('aria-expanded') === 'true') close();
        else open();
    });
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            const list = document.getElementById(button.getAttribute('aria-controls'));
            const categoryName = button.closest('.calculator-category').querySelector('.calculator-category-heading a').textContent;
            button.setAttribute('aria-expanded', String(!expanded));
            button.setAttribute('aria-label', `${expanded ? 'Show' : 'Hide'} ${categoryName} calculators`);
            list.hidden = expanded;
        });
    });

    window.addEventListener('resize', () => {
        if (isMobile()) {
            close();
            categoryLists.forEach(list => { list.hidden = true; });
            categoryButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
        } else {
            categoryLists.forEach(list => { list.hidden = false; });
            categoryButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
        }
    });

    return { close, trigger, get restoreFocus() { return restoreFocus; }, set restoreFocus(value) { restoreFocus = value; } };
}

// Keep the sample BMI page functional while sharing the site's navigation script.
function initBmiCalculator() {
    const form = document.getElementById('bmi-form');
    const result = document.getElementById('bmi-result');
    if (!form || !result) return;

    form.addEventListener('submit', event => {
        event.preventDefault();
        const weight = Number(form.elements.weight.value);
        const height = Number(form.elements.height.value) / 100;
        if (!weight || !height) return;
        const bmi = weight / (height * height);
        const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obesity range';
        result.textContent = `Your BMI is ${bmi.toFixed(1)} (${category}).`;
    });
}

// Render all non-BMI calculators and category directories from the shared link data.
function initToolPage() {
    const page = document.getElementById('tool-page');
    if (!page) return;

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get('category');
    const categorySlug = requestedCategory?.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
    const category = categorySlug && calculatorLinks.find(item => item.category.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-') === categorySlug)?.category;
    const categoryGroup = categoryMenuData.find(group => group.slug === categorySlug);
    const toolId = params.get('tool');

    if (category || categoryGroup) {
        const categoryName = categoryGroup?.name || category;
        const items = categoryGroup
            ? categoryGroup.items.map(item => ({ name: item.name, url: `tool-page.html?tool=${item.id}` }))
            : calculatorLinks.filter(item => item.category === category);
        page.innerHTML = `
            <section class="bmi-tool" aria-labelledby="tool-title">
                <span class="eyebrow">Calculator category</span>
                <h1 id="tool-title">${categoryName}</h1>
                <ul class="tool-link-list">${items.map(item => `<li><a href="${item.url}">${item.name}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></li>`).join('')}</ul>
            </section>`;
        document.title = `${categoryName} | Everyday Tools`;
        return;
    }

    const item = calculatorLinks.find(link => link.url.replace('.html', '') === toolId) || categoryCalculatorLinks.find(link => link.id === toolId);
    if (!item || item.url === 'bmi-calculator.html') {
        page.innerHTML = '<section class="bmi-tool"><h1>Calculator not found</h1><p>Choose a calculator from the navigation menu.</p></section>';
        return;
    }

    const fieldSets = {
        'mortgage-calculator': [
            { name: 'principal', label: 'Home price or loan amount ($)', type: 'number', min: 1, step: 'any' },
            { name: 'rate', label: 'Annual interest rate (%)', type: 'number', min: 0, step: 'any' },
            { name: 'years', label: 'Loan term (years)', type: 'number', min: 1, step: 1 }
        ],
        'loan-calculator': [
            { name: 'principal', label: 'Loan amount ($)', type: 'number', min: 1, step: 'any' },
            { name: 'rate', label: 'Annual interest rate (%)', type: 'number', min: 0, step: 'any' },
            { name: 'years', label: 'Loan term (years)', type: 'number', min: 1, step: 1 }
        ],
        'compound-interest-calculator': [
            { name: 'principal', label: 'Starting amount ($)', type: 'number', min: 0, step: 'any' },
            { name: 'rate', label: 'Annual interest rate (%)', type: 'number', min: 0, step: 'any' },
            { name: 'years', label: 'Time invested (years)', type: 'number', min: 0, step: 'any' },
            { name: 'frequency', label: 'Compounding periods per year', type: 'number', min: 1, step: 1, value: 12 }
        ],
        'calorie-calculator': [
            { name: 'weight', label: 'Weight (kg)', type: 'number', min: 1, step: 'any' },
            { name: 'height', label: 'Height (cm)', type: 'number', min: 50, step: 'any' },
            { name: 'age', label: 'Age (years)', type: 'number', min: 1, max: 120, step: 1 },
            { name: 'sex', label: 'Formula', type: 'select', options: [['female', 'Female'], ['male', 'Male']] },
            { name: 'activity', label: 'Activity level', type: 'select', options: [['1.2', 'Mostly sedentary'], ['1.375', 'Light activity'], ['1.55', 'Moderate activity'], ['1.725', 'Very active'], ['1.9', 'Extra active']] }
        ],
        'bmr-calculator': [
            { name: 'weight', label: 'Weight (kg)', type: 'number', min: 1, step: 'any' },
            { name: 'height', label: 'Height (cm)', type: 'number', min: 50, step: 'any' },
            { name: 'age', label: 'Age (years)', type: 'number', min: 1, max: 120, step: 1 },
            { name: 'sex', label: 'Formula', type: 'select', options: [['female', 'Female'], ['male', 'Male']] }
        ],
        'percentage-calculator': [
            { name: 'percent', label: 'Percentage (%)', type: 'number', step: 'any' },
            { name: 'value', label: 'Value', type: 'number', step: 'any' }
        ],
        'fraction-calculator': [
            { name: 'numerator1', label: 'First numerator', type: 'number', step: 1 },
            { name: 'denominator1', label: 'First denominator', type: 'number', step: 1 },
            { name: 'operation', label: 'Operation', type: 'select', options: [['add', 'Add'], ['subtract', 'Subtract'], ['multiply', 'Multiply'], ['divide', 'Divide']] },
            { name: 'numerator2', label: 'Second numerator', type: 'number', step: 1 },
            { name: 'denominator2', label: 'Second denominator', type: 'number', step: 1 }
        ],
        'age-calculator': [
            { name: 'birthDate', label: 'Date of birth', type: 'date' }
        ],
        'date-difference-calculator': [
            { name: 'startDate', label: 'Start date', type: 'date' },
            { name: 'endDate', label: 'End date', type: 'date' }
        ],
        'pet-age-calculator': [
            { name: 'petType', label: 'Pet type', type: 'select', options: [['dog', 'Dog'], ['cat', 'Cat']] },
            { name: 'petAge', label: 'Pet age (years)', type: 'number', min: 0, step: 'any' }
        ],
        'pet-food-calculator': [
            { name: 'petWeight', label: 'Pet weight (kg)', type: 'number', min: 0.1, step: 'any' },
            { name: 'feeding', label: 'Life stage / activity', type: 'select', options: [['1.2', 'Weight management'], ['1.4', 'Typical adult'], ['2', 'Active or growing']] }
        ],
        'molarity-calculator': [
            { name: 'moles', label: 'Solute amount (moles)', type: 'number', min: 0, step: 'any' },
            { name: 'solutionVolume', label: 'Solution volume (mL)', type: 'number', min: 0.001, step: 'any' }
        ],
        'dilution-calculator': [
            { name: 'stockConcentration', label: 'Stock concentration (mol/L)', type: 'number', min: 0, step: 'any' },
            { name: 'targetConcentration', label: 'Target concentration (mol/L)', type: 'number', min: 0, step: 'any' },
            { name: 'stockVolume', label: 'Stock solution volume (mL)', type: 'number', min: 0, step: 'any' }
        ],
        'planetary-weight-calculator': [
            { name: 'earthWeight', label: 'Your Earth weight (kg)', type: 'number', min: 0, step: 'any' },
            { name: 'planet', label: 'World', type: 'select', options: [['0.165', 'Moon'], ['0.378', 'Mars'], ['0.904', 'Venus'], ['1', 'Earth'], ['2.528', 'Jupiter']] }
        ],
        'light-travel-time-calculator': [
            { name: 'distanceKm', label: 'Distance (kilometers)', type: 'number', min: 0, step: 'any' }
        ],
        'recipe-scaler-calculator': [
            { name: 'ingredientAmount', label: 'Ingredient amount', type: 'number', min: 0, step: 'any' },
            { name: 'originalServings', label: 'Original servings', type: 'number', min: 0.1, step: 'any' },
            { name: 'targetServings', label: 'Desired servings', type: 'number', min: 0.1, step: 'any' }
        ],
        'cooking-unit-converter': [
            { name: 'quantity', label: 'Quantity', type: 'number', min: 0, step: 'any' },
            { name: 'fromUnit', label: 'From', type: 'select', options: [['tsp', 'Teaspoon'], ['tbsp', 'Tablespoon'], ['cup', 'Cup'], ['ml', 'Milliliter'], ['fl-oz', 'Fluid ounce']] },
            { name: 'toUnit', label: 'To', type: 'select', options: [['tsp', 'Teaspoon'], ['tbsp', 'Tablespoon'], ['cup', 'Cup'], ['ml', 'Milliliter'], ['fl-oz', 'Fluid ounce']] }
        ],
        'coordinate-distance-calculator': [
            { name: 'latitude1', label: 'Start latitude', type: 'number', min: -90, max: 90, step: 'any' },
            { name: 'longitude1', label: 'Start longitude', type: 'number', min: -180, max: 180, step: 'any' },
            { name: 'latitude2', label: 'Destination latitude', type: 'number', min: -90, max: 90, step: 'any' },
            { name: 'longitude2', label: 'Destination longitude', type: 'number', min: -180, max: 180, step: 'any' }
        ],
        'travel-time-calculator': [
            { name: 'travelDistance', label: 'Distance (km)', type: 'number', min: 0, step: 'any' },
            { name: 'travelSpeed', label: 'Average speed (km/h)', type: 'number', min: 0.1, step: 'any' }
        ],
        'kd-ratio-calculator': [
            { name: 'kills', label: 'Kills', type: 'number', min: 0, step: 1 },
            { name: 'deaths', label: 'Deaths', type: 'number', min: 0, step: 1 }
        ],
        'edpi-calculator': [
            { name: 'mouseDpi', label: 'Mouse DPI', type: 'number', min: 1, step: 1 },
            { name: 'gameSensitivity', label: 'In-game sensitivity', type: 'number', min: 0, step: 'any' }
        ]
    };

    const fields = fieldSets[toolId];
    if (!fields) return;
    const renderField = field => {
        const id = `field-${field.name}`;
        const control = field.type === 'select'
            ? `<select id="${id}" name="${field.name}" required>${field.options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select>`
            : `<input id="${id}" name="${field.name}" type="${field.type}"${field.min !== undefined ? ` min="${field.min}"` : ''}${field.max !== undefined ? ` max="${field.max}"` : ''}${field.step ? ` step="${field.step}"` : ''}${field.value ? ` value="${field.value}"` : ''} required>`;
        return `<label for="${id}">${field.label}${control}</label>`;
    };

    page.innerHTML = `
        <section class="bmi-tool" aria-labelledby="tool-title">
            <span class="eyebrow">${item.category}</span>
            <h1 id="tool-title">${item.name}</h1>
            <p>Enter your values to calculate a clear result.</p>
            <form class="bmi-form" id="tool-form">${fields.map(renderField).join('')}<button type="submit">Calculate</button></form>
            <p class="bmi-result" id="tool-result" role="status" aria-live="polite"></p>
        </section>`;
    document.title = `${item.name} | Everyday Tools`;

    const form = document.getElementById('tool-form');
    const result = document.getElementById('tool-result');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form).entries());
        const number = name => Number(values[name]);
        const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        let answer;

        if (toolId === 'mortgage-calculator' || toolId === 'loan-calculator') {
            const periods = number('years') * 12;
            const monthlyRate = number('rate') / 1200;
            const payment = monthlyRate === 0 ? number('principal') / periods : number('principal') * monthlyRate / (1 - Math.pow(1 + monthlyRate, -periods));
            answer = `Estimated monthly payment: ${money(payment)}. Total paid: ${money(payment * periods)}.`;
        } else if (toolId === 'compound-interest-calculator') {
            const balance = number('principal') * Math.pow(1 + number('rate') / 100 / number('frequency'), number('frequency') * number('years'));
            answer = `Future balance: ${money(balance)}. Interest earned: ${money(balance - number('principal'))}.`;
        } else if (toolId === 'bmr-calculator' || toolId === 'calorie-calculator') {
            const bmr = 10 * number('weight') + 6.25 * number('height') - 5 * number('age') + (values.sex === 'male' ? 5 : -161);
            answer = toolId === 'bmr-calculator' ? `Estimated basal metabolic rate: ${Math.round(bmr)} calories per day.` : `Estimated maintenance calories: ${Math.round(bmr * number('activity'))} calories per day.`;
        } else if (toolId === 'percentage-calculator') {
            answer = `${number('percent')}% of ${number('value')} is ${(number('percent') * number('value') / 100).toLocaleString()}.`;
        } else if (toolId === 'fraction-calculator') {
            const a = number('numerator1') * number('denominator2');
            const b = number('numerator2') * number('denominator1');
            const numerator = values.operation === 'add' ? a + b : values.operation === 'subtract' ? a - b : values.operation === 'multiply' ? number('numerator1') * number('numerator2') : number('numerator1') * number('denominator2');
            const denominator = values.operation === 'add' || values.operation === 'subtract' ? number('denominator1') * number('denominator2') : values.operation === 'multiply' ? number('denominator1') * number('denominator2') : number('denominator1') * number('numerator2');
            if (denominator === 0) {
                result.textContent = 'The result is undefined because the denominator is zero.';
                return;
            }
            const gcd = (left, right) => right ? gcd(right, left % right) : Math.abs(left);
            const divisor = gcd(numerator, denominator) || 1;
            answer = `Result: ${numerator / divisor}/${denominator / divisor}.`;
        } else if (toolId === 'age-calculator') {
            const birth = new Date(`${values.birthDate}T00:00:00`);
            const today = new Date();
            let years = today.getFullYear() - birth.getFullYear();
            let months = today.getMonth() - birth.getMonth();
            let days = today.getDate() - birth.getDate();
            if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years--; months += 12; }
            answer = `Age: ${years} years, ${months} months, and ${days} days.`;
        } else if (toolId === 'date-difference-calculator') {
            const start = new Date(`${values.startDate}T00:00:00`);
            const end = new Date(`${values.endDate}T00:00:00`);
            const days = Math.abs(Math.round((end - start) / 86400000));
            answer = `Difference: ${days.toLocaleString()} days (${(days / 7).toFixed(1)} weeks).`;
        } else if (toolId === 'pet-age-calculator') {
            const age = number('petAge');
            const humanAge = age <= 1 ? age * 15 : values.petType === 'cat' ? 24 + (age - 2) * 4 : 24 + (age - 2) * 5;
            answer = `Approximate human-age equivalent: ${humanAge.toFixed(1)} years. Individual pets vary.`;
        } else if (toolId === 'pet-food-calculator') {
            const restingEnergy = 70 * Math.pow(number('petWeight'), 0.75);
            answer = `Estimated daily energy: ${Math.round(restingEnergy * number('feeding'))} kcal per day. Check feeding amounts with your veterinarian.`;
        } else if (toolId === 'molarity-calculator') {
            answer = `Molarity: ${(number('moles') / (number('solutionVolume') / 1000)).toPrecision(4)} mol/L.`;
        } else if (toolId === 'dilution-calculator') {
            const stock = number('stockConcentration');
            const target = number('targetConcentration');
            if (target > stock) {
                result.textContent = 'Target concentration cannot exceed the stock concentration for a dilution.';
                return;
            }
            if (target === 0) {
                result.textContent = 'Target concentration must be greater than zero.';
                return;
            }
            const finalVolume = stock * number('stockVolume') / target;
            answer = `Final solution volume: ${finalVolume.toFixed(2)} mL. Add ${(finalVolume - number('stockVolume')).toFixed(2)} mL solvent.`;
        } else if (toolId === 'planetary-weight-calculator') {
            const multipliers = { '0.165': 'Moon', '0.378': 'Mars', '0.904': 'Venus', '1': 'Earth', '2.528': 'Jupiter' };
            answer = `Your weight on ${multipliers[values.planet]}: ${(number('earthWeight') * number('planet')).toFixed(2)} kg equivalent.`;
        } else if (toolId === 'light-travel-time-calculator') {
            const seconds = number('distanceKm') / 299792.458;
            answer = `Light travel time: ${seconds < 60 ? `${seconds.toFixed(3)} seconds` : `${(seconds / 60).toFixed(2)} minutes`}.`;
        } else if (toolId === 'recipe-scaler-calculator') {
            const scaled = number('ingredientAmount') * number('targetServings') / number('originalServings');
            answer = `Use ${Number(scaled.toPrecision(4))} units of this ingredient.`;
        } else if (toolId === 'cooking-unit-converter') {
            const milliliters = { tsp: 4.92892, tbsp: 14.7868, cup: 236.588, ml: 1, 'fl-oz': 29.5735 };
            const converted = number('quantity') * milliliters[values.fromUnit] / milliliters[values.toUnit];
            answer = `${number('quantity')} ${values.fromUnit} = ${Number(converted.toPrecision(4))} ${values.toUnit}.`;
        } else if (toolId === 'coordinate-distance-calculator') {
            const radians = degrees => degrees * Math.PI / 180;
            const lat1 = radians(number('latitude1'));
            const lat2 = radians(number('latitude2'));
            const deltaLat = lat2 - lat1;
            const deltaLon = radians(number('longitude2') - number('longitude1'));
            const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
            const distance = 6371.0088 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
            answer = `Great-circle distance: ${distance.toFixed(2)} km (${(distance * 0.621371).toFixed(2)} mi).`;
        } else if (toolId === 'travel-time-calculator') {
            const hours = number('travelDistance') / number('travelSpeed');
            answer = `Estimated travel time: ${Math.floor(hours)} h ${Math.round((hours % 1) * 60)} min.`;
        } else if (toolId === 'kd-ratio-calculator') {
            const kills = number('kills');
            const deaths = number('deaths');
            answer = `K/D ratio: ${deaths === 0 ? (kills === 0 ? '0.00' : 'Perfect (no deaths)') : (kills / deaths).toFixed(2)}.`;
        } else if (toolId === 'edpi-calculator') {
            answer = `Effective DPI: ${(number('mouseDpi') * number('gameSensitivity')).toLocaleString()}.`;
        }

        result.textContent = answer || 'Enter valid values to calculate a result.';
    });
}

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

