// Main 3D Slider
class Slider3D {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.playBtn = document.getElementById('playPause');
        this.playIcon = document.getElementById('playIcon');
        this.progressBar = document.getElementById('progressBar');
        this.currentSlide = document.getElementById('currentSlide');
        this.fullscreenBtn = document.getElementById('fullscreen');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isPlaying = true;
        this.rotationInterval = null;
        this.rotationSpeed = 5000;
        
        this.init();
    }

    init() {
        this.updateSlider();
        
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                this.goToSlide(index);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePlay();
            }
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        });

        this.startRotation();
        
        document.querySelector('.hero-slider-container').addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) this.next();
            else this.prev();
        });

        let touchStartX = 0;
        let touchEndX = 0;

        document.querySelector('.hero-slider-container').addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.querySelector('.hero-slider-container').addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });

        this.enableDrag();
    }

    updateSlider() {
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
            
            const diff = index - this.currentIndex;
            
            if (diff === 0) slide.classList.add('active');
            else if (diff === 1 || (diff === -(this.totalSlides - 1))) slide.classList.add('next');
            else if (diff === -1 || (diff === (this.totalSlides - 1))) slide.classList.add('prev');
            else if (diff === 2 || (diff === -(this.totalSlides - 2))) slide.classList.add('far-next');
            else if (diff === -2 || (diff === (this.totalSlides - 2))) slide.classList.add('far-prev');
        });

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        this.currentSlide.textContent = (this.currentIndex + 1).toString().padStart(2, '0');

        this.progressBar.style.width = '0%';
        this.progressBar.classList.remove('animating');
        
        if (this.isPlaying) {
            setTimeout(() => {
                this.progressBar.classList.add('animating');
            }, 50);
        }
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
        this.resetRotation();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
        this.resetRotation();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetRotation();
    }

    startRotation() {
        if (this.rotationInterval) clearInterval(this.rotationInterval);
        
        if (this.isPlaying) {
            this.rotationInterval = setInterval(() => this.next(), this.rotationSpeed);
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.playIcon.classList.remove('fa-play');
            this.playIcon.classList.add('fa-pause');
            this.startRotation();
            this.progressBar.classList.add('animating');
        } else {
            this.playIcon.classList.remove('fa-pause');
            this.playIcon.classList.add('fa-play');
            clearInterval(this.rotationInterval);
            this.progressBar.classList.remove('animating');
        }
    }

    resetRotation() {
        if (this.isPlaying) this.startRotation();
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) this.next();
            else this.prev();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }

    enableDrag() {
        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        document.querySelector('.hero-slider-container').addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            currentX = startX;
            document.querySelector('.hero-slider-container').style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            const diff = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) this.next();
                else this.prev();
            }
            
            isDragging = false;
            document.querySelector('.hero-slider-container').style.cursor = 'grab';
        });
    }
}

// Character Slider
class CharacterSlider {
    constructor() {
        this.items = document.querySelectorAll('.character-slider .list .item');
        this.thumbnails = document.querySelectorAll('.character-thumbnail .item');
        this.nextBtn = document.getElementById('characterNext');
        this.prevBtn = document.getElementById('characterPrev');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.allItems = Array.from(this.items);
        
        this.currentIndex = 0;
        this.totalItems = this.items.length;
        this.filteredItems = this.allItems;
        this.currentCategory = 'all';
        this.autoPlayInterval = null;
        
        this.init();
    }

