document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const counterElement = document.getElementById('counter');
    const headerElement = document.querySelector('h1'); 
    const restartButton = document.getElementById('restart-button'); 
    const cardPairs = 8; // se puede elegir cuantas cartas aparecen
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let attempts = 0;

    // obtener cartas de la API
    async function fetchCards() {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/new/draw/?count=${cardPairs}`);
        const data = await response.json();
        return data.cards;
    }

    // obtener insulto de la API
    async function fetchInsult() {
        const response = await fetch('https://insult.mattbas.org/api/insult');
        const insult = await response.text();
        return insult;
    }

    // iniciamos juego
    async function initGame() {
        const fetchedCards = await fetchCards();
        cards = [...fetchedCards, ...fetchedCards]; 
        cards = shuffle(cards); 
        renderCards();
        headerElement.textContent = 'Pairing cards game'; // Cambia el contenido de h1
        counterElement.textContent = 'Intentos: 0'; // Reinicia el contador de intentos
        matchedPairs = 0;
        attempts = 0;
        flippedCards = [];
    }

    // Función para barajar las cartas
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderCards() {
        gameBoard.innerHTML = '';
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"><img src="${card.image}" alt="${card.value} ${card.suit}" style="width: 100px; height: 150px;"></div>
                    <div class="card-back"><img src="https://deckofcardsapi.com/static/img/back.png" alt="Back of card" style="width: 100px; height: 150px;"></div>
                </div>
            `;
            cardElement.addEventListener('click', () => flipCard(cardElement, card));
            gameBoard.appendChild(cardElement);
        });
    }

    function flipCard(cardElement, card) {
        if (flippedCards.length < 2 && !cardElement.classList.contains('flipped')) {
            cardElement.classList.add('flipped');
            adjustCardSize(cardElement); 
            flippedCards.push({ cardElement, card });

            if (flippedCards.length === 2) {
                setTimeout(checkForMatch, 1000);
            }
        }
    }

    function adjustCardSize(cardElement) {
        const img = cardElement.querySelector('img');
        img.style.width = "100px";
        img.style.height = "150px";
    }

    // Verifica aciertos
    async function checkForMatch() {
        const [firstCard, secondCard] = flippedCards;
        if (firstCard.card.code === secondCard.card.code) {
            matchedPairs++;
            if (matchedPairs === cardPairs) {
                document.querySelector("h1").innerText = "Finally you won!!!";
            }
        } else {
            firstCard.cardElement.classList.remove('flipped');
            secondCard.cardElement.classList.remove('flipped');
            attempts++;
            counterElement.textContent = 'Failed attempts: ' + attempts;
            const insult = await fetchInsult();
            document.querySelector("h1").innerText = insult; //cargo insulto en h1
        }
        flippedCards = [];
    }

    //Volver a empezar juego
    restartButton.addEventListener('click', initGame);

    initGame();
});
