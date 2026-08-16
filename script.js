/* =========================================================
   HOME ENERGY MANAGER
   script.js
   ========================================================= */

"use strict";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "homeEnergyManagerData";

const DEFAULT_APPLIANCES = {
    fan1: {
        id: "fan1",
        name: "Fan 1",
        wattage: 75,
        icon: "🌀",
        type: "normal"
    },

    fan2: {
        id: "fan2",
        name: "Fan 2",
        wattage: 75,
        icon: "🌀",
        type: "normal"
    },

    tv: {
        id: "tv",
        name: "TCL Medium TV",
        wattage: 100,
        icon: "📺",
        type: "normal"
    },

    refrigerator: {
        id: "refrigerator",
        name: "Old Refrigerator",
        wattage: 150,
        icon: "🧊",
        type: "refrigerator",
        dutyCycle: 40,
        twentyFourHour: true
    },

    pump: {
        id: "pump",
        name: "Water Pump",
        wattage: 750,
        icon: "💧",
        type: "pump"
    },

    cooler: {
        id: "cooler",
        name: "Air Cooler",
        wattage: 200,
        icon: "❄️",
        type: "normal"
    },

    oven: {
        id: "oven",
        name: "Oven",
        wattage: 1500,
        icon: "🔥",
        type: "oven"
    },

    lights: {
        id: "lights",
        name: "Lights / Bulbs",
        wattage: 60,
        icon: "💡",
        type: "normal"
    }
};


const DEFAULT_SCHEDULE = {
    morning:
        "Water pump: 30–40 minutes\nFans: only when needed\nTV: OFF unless needed",

    afternoon:
        "Cooler: only when necessary\nFans: use only occupied rooms\nTV: OFF when nobody is watching",

    evening:
        "TV: maximum 3–4 hours\nFans: as needed\nLights: only necessary lights",

    night:
        "Turn OFF TV when finished\nTurn OFF unnecessary fans\nTurn OFF cooler when not needed\nRefrigerator remains ON"
};


/* =========================================================
   APP STATE
========================================================= */

let state = loadData();

let timerInterval = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});


function initializeApp() {

    normalizeState();

    setupNavigation();
    setupQuickNavigation();
    setupApplianceButtons();
    setupExpenseForm();
    setupSettings();
    setupSchedule();
    setupHistory();
    setupModals();

    setDefaultDates();
    renderApplianceSettings();
    renderSchedule();

    updateAll();

    startLiveTimer();

    window.addEventListener("beforeunload", saveData);
}


/* =========================================================
   DATA STRUCTURE
========================================================= */

function createDefaultState() {

    return {
        settings: {
            monthlyTarget: 170,
            dailyBudget: 600,
            electricityTariff: "",
            refrigeratorDutyCycle: 40
        },

        appliances: structuredClone(DEFAULT_APPLIANCES),

        usage: {},

        expenses: [],

        schedule: structuredClone(DEFAULT_SCHEDULE)
    };
}


/* =========================================================
   LOAD / SAVE
========================================================= */

function loadData() {

    const defaultData = createDefaultState();

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultData;
        }

        const parsed = JSON.parse(saved);

        return {
            ...defaultData,
            ...parsed,
            settings: {
                ...defaultData.settings,
                ...(parsed.settings || {})
            },
            appliances: {
                ...defaultData.appliances,
                ...(parsed.appliances || {})
            },
            usage: parsed.usage || {},
            expenses: Array.isArray(parsed.expenses)
                ? parsed.expenses
                : [],
            schedule: {
                ...defaultData.schedule,
                ...(parsed.schedule || {})
            }
        };

    } catch (error) {

        console.error("Could not load saved data:", error);

        return defaultData;
    }
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error("Could not save data:", error);
    }
}


/* =========================================================
   NORMALIZE STATE
========================================================= */

function normalizeState() {

    Object.keys(DEFAULT_APPLIANCES).forEach(id => {

        if (!state.appliances[id]) {

            state.appliances[id] =
                structuredClone(DEFAULT_APPLIANCES[id]);

        }

        const defaultAppliance =
            DEFAULT_APPLIANCES[id];

        state.appliances[id] = {
            ...defaultAppliance,
            ...state.appliances[id]
        };

        if (typeof state.appliances[id].wattage !== "number") {
            state.appliances[id].wattage =
                defaultAppliance.wattage;
        }

        if (state.appliances[id].type === "refrigerator") {

            if (
                typeof state.appliances[id].dutyCycle !== "number"
            ) {

                state.appliances[id].dutyCycle =
                    state.settings.refrigeratorDutyCycle || 40;
            }
        }

        if (typeof state.appliances[id].isOn !== "boolean") {
            state.appliances[id].isOn = false;
        }

        if (!state.appliances[id].startedAt) {
            state.appliances[id].startedAt = null;
        }

    });

    saveData();
}


/* =========================================================
   DATE HELPERS
========================================================= */

function getDateKey(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getMonthKey(date = new Date()) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
}


function getDaysInCurrentMonth() {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();
}


function getCurrentDayOfMonth() {

    return new Date().getDate();
}