    init() {
        this.updateSlider();
        
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
        
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                this.currentIndex = index;
                this.updateSlider();
            });
        });

        // Category filtering
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                this.categoryBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                this.currentCategory = btn.dataset.category;
                
                // Filter items
                if (this.currentCategory === 'all') {
                    this.filteredItems = this.allItems;
                    this.items.forEach(item => item.style.display = 'block');
                } else {
                    this.filteredItems = this.allItems.filter(item => item.dataset.category === this.currentCategory);
                    
                    // Hide/show items based on category
                    this.items.forEach(item => {
                        if (item.dataset.category === this.currentCategory || this.currentCategory === 'all') {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
                
                // Reset to first item in filtered list
                if (this.filteredItems.length > 0) {
                    this.currentIndex = Array.from(this.items).indexOf(this.filteredItems[0]);
                    this.updateSlider();
                }
            });
        });

        // Auto play
        this.startAutoPlay();
        
        // Pause auto play on hover
        const sliderContainer = document.querySelector('.character-slider');
        sliderContainer.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }

    updateSlider() {
        // Remove active class from all items
        this.items.forEach(item => item.classList.remove('active'));
        this.thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Add active class to current item
        this.items[this.currentIndex].classList.add('active');
        this.thumbnails[this.currentIndex].classList.add('active');
        
        // Scroll thumbnail into view
        this.scrollThumbnailIntoView();
    }

    next() {
        let currentFilteredIndex = this.filteredItems.indexOf(this.items[this.currentIndex]);
        if (currentFilteredIndex < this.filteredItems.length - 1) {
            this.currentIndex = Array.from(this.items).indexOf(this.filteredItems[currentFilteredIndex + 1]);
        } else {
            this.currentIndex = Array.from(this.items).indexOf(this.filteredItems[0]);
        }
        this.updateSlider();
    }

    prev() {
        let currentFilteredIndex = this.filteredItems.indexOf(this.items[this.currentIndex]);
        if (currentFilteredIndex > 0) {
            this.currentIndex = Array.from(this.items).indexOf(this.filteredItems[currentFilteredIndex - 1]);
        } else {
            this.currentIndex = Array.from(this.items).indexOf(this.filteredItems[this.filteredItems.length - 1]);
        }
        this.updateSlider();
    }

    scrollThumbnailIntoView() {
        let thumbnailActive = document.querySelector('.character-thumbnail .item.active');
        if (thumbnailActive) {
            let rect = thumbnailActive.getBoundingClientRect();
            if (rect.left < 0 || rect.right > window.innerWidth) {
                thumbnailActive.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
            }
        }
    }

    startAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = setInterval(() => this.next(), 7000);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Quiz Data
const quizQuestions = [
    {
        question: "What year did Life of Pi win the Man Booker Prize?",
        options: [
            "2001",
            "2002",
            "2003",
            "2004"
        ],
        correct: 1
    },
    {
        question: "What is Pi's full name?",
        options: [
            "Piscine Molitor Patel",
            "Peter Matthew Patel",
            "Paul Michael Patel",
            "Patrick Martin Patel"
        ],
        correct: 0
    },
    {
        question: "How many days was Pi adrift at sea?",
        options: [
            "100 days",
            "227 days",
            "365 days",
            "180 days"
        ],
        correct: 1
    },
    {
        question: "Which literary movement is Life of Pi most associated with?",
        options: [
            "Modernism",
            "Postmodernism",
            "Romanticism",
            "Realism"
        ],
        correct: 1
    },
    {
        question: "What was the name of the cargo ship that sank?",
        options: [
            "Titanic",
            "Tsimtsum",
            "Pacific Star",
            "Ocean Voyager"
        ],
        correct: 1
    },
    {
        question: "What religions does Pi practice?",
        options: [
            "Hinduism only",
            "Christianity only",
            "Hinduism, Christianity, and Islam",
            "Buddhism and Hinduism"
        ],
        correct: 2
    },
    {
        question: "What was the tiger's name?",
        options: [
            "Sher Khan",
            "Richard Parker",
            "Shere Khan",
            "Royal Bengal"
        ],
        correct: 1
    },
    {
        question: "What makes Life of Pi's narrative structure innovative?",
        options: [
            "It uses stream of consciousness",
            "It employs a frame narrative",
            "It's written in second person",
            "It has no chapters"
        ],
        correct: 1
    },
    {
        question: "What was Orange Juice?",
        options: [
            "A drink Pi made",
            "The name of the lifeboat",
            "The orangutan",
            "A type of fish"
        ],
        correct: 2
    },
    {
        question: "What was the alternative story Pi told the Japanese officials?",
        options: [
            "A story without animals",
            "A story with different animals",
            "A story where he was alone",
            "A story where he was the tiger"
        ],
        correct: 0
    }
];

// Quiz Variables
let currentQuestion = 0;
let score = 0;
let userAnswers = new Array(quizQuestions.length).fill(null);

// Initialize Quiz
function initQuiz() {
    displayQuestion();
    updateProgressBar();
    document.getElementById('prevBtn').style.display = 'none';
}

