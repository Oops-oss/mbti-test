// MBTI Test Application Logic

// App State
const AppState = {
    currentPage: 'home',
    currentQuestionIndex: 0,
    answers: [],
    scores: {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    },
    result: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Reset state
    resetState();
    // Show home page
    showPage('home');
}

function resetState() {
    AppState.currentQuestionIndex = 0;
    AppState.answers = [];
    AppState.scores = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    };
    AppState.result = null;
}

// Quit Quiz - return to home
function quitQuiz() {
    resetState();
    showPage('home');
}

// Previous Question
function prevQuestion() {
    if (AppState.currentQuestionIndex > 0) {
        // Remove last answer from answers array
        var lastAnswer = AppState.answers.pop();
        if (lastAnswer) {
            // Decrement the score
            AppState.scores[lastAnswer.answer]--;
        }
        
        // Go back to previous question
        AppState.currentQuestionIndex--;
        loadQuestion(AppState.currentQuestionIndex);
        
        // Update the previous button state
        updatePrevButton();
    }
}

// Update Previous Button State
function updatePrevButton() {
    var prevBtn = document.getElementById('prev-question-btn');
    if (prevBtn) {
        if (AppState.currentQuestionIndex === 0) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
    }
}

// Page Navigation
function showPage(pageName) {
    var pages = ['home', 'quiz', 'results'];
    
    // Hide all pages
    pages.forEach(function(page) {
        var pageEl = document.getElementById(page + '-page');
        if (pageEl) {
            pageEl.classList.remove('active', 'visible');
        }
    });
    
    // Show target page
    var targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Trigger animation
        setTimeout(function() {
            targetPage.classList.add('visible');
        }, 50);
    }
    
    AppState.currentPage = pageName;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start Test
function startTest() {
    resetState();
    showPage('quiz');
    loadQuestion(0);
}

// Load Question
function loadQuestion(index) {
    var question = MBTI_DATA.questions[index];
    if (!question) return;
    
    // Update progress
    var total = MBTI_DATA.questions.length;
    var progress = ((index + 1) / total) * 100;
    
    document.getElementById('current-num').textContent = index + 1;
    document.getElementById('total-num').textContent = total;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Update question
    document.getElementById('question-number').textContent = '问题 ' + (index + 1);
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('option-a-text').textContent = question.optionA.text;
    document.getElementById('option-b-text').textContent = question.optionB.text;
    
    // Update dimension tags
    updateDimensionTags(question.dimension);
    
    // Reset option states
    document.getElementById('option-a').classList.remove('selected');
    document.getElementById('option-b').classList.remove('selected');
    
    // Check if there's a previous answer for this question to restore state
    if (AppState.answers[index]) {
        var savedAnswer = AppState.answers[index].answer;
        if (savedAnswer === 'A' || savedAnswer === 'B') {
            document.getElementById('option-' + savedAnswer.toLowerCase()).classList.add('selected');
        }
    }
    
    // Update previous button state
    updatePrevButton();
    
    // Add animation to question
    animateQuestion();
}

// Update Dimension Tags
function updateDimensionTags(dimension) {
    var tags = {
        'EI': document.getElementById('tag-ei'),
        'SN': document.getElementById('tag-sn'),
        'TF': document.getElementById('tag-tf'),
        'JP': document.getElementById('tag-jp')
    };
    
    // Reset all tags
    Object.keys(tags).forEach(function(key) {
        if (tags[key]) tags[key].classList.remove('active');
    });
    
    // Activate current dimension tag
    if (tags[dimension]) {
        tags[dimension].classList.add('active');
    }
}

// Animate Question Transition
function animateQuestion() {
    var content = document.querySelector('.quiz-content');
    content.style.animation = 'none';
    
    // Trigger reflow
    content.offsetHeight;
    
    // Add animation
    content.style.animation = 'slideUp 0.3s ease forwards';
}

// Select Option
function selectOption(option) {
    var question = MBTI_DATA.questions[AppState.currentQuestionIndex];
    if (!question) return;
    
    // Record answer
    var answer = option === 'A' ? question.optionA.score : question.optionB.score;
    AppState.answers.push({
        questionId: question.id,
        dimension: question.dimension,
        answer: answer
    });
    
    // Update scores
    AppState.scores[answer]++;
    
    // Visual feedback
    var selectedEl = document.getElementById('option-' + option.toLowerCase());
    selectedEl.classList.add('selected');
    
    // Move to next question or show results
    setTimeout(function() {
        AppState.currentQuestionIndex++;
        
        if (AppState.currentQuestionIndex < MBTI_DATA.questions.length) {
            loadQuestion(AppState.currentQuestionIndex);
        } else {
            calculateResult();
        }
    }, 200);
}