function getRemainingDaysInMonth() {

    return (
        getDaysInCurrentMonth() -
        getCurrentDayOfMonth()
    );
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   USAGE DATA
========================================================= */

function getDayUsage(dateKey = getDateKey()) {

    if (!state.usage[dateKey]) {

        state.usage[dateKey] = {
            totalKwh: 0,
            appliances: {}
        };

    }

    return state.usage[dateKey];
}


function getApplianceDayUsage(
    applianceId,
    dateKey = getDateKey()
) {

    const day = getDayUsage(dateKey);

    if (!day.appliances[applianceId]) {

        day.appliances[applianceId] = {
            kwh: 0,
            runtimeSeconds: 0
        };

    }

    return day.appliances[applianceId];
}


/* =========================================================
   ELECTRICITY CALCULATION
========================================================= */

/*
    Energy (kWh) =
    Wattage × Running Hours / 1000
*/

function calculateKwh(wattage, runtimeSeconds) {

    const hours = runtimeSeconds / 3600;

    return (
        Number(wattage) *
        hours /
        1000
    );
}


function calculateKwhFromMinutes(
    wattage,
    minutes
) {

    return calculateKwh(
        wattage,
        Number(minutes) * 60
    );
}


/* =========================================================
   APPLIANCE CONTROLS
========================================================= */

function setupApplianceButtons() {

    document
        .querySelectorAll("[data-toggle]")
        .forEach(button => {

            button.addEventListener(
                "click",
                handleApplianceToggle
            );

        });


    document
        .querySelectorAll("[data-quick-use]")
        .forEach(button => {

            button.addEventListener(
                "click",
                handleQuickUse
            );

        });


    document
        .querySelectorAll("[data-oven-use]")
        .forEach(button => {

            button.addEventListener(
                "click",
                openOvenModal
            );

        });
}


function handleApplianceToggle(event) {

    const card =
        event.currentTarget.closest(
            ".appliance-card"
        );

    if (!card) {
        return;
    }

    const applianceId =
        card.dataset.applianceId;

    toggleAppliance(applianceId);
}


function toggleAppliance(applianceId) {

    const appliance =
        state.appliances[applianceId];

    if (!appliance) {
        return;
    }


    if (appliance.isOn) {

        turnApplianceOff(applianceId);

    } else {

        turnApplianceOn(applianceId);

    }

}


function turnApplianceOn(applianceId) {

    const appliance =
        state.appliances[applianceId];

    if (!appliance) {
        return;
    }

    appliance.isOn = true;

    appliance.startedAt =
        Date.now();

    saveData();

    updateAll();

    showToast(
        `${appliance.name} turned ON`
    );
}


function turnApplianceOff(applianceId) {

    const appliance =
        state.appliances[applianceId];

    if (!appliance) {
        return;
    }


    if (!appliance.isOn || !appliance.startedAt) {

        appliance.isOn = false;
        appliance.startedAt = null;

        saveData();

        updateAll();

        return;
    }


    const endTime = Date.now();

    const startTime =
        Number(appliance.startedAt);

    const runtimeMs =
        Math.max(
            0,
            endTime - startTime
        );

    const runtimeSeconds =
        Math.floor(runtimeMs / 1000);


    /*
       Normal appliance usage.
    */

    const kwh =
        calculateKwh(
            appliance.wattage,
            runtimeSeconds
        );


    /*
       Save usage.
    */

    addUsage(
        applianceId,
        runtimeSeconds,
        kwh
    );


    appliance.isOn = false;
    appliance.startedAt = null;


    saveData();

    updateAll();


    showToast(
        `${appliance.name} used ${kwh.toFixed(3)} kWh`
    );
}


/* =========================================================
   ADD USAGE
========================================================= */

function addUsage(
    applianceId,
    runtimeSeconds,
    kwh,
    dateKey = getDateKey()
) {

    const day =
        getDayUsage(dateKey);

    const applianceUsage =
        getApplianceDayUsage(
            applianceId,
            dateKey
        );


    applianceUsage.runtimeSeconds +=
        Number(runtimeSeconds);


    applianceUsage.kwh +=
        Number(kwh);


    day.totalKwh +=
        Number(kwh);


    saveData();
}


/* =========================================================
   QUICK USE
========================================================= */

function handleQuickUse(event) {

    const button =
        event.currentTarget;

    const applianceId =
        button.dataset.quickUse;

    const minutes =
        Number(button.dataset.minutes);

    const appliance =
        state.appliances[applianceId];

    if (!appliance || !minutes) {
        return;
    }


    const seconds =
        minutes * 60;

    const kwh =
        calculateKwh(
            appliance.wattage,
            seconds
        );


    addUsage(
        applianceId,
        seconds,
        kwh
    );


    saveData();

    updateAll();


    showToast(
        `${appliance.name}: ${minutes} min = ${kwh.toFixed(3)} kWh`
    );
}


/* =========================================================
   OVEN
========================================================= */

function openOvenModal() {

    const modal =
        document.getElementById(
            "ovenModal"
        );

    if (!modal) {
        return;
    }

    const input =
        document.getElementById(
            "ovenMinutes"
        );

    if (input) {
        input.value = "";
    }

    modal.hidden = false;

    setTimeout(() => {

        if (input) {
            input.focus();
        }

    }, 50);
}


function confirmOvenUsage() {

    const input =
        document.getElementById(
            "ovenMinutes"
        );

    const minutes =
        Number(input.value);

    if (!minutes || minutes <= 0) {

        showToast(
            "Please enter valid oven minutes."
        );

        return;
    }


    const oven =
        state.appliances.oven;


    const seconds =
        minutes * 60;


    const kwh =
        calculateKwh(
            oven.wattage,
            seconds
        );


    addUsage(
        "oven",
        seconds,
        kwh
    );


    saveData();

    updateAll();

    closeModal("ovenModal");


    showToast(
        `Oven usage added: ${kwh.toFixed(3)} kWh`
    );
}


/* =========================================================
   REFRIGERATOR
========================================================= */

function calculateRefrigeratorDailyUsage() {

    const fridge =
        state.appliances.refrigerator;

    if (!fridge) {
        return 0;
    }

    const dutyCycle =
        Number(
            fridge.dutyCycle ||
            state.settings.refrigeratorDutyCycle ||
            40
        );


    /*
       24 hours × duty cycle
    */

    const runtimeHours =
        24 * (dutyCycle / 100);


    return (
        Number(fridge.wattage) *
        runtimeHours /
        1000
    );
}


function addRefrigeratorDailyUsageIfNeeded() {

    const today =
        getDateKey();

    const day =
        getDayUsage(today);

    if (!day.appliances.refrigerator) {

        const kwh =
            calculateRefrigeratorDailyUsage();


        day.appliances.refrigerator = {
            kwh: kwh,
            runtimeSeconds:
                86400 *
                (
                    Number(
                        state.appliances.refrigerator
                            .dutyCycle || 40
                    ) / 100
                )
        };


        day.totalKwh += kwh;

        saveData();
    }
}


/* =========================================================
   RUNNING TIME
========================================================= */

function getLiveRuntimeSeconds(appliance) {

    if (
        !appliance ||
        !appliance.isOn ||
        !appliance.startedAt
    ) {
        return 0;
    }

    return Math.floor(
        (
            Date.now() -
            Number(appliance.startedAt)
        ) / 1000
    );
}


function formatRuntime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(Number(seconds) || 0)
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const secs =
        seconds % 60;


    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(secs).padStart(2, "0")
    ].join(":");
}