// Display Current Question
function displayQuestion() {
    const question = quizQuestions[currentQuestion];
    const questionContainer = document.getElementById('questionContainer');
    
    let optionsHtml = '';
    question.options.forEach((option, index) => {
        let optionClass = 'option-btn';
        if (userAnswers[currentQuestion] === index) {
            optionClass += ' selected';
        }
        optionsHtml += `
            <div class="option-btn ${optionClass}" onclick="selectAnswer(${index})">
                ${option}
            </div>
        `;
    });
    
    questionContainer.innerHTML = `
        <div class="question-container">
            <div class="question-text">
                ${currentQuestion + 1}. ${question.question}
            </div>
            <div class="options-grid">
                ${optionsHtml}
            </div>
        </div>
    `;
    
    document.getElementById('prevBtn').style.display = currentQuestion === 0 ? 'none' : 'block';
    document.getElementById('nextBtn').textContent = currentQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next Question';
}

// Select Answer
function selectAnswer(index) {
    userAnswers[currentQuestion] = index;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
}

// Next Question
function nextQuestion() {
    if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        displayQuestion();
        updateProgressBar();
    } else {
        showResults();
    }
}

// Previous Question
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        updateProgressBar();
    }
}

// Update Progress Bar
function updateProgressBar() {
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    document.getElementById('progressBarQuiz').style.width = `${progress}%`;
}

// Show Results
function showResults() {
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correct) {
            score++;
        }
    });
    
    document.getElementById('scoreDisplay').textContent = `${score}/${quizQuestions.length}`;
    
    let message = '';
    if (score === quizQuestions.length) {
        message = 'Perfect! You are a true Life of Pi literary expert!';
    } else if (score >= quizQuestions.length * 0.7) {
        message = 'Excellent! You have strong literary knowledge!';
    } else if (score >= quizQuestions.length * 0.5) {
        message = 'Good job! You understand the key literary aspects.';
    } else {
        message = 'A great opportunity to explore this masterpiece further!';
    }
    
    document.getElementById('scoreMessage').textContent = message;
    
    document.getElementById('questionContainer').style.display = 'none';
    document.querySelector('.quiz-controls').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
}

// Restart Quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers.fill(null);
    
    document.getElementById('questionContainer').style.display = 'block';
    document.querySelector('.quiz-controls').style.display = 'flex';
    document.getElementById('resultContainer').style.display = 'none';
    
    initQuiz();
}

// Modal Management
class ModalManager {
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.closeButtons = document.querySelectorAll('.close-modal');
        this.readMoreButtons = document.querySelectorAll('.read-more-btn');
        this.characterButtons = document.querySelectorAll('.character-read-more');
        this.sectionButtons = document.querySelectorAll('.read-more-section');
        