// Calculate Result
function calculateResult() {
    var scores = AppState.scores;
    
    // Determine each dimension
    var dimensionEI = scores.E >= scores.I ? 'E' : 'I';
    var dimensionSN = scores.S >= scores.N ? 'S' : 'N';
    var dimensionTF = scores.T >= scores.F ? 'T' : 'F';
    var dimensionJP = scores.J >= scores.P ? 'J' : 'P';
    
    // Get result type
    var resultType = dimensionEI + dimensionSN + dimensionTF + dimensionJP;
    var resultData = MBTI_DATA.types[resultType];
    
    if (resultData) {
        AppState.result = {
            type: resultType
        };
        
        // Copy all properties from resultData
        for (var key in resultData) {
            if (resultData.hasOwnProperty(key)) {
                AppState.result[key] = resultData[key];
            }
        }
        
        // Calculate percentages for display
        var totalE = scores.E + scores.I;
        var totalS = scores.S + scores.N;
        var totalT = scores.T + scores.F;
        var totalJ = scores.J + scores.P;
        
        AppState.result.percentages = {
            E: Math.round((scores.E / totalE) * 100),
            I: Math.round((scores.I / totalE) * 100),
            S: Math.round((scores.S / totalS) * 100),
            N: Math.round((scores.N / totalS) * 100),
            T: Math.round((scores.T / totalT) * 100),
            F: Math.round((scores.F / totalT) * 100),
            J: Math.round((scores.J / totalJ) * 100),
            P: Math.round((scores.P / totalJ) * 100)
        };
        
        displayResult();
    }
}

// Display Result
function displayResult() {
    var result = AppState.result;
    if (!result) return;
    
    // Update result card
    var resultCard = document.getElementById('result-card');
    resultCard.style.setProperty('--result-color', result.color);
    
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-type').style.color = result.color;
    document.getElementById('result-type').style.textShadow = '0 0 40px ' + result.color;
    document.getElementById('result-name').textContent = result.chineseName;
    document.getElementById('result-english').textContent = result.englishName;
    document.getElementById('result-group').innerHTML = '<span>' + result.groupCN + '</span> · <span>' + result.group + '</span>';
    document.getElementById('result-description').textContent = result.description;
    
    // Update strengths
    var strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = result.strengths.map(function(s) { 
        return '<span class="analysis-tag">' + s + '</span>'; 
    }).join('');
    
    // Update weaknesses
    var weaknessesList = document.getElementById('weaknesses-list');
    weaknessesList.innerHTML = result.weaknesses.map(function(w) { 
        return '<span class="analysis-tag">' + w + '</span>'; 
    }).join('');
    
    // Update relationships
    document.getElementById('result-relationships').textContent = result.relationships;
    
    // Update career
    document.getElementById('result-career').textContent = result.career;
    
    // Add result color to gradient background
    resultCard.style.background = 'linear-gradient(135deg, var(--bg-card) 0%, ' + result.color + '15 100%)';
    
    // Show results page
    showPage('results');
}

// Show Result for Direct Type (from clicking type badge)
function showTypeResult(typeCode) {
    var resultData = MBTI_DATA.types[typeCode];
    if (!resultData) return;
    
    // Create result object
    AppState.result = {
        type: typeCode
    };
    
    // Copy all properties from resultData
    for (var key in resultData) {
        if (resultData.hasOwnProperty(key)) {
            AppState.result[key] = resultData[key];
        }
    }
    
    // For direct type viewing, calculate dummy percentages
    AppState.result.percentages = {
        E: 50, I: 50,
        S: 50, N: 50,
        T: 50, F: 50,
        J: 50, P: 50
    };
    
    displayDirectType();
}

// Display Result for Direct Type (different wording)
function displayDirectType() {
    var result = AppState.result;
    if (!result) return;
    
    // Change title and subtitle for direct type viewing
    document.querySelector('.results-title').textContent = '人格类型';
    document.querySelector('.results-subtitle').textContent = '你是 ' + result.type + ' · ' + result.chineseName;
    
    // Update result card
    var resultCard = document.getElementById('result-card');
    resultCard.style.setProperty('--result-color', result.color);
    
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-type').style.color = result.color;
    document.getElementById('result-type').style.textShadow = '0 0 40px ' + result.color;
    document.getElementById('result-name').textContent = result.chineseName;
    document.getElementById('result-english').textContent = result.englishName;
    document.getElementById('result-group').innerHTML = '<span>' + result.groupCN + '</span> · <span>' + result.group + '</span>';
    document.getElementById('result-description').textContent = result.description;
    
    // Update strengths
    var strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = result.strengths.map(function(s) { 
        return '<span class="analysis-tag">' + s + '</span>'; 
    }).join('');
    
    // Update weaknesses
    var weaknessesList = document.getElementById('weaknesses-list');
    weaknessesList.innerHTML = result.weaknesses.map(function(w) { 
        return '<span class="analysis-tag">' + w + '</span>'; 
    }).join('');
    
    // Update relationships
    document.getElementById('result-relationships').textContent = result.relationships;
    
    // Update career
    document.getElementById('result-career').textContent = result.career;
    
    // Add result color to gradient background
    resultCard.style.background = 'linear-gradient(135deg, var(--bg-card) 0%, ' + result.color + '15 100%)';
    
    // Show results page
    showPage('results');
}

// Keyboard Support
document.addEventListener('keydown', function(e) {
    if (AppState.currentPage !== 'quiz') return;
    
    if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        selectOption('A');
    } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        selectOption('B');
    }
});

// Prevent accidental back navigation
window.addEventListener('beforeunload', function(e) {
    if (AppState.currentPage === 'quiz' && AppState.currentQuestionIndex > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Initialize on load (for SPA behavior)
if (document.readyState === 'complete') {
    initApp();
}
