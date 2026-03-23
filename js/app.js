// MBTI Test Application Logic - Likert Scale Version

// 5-level Likert score mapping
const SCORE_MAP = {
    1: 2,   // 非常像A → +2
    2: 1,   // 比较像A → +1
    3: 0,   // 居中 → 0
    4: -1,  // 比较像B → -1
    5: -2   // 非常像B → -2
};

// Option labels for display
const OPTION_LABELS = {
    1: "非常像A",
    2: "比较像A",
    3: "居中",
    4: "比较像B",
    5: "非常像B"
};

// App State
const AppState = {
    currentPage: 'home',
    currentQuestionIndex: 0,
    answers: [],  // Stores { questionId, dimension, optionIndex, leftLetter, rightLetter, score }
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
            // Reverse the scoring: subtract what was added
            var score = lastAnswer.score;
            AppState.scores[lastAnswer.leftLetter] -= score;
            AppState.scores[lastAnswer.rightLetter] -= (-score);
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
    
    // Update phrase labels (A/B)
    document.getElementById('phrase-left').textContent = question.phraseLeft;
    document.getElementById('phrase-right').textContent = question.phraseRight;
    
    // Update dimension tags
    updateDimensionTags(question.dimension);
    
    // Reset all option states
    for (var i = 1; i <= 5; i++) {
        var optionEl = document.getElementById('option-' + i);
        if (optionEl) {
            optionEl.classList.remove('selected');
        }
    }
    
    // Check if there's a previous answer for this question to restore state
    if (AppState.answers[index]) {
        var savedOptionIndex = AppState.answers[index].optionIndex;
        if (savedOptionIndex >= 1 && savedOptionIndex <= 5) {
            var savedEl = document.getElementById('option-' + savedOptionIndex);
            if (savedEl) {
                savedEl.classList.add('selected');
            }
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

// Select Option (Likert scale: 1-5)
function selectOption(optionIndex) {
    var question = MBTI_DATA.questions[AppState.currentQuestionIndex];
    if (!question) return;
    
    // Check if user already answered this question (replace previous answer)
    var existingAnswerIndex = -1;
    for (var i = 0; i < AppState.answers.length; i++) {
        if (AppState.answers[i].questionId === question.id) {
            existingAnswerIndex = i;
            break;
        }
    }
    
    // If already answered, remove the old answer and score first
    if (existingAnswerIndex !== -1) {
        var oldAnswer = AppState.answers[existingAnswerIndex];
        // Reverse the old scoring
        AppState.scores[oldAnswer.leftLetter] -= oldAnswer.score;
        AppState.scores[oldAnswer.rightLetter] -= (-oldAnswer.score);
        // Remove old answer
        AppState.answers.splice(existingAnswerIndex, 1);
    }
    
    // Get score from mapping
    var score = SCORE_MAP[optionIndex];
    
    // Record new answer
    AppState.answers.push({
        questionId: question.id,
        dimension: question.dimension,
        optionIndex: optionIndex,
        leftLetter: question.leftLetter,
        rightLetter: question.rightLetter,
        score: score
    });
    
    // Update scores using leftLetter/rightLetter mapping
    // leftLetter gets +score, rightLetter gets -score (which adds to the opposite direction)
    AppState.scores[question.leftLetter] += score;
    AppState.scores[question.rightLetter] += (-score);
    
    // Visual feedback
    // Remove selected from all options first
    for (var i = 1; i <= 5; i++) {
        var optEl = document.getElementById('option-' + i);
        if (optEl) {
            optEl.classList.remove('selected');
        }
    }
    // Add selected to clicked option
    var selectedEl = document.getElementById('option-' + optionIndex);
    if (selectedEl) {
        selectedEl.classList.add('selected');
    }
    
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
    
    // Count questions per dimension
    var dimensionCounts = { EI: 0, SN: 0, TF: 0, JP: 0 };
    MBTI_DATA.questions.forEach(function(q) {
        dimensionCounts[q.dimension]++;
    });
    
    // Determine each dimension based on score comparison
    // Compare scores.E vs scores.I, scores.S vs scores.N, etc.
    // Positive score means倾向leftLetter, negative means倾向rightLetter
    
    var letter1 = scores.E >= scores.I ? 'E' : 'I';
    var letter2 = scores.S >= scores.N ? 'S' : 'N';
    var letter3 = scores.T >= scores.F ? 'T' : 'F';
    var letter4 = scores.J >= scores.P ? 'J' : 'P';
    
    // Get result type
    var resultType = letter1 + letter2 + letter3 + letter4;
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
        // Use absolute difference for percentage calculation
        var dimEI = scores.E - scores.I;
        var dimSN = scores.S - scores.N;
        var dimTF = scores.T - scores.F;
        var dimJP = scores.J - scores.P;
        
        var maxEI = dimensionCounts.EI * 2;
        var maxSN = dimensionCounts.SN * 2;
        var maxTF = dimensionCounts.TF * 2;
        var maxJP = dimensionCounts.JP * 2;
        
        AppState.result.percentages = {
            E: Math.round(50 + (dimEI / maxEI) * 50),
            I: Math.round(50 + (-dimEI / maxEI) * 50),
            S: Math.round(50 + (dimSN / maxSN) * 50),
            N: Math.round(50 + (-dimSN / maxSN) * 50),
            T: Math.round(50 + (dimTF / maxTF) * 50),
            F: Math.round(50 + (-dimTF / maxTF) * 50),
            J: Math.round(50 + (dimJP / maxJP) * 50),
            P: Math.round(50 + (-dimJP / maxJP) * 50)
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
    
    // Update communication style
    if (result.communication) {
        document.getElementById('result-communication').textContent = result.communication;
    }
    
    // Update emotional pattern
    if (result.emotional) {
        document.getElementById('result-emotional').textContent = result.emotional;
    }
    
    // Update work style
    if (result.workstyle) {
        document.getElementById('result-workstyle').textContent = result.workstyle;
    }
    
    // Update growth
    if (result.growth) {
        document.getElementById('result-growth').textContent = result.growth;
    }
    
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
    
    // Update communication style
    if (result.communication) {
        document.getElementById('result-communication').textContent = result.communication;
    }
    
    // Update emotional pattern
    if (result.emotional) {
        document.getElementById('result-emotional').textContent = result.emotional;
    }
    
    // Update work style
    if (result.workstyle) {
        document.getElementById('result-workstyle').textContent = result.workstyle;
    }
    
    // Update growth
    if (result.growth) {
        document.getElementById('result-growth').textContent = result.growth;
    }
    
    // Add result color to gradient background
    resultCard.style.background = 'linear-gradient(135deg, var(--bg-card) 0%, ' + result.color + '15 100%)';
    
    // Show results page
    showPage('results');
}

// Keyboard Support
document.addEventListener('keydown', function(e) {
    if (AppState.currentPage !== 'quiz') return;
    
    if (e.key === '1') {
        selectOption(1);
    } else if (e.key === '2') {
        selectOption(2);
    } else if (e.key === '3') {
        selectOption(3);
    } else if (e.key === '4') {
        selectOption(4);
    } else if (e.key === '5') {
        selectOption(5);
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