        this.init();
    }

    init() {
        // Close modals when clicking X
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modals when clicking outside
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Main slider read more buttons
        this.readMoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.openModal(modalId);
            });
        });

        // Character read more buttons
        this.characterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const characterId = e.target.dataset.character;
                this.openCharacterModal(characterId);
            });
        });

        // Section read more buttons
        this.sectionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = e.target.dataset.section;
                this.openSectionModal(sectionId);
            });
        });
    }

    openModal(modalId) {
        this.closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    openCharacterModal(characterId) {
        const characterData = this.getCharacterData(characterId);
        const modalContent = document.getElementById('characterModalContent');
        
        if (characterData) {
            modalContent.innerHTML = `
                <h2>${characterData.name}</h2>
                <h3>${characterData.role}</h3>
                <div class="modal-body">
                    <div class="character-detail">
                        <h4>Character Overview</h4>
                        <p>${characterData.description}</p>
                        
                        <h4>Key Characteristics</h4>
                        <ul>
                            ${characterData.characteristics.map(char => `<li>${char}</li>`).join('')}
                        </ul>
                        
                        <h4>Symbolic Significance</h4>
                        <p>${characterData.symbolism}</p>
                        
                        <h4>Literary Analysis</h4>
                        <p>${characterData.analysis}</p>
                    </div>
                </div>
            `;
            this.openModal('characterModal');
        }
    }

    openSectionModal(sectionId) {
        const sectionData = this.getSectionData(sectionId);
        const modalContent = document.getElementById('sectionModalContent');
        
        if (sectionData) {
            modalContent.innerHTML = `
                <h2>${sectionData.title}</h2>
                <div class="modal-body">
                    <h3>${sectionData.subtitle}</h3>
                    <div class="section-detail">
                        ${sectionData.content}
                        
                        ${sectionData.additionalInfo ? `
                        <h4>Additional Information</h4>
                        <p>${sectionData.additionalInfo}</p>
                        ` : ''}
                        
                        ${sectionData.impact ? `
                        <h4>Impact on Literature</h4>
                        <p>${sectionData.impact}</p>
                        ` : ''}
                    </div>
                </div>
            `;
            this.openModal('sectionModal');
        }
    }

    getCharacterData(characterId) {
        const characters = {
            'pi': {
                name: 'Pi Patel',
                role: 'Piscine Molitor Patel - The Survivor',
                description: 'The 16-year-old protagonist who survives 227 days at sea. His journey represents faith, resilience, and the human spirit\'s capacity for adaptation.',
                characteristics: [
                    'Practices Hinduism, Christianity, and Islam simultaneously',
                    'Survives using knowledge of animals and religion',
                    'Represents the universal search for meaning',
                    'Demonstrates incredible psychological resilience'
                ],
                symbolism: 'Pi represents humanity\'s capacity for faith and adaptation. His journey symbolizes the spiritual quest for meaning in an indifferent universe.',
                analysis: 'As a literary character, Pi serves as both a realistic survivor and an allegorical figure. His ability to maintain faith in three religions represents the universal human need for spiritual meaning, while his survival skills demonstrate human adaptability.'
            },
            'richard': {
                name: 'Richard Parker',
                role: 'Bengal Tiger - The Unlikely Companion',
                description: 'The 450-pound Bengal tiger who becomes Pi\'s companion and challenge during the 227-day journey.',
                characteristics: [
                    'Named due to a clerical error swapping hunter and animal',
                    'Initially represents pure danger and fear',
                    'Gradually becomes a symbol of co-dependence',
                    'Represents Pi\'s primal instincts'
                ],
                symbolism: 'Richard Parker symbolizes the untamable aspects of nature, human primal instincts, and the balance between civilization and wilderness.',
                analysis: 'As a literary device, Richard Parker serves multiple functions: he represents the external threat, Pi\'s internal fears, and eventually becomes a symbol of the complex relationship between humans and nature.'
            },
            'orange': {
                name: 'Orange Juice',
                role: 'Orangutan - The Maternal Figure',
                description: 'The gentle orangutan from Pi\'s family zoo who provides brief companionship and maternal comfort.',
                characteristics: [
                    'Arrives on a bundle of bananas',
                    'Represents maternal protection',
                    'Symbolizes innocence and childhood',
                    'Her death marks a turning point in Pi\'s emotional journey'
                ],
                symbolism: 'Orange Juice symbolizes lost innocence, maternal comfort, and the tragic separation from childhood security.',
                analysis: 'Her character serves as an emotional anchor for Pi, representing the comfort and security he has lost. Her death forces Pi to confront the harsh realities of survival.'
            },
            'santosh': {
                name: 'Santosh Patel',
                role: 'Pi\'s Father - The Pragmatist',
                description: 'A pragmatic zoo keeper whose practical lessons prove crucial for Pi\'s survival.',
                characteristics: [
                    'Teaches Pi about animal dangers through harsh lessons',
                    'Represents rational, practical thinking',
                    'His lessons about Richard Parker save Pi\'s life',
                    'Contrasts with Pi\'s spiritual nature'
                ],
                symbolism: 'Represents practical wisdom, parental authority, and the necessary balance between idealism and realism.',
                analysis: 'Santosh serves as the voice of reason and practical wisdom. His character establishes the tension between faith and reason that runs throughout the novel.'
            },
            'gita': {
                name: 'Gita Patel',
                role: 'Pi\'s Mother - The Nurturer',
                description: 'A botanist who nurtures Pi\'s spiritual exploration and provides emotional foundation.',
                characteristics: [
                    'Supports Pi\'s exploration of multiple religions',
                    'Provides botanical knowledge that helps Pi survive',
                    'Represents emotional and spiritual nurturing',
                    'Her books become survival tools'
                ],
                symbolism: 'Represents spiritual guidance, emotional support, and the foundation of faith that sustains Pi.',
                analysis: 'Gita\'s character provides the spiritual foundation that sustains Pi. Her acceptance of his multi-religious exploration sets the stage for the novel\'s central themes.'
            },
            'satish': {
                name: 'Satish Kumar',
                role: 'Biology Teacher - The Atheist',
                description: 'An atheist biology teacher who respects Pi\'s spiritual journey while teaching scientific rationality.',
                characteristics: [
                    'Teaches Pi about science and reason',
                    'Respects Pi\'s religious explorations',
                    'Represents rational, scientific thought',
                    'Shows that faith and science can coexist'
                ],
                symbolism: 'Represents scientific rationality, intellectual honesty, and the compatibility of different worldviews.',
                analysis: 'Satish Kumar demonstrates that faith and reason are not mutually exclusive. His character adds depth to the novel\'s exploration of belief systems.'
            }
        };
        
        return characters[characterId];
    }

    getSectionData(sectionId) {
        const sections = {
            'booker-intro': {
                title: 'Introduction to the Booker Prize',
                subtitle: 'The Prestigious Literary Award',
                content: `<p>The Man Booker Prize, established in 1969, is one of the world's most prestigious literary awards. Originally awarded for the best original novel written in English and published in the United Kingdom, it has evolved into a global literary phenomenon.</p>
                
                <h4>History and Evolution</h4>
                <p>The prize was founded by Booker McConnell Ltd, a British food wholesale operator, with the initial aim of rewarding fiction and elevating the prestige of the novel. Over the years, it has undergone several significant changes:</p>
                <ul>
                    <li><strong>1969-2013:</strong> Awarded to citizens of the Commonwealth, Ireland, and Zimbabwe</li>
                    <li><strong>2014-Present:</strong> Expanded to include any novel written in English and published in the UK</li>
                    <li><strong>2019:</strong> Renamed to The Booker Prize after new sponsorship</li>
                </ul>`,
                additionalInfo: 'The prize money has increased from £5,000 in 1969 to £50,000 today, with each shortlisted author receiving £2,500.',
                impact: 'Winning the Booker Prize guarantees international recognition and significant commercial success, often increasing sales by 500-1000%.'
            },
            'booker-background': {
                title: 'Background of The Booker Prize',
                subtitle: 'Founding and Development',
                content: `<p>The Booker Prize was created through the vision of Tom Maschler, a literary editor who recognized the need for a major British literary prize. The first award ceremony in 1969 was a modest affair compared to today's high-profile events.</p>
                
                <h4>Key Developments</h4>
                <ul>
                    <li><strong>1969:</strong> First award to P.H. Newby for "Something to Answer For"</li>
                    <li><strong>1971:</strong> Television coverage begins, increasing public awareness</li>
                    <li><strong>1993:</strong> Sponsorship changes to the Booker McConnell foundation</li>
                    <li><strong>2002:</strong> Life of Pi wins, bringing international attention</li>
                    <li><strong>2014:</strong> Major expansion to include all English-language novels</li>
                </ul>`,
                additionalInfo: 'The prize has faced controversies over the years, including debates about judging criteria, sponsorship, and eligibility rules.',
                impact: 'The Booker Prize has significantly influenced literary trends and brought international attention to authors from diverse backgrounds.'
            },
            'booker-significance': {
                title: 'Significance of the Booker Prize',
                subtitle: 'Literary and Commercial Impact',
                content: `<p>Winning the Booker Prize is often described as a "career-making" achievement. The award brings immediate international recognition and transforms authors' careers overnight.</p>
                
                <h4>Commercial Impact</h4>
                <p>The "Booker effect" typically results in:</p>
                <ul>
                    <li>Sales increases of 500-1000% for the winning novel</li>
                    <li>International translation rights for 40+ languages</li>
                    <li>Film and television adaptation opportunities</li>
                    <li>Increased sales for the author's entire backlist</li>
                </ul>
                
                <h4>Literary Prestige</h4>
                <p>Beyond commercial success, the Booker Prize confers:</p>
                <ul>
                    <li>Entry into the literary canon</li>
                    <li>Academic study and critical analysis</li>
                    <li>Invitations to international literary festivals</li>
                    <li>Teaching positions at universities</li>
                </ul>`,
                additionalInfo: 'The prize has launched the careers of numerous literary giants, including Salman Rushdie, Margaret Atwood, and Kazuo Ishiguro.',
                impact: 'The Booker Prize has shaped literary culture by bringing challenging, innovative works to mainstream attention.'
            },
            'booker-timeline': {
                title: 'Historical Timeline of Notable Winners',
                subtitle: 'Five Decades of Literary Excellence',
                content: `<p>The Booker Prize timeline reflects the evolution of English literature over the past five decades, showcasing diverse voices and literary movements.</p>
                
                <h4>Notable Winners and Their Impact</h4>
                <div class="timeline-detail">
                    <div class="timeline-item-detail">
                        <h5>1969: P.H. Newby</h5>
                        <p><strong>"Something to Answer For"</strong> - The inaugural winner set the standard for literary excellence.</p>
                    </div>
                    <div class="timeline-item-detail">
                        <h5>1981: Salman Rushdie</h5>
                        <p><strong>"Midnight's Children"</strong> - Revolutionized postcolonial literature and magical realism.</p>
                    </div>
                    <div class="timeline-item-detail">
                        <h5>2002: Yann Martel</h5>
                        <p><strong>"Life of Pi"</strong> - Brought philosophical depth and spiritual exploration to mainstream attention.</p>
                    </div>
                    <div class="timeline-item-detail">
                        <h5>2007: Anne Enright</h5>
                        <p><strong>"The Gathering"</strong> - Explored family trauma with psychological depth.</p>
                    </div>
                    <div class="timeline-item-detail">
                        <h5>2017: George Saunders</h5>
                        <p><strong>"Lincoln in the Bardo"</strong> - Experimental narrative form exploring grief and history.</p>
                    </div>
                    <div class="timeline-item-detail">
                        <h5>2019: Margaret Atwood</h5>
                        <p><strong>"The Testaments"</strong> - Sequel to "The Handmaid's Tale," exploring dystopian themes.</p>
                    </div>
                </div>`,
                additionalInfo: 'The timeline shows the prize\'s evolution from focusing on British authors to embracing global English literature.',
                impact: 'Each winning novel has contributed to literary conversations and influenced subsequent generations of writers.'
            },
            'booker-conventions': {
                title: 'Conventions on the School of Thought',
                subtitle: 'Literary Movements and the Booker Prize',
                content: `<p>The Booker Prize has reflected and sometimes influenced major literary movements throughout its history.</p>
                
                <h4>Major Literary Movements in Booker History</h4>
                
                <div class="movement-detail">
                    <h5>Postmodernism (1980s-1990s)</h5>
                    <p>The prize embraced experimental narratives, metafiction, and magical realism during this period. Winners like Salman Rushdie and Julian Barnes challenged traditional storytelling forms.</p>
                    
                    <h5>Postcolonial Literature (1990s-2000s)</h5>
                    <p>As the prize expanded to include Commonwealth authors, it celebrated works exploring colonial legacies, cultural identity, and diaspora experiences.</p>
                    
                    <h5>Psychological Realism (2000s-Present)</h5>
                    <p>Recent years have seen a focus on deep character exploration, interiority, and psychological depth in narrative.</p>
                    
                    <h5>Global English Literature (2010s-Present)</h5>
                    <p>Since the 2014 expansion, the prize has embraced truly global English literature, reflecting diverse voices and experiences.</p>
                </div>`,
                additionalInfo: 'The judging panels have evolved to include more diverse voices, influencing which literary conventions receive recognition.',
                impact: 'The Booker Prize has played a crucial role in legitimizing and popularizing various literary movements.'
            }
        };
        
        return sections[sectionId];
    }

    closeAllModals() {
        this.modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main slider
    const slider = new Slider3D();
    
    // Initialize character slider
    const characterSlider = new CharacterSlider();
    
    // Initialize modal manager
    const modalManager = new ModalManager();
    
    // Initialize quiz
    initQuiz();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(10, 20, 26, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.backgroundColor = 'rgba(10, 20, 26, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        }
    });

    // Add animation to content boxes on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.content-box, .analysis-card, .timeline-item').forEach(el => {
        observer.observe(el);
    });
});