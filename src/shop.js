import { getCoins, removeCoins } from "./pointsHandler.js";
import { sendAlert } from './alert.js';

let currentSpikeColor = localStorage.getItem("currentSpikeColor") || false;
let currentObstacleColor = localStorage.getItem("currentObstacleColor") || false;
let roundedObstacles = localStorage.getItem("roundedObstacles") || false;

let shopOpen = false;

let shopEventListeners = [];
let items = [
    {
        name: "Color blue",
        price: 20,
        action: () => {
            currentSpikeColor = "blue";
        },
        purchased: false,
        icon: "🔵"
    },
    {
        name: "Color red",
        price: 1,
        action: () => {
            currentSpikeColor = "red";
        },
        purchased: false,
        icon: "🔴"
    },
    {
        name: "Color green",
        price: 10,
        action: () => {
            currentSpikeColor = "green";
        },
        purchased: false,
        icon: "🟢"
    },
    {
        name: "Color yellow",
        price: 10,
        action: () => {
            currentSpikeColor = "yellow";
        },
        purchased: false,
        icon: "🟡"
    },
    {
        name: "Color purple",
        price: 10,
        action: () => {
            currentSpikeColor = "purple";
        },
        purchased: false,
        icon: "🟣"
    },
    {
        name: "Color black",
        price: 10,
        action: () => {
            currentSpikeColor = "black";
        },
        purchased: false,
        icon: "⚫"
    },
    {
        name: "Color white",
        price: 10,
        action: () => {
            currentSpikeColor = "white";
        },
        purchased: false,
        icon: "⚪"
    },
    {
        name: "Obstacle color blue",
        price: 10,
        action: () => {
            currentObstacleColor = "blue";
        },
        icon: "🟦"
    },
    {
        name: "Obstacle color red",
        price: 1,
        action: () => {
            currentObstacleColor = "red";
        },
        icon: "🟥"
    },
    {
        name: "Obstacle color green",
        price: 10,
        action: () => {
            currentObstacleColor = "green";
        },
        icon: "🟩"
    },
    {
        name: "Obstacle color yellow",
        price: 10,
        action: () => {
            currentObstacleColor = "yellow";
        },
        icon: "🟨"
    },
    {
        name: "Obstacle color white",
        price: 10,
        action: () => {
            currentObstacleColor = "white";
        },
        icon: "⬜"
    },
    {
        name: "Rounded obstacles",
        price: 100,
        action: () => {
            roundedObstacles = true;
        },
        icon: "🌍"
    },
    {
        name: "Normal obstacles",
        price: 10,
        action: () => {
            roundedObstacles = false;
        },
        icon: "⏹️"
    }
]

function buyItem(name) {
    let item = items.find(item => item.name === name);

    if (getCoins() < item.price) {
        sendAlert(`Not enough coins to buy ${item.name} (${item.price} coins)`, true);
        return;
    }
    useItem(name);
    removeCoins(item.price);
    localStorage.setItem(`purchased_${item.name}`, true);

    sendAlert(`Purchased ${item.name}`, true);
}

function getItems() {
    return items;
}

function useItem(name) {
    let item = items.find(item => item.name === name);
    if (!item) {
        sendAlert(`Item ${name} not found`);
        return;
    }
    if (!localStorage.getItem(`purchased_${item.name}`)) {
        sendAlert(`Item ${item.name} not purchased`);
        return;
    }

    item.action();

    localStorage.setItem('roundedObstacles', roundedObstacles);
    localStorage.setItem('currentSpikeColor', currentSpikeColor);
    localStorage.setItem('currentObstacleColor', currentObstacleColor);

    sendAlert(`Selected ${item.name}`);
}


function runItem(name) {
    let item = items.find(item => item.name === name);
    if (localStorage.getItem(`purchased_${item.name}`)) {
        item.action();
        return false;
    } else {
        buyItem(name);
        return true;
    }
}

function openShop() {
    shopOpen = true;
    shopEventListeners.forEach(listener => listener());
}

function closeShop() {
    shopOpen = false;
}

function isShopOpen() {
    return shopOpen;
}

function addShopEventListener(listener) {
    shopEventListeners.push(listener);
}

export { items, currentSpikeColor, currentObstacleColor, roundedObstacles, buyItem, getItems, useItem, runItem, openShop, closeShop, isShopOpen, shopEventListeners, addShopEventListener };