function formatShortRuntime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(Number(seconds) || 0)
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    return (
        String(hours).padStart(2, "0") +
        "h " +
        String(minutes).padStart(2, "0") +
        "m"
    );
}


/* =========================================================
   CALCULATE TODAY'S APPLIANCE USAGE
========================================================= */

function getTodayApplianceData(applianceId) {

    const dateKey =
        getDateKey();

    const usage =
        getApplianceDayUsage(
            applianceId,
            dateKey
        );


    let kwh =
        Number(usage.kwh || 0);

    let runtimeSeconds =
        Number(
            usage.runtimeSeconds || 0
        );


    const appliance =
        state.appliances[applianceId];


    /*
       Add live running consumption
       without saving it repeatedly.
    */

    if (
        appliance &&
        appliance.isOn &&
        appliance.startedAt
    ) {

        const liveSeconds =
            getLiveRuntimeSeconds(
                appliance
            );


        runtimeSeconds +=
            liveSeconds;


        kwh +=
            calculateKwh(
                appliance.wattage,
                liveSeconds
            );
    }


    /*
       Refrigerator estimated daily usage.
    */

    if (
        appliance &&
        appliance.type === "refrigerator" &&
        appliance.twentyFourHour
    ) {

        const savedFridge =
            usage.kwh || 0;


        if (savedFridge === 0) {

            kwh =
                calculateRefrigeratorDailyUsage();

        }

    }


    return {
        kwh,
        runtimeSeconds
    };
}


/* =========================================================
   TOTAL TODAY
========================================================= */

function calculateTodayUsage() {

    const day =
        getDayUsage();

    let total =
        Number(day.totalKwh || 0);


    /*
       Include currently running appliances.
    */

    Object.keys(state.appliances)
        .forEach(applianceId => {

            const appliance =
                state.appliances[applianceId];


            if (
                appliance.isOn &&
                appliance.startedAt
            ) {

                const liveSeconds =
                    getLiveRuntimeSeconds(
                        appliance
                    );


                total +=
                    calculateKwh(
                        appliance.wattage,
                        liveSeconds
                    );

            }

        });


    return total;
}


/* =========================================================
   MONTHLY USAGE
========================================================= */

function calculateMonthlyUsage() {

    const month =
        getMonthKey();

    let total = 0;


    Object.keys(state.usage)
        .forEach(dateKey => {

            if (
                dateKey.startsWith(month)
            ) {

                total += Number(
                    state.usage[dateKey].totalKwh ||
                    0
                );

            }

        });


    /*
       Add live usage from today's
       currently running appliances.
    */

    const todaySaved =
        Number(
            getDayUsage().totalKwh || 0
        );


    const liveToday =
        calculateTodayUsage() -
        todaySaved;


    total += Math.max(
        0,
        liveToday
    );


    /*
       If refrigerator is 24-hour and
       today's usage wasn't created,
       include its estimated consumption.
    */

    const fridge =
        state.appliances.refrigerator;


    if (
        fridge &&
        fridge.twentyFourHour
    ) {

        const today =
            getDayUsage();

        const fridgeUsage =
            today.appliances &&
            today.appliances.refrigerator;


        if (!fridgeUsage) {

            total +=
                calculateRefrigeratorDailyUsage();

        }

    }


    return total;
}


/* =========================================================
   MONTHLY ESTIMATE
========================================================= */

function calculateEstimatedMonthlyUsage() {

    const today =
        calculateTodayUsage();


    const day =
        getCurrentDayOfMonth();


    if (day <= 0) {
        return 0;
    }


    return (
        today / day
    ) *
    getDaysInCurrentMonth();
}


/* =========================================================
   DAILY TARGET
========================================================= */

function calculateDailyTarget() {

    const target =
        Number(
            state.settings.monthlyTarget
        ) || 170;


    return (
        target /
        getDaysInCurrentMonth()
    );
}


/* =========================================================
   EXPENSES
========================================================= */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            addExpense();

        }
    );
}


function addExpense() {

    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        );


    const category =
        document.getElementById(
            "expenseCategory"
        ).value;


    const note =
        document.getElementById(
            "expenseNote"
        ).value.trim();


    const date =
        document.getElementById(
            "expenseDate"
        ).value ||
        getDateKey();


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Please enter a valid amount."
        );

        return;
    }


    state.expenses.push({

        id:
            Date.now().toString(),

        amount,

        category,

        note,

        date,

        createdAt:
            new Date().toISOString()

    });


    saveData();


    document
        .getElementById("expenseForm")
        .reset();


    document
        .getElementById("expenseDate")
        .value =
        getDateKey();


    updateAll();


    showToast(
        "Expense added successfully."
    );
}


function getExpensesForDate(
    dateKey
) {

    return state.expenses.filter(
        expense =>
            expense.date === dateKey
    );
}


function getMonthlyExpenses() {

    const month =
        getMonthKey();

    return state.expenses
        .filter(expense =>
            expense.date &&
            expense.date.startsWith(month)
        )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );
}


function getTodayExpenses() {

    return getExpensesForDate(
        getDateKey()
    )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );
}


function deleteExpense(id) {

    state.expenses =
        state.expenses.filter(
            expense =>
                expense.id !== id
        );


    saveData();

    updateAll();

    showToast(
        "Expense deleted."
    );
}


/* =========================================================
   RENDER EXPENSES
========================================================= */

function renderExpenses() {

    const list =
        document.getElementById(
            "expenseList"
        );

    if (!list) {
        return;
    }


    const expenses =
        [...state.expenses]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 30);


    if (!expenses.length) {

        list.innerHTML =
            `
            <p class="empty-state">
                No expenses recorded yet.
            </p>
            `;

        return;
    }


    list.innerHTML =
        expenses.map(expense => {

            const note =
                expense.note
                    ? `<small>${escapeHtml(expense.note)}</small>`
                    : "";


            return `
                <div class="expense-item">

                    <div class="expense-item-icon">
                        ${getCategoryIcon(expense.category)}
                    </div>

                    <div class="expense-item-info">

                        <strong>
                            ${escapeHtml(expense.category)}
                        </strong>

                        ${note}

                        <span>
                            ${formatDate(expense.date)}
                        </span>

                    </div>

                    <div class="expense-item-right">

                        <strong>
                            Rs. ${Number(expense.amount).toLocaleString()}
                        </strong>

                        <button
                            type="button"
                            class="delete-expense"
                            data-delete-expense="${expense.id}"
                            aria-label="Delete expense"
                        >
                            ×
                        </button>

                    </div>

                </div>
            `;

        })
        .join("");


    list
        .querySelectorAll(
            "[data-delete-expense]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.deleteExpense;

                    deleteExpense(id);

                }
            );

        });
}


function getCategoryIcon(category) {

    const icons = {
        Food: "🍔",
        Electricity: "⚡",
        Water: "💧",
        Transport: "🚗",
        Shopping: "🛍️",
        Other: "📦"
    };

    return icons[category] || "📦";
}


/* =========================================================
   APPLIANCE RENDER
========================================================= */

function updateApplianceCards() {

    document
        .querySelectorAll(".appliance-card")
        .forEach(card => {

            const id =
                card.dataset.applianceId;

            const appliance =
                state.appliances[id];

            if (!appliance) {
                return;
            }


            const status =
                card.querySelector(
                    "[data-status]"
                );


            const toggle =
                card.querySelector(
                    "[data-toggle]"
                );


            const wattage =
                card.querySelector(
                    "[data-wattage]"
                );


            const todayUsage =
                card.querySelector(
                    "[data-today-usage]"
                );


            const runtime =
                card.querySelector(
                    "[data-runtime]"
                );


            const runningDisplay =
                card.querySelector(
                    "[data-running-display]"
                );


            if (wattage) {

                wattage.textContent =
                    appliance.wattage;

            }


            const data =
                getTodayApplianceData(id);


            if (todayUsage) {

                todayUsage.textContent =
                    data.kwh.toFixed(2);

            }


            if (runtime) {

                runtime.textContent =
                    formatShortRuntime(
                        data.runtimeSeconds
                    );

            }


            if (status) {

                status.textContent =
                    appliance.isOn
                        ? "ON"
                        : "OFF";


                status.classList.toggle(
                    "on",
                    appliance.isOn
                );


                status.classList.toggle(
                    "off",
                    !appliance.isOn
                );

            }


            if (toggle) {

                toggle.textContent =
                    appliance.isOn
                        ? "TURN OFF"
                        : "TURN ON";


                toggle.classList.toggle(
                    "on",
                    appliance.isOn
                );


                toggle.classList.toggle(
                    "off",
                    !appliance.isOn
                );

            }


            if (runningDisplay) {

                if (appliance.isOn) {

                    runningDisplay.hidden =
                        false;

                    const running =
                        runningDisplay.querySelector(
                            "strong"
                        );

                    if (running) {

                        running.textContent =
                            formatRuntime(
                                getLiveRuntimeSeconds(
                                    appliance
                                )
                            );

                    }

                } else {

                    runningDisplay.hidden =
                        true;

                }

            }


            /*
               Refrigerator UI
            */

            if (
                appliance.type ===
                "refrigerator"
            ) {

                const dutyCycle =
                    card.querySelector(
                        "[data-duty-cycle]"
                    );


                if (dutyCycle) {

                    dutyCycle.textContent =
                        appliance.dutyCycle || 40;

                }


                const checkbox =
                    card.querySelector(
                        "[data-24hour]"
                    );


                if (checkbox) {

                    checkbox.checked =
                        appliance.twentyFourHour !== false;

                }

            }

        });
}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const saveEnergy =
        document.getElementById(
            "saveEnergySettingsBtn"
        );

    if (saveEnergy) {

        saveEnergy.addEventListener(
            "click",
            saveEnergySettings
        );

    }


    const saveAppliances =
        document.getElementById(
            "saveApplianceSettingsBtn"
        );

    if (saveAppliances) {

        saveAppliances.addEventListener(
            "click",
            saveApplianceSettings
        );

    }


    const saveFridge =
        document.getElementById(
            "saveFridgeSettingsBtn"
        );

    if (saveFridge) {

        saveFridge.addEventListener(
            "click",
            saveFridgeSettings
        );

    }


    const reset =
        document.getElementById(
            "resetDataBtn"
        );

    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                openModal(
                    "resetModal"
                );

            }
        );

    }


    const settingsHeader =
        document.getElementById(
            "settingsHeaderBtn"
        );

    if (settingsHeader) {

        settingsHeader.addEventListener(
            "click",
            () => {
                showSection("settings");
            }
        );

    }

}


function renderSettingsValues() {

    const monthlyTarget =
        document.getElementById(
            "monthlyTargetInput"
        );


    const dailyBudget =
        document.getElementById(
            "dailyBudgetInput"
        );


    const tariff =
        document.getElementById(
            "electricityTariffInput"
        );


    const fridgeDuty =
        document.getElementById(
            "fridgeDutyCycleInput"
        );


    if (monthlyTarget) {

        monthlyTarget.value =
            state.settings.monthlyTarget;

    }


    if (dailyBudget) {

        dailyBudget.value =
            state.settings.dailyBudget;

    }


    if (tariff) {

        tariff.value =
            state.settings.electricityTariff;

    }


    if (fridgeDuty) {

        fridgeDuty.value =
            state.settings.refrigeratorDutyCycle;

    }

}


