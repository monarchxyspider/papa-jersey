"use strict";

/* =========================================================
   HOME CURRENT
   Main Application
========================================================= */


// =========================================================
// CONFIG
// =========================================================

const CONFIG = APP_CONFIG;


// =========================================================
// STORAGE
// =========================================================

const STORAGE_KEY = CONFIG.storageKey;


// =========================================================
// DEFAULT DATA
// =========================================================

function createDefaultData() {

    return {

        settings: {

            monthlyTarget:
                CONFIG.defaults.monthlyTarget,

            electricityTariff:
                CONFIG.defaults.electricityTariff,

            dailyBudget:
                CONFIG.defaults.dailyBudget

        },


        currentMonth: null,

        months: [],

        expenses: [],

        schedules: [],

        applianceSettings:
            JSON.parse(
                JSON.stringify(CONFIG.appliances)
            )

    };

}


// =========================================================
// LOAD DATA
// =========================================================

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            return createDefaultData();

        }

        const parsed =
            JSON.parse(saved);

        return {

            ...createDefaultData(),

            ...parsed,

            settings: {

                ...createDefaultData().settings,

                ...(parsed.settings || {})

            },

            months:
                Array.isArray(parsed.months)
                    ? parsed.months
                    : [],

            expenses:
                Array.isArray(parsed.expenses)
                    ? parsed.expenses
                    : [],

            schedules:
                Array.isArray(parsed.schedules)
                    ? parsed.schedules
                    : [],

            applianceSettings:
                Array.isArray(parsed.applianceSettings)
                    ? parsed.applianceSettings
                    : createDefaultData().applianceSettings

        };

    } catch (error) {

        console.error(
            "Unable to load Home Current data:",
            error
        );

        return createDefaultData();

    }

}


let appData = loadData();


// =========================================================
// SAVE DATA
// =========================================================

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}


// =========================================================
// HELPERS
// =========================================================

function $(id) {

    return document.getElementById(id);

}


function todayISO() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function currentMonthISO() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    return `${year}-${month}`;

}


function formatNumber(value, decimals = 2) {

    return Number(value || 0)
        .toLocaleString(
            undefined,
            {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }
        );

}


function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-PK",
            {
                maximumFractionDigits: 0
            }
        );

}


function formatDate(dateString) {

    if (!dateString) {
        return "Unknown date";
    }

    const date =
        new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(
        "en-PK",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatMonth(monthString) {

    if (!monthString) {
        return "No Month Started";
    }

    const date =
        new Date(`${monthString}-01T00:00:00`);

    return date.toLocaleDateString(
        "en-PK",
        {
            month: "long",
            year: "numeric"
        }
    );

}


// =========================================================
// TOAST
// =========================================================

function showToast(message) {

    const toast = $("toast");
    const messageElement =
        $("toastMessage");

    if (!toast || !messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

}


// =========================================================
// NAVIGATION
// =========================================================

function openSection(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.toggle(
                "active-section",
                section.id === sectionId
            );

        });


    document
        .querySelectorAll(
            ".nav-item, .side-nav-item"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionId
            );

        });


    closeMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-item, .side-nav-item"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.section
                    );

                }

            );

        });


    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.sectionTarget
                    );

                }

            );

        });

}


// =========================================================
// SIDE MENU
// =========================================================

