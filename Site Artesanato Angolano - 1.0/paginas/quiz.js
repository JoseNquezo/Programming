// Dados do Quiz
const quizData = [
    {
        question: "Qual é o material mais tradicionalmente usado nas esculturas angolanas?",
        options: ["Madeira", "Pedra", "Metal", "Argila"],
        correct: 0
    },
    {
        question: "Que tipo de fibras naturais são comumente usadas na cestaria angolana?",
        options: ["Algodão e linho", "Capim, palha e sisal", "Seda e lã", "Bambu e rattan"],
        correct: 1
    },
    {
        question: "Qual é uma característica distintiva da cerâmica tradicional angolana?",
        options: ["Uso de vidrado colorido", "Moldagem manual com técnicas ancestrais", "Produção em massa", "Decoração com ouro"],
        correct: 1
    },
    {
        question: "Quais artistas são mencionados como representantes da arte contemporânea angolana?",
        options: ["Picasso, Monet e Van Gogh", "Viteix, Hilario Silva e Binelde Hyrcan", "Da Vinci, Michelangelo e Rafael", "Warhol, Basquiat e Hockney"],
        correct: 1
    },
    {
        question: "Onde fica localizado o famoso Mercado de Artesanato mencionado no texto?",
        options: ["Benguela", "Huambo", "Luanda - Benfica", "Lobito"],
        correct: 2
    },
    {
        question: "O que caracteriza a arte sustentável angolana?",
        options: ["Uso exclusivo de materiais importados", "Transformação de materiais reciclados em arte", "Produção apenas digital", "Uso de técnicas europeias"],
        correct: 1
    },
    {
        question: "Qual é o significado das esculturas em madeira angolanas?",
        options: ["Apenas decorativo", "Carregam significados espirituais e culturais", "Somente comercial", "Imitação de estilos estrangeiros"],
        correct: 1
    },
    {
        question: "O que os padrões geométricos na cestaria angolana refletem?",
        options: ["Influências europeias", "Tendências modernas", "Identidade cultural das diversas etnias", "Padrões aleatórios"],
        correct: 2
    },
    {
        question: "Como a arte contemporânea angolana dialoga com a tradição?",
        options: ["Ignora completamente as tradições", "Rejeita qualquer influência tradicional", "Dialoga entre tradição e modernidade", "Copia apenas estilos estrangeiros"],
        correct: 2
    },
    {
        question: "Qual é o papel dos mestres artesãos na preservação cultural?",
        options: ["Apenas vendem produtos", "São guardiões e inovadores da expressão cultural", "Trabalham apenas para turistas", "Não têm importância cultural"],
        correct: 1
    }
];

// Estado do Quiz
let currentQuestion = 0;
let selectedAnswer = null;
let score = 0;
let userAnswers = [];

// DOM Elements
const questionTitle = document.getElementById('questionTitle');
const optionsContainer = document.getElementById('optionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quizCard = document.getElementById('quizCard');
const quizResults = document.getElementById('quizResults');
const finalScore = document.getElementById('finalScore');
const scoreMessage = document.getElementById('scoreMessage');

// Inicializa o Quiz
function initQuiz() {
    currentQuestion = 0;
    selectedAnswer = null;
    score = 0;
    userAnswers = [];
    showQuestion();
    updateProgress();
    quizCard.style.display = 'block';
    quizResults.style.display = 'none';
}

// Mostra a Resposta Atual
function showQuestion() {
    const question = quizData[currentQuestion];
    questionTitle.textContent = question.question;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        
        // Restaura a seleção anterior se voltar
        if (userAnswers[currentQuestion] !== undefined && userAnswers[currentQuestion] === index) {
            button.classList.add('selected');
            selectedAnswer = index;
        }
        
        optionsContainer.appendChild(button);
    });
    
    updateButtons();
}

//Selecionar resposta
function selectAnswer(answerIndex) {
    selectedAnswer = answerIndex;
    userAnswers[currentQuestion] = answerIndex;
    
    // Atualiza o visual da seleção
    const options = document.querySelectorAll('.option-btn');
    options.forEach((option, index) => {
        option.classList.remove('selected');
        if (index === answerIndex) {
            option.classList.add('selected');
        }
    });
    
    updateButtons();
}

// Atualizar os botões de navegação
function updateButtons() {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = selectedAnswer === null;
    
    if (currentQuestion === quizData.length - 1) {
        nextBtn.textContent = 'Finalizar';
    } else {
        nextBtn.textContent = 'Próxima';
    }
}

// Pergunta anterior
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        selectedAnswer = userAnswers[currentQuestion] !== undefined ? userAnswers[currentQuestion] : null;
        showQuestion();
        updateProgress();
    }
}

// Próxima pergunta
function nextQuestion() {
    if (selectedAnswer !== null) {
        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            selectedAnswer = userAnswers[currentQuestion] !== undefined ? userAnswers[currentQuestion] : null;
            showQuestion();
            updateProgress();
        } else {
            finishQuiz();
        }
    }
}

// Atualiza a barra de progresso
function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Pergunta ${currentQuestion + 1} de ${quizData.length}`;
}

// Finaliza o Quiz
function finishQuiz() {
    // Calcula a pontuação
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizData[index].correct) {
            score++;
        }
    });
    
    // Mostrar resultado
    showResults();
}

// Mostra resultado
function showResults() {
    quizCard.style.display = 'none';
    quizResults.style.display = 'block';
    
    finalScore.textContent = score;
    
    let message = '';
    const percentage = (score / quizData.length) * 100;
    
    if (percentage >= 90) {
        message = 'Excelente! Você é um verdadeiro conhecedor da arte angolana!';
    } else if (percentage >= 70) {
        message = 'Muito bom! Você tem um bom conhecimento sobre a arte angolana.';
    } else if (percentage >= 50) {
        message = 'Bom trabalho! Continue aprendendo sobre a rica cultura artística de Angola.';
    } else {
        message = 'Continue explorando! Há muito mais para descobrir sobre a arte angolana.';
    }
    
    scoreMessage.textContent = message;
}

// Reinicia o Quiz
function restartQuiz() {
    initQuiz();
}

// Incia quando a página carrega
document.addEventListener('DOMContentLoaded', initQuiz);