/* =========================================================
   APPLIANCE SETTINGS GENERATOR
========================================================= */

function renderApplianceSettings() {

    const container =
        document.getElementById(
            "applianceSettingsContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML =
        Object.values(state.appliances)
            .map(appliance => {

                return `
                    <div
                        class="setting-appliance-row"
                        data-setting-appliance="${appliance.id}"
                    >

                        <div class="setting-appliance-name">

                            <span class="setting-icon">
                                ${appliance.icon}
                            </span>

                            <div>
                                <strong>
                                    ${escapeHtml(appliance.name)}
                                </strong>

                                <small>
                                    Wattage
                                </small>
                            </div>

                        </div>


                        <div class="setting-input-wrap">

                            <input
                                type="number"
                                min="1"
                                step="1"
                                class="appliance-wattage-input"
                                data-setting-wattage="${appliance.id}"
                                value="${appliance.wattage}"
                                aria-label="${escapeHtml(appliance.name)} wattage"
                            >

                            <span>W</span>

                        </div>

                    </div>
                `;

            })
            .join("");
}


function saveEnergySettings() {

    const target =
        Number(
            document.getElementById(
                "monthlyTargetInput"
            ).value
        );


    const budget =
        Number(
            document.getElementById(
                "dailyBudgetInput"
            ).value
        );


    const tariff =
        document.getElementById(
            "electricityTariffInput"
        ).value;


    if (!target || target <= 0) {

        showToast(
            "Monthly target must be greater than 0."
        );

        return;
    }


    if (
        Number.isNaN(budget) ||
        budget < 0
    ) {

        showToast(
            "Please enter a valid daily budget."
        );

        return;
    }


    state.settings.monthlyTarget =
        target;


    state.settings.dailyBudget =
        budget;


    state.settings.electricityTariff =
        tariff;


    saveData();

    updateAll();


    showToast(
        "Energy settings saved."
    );
}


function saveApplianceSettings() {

    document
        .querySelectorAll(
            "[data-setting-wattage]"
        )
        .forEach(input => {

            const id =
                input.dataset.settingWattage;

            const wattage =
                Number(input.value);


            if (
                state.appliances[id] &&
                wattage > 0
            ) {

                state.appliances[id].wattage =
                    wattage;

            }

        });


    /*
       Update refrigerator duty cycle
       from the current setting too.
    */

    state.appliances.refrigerator.dutyCycle =
        Number(
            state.settings.refrigeratorDutyCycle
        ) || 40;


    saveData();

    updateAll();


    showToast(
        "Appliance wattages saved."
    );
}


function saveFridgeSettings() {

    const input =
        document.getElementById(
            "fridgeDutyCycleInput"
        );


    const dutyCycle =
        Number(input.value);


    if (
        !dutyCycle ||
        dutyCycle < 1 ||
        dutyCycle > 100
    ) {

        showToast(
            "Duty cycle must be between 1% and 100%."
        );

        return;
    }


    state.settings.refrigeratorDutyCycle =
        dutyCycle;


    state.appliances.refrigerator.dutyCycle =
        dutyCycle;


    saveData();

    updateAll();


    showToast(
        "Refrigerator setting saved."
    );
}


/* =========================================================
   REFRIGERATOR CHECKBOX
========================================================= */

function setupRefrigeratorCheckbox() {

    const checkbox =
        document.querySelector(
            "[data-24hour]"
        );

    if (!checkbox) {
        return;
    }


    checkbox.addEventListener(
        "change",
        () => {

            state.appliances.refrigerator.twentyFourHour =
                checkbox.checked;


            saveData();

            updateAll();

        }
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.section;

                    showSection(section);

                }
            );

        });
}


function setupQuickNavigation() {

    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.sectionTarget
                    );

                }
            );

        });
}


function showSection(sectionId) {

    /*
       Schedule doesn't have a bottom-nav
       item, but can still be opened.
    */

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const target =
        document.getElementById(
            sectionId
        );


    if (!target) {
        return;
    }


    target.classList.add(
        "active-section"
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                sectionId
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sectionId === "history") {

        renderCharts();

    }


    if (sectionId === "settings") {

        renderSettingsValues();
        renderApplianceSettings();

    }

}


/* =========================================================
   SCHEDULE
========================================================= */

function setupSchedule() {

    const saveButton =
        document.getElementById(
            "saveScheduleBtn"
        );

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSchedule
        );

    }


    renderSchedule();
}


function renderSchedule() {

    Object.keys(state.schedule)
        .forEach(time => {

            const textarea =
                document.querySelector(
                    `[data-schedule="${time}"]`
                );


            if (textarea) {

                textarea.value =
                    state.schedule[time];

            }

        });
}


function saveSchedule() {

    document
        .querySelectorAll(
            "[data-schedule]"
        )
        .forEach(textarea => {

            const key =
                textarea.dataset.schedule;

            state.schedule[key] =
                textarea.value;

        });


    saveData();


    showToast(
        "Electricity schedule saved."
    );
}


/* =========================================================
   HISTORY
========================================================= */

function setupHistory() {

    const dateInput =
        document.getElementById(
            "historyDate"
        );


    if (!dateInput) {
        return;
    }


    dateInput.addEventListener(
        "change",
        () => {

            updateHistory();

        }
    );
}


function updateHistory() {

    const dateInput =
        document.getElementById(
            "historyDate"
        );


    const dateKey =
        dateInput.value ||
        getDateKey();


    const day =
        state.usage[dateKey] || {
            totalKwh: 0,
            appliances: {}
        };


    const expenses =
        getExpensesForDate(
            dateKey
        );


    const expenseTotal =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );


    const tariff =
        Number(
            state.settings.electricityTariff
        ) || 0;


    const electricityCost =
        Number(day.totalKwh || 0) *
        tariff;


    setText(
        "selectedDateTitle",
        formatDate(dateKey)
    );


    setText(
        "historyElectricity",
        Number(day.totalKwh || 0).toFixed(2)
    );


    setText(
        "historyExpenses",
        expenseTotal.toLocaleString()
    );


    setText(
        "historyElectricityCost",
        electricityCost.toFixed(2)
    );


    renderCharts();
}