function openMenu() {

    const menu =
        $("sideMenu");

    const overlay =
        $("menuOverlay");

    if (!menu || !overlay) {
        return;
    }

    menu.classList.add("open");

    overlay.hidden = false;

    requestAnimationFrame(() => {

        overlay.classList.add("visible");

    });

    menu.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeMenu() {

    const menu =
        $("sideMenu");

    const overlay =
        $("menuOverlay");

    if (!menu || !overlay) {
        return;
    }

    menu.classList.remove("open");

    overlay.classList.remove(
        "visible"
    );

    menu.setAttribute(
        "aria-hidden",
        "true"
    );

    setTimeout(() => {

        overlay.hidden = true;

    }, 250);

}


function setupMenu() {

    $("menuButton")
        ?.addEventListener(
            "click",
            openMenu
        );

    $("menuClose")
        ?.addEventListener(
            "click",
            closeMenu
        );

    $("menuOverlay")
        ?.addEventListener(
            "click",
            closeMenu
        );

}


// =========================================================
// DATE
// =========================================================

function updateDate() {

    const element =
        $("currentDate");

    if (!element) {
        return;
    }

    const today =
        new Date();

    element.textContent =
        today.toLocaleDateString(
            "en-PK",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// =========================================================
// MONTH
// =========================================================

function setupMonthModal() {

    $("newMonthBtn")
        ?.addEventListener(
            "click",
            openNewMonthModal
        );


    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.closeModal
                    );

                }

            );

        });


    $("startNewMonthBtn")
        ?.addEventListener(
            "click",
            startNewMonth
        );

}


function openNewMonthModal() {

    const modal =
        $("newMonthModal");

    if (!modal) {
        return;
    }

    $("newMonthName").value =
        currentMonthISO();

    $("newMonthDate").value =
        todayISO();

    $("newMonthUnits").value =
        "";

    $("newMonthTarget").value =
        appData.settings.monthlyTarget;

    modal.hidden = false;

    requestAnimationFrame(() => {

        modal.classList.add("show");

    });

}


function closeModal(id) {

    const modal =
        $(id);

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    setTimeout(() => {

        modal.hidden = true;

    }, 200);

}


function startNewMonth() {

    const month =
        $("newMonthName").value;

    const startDate =
        $("newMonthDate").value;

    const startingUnits =
        Number(
            $("newMonthUnits").value
        );

    const target =
        Number(
            $("newMonthTarget").value
        );


    if (!month) {

        showToast(
            "Please select a month."
        );

        return;

    }


    if (!startDate) {

        showToast(
            "Please select a start date."
        );

        return;

    }


    if (
        !Number.isFinite(startingUnits) ||
        startingUnits < 0
    ) {

        showToast(
            "Enter a valid meter reading."
        );

        return;

    }


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {

        showToast(
            "Enter a valid monthly target."
        );

        return;

    }


    // Save previous month
    if (appData.currentMonth) {

        const exists =
            appData.months.some(
                item =>
                    item.id ===
                    appData.currentMonth.id
            );

        if (!exists) {

            appData.months.push(
                appData.currentMonth
            );

        }

    }


    appData.currentMonth = {

        id:
            `${month}-${Date.now()}`,

        month,

        startDate,

        startingMeter:
            startingUnits,

        target,

        dailyUsage: {},

        applianceUsage: {}

    };


    appData.settings.monthlyTarget =
        target;


    saveData();

    closeModal(
        "newMonthModal"
    );

    renderAll();

    showToast(
        "New electricity month started ⚡"
    );

}


// =========================================================
// APPLIANCES
// =========================================================

function renderAppliances() {

    const container =
        $("appliancesContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    appData.applianceSettings
        .forEach(appliance => {

            const card =
                document.createElement("article");

            card.className =
                "appliance-card";


            card.innerHTML = `

                <div class="appliance-icon">
                    ${appliance.icon}
                </div>

                <div class="appliance-info">

                    <strong>
                        ${escapeHTML(appliance.name)}
                    </strong>

                    <span>
                        ${appliance.watts} W
                    </span>

                </div>

                <div class="appliance-control">

                    <label>
                        Hours
                    </label>

                    <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value="0"
                        data-appliance-hours="${appliance.id}"
                    >

                </div>

            `;


            container.appendChild(card);

        });

}


// =========================================================
// APPLIANCE USAGE
// =========================================================

function calculateApplianceUsage(
    appliance,
    hours
) {

    let effectiveWatts =
        appliance.watts;


    if (appliance.dutyCycle) {

        effectiveWatts *=
            appliance.dutyCycle;

    }


    return (
        effectiveWatts *
        hours
    ) / 1000;

}


function calculateTodayUsage() {

    let total = 0;


    document
        .querySelectorAll(
            "[data-appliance-hours]"
        )
        .forEach(input => {

            const appliance =
                appData.applianceSettings
                    .find(
                        item =>
                            item.id ===
                            input.dataset.applianceHours
                    );


            if (!appliance) {
                return;
            }


            const hours =
                Number(input.value) || 0;


            total +=
                calculateApplianceUsage(
                    appliance,
                    hours
                );

        });


    return total;

}


function saveTodayUsage() {

    if (!appData.currentMonth) {

        showToast(
            "Start a month first."
        );

        return;

    }


    const usage =
        calculateTodayUsage();

    const date =
        todayISO();


    appData.currentMonth.dailyUsage[date] =
        Number(
            usage.toFixed(2)
        );


    appData.currentMonth.applianceUsage[date] =
        {};


    document
        .querySelectorAll(
            "[data-appliance-hours]"
        )
        .forEach(input => {

            appData.currentMonth
                .applianceUsage[date]
                [input.dataset.applianceHours] =
                Number(input.value) || 0;

        });


    saveData();

    renderDashboard();

    renderHistory();

    showToast(
        "Today's electricity usage saved."
    );

}


// =========================================================
// SETTINGS
// =========================================================

function renderSettings() {

    const target =
        $("monthlyTargetInput");

    const tariff =
        $("electricityTariffInput");

    const budget =
        $("dailyBudgetInput");


    if (target) {

        target.value =
            appData.settings.monthlyTarget;

    }


    if (tariff) {

        tariff.value =
            appData.settings.electricityTariff;

    }


    if (budget) {

        budget.value =
            appData.settings.dailyBudget;

    }


    renderApplianceSettings();

}


function renderApplianceSettings() {

    const container =
        $("applianceSettingsContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    appData.applianceSettings
        .forEach(appliance => {

            const row =
                document.createElement("div");

            row.className =
                "settings-row";


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(appliance.name)}
                    </strong>

                    <span>
                        ${appliance.category}
                    </span>

                </div>

                <label>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value="${appliance.watts}"
                        data-wattage-id="${appliance.id}"
                    >

                    W

                </label>

            `;


            container.appendChild(row);

        });

}


function saveEnergySettings() {

    const target =
        Number(
            $("monthlyTargetInput").value
        );

    const tariff =
        Number(
            $("electricityTariffInput").value
        );

    const budget =
        Number(
            $("dailyBudgetInput").value
        );


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {

        showToast(
            "Monthly target must be greater than 0."
        );

        return;

    }


    appData.settings.monthlyTarget =
        target;

    appData.settings.electricityTariff =
        Math.max(0, tariff || 0);

    appData.settings.dailyBudget =
        Math.max(0, budget || 0);


    saveData();

    renderAll();

    showToast(
        "Energy settings saved."
    );

}


function saveApplianceSettings() {

    document
        .querySelectorAll(
            "[data-wattage-id]"
        )
        .forEach(input => {

            const appliance =
                appData.applianceSettings
                    .find(
                        item =>
                            item.id ===
                            input.dataset.wattageId
                    );


            if (appliance) {

                appliance.watts =
                    Math.max(
                        1,
                        Number(input.value) || 1
                    );

            }

        });


    saveData();

    renderAppliances();

    showToast(
        "Appliance settings saved."
    );

}


// =========================================================
// DASHBOARD
// =========================================================

function getCurrentMonthUsage() {

    if (!appData.currentMonth) {
        return 0;
    }

    return Object.values(
        appData.currentMonth.dailyUsage || {}
    )
        .reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        );

}


function getTodayUsage() {

    if (!appData.currentMonth) {
        return 0;
    }

    return Number(
        appData.currentMonth
            .dailyUsage?.[todayISO()] || 0
    );

}


function getTodayExpenses() {

    const today =
        todayISO();

    return appData.expenses
        .filter(
            expense =>
                expense.date === today
        )
        .reduce(
            (sum, expense) =>
                sum +
                Number(expense.amount || 0),
            0
        );

}


function getMonthlyExpenses() {

    const month =
        currentMonthISO();

    return appData.expenses
        .filter(
            expense =>
                expense.date.startsWith(month)
        )
        .reduce(
            (sum, expense) =>
                sum +
                Number(expense.amount || 0),
            0
        );

}


function renderDashboard() {

    const current =
        appData.currentMonth;


    if (!current) {

        $("currentMonthName").textContent =
            "No Month Started";

        $("monthlyUsage").textContent =
            "0.00";

        $("monthlyTargetDisplay").textContent =
            formatNumber(
                appData.settings.monthlyTarget,
                0
            );

        $("monthlyPercentage").textContent =
            "0%";

        $("unitsRemaining").textContent =
            "0";

        $("todayUsage").textContent =
            "0.00";

        $("todayTarget").textContent =
            "0.00";

        $("estimatedMonthlyUsage").textContent =
            "0.00";

        $("dashboardSpentToday").textContent =
            "0";

        $("dailyUsageValue").textContent =
            "0.00";

        $("dailyRecommendation").textContent =
            "Start a month to begin tracking.";

        updateProgress(
            "monthlyProgressBar",
            0
        );

        updateProgress(
            "dailyProgressBar",
            0
        );

        return;

    }


    const monthlyUsage =
        getCurrentMonthUsage();

    const monthlyTarget =
        Number(
            current.target ||
            appData.settings.monthlyTarget
        );

    const todayUsage =
        getTodayUsage();


    const percentage =
        monthlyTarget > 0
            ? (monthlyUsage / monthlyTarget) * 100
            : 0;


    const daysElapsed =
        Object.keys(
            current.dailyUsage || {}
        ).length || 1;


    const estimatedMonthly =
        todayUsage > 0
            ? todayUsage * 30
            : (
                monthlyUsage /
                daysElapsed
            ) * 30;


    const remaining =
        Math.max(
            0,
            monthlyTarget - monthlyUsage
        );


    $("currentMonthName").textContent =
        formatMonth(current.month);

    $("monthlyUsage").textContent =
        formatNumber(monthlyUsage);

    $("monthlyTargetDisplay").textContent =
        formatNumber(monthlyTarget, 0);

    $("monthlyPercentage").textContent =
        `${Math.round(percentage)}%`;

    $("unitsRemaining").textContent =
        formatNumber(remaining);

    $("todayUsage").textContent =
        formatNumber(todayUsage);

    $("todayTarget").textContent =
        formatNumber(
            monthlyTarget / 30
        );

    $("estimatedMonthlyUsage").textContent =
        formatNumber(
            estimatedMonthly
        );


    const todayExpenses =
        getTodayExpenses();


    $("dashboardSpentToday").textContent =
        formatMoney(todayExpenses);


    $("dailyUsageValue").textContent =
        formatNumber(todayUsage);


    const dailyTarget =
        monthlyTarget / 30;


    const dailyPercentage =
        dailyTarget > 0
            ? (
                todayUsage /
                dailyTarget
            ) * 100
            : 0;


    updateProgress(
        "monthlyProgressBar",
        percentage
    );


    updateProgress(
        "dailyProgressBar",
        dailyPercentage
    );


    updateDailyStatus(
        dailyPercentage
    );


    const budget =
        appData.settings.dailyBudget;


    $("dashboardDailyBudget").textContent =
        formatMoney(budget);

    $("dashboardSpent").textContent =
        formatMoney(todayExpenses);


    const remainingBudget =
        budget - todayExpenses;


    $("dashboardRemainingBudget").textContent =
        `Rs. ${formatMoney(
            Math.max(0, remainingBudget)
        )}`;


    $("dashboardRemainingBudget")
        .classList.toggle(
            "negative-money",
            remainingBudget < 0
        );


    $("dashboardRemainingBudget")
        .classList.toggle(
            "positive-money",
            remainingBudget >= 0
        );


    renderAlerts();

}


function updateProgress(id, percentage) {

    const element =
        $(id);

    if (!element) {
        return;
    }

    element.style.width =
        `${Math.min(
            100,
            Math.max(0, percentage)
        )}%`;

}


function updateDailyStatus(percentage) {

    const badge =
        $("dailyStatus");

    const recommendation =
        $("dailyRecommendation");


    if (!badge || !recommendation) {
        return;
    }


    badge.className =
        "status-badge";


    if (percentage <= 80) {

        badge.classList.add("safe");

        badge.textContent =
            "SAFE";

        recommendation.textContent =
            "Great! Your electricity usage is under control.";

    }

    else if (percentage <= 100) {

        badge.classList.add("warning");

        badge.textContent =
            "WATCH";

        recommendation.textContent =
            "You're getting close to today's target.";

    }

    else {

        badge.classList.add("danger");

        badge.textContent =
            "HIGH";

        recommendation.textContent =
            "Today's usage is above your target. Consider reducing appliance runtime.";

    }

}


// =========================================================
// ALERTS
// =========================================================

function renderAlerts() {

    const container =
        $("alertsContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (!appData.currentMonth) {
        return;
    }


    const usage =
        getCurrentMonthUsage();

    const target =
        appData.currentMonth.target;


    if (
        usage >
        target
    ) {

        const alert =
            document.createElement("div");

        alert.className =
            "alert-card danger-alert";

        alert.innerHTML = `
            <span>⚠️</span>
            <div>
                <strong>Monthly target exceeded</strong>
                <p>
                    Your current usage is
                    ${formatNumber(usage)} kWh.
                </p>
            </div>
        `;

        container.appendChild(alert);

    }

}


// =========================================================
// EXPENSES
// =========================================================

function setupExpenseForm() {

    const form =
        $("expenseForm");

    if (!form) {
        return;
    }


    $("expenseDate").value =
        todayISO();


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const amount =
                Number(
                    $("expenseAmount").value
                );


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                showToast(
                    "Enter a valid expense amount."
                );

                return;

            }


            appData.expenses.push({

                id:
                    Date.now(),

                amount,

                category:
                    $("expenseCategory").value,

                note:
                    $("expenseNote").value.trim(),

                date:
                    $("expenseDate").value

            });


            saveData();

            form.reset();

            $("expenseDate").value =
                todayISO();

            renderAll();

            showToast(
                "Expense added successfully."
            );

        }

    );

}


function renderExpenses() {

    const today =
        todayISO();

    const todaySpent =
        getTodayExpenses();

    const monthlySpent =
        getMonthlyExpenses();


    $("expenseBudget").textContent =
        formatMoney(
            appData.settings.dailyBudget
        );

    $("expenseSpentToday").textContent =
        formatMoney(todaySpent);


    const remaining =
        appData.settings.dailyBudget -
        todaySpent;


    $("expenseRemaining").textContent =
        `Rs. ${formatMoney(
            Math.max(0, remaining)
        )}`;


    $("monthlyExpenses").textContent =
        formatMoney(monthlySpent);


    const uniqueDays =
        new Set(
            appData.expenses
                .filter(
                    expense =>
                        expense.date
                            .startsWith(
                                currentMonthISO()
                            )
                )
                .map(
                    expense =>
                        expense.date
                )
        );


    $("daysTracked").textContent =
        uniqueDays.size;


    $("averageDailyExpense").textContent =
        formatMoney(
            uniqueDays.size
                ? monthlySpent /
                  uniqueDays.size
                : 0
        );


    const list =
        $("expenseList");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    const expenses =
        [...appData.expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 20);


    if (!expenses.length) {

        list.innerHTML = `
            <div class="empty-state">
                <span>💰</span>
                <strong>No expenses yet</strong>
                <p>Your expense history will appear here.</p>
            </div>
        `;

        return;

    }


    expenses.forEach(expense => {

        const item =
            document.createElement("div");

        item.className =
            "expense-item";


        item.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        expense.category
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        expense.note ||
                        "No note"
                    )}
                </span>

                <small>
                    ${formatDate(expense.date)}
                </small>

            </div>

            <strong>
                Rs. ${formatMoney(
                    expense.amount
                )}
            </strong>

        `;


        list.appendChild(item);

    });

}


// =========================================================
// HISTORY
// =========================================================

function setupHistory() {

    const input =
        $("historyDate");

    if (!input) {
        return;
    }

    input.value =
        todayISO();


    input.addEventListener(
        "change",
        renderHistory
    );

}


function renderHistory() {

    const date =
        $("historyDate")?.value ||
        todayISO();


    $("selectedDateTitle").textContent =
        formatDate(date);


    let electricity = 0;


    if (appData.currentMonth) {

        electricity =
            Number(
                appData.currentMonth
                    .dailyUsage?.[date] || 0
            );

    }


    const expenses =
        appData.expenses
            .filter(
                expense =>
                    expense.date === date
            )
            .reduce(
                (sum, expense) =>
                    sum +
                    Number(expense.amount || 0),
                0
            );


    const electricityCost =
        electricity *
        Number(
            appData.settings.electricityTariff ||
            0
        );


    $("historyElectricity").textContent =
        formatNumber(electricity);

    $("historyExpenses").textContent =
        formatMoney(expenses);

    $("historyElectricityCost").textContent =
        formatMoney(electricityCost);


    renderHistoryList();

}


function renderHistoryList() {

    const container =
        $("historyList");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (!appData.currentMonth) {

        container.innerHTML = `
            <div class="empty-state">
                <span>📊</span>
                <strong>No history yet</strong>
                <p>Start an electricity month to begin tracking.</p>
            </div>
        `;

        return;

    }


    const entries =
        Object.entries(
            appData.currentMonth.dailyUsage || {}
        )
        .sort(
            (a, b) =>
                new Date(b[0]) -
                new Date(a[0])
        );


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                <span>📊</span>
                <strong>No usage recorded</strong>
                <p>Save appliance usage to create history.</p>
            </div>
        `;

        return;

    }


    entries.forEach(
        ([date, usage]) => {

            const item =
                document.createElement("div");

            item.className =
                "history-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${formatDate(date)}
                    </strong>

                    <span>
                        Daily electricity usage
                    </span>

                </div>

                <strong>
                    ${formatNumber(usage)}
                    kWh
                </strong>

            `;


            container.appendChild(item);

        }
    );

}


// =========================================================
// EXPORT
// =========================================================

function exportData() {

    const data =
        JSON.stringify(
            appData,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `home-current-backup-${todayISO()}.json`;


    link.click();


    URL.revokeObjectURL(url);


    showToast(
        "Backup exported."
    );

}


// =========================================================
// RESET
// =========================================================

function resetData() {

    const confirmed =
        confirm(
            "Are you sure? This will permanently delete all Home Current data from this browser."
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    appData =
        createDefaultData();


    renderAll();

    showToast(
        "Everything has been reset."
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================================================
// RENDER EVERYTHING
// =========================================================

function renderAll() {

    updateDate();

    renderDashboard();

    renderAppliances();

    renderSettings();

    renderExpenses();

    renderHistory();

}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEvents() {

    setupNavigation();

    setupMenu();

    setupMonthModal();

    setupExpenseForm();

    setupHistory();


    $("saveEnergySettingsBtn")
        ?.addEventListener(
            "click",
            saveEnergySettings
        );


    $("saveApplianceSettingsBtn")
        ?.addEventListener(
            "click",
            saveApplianceSettings
        );


    $("exportDataBtn")
        ?.addEventListener(
            "click",
            exportData
        );


    $("resetDataBtn")
        ?.addEventListener(
            "click",
            resetData
        );


    $("saveScheduleBtn")
        ?.addEventListener(
            "click",
            saveTodayUsage
        );

}


// =========================================================
// INIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEvents();

        renderAll();

        console.log(
            `${CONFIG.appName} v${CONFIG.version} loaded.`
        );

    }
);