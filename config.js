const APP_CONFIG = {

    // =====================================================
    // APP
    // =====================================================

    appName: "Home Current",

    shortName: "MY HOME",

    version: "1.0.0",


    // =====================================================
    // BRAND
    // =====================================================

    branding: {

        title: "Home Current",

        subtitle:
            "Smart electricity management for your home.",

        icon: "⚡"

    },


    // =====================================================
    // THEME
    // =====================================================

    theme: {

        primary: "#287a66",

        primaryDark: "#1e5c4d",

        cream: "#f8f5ed",

        yellow: "#f4c95d",

        danger: "#d9534f",

        text: "#26332f",

        muted: "#74817c"

    },


    // =====================================================
    // DEFAULT SETTINGS
    // =====================================================

    defaults: {

        monthlyTarget: 170,

        electricityTariff: 0,

        dailyBudget: 600

    },


    // =====================================================
    // APPLIANCES
    // =====================================================

    appliances: [

        {
            id: "fan1",
            name: "Fan 1",
            icon: "🌀",
            watts: 75,
            category: "Cooling"
        },

        {
            id: "fan2",
            name: "Fan 2",
            icon: "🌀",
            watts: 75,
            category: "Cooling"
        },

        {
            id: "tv",
            name: "TCL TV",
            icon: "📺",
            watts: 100,
            category: "Entertainment"
        },

        {
            id: "fridge",
            name: "Refrigerator",
            icon: "🧊",
            watts: 150,
            dutyCycle: 0.40,
            category: "Kitchen"
        },

        {
            id: "pump",
            name: "Water Pump",
            icon: "💧",
            watts: 750,
            category: "Utility"
        },

        {
            id: "cooler",
            name: "Room Cooler",
            icon: "❄️",
            watts: 200,
            category: "Cooling"
        },

        {
            id: "oven",
            name: "Electric Oven",
            icon: "🔥",
            watts: 1500,
            category: "Kitchen"
        },

        {
            id: "lights",
            name: "Lights",
            icon: "💡",
            watts: 60,
            category: "Lighting"
        }

    ],


    // =====================================================
    // STORAGE
    // =====================================================

    storageKey: "homeCurrentData"


};