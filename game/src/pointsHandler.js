function getCoins() {
    return localStorage.getItem('coins') || 0;
}

function addCoins(amount=1) {
    let coins = getCoins();
    coins = parseInt(coins) + amount;
    localStorage.setItem('coins', coins);
}

function removeCoins(amount=1) {
    let coins = getCoins();
    coins = parseInt(coins) - amount;
    localStorage.setItem('coins', coins);
}

function setCoins(amount=0) {
    localStorage.setItem('coins', amount);
}

export { getCoins, addCoins, removeCoins, setCoins };