/* =========================================================
   CHARTS
========================================================= */

function renderCharts() {

    requestAnimationFrame(() => {

        drawDailyElectricityChart();
        drawApplianceChart();
        drawExpenseChart();

    });
}


/* ---------------------------------------------------------
   GENERIC CANVAS
--------------------------------------------------------- */

function prepareCanvas(canvas) {

    if (!canvas) {
        return null;
    }


    const parent =
        canvas.parentElement;


    const width =
        Math.max(
            280,
            parent.clientWidth
        );


    const height =
        220;


    const ratio =
        window.devicePixelRatio || 1;


    canvas.width =
        width * ratio;


    canvas.height =
        height * ratio;


    canvas.style.width =
        `${width}px`;


    canvas.style.height =
        `${height}px`;


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    return {
        ctx,
        width,
        height
    };
}


/* ---------------------------------------------------------
   DAILY ELECTRICITY CHART
--------------------------------------------------------- */

function drawDailyElectricityChart() {

    const canvas =
        document.getElementById(
            "dailyElectricityCanvas"
        );


    const prepared =
        prepareCanvas(canvas);


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const values = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        const key =
            getDateKey(date);


        values.push({
            date: key,
            value:
                Number(
                    state.usage[key]?.totalKwh || 0
                )
        });

    }


    drawBarChart(
        ctx,
        width,
        height,
        values,
        "#16a34a",
        "kWh"
    );
}


/* ---------------------------------------------------------
   APPLIANCE CHART
--------------------------------------------------------- */

function drawApplianceChart() {

    const canvas =
        document.getElementById(
            "applianceUsageCanvas"
        );


    const prepared =
        prepareCanvas(canvas);


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const today =
        getDayUsage();


    const values =
        Object.keys(state.appliances)
            .map(id => {

                const appliance =
                    state.appliances[id];


                const usage =
                    today.appliances?.[id];


                return {
                    date: appliance.name,
                    value:
                        Number(
                            usage?.kwh || 0
                        )
                };

            });


    drawBarChart(
        ctx,
        width,
        height,
        values,
        "#6366f1",
        "kWh"
    );
}


/* ---------------------------------------------------------
   EXPENSE CHART
--------------------------------------------------------- */

function drawExpenseChart() {

    const canvas =
        document.getElementById(
            "expenseCanvas"
        );


    const prepared =
        prepareCanvas(canvas);


    if (!prepared) {
        return;
    }


    const {
        ctx,
        width,
        height
    } = prepared;


    const values = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        const key =
            getDateKey(date);


        const amount =
            getExpensesForDate(key)
                .reduce(
                    (sum, expense) =>
                        sum +
                        Number(
                            expense.amount || 0
                        ),
                    0
                );


        values.push({
            date: key,
            value: amount
        });

    }


    drawBarChart(
        ctx,
        width,
        height,
        values,
        "#f59e0b",
        "PKR"
    );
}


/* ---------------------------------------------------------
   BAR CHART ENGINE
--------------------------------------------------------- */

function drawBarChart(
    ctx,
    width,
    height,
    values,
    color,
    unit
) {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const padding = {
        top: 20,
        right: 12,
        bottom: 42,
        left: 42
    };


    const chartWidth =
        width -
        padding.left -
        padding.right;


    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    const maxValue =
        Math.max(
            ...values.map(
                item => item.value
            ),
            1
        );


    /*
       Grid
    */

    ctx.strokeStyle =
        "#e5e7eb";

    ctx.lineWidth = 1;


    for (let i = 0; i <= 4; i++) {

        const y =
            padding.top +
            (
                chartHeight *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();


        const label =
            (
                maxValue -
                (
                    maxValue *
                    i /
                    4
                )
            ).toFixed(
                maxValue < 10
                    ? 1
                    : 0
            );


        ctx.fillStyle =
            "#94a3b8";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "right";

        ctx.fillText(
            label,
            padding.left - 7,
            y + 3
        );

    }


    const barGap =
        chartWidth /
        Math.max(values.length, 1);


    const barWidth =
        Math.min(
            32,
            barGap * 0.55
        );


    values.forEach(
        (item, index) => {

            const barHeight =
                (
                    item.value /
                    maxValue
                ) *
                chartHeight;


            const x =
                padding.left +
                index * barGap +
                (
                    barGap -
                    barWidth
                ) / 2;


            const y =
                padding.top +
                chartHeight -
                barHeight;


            /*
               Bar
            */

            ctx.fillStyle =
                color;


            roundRect(
                ctx,
                x,
                y,
                barWidth,
                barHeight,
                6
            );


            ctx.fill();


            /*
               Value
            */

            ctx.fillStyle =
                "#334155";

            ctx.font =
                "bold 10px Arial";

            ctx.textAlign =
                "center";


            const valueText =
                item.value.toFixed(
                    item.value < 10
                        ? 1
                        : 0
                );


            ctx.fillText(
                valueText,
                x + barWidth / 2,
                Math.max(
                    y - 5,
                    12
                )
            );


            /*
               Date / name
            */

            let label =
                item.date;


            if (
                /^\d{4}-\d{2}-\d{2}$/.test(
                    label
                )
            ) {

                label =
                    label.slice(5);

            } else if (
                label.length > 9
            ) {

                label =
                    label.substring(0, 8) +
                    "…";

            }


            ctx.fillStyle =
                "#64748b";

            ctx.font =
                "9px Arial";


            ctx.fillText(
                label,
                x + barWidth / 2,
                height - 17
            );

        }
    );
}


function roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    const actualHeight =
        Math.max(
            0,
            height
        );


    ctx.beginPath();

    ctx.moveTo(
        x + radius,
        y
    );

    ctx.lineTo(
        x + width - radius,
        y
    );

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    ctx.lineTo(
        x + width,
        y + actualHeight
    );

    ctx.lineTo(
        x,
        y + actualHeight
    );

    ctx.lineTo(
        x,
        y + radius
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    ctx.closePath();
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const monthlyUsage =
        calculateMonthlyUsage();


    const todayUsage =
        calculateTodayUsage();


    const target =
        Number(
            state.settings.monthlyTarget
        ) || 170;


    const remaining =
        Math.max(
            0,
            target - monthlyUsage
        );


    const percentage =
        target > 0
            ? (
                monthlyUsage /
                target
            ) * 100
            : 0;


    const dailyTarget =
        calculateDailyTarget();


    const estimated =
        calculateEstimatedMonthlyUsage();


    /*
       Monthly values
    */

    setText(
        "monthlyUsage",
        monthlyUsage.toFixed(2)
    );


    setText(
        "monthlyTargetDisplay",
        target.toFixed(
            target % 1 === 0
                ? 0
                : 2
        )
    );


    setText(
        "unitsRemaining",
        remaining.toFixed(2)
    );


    setText(
        "dashboardRemaining",
        remaining.toFixed(2)
    );


    setText(
        "monthlyPercentage",
        `${percentage.toFixed(0)}%`
    );


    setText(
        "todayUsage",
        todayUsage.toFixed(2)
    );


    setText(
        "dailyUsageValue",
        todayUsage.toFixed(2)
    );


    setText(
        "todayTarget",
        dailyTarget.toFixed(2)
    );


    setText(
        "estimatedMonthlyUsage",
        estimated.toFixed(2)
    );


    /*
       Progress bar
    */

    const monthlyBar =
        document.getElementById(
            "monthlyProgressBar"
        );


    if (monthlyBar) {

        monthlyBar.style.width =
            `${Math.min(
                percentage,
                100
            )}%`;


        monthlyBar.classList.remove(
            "safe",
            "warning",
            "danger"
        );


        if (percentage >= 100) {

            monthlyBar.classList.add(
                "danger"
            );

        } else if (percentage >= 75) {

            monthlyBar.classList.add(
                "warning"
            );

        } else {

            monthlyBar.classList.add(
                "safe"
            );

        }

    }


    /*
       Daily progress
    */

    const dailyPercentage =
        dailyTarget > 0
            ? (
                todayUsage /
                dailyTarget
            ) * 100
            : 0;


    const dailyBar =
        document.getElementById(
            "dailyProgressBar"
        );


    if (dailyBar) {

        dailyBar.style.width =
            `${Math.min(
                dailyPercentage,
                100
            )}%`;

    }


    /*
       Daily status
    */

    const dailyStatus =
        document.getElementById(
            "dailyStatus"
        );


    if (dailyStatus) {

        if (todayUsage > dailyTarget) {

            dailyStatus.textContent =
                "Above target";

        } else {

            dailyStatus.textContent =
                "Safe";

        }

    }


    const dailyRecommendation =
        document.getElementById(
            "dailyRecommendation"
        );


    if (dailyRecommendation) {

        dailyRecommendation.textContent =
            `Recommended maximum: ${dailyTarget.toFixed(2)} kWh today`;

    }


    updateOverallStatus(
        percentage,
        estimated,
        target
    );


    updateAlerts(
        percentage,
        todayUsage,
        dailyTarget,
        estimated,
        target
    );
}


/* =========================================================
   STATUS
========================================================= */

function updateOverallStatus(
    percentage,
    estimated,
    target
) {

    const status =
        document.getElementById(
            "overallStatus"
        );


    if (!status) {
        return;
    }


    status.classList.remove(
        "safe",
        "warning",
        "danger"
    );


    if (
        percentage >= 100 ||
        estimated > target
    ) {

        status.textContent =
            "OVER TARGET";

        status.classList.add(
            "danger"
        );

    } else if (
        percentage >= 75 ||
        estimated >= target * 0.9
    ) {

        status.textContent =
            "WATCH USAGE";

        status.classList.add(
            "warning"
        );

    } else {

        status.textContent =
            "ON TRACK";

        status.classList.add(
            "safe"
        );

    }

}


/* =========================================================
   ALERTS
========================================================= */

function updateAlerts(
    percentage,
    todayUsage,
    dailyTarget,
    estimated,
    target
) {

    const container =
        document.getElementById(
            "alertsContainer"
        );


    if (!container) {
        return;
    }


    const alerts = [];


    if (percentage >= 100) {

        alerts.push({
            type: "danger",
            icon: "🚨",
            text:
                "You have exceeded your monthly electricity target."
        });

    } else if (percentage >= 90) {

        alerts.push({
            type: "danger",
            icon: "⚠️",
            text:
                "You have used 90% of your monthly electricity target."
        });

    } else if (percentage >= 75) {

        alerts.push({
            type: "warning",
            icon: "⚠️",
            text:
                "You are getting close to your monthly electricity limit."
        });

    }


    if (
        todayUsage >
        dailyTarget
    ) {

        alerts.push({
            type: "warning",
            icon: "📈",
            text:
                "You are using more than your recommended daily average."
        });

    }


    if (
        estimated > target
    ) {

        alerts.push({
            type: "danger",
            icon: "🔴",
            text:
                "You are currently ON track to exceed 170 units this month."
        });

    }


    if (!alerts.length) {

        alerts.push({
            type: "success",
            icon: "✓",
            text:
                "Great! You are below your monthly target."
        });

    }


    container.innerHTML =
        alerts.map(alert => {

            return `
                <div class="alert ${alert.type}">
                    <span class="alert-icon">
                        ${alert.icon}
                    </span>

                    <span>
                        ${alert.text}
                    </span>
                </div>
            `;

        }).join("");
}


/* =========================================================
   EXPENSE DASHBOARD
========================================================= */

function updateExpenseDashboard() {

    const dailyBudget =
        Number(
            state.settings.dailyBudget
        ) || 600;


    const spent =
        getTodayExpenses();


    const remaining =
        dailyBudget - spent;


    setText(
        "dashboardDailyBudget",
        dailyBudget.toLocaleString()
    );


    setText(
        "dashboardSpentToday",
        spent.toLocaleString()
    );


    setText(
        "dashboardRemainingBudget",
        Math.max(
            0,
            remaining
        ).toLocaleString()
    );


    setText(
        "expenseBudget",
        dailyBudget.toLocaleString()
    );


    setText(
        "expenseSpentToday",
        spent.toLocaleString()
    );


    const remainingElement =
        document.getElementById(
            "expenseRemaining"
        );


    if (remainingElement) {

        remainingElement.textContent =
            `Rs. ${Math.max(
                0,
                remaining
            ).toLocaleString()}`;


        remainingElement.classList.toggle(
            "negative-money",
            remaining < 0
        );


        remainingElement.classList.toggle(
            "positive-money",
            remaining >= 0
        );

    }


    setText(
        "monthlyExpenses",
        getMonthlyExpenses().toLocaleString()
    );


    const trackedDays =
        getTrackedExpenseDays();


    setText(
        "daysTracked",
        trackedDays
    );


    const average =
        trackedDays > 0
            ? getMonthlyExpenses() /
              trackedDays
            : 0;


    setText(
        "averageDailyExpense",
        average.toFixed(0)
    );
}


function getTrackedExpenseDays() {

    const month =
        getMonthKey();


    const dates =
        new Set(
            state.expenses
                .filter(
                    expense =>
                        expense.date &&
                        expense.date.startsWith(month)
                )
                .map(
                    expense =>
                        expense.date
                )
        );


    return dates.size;
}


/* =========================================================
   COST
========================================================= */

function calculateTodayElectricityCost() {

    const tariff =
        Number(
            state.settings.electricityTariff
        ) || 0;


    return (
        calculateTodayUsage() *
        tariff
    );
}


function calculateMonthlyElectricityCost() {

    const tariff =
        Number(
            state.settings.electricityTariff
        ) || 0;


    return (
        calculateMonthlyUsage() *
        tariff
    );
}


/* =========================================================
   UPDATE ALL UI
========================================================= */

function updateAll() {

    addRefrigeratorDailyUsageIfNeeded();

    updateDashboard();
    updateApplianceCards();
    updateExpenseDashboard();
    renderExpenses();
    updateHistory();

    setupRefrigeratorCheckbox();

    renderSettingsValues();
}


/* =========================================================
   LIVE TIMER
========================================================= */

function startLiveTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    timerInterval =
        setInterval(
            () => {

                updateLiveTimers();

            },
            1000
        );
}


function updateLiveTimers() {

    /*
       Only update live information.
       Do not save every second.
    */

    document
        .querySelectorAll(".appliance-card")
        .forEach(card => {

            const id =
                card.dataset.applianceId;

            const appliance =
                state.appliances[id];


            if (!appliance) {
                return;
            }


            const runningDisplay =
                card.querySelector(
                    "[data-running-display]"
                );


            if (
                appliance.isOn &&
                runningDisplay
            ) {

                const strong =
                    runningDisplay.querySelector(
                        "strong"
                    );


                if (strong) {

                    strong.textContent =
                        formatRuntime(
                            getLiveRuntimeSeconds(
                                appliance
                            )
                        );

                }

            }


            /*
               Live kWh
            */

            const todayUsage =
                card.querySelector(
                    "[data-today-usage]"
                );


            const runtime =
                card.querySelector(
                    "[data-runtime]"
                );


            if (
                appliance.isOn
            ) {

                const data =
                    getTodayApplianceData(
                        id
                    );


                if (todayUsage) {

                    todayUsage.textContent =
                        data.kwh.toFixed(2);

                }


                if (runtime) {

                    runtime.textContent =
                        formatShortRuntime(
                            data.runtimeSeconds
                        );

                }

            }

        });


    /*
       Dashboard live usage.
    */

    updateDashboard();

}


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

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


    const ovenConfirm =
        document.getElementById(
            "confirmOvenBtn"
        );


    if (ovenConfirm) {

        ovenConfirm.addEventListener(
            "click",
            confirmOvenUsage
        );

    }


    const resetConfirm =
        document.getElementById(
            "confirmResetBtn"
        );


    if (resetConfirm) {

        resetConfirm.addEventListener(
            "click",
            resetAllData
        );

    }


    document
        .querySelectorAll(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        overlay.hidden =
                            true;

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-overlay"
                    )
                    .forEach(modal => {

                        modal.hidden =
                            true;

                    });

            }

        }
    );
}


function openModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.hidden = false;

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.hidden = true;

    }

}


/* =========================================================
   RESET DATA
========================================================= */

function resetAllData() {

    /*
       Clear running states too.
    */

    localStorage.removeItem(
        STORAGE_KEY
    );


    state =
        createDefaultState();


    saveData();


    closeModal(
        "resetModal"
    );


    renderApplianceSettings();
    renderSchedule();

    setDefaultDates();

    updateAll();


    showToast(
        "All data has been reset."
    );
}


/* =========================================================
   DEFAULT DATES
========================================================= */

function setDefaultDates() {

    const expenseDate =
        document.getElementById(
            "expenseDate"
        );


    if (expenseDate) {

        expenseDate.value =
            getDateKey();

    }


    const historyDate =
        document.getElementById(
            "historyDate"
        );


    if (historyDate) {

        historyDate.value =
            getDateKey();

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

let resizeTimeout;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimeout
        );


        resizeTimeout =
            setTimeout(
                () => {

                    const history =
                        document.getElementById(
                            "history"
                        );


                    if (
                        history &&
                        history.classList.contains(
                            "active-section"
                        )
                    ) {

                        renderCharts();

                    }

                },
                200
            );

    }
);


/* =========================================================
   PERIODIC SAVE
========================================================= */

setInterval(
    () => {

        saveData();

    },
    30000
);


/* =========================================================
   INITIAL EXTRA SETUP
========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.matches(
                "[data-24hour]"
            )
        ) {

            state.appliances.refrigerator
                .twentyFourHour =
                event.target.checked;


            saveData();

            updateAll();

        }

    }
);


/* =========================================================
   END OF SCRIPT
========================================================= */