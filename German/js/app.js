(function() {
  const { useState, useEffect, useRef } = React;

  // TransformWrapper Component to handle dragging/scaling in Edit Mode
  const TransformWrapper = ({ id, config, isEditMode, onConfigChange, children, className }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth >= 1024;
    const state = config[id] || { x: 0, y: 0, scale: 1 };
    const containerRef = useRef(null);
    const dragData = useRef({ isDragging: false, isScaling: false, startX: 0, startY: 0, startConfig: null });

    useEffect(() => {
      const handleMouseMove = (e) => {
        const { isDragging, isScaling, startX, startY, startConfig } = dragData.current;
        if (!isDragging && !isScaling) return;

        if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          onConfigChange(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              x: startConfig.x + deltaX,
              y: startConfig.y + deltaY
            }
          }));
        } else if (isScaling) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          const delta = deltaX + deltaY;
          const scaleFactor = 0.005;
          const newScale = Math.max(0.1, startConfig.scale + (delta * scaleFactor));
          onConfigChange(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              scale: parseFloat(newScale.toFixed(2))
            }
          }));
        }
      };

      const handleMouseUp = () => {
        dragData.current.isDragging = false;
        dragData.current.isScaling = false;
      };

      if (isEditMode) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isEditMode, id, onConfigChange]);

    const handleMouseDown = (e) => {
      if (!isEditMode) return;
      e.stopPropagation();
      e.preventDefault();
      dragData.current = {
        isDragging: true,
        isScaling: false,
        startX: e.clientX,
        startY: e.clientY,
        startConfig: { ...state }
      };
    };

    const handleScaleMouseDown = (e) => {
      if (!isEditMode) return;
      e.stopPropagation();
      e.preventDefault();
      dragData.current = {
        isDragging: false,
        isScaling: true,
        startX: e.clientX,
        startY: e.clientY,
        startConfig: { ...state }
      };
    };

    if (!isDesktop && !isEditMode) {
      if (id === 'bee') {
        return null;
      }
      return React.createElement('div', { className: className || '' }, children);
    }

    let displayX = state.x;
    let displayY = state.y;
    let displayScale = state.scale;

    if (!isEditMode && isDesktop) {
      const refWidth = 1440;
      const factor = Math.min(1.8, windowWidth / refWidth);
      displayScale = state.scale * factor;
      displayX = state.x * factor;

      if (id === 'bee') {
        const refHeight = 900;
        const currentHeight = window.innerHeight;
        const distanceFromBottom = refHeight - state.y;
        displayY = currentHeight - (distanceFromBottom * factor);
        displayY = Math.max(state.y * 0.8, Math.min(currentHeight - 150, displayY));
      } else {
        displayY = state.y * factor;
      }

      const containerWidth = 1152; // max-w-6xl
      const margin = Math.max(0, (windowWidth - containerWidth) / 2);

      if (id === 'hero' && displayX < 0) {
        displayX = Math.max(-margin, displayX);
      }

      if (id === 'cards' && displayX > 0) {
        displayX = Math.min(margin, displayX);
      }
    }

    return React.createElement('div', {
      ref: containerRef,
      className: className || '',
      style: {
        position: id === 'bee' ? 'absolute' : 'relative',
        ...(id === 'bee' ? { top: 0, left: 0 } : {}),
        transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`,
        transformOrigin: 'center center',
        transition: dragData.current.isDragging ? 'none' : 'transform 0.1s ease-out',
        touchAction: 'none',
        zIndex: id === 'bee' ? 5 : 20
      },
      onMouseDown: handleMouseDown
    },
      children,
      isEditMode && React.createElement('div', {
        className: 'absolute top-1 left-1 bg-black text-yellow-400 text-xs px-2 py-0.5 rounded flex items-center gap-1 select-none pointer-events-auto',
        style: { zIndex: 9999 }
      },
        React.createElement('span', null, `${id.toUpperCase()}: [x: ${Math.round(state.x)}, y: ${Math.round(state.y)}, s: ${state.scale}]`),
        React.createElement('div', {
          onMouseDown: handleScaleMouseDown,
          style: {
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: 20,
            height: 20,
            backgroundColor: '#FBBF24',
            border: '3px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 101,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }
        })
      )
    );
  };

  // Sparkles background layer
  const StarrySky = () => {
    const starsCount = 40;
    const stars = Array.from({ length: starsCount }).map((_, i) => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const speed = Math.random() * 5 + 3;
      const delay = Math.random() * 5;
      const dx = Math.random() * 20 - 10;
      const dy = Math.random() * 20 - 10;

      return React.createElement('div', {
        key: i,
        className: 'star-element',
        style: {
          top: `${top}%`,
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          '--speed': `${speed}s`,
          animationDelay: `${delay}s`
        }
      });
    });

    return React.createElement('div', { className: 'absolute inset-0 overflow-hidden pointer-events-none' }, stars);
  };

  // Floating fireflies layer
  const Fireflies = () => {
    const firefliesCount = 12;
    const fireflies = Array.from({ length: firefliesCount }).map((_, i) => {
      const top = Math.random() * 90 + 5;
      const left = Math.random() * 90 + 5;
      const speed = Math.random() * 10 + 8;
      const delay = Math.random() * 6;
      const dx = Math.random() * 80 - 40;
      const dy = Math.random() * 80 - 40;

      return React.createElement('div', {
        key: i,
        className: 'firefly-element',
        style: {
          top: `${top}%`,
          left: `${left}%`,
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          '--speed': `${speed}s`,
          animationDelay: `${delay}s`
        }
      });
    });

    return React.createElement('div', { className: 'absolute inset-0 overflow-hidden pointer-events-none' }, fireflies);
  };

  // Shooting comets layer
  const Comets = () => {
    const speed = Math.random() * 10 + 12;
    const delay = Math.random() * 15 + 5;

    return React.createElement('div', { className: 'absolute inset-0 overflow-hidden pointer-events-none' },
      React.createElement('div', {
        className: 'comet-element',
        style: {
          '--speed': `${speed}s`,
          animationDelay: `${delay}s`
        }
      })
    );
  };

  // Icons Helper
  const ArrowLeft = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M10 19l-7-7m0 0l7-7m-7 7h18' })
  );

  const Volume2 = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' })
  );

  const Mic = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' })
  );

  const Award = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 2a4 4 0 118 0 4 4 0 01-8 0z' })
  );

  const BookOpen = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  );

  const Star = ({ className }) => React.createElement('svg', { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.175 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z' })
  );

  // Main SpellingBeeGame Component
  const SpellingBeeGame = () => {
    const [currentScreen, setCurrentScreen] = useState('home'); // home, menu, game, wordList, instructions, winners, admin
    const [gameMode, setGameMode] = useState(null); // contest, training
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userSpelling, setUserSpelling] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [timer, setTimer] = useState(30);
    const [gameActive, setGameActive] = useState(false);
    const [shuffledIndices, setShuffledIndices] = useState([]);
    const [expandedSection, setExpandedSection] = useState(null);
    
    // Day / Night toggler config state (persisted in localStorage)
    const [themeConfig, setThemeConfig] = useState({
      mode: localStorage.getItem('bee_de_theme') || 'night',
      effectSpeed: 1,
      bgOpacity: 1,
      beeOpacity: 1,
      sparklesBrightness: 1
    });
    const [showThemeModal, setShowThemeModal] = useState(false);
    
    // UI Layout Configuration Coordinates
    const [layoutConfig, setLayoutConfig] = useState({
      hero: { x: 0, y: 0, scale: 1 },
      cards: { x: 0, y: 0, scale: 1 },
      bee: { x: 0, y: 0, scale: 1 }
    });

    const [isAdminLogged, setIsAdminLogged] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [showDefinition, setShowDefinition] = useState(false);
    const [showExample, setShowExample] = useState(false);
    
    const inputRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Initialize layout settings from index.html if present
    useEffect(() => {
      const dataEl = document.getElementById('layout-config-data');
      if (dataEl) {
        try {
          const config = JSON.parse(dataEl.textContent);
          if (config) {
            setLayoutConfig(prev => ({
              hero: config.hero || prev.hero,
              cards: config.cards || prev.cards,
              bee: config.bee || prev.bee
            }));
          }
        } catch (e) {
          console.error('Error al cargar la configuración de coordenadas:', e);
        }
      }
    }, []);

    // Load dynamic German Spelling Data words
    const levelAWords = (window.SPELLING_DATA && Array.isArray(window.SPELLING_DATA.levelAWords) && window.SPELLING_DATA.levelAWords.length)
      ? window.SPELLING_DATA.levelAWords
      : [{ word: 'Apfel', phonetic: '[ˈapfl̩]', definition: 'Manzana', example: 'Ich esse einen Apfel.' }];

    const levelBWords = (window.SPELLING_DATA && Array.isArray(window.SPELLING_DATA.levelBWords) && window.SPELLING_DATA.levelBWords.length)
      ? window.SPELLING_DATA.levelBWords
      : [{ word: 'Bleistift', phonetic: '[ˈblaɪ̯ˌʃtɪft]', definition: 'Lápiz', example: 'Ich schreibe mit einem Bleistift.' }];

    const levelCWords = (window.SPELLING_DATA && Array.isArray(window.SPELLING_DATA.levelCWords) && window.SPELLING_DATA.levelCWords.length)
      ? window.SPELLING_DATA.levelCWords
      : [{ word: 'Gerechtigkeit', phonetic: '[ɡəˈʁɛçtɪçkaɪ̯t]', definition: 'Justicia', example: 'Gerechtigkeit ist ein wichtiges Prinzip.' }];

    const levels = {
      levelA: { name: 'Stufe A (Anfänger)', icon: '🌱', words: levelAWords, color: 'bg-emerald-500' },
      levelB: { name: 'Stufe B (Mittelstufe)', icon: '🚀', words: levelBWords, color: 'bg-blue-500' },
      levelC: { name: 'Stufe C (Fortgeschritten)', icon: '👑', words: levelCWords, color: 'bg-purple-500' }
    };

    // Load speech synthesis voices (Integrated with ResponsiveVoice Premium and native voices)
    useEffect(() => {
      const loadVoices = () => {
        if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
          const rvList = [
            { name: "Deutsch Female", lang: "de-DE", isResponsiveVoice: true },
            { name: "Deutsch Male", lang: "de-DE", isResponsiveVoice: true }
          ];
          setAvailableVoices(rvList);
          setSelectedVoice(prev => prev || rvList[0]);
        } else if ('speechSynthesis' in window) {
          const voices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('de'));
          setAvailableVoices(voices);
          if (voices.length > 0) {
            const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
            setSelectedVoice(prev => prev || preferred);
          }
        }
      };
      
      loadVoices();
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Retry loading voices in 1.5s in case ResponsiveVoice loads asynchronously
      const timer = setTimeout(loadVoices, 1500);
      return () => clearTimeout(timer);
    }, []);

    // Speech Recognition initialization
    useEffect(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'de-DE';

        rec.onstart = () => {
          setIsListening(true);
          setSpokenText('');
        };

        rec.onresult = (event) => {
          const resultText = event.results[0][0].transcript;
          // Filter out spaces or dots to get spelling characters
          const cleanedText = resultText.replace(/[\s\.]/g, '').toLowerCase();
          setSpokenText(resultText);
          setUserSpelling(cleanedText);
        };

        rec.onerror = (e) => {
          console.error('Error de reconocimiento de voz:', e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }, []);

    const toggleListening = () => {
      if (!recognition) {
        alert('Spracherkennung wird von diesem Browser nicht unterstützt.');
        return;
      }
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleConfigChange = (id, newConfig) => {
      setLayoutConfig(prev => ({
        ...prev,
        [id]: newConfig
      }));
    };

    // Timer management for contest mode
    useEffect(() => {
      if (gameActive && gameMode === 'contest') {
        timerIntervalRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current);
              handleWordSubmit(true); // Auto-fail on timeout
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }, [gameActive, gameMode, currentWordIndex]);

    const speak = (text) => {
      if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function' && selectedVoice && selectedVoice.isResponsiveVoice) {
        responsiveVoice.speak(text, selectedVoice.name);
      } else if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
          if (selectedVoice.isResponsiveVoice) {
            utterance.lang = selectedVoice.lang;
          } else {
            utterance.voice = selectedVoice;
            utterance.lang = 'de-DE';
          }
        } else {
          utterance.lang = 'de-DE';
        }
        speechSynthesis.speak(utterance);
      } else {
        alert('Sprachsynthese nicht verfügbar.');
      }
    };

    const startGame = (levelKey) => {
      setSelectedLevel(levelKey);
      const listLength = levels[levelKey].words.length;
      if (listLength === 0) return;

      // Create shuffled index list
      const indices = Array.from({ length: listLength }).map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      setShuffledIndices(indices);
      setCurrentWordIndex(0);
      setUserSpelling('');
      setScore(0);
      setMistakes(0);
      setShowResult(false);
      setTimer(30);
      setGameActive(true);
      setShowDefinition(false);
      setShowExample(false);
      setCurrentScreen('game');

      // Auto-pronounce first word
      setTimeout(() => {
        const firstWord = levels[levelKey].words[indices[0]].word;
        speak(firstWord);
      }, 500);
    };

    const handleWordSubmit = (isTimeout = false) => {
      if (showResult) return;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const activeWords = levels[selectedLevel].words;
      const actualIndex = shuffledIndices[currentWordIndex];
      const correctWord = activeWords[actualIndex].word.toLowerCase().trim();
      const enteredWord = userSpelling.toLowerCase().trim();

      const correct = !isTimeout && (enteredWord === correctWord);
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        setScore(prev => prev + 1);
        speak('Das ist richtig! Gut gemacht.');
      } else {
        setMistakes(prev => prev + 1);
        speak(`Nein, das ist falsch. Das richtige Wort lautet: ${activeWords[actualIndex].word}`);
      }

      setTimeout(() => {
        // Go to next word or end game
        if (currentWordIndex + 1 < shuffledIndices.length && mistakes + (correct ? 0 : 1) < 3) {
          setCurrentWordIndex(prev => prev + 1);
          setUserSpelling('');
          setShowResult(false);
          setTimer(30);
          setShowDefinition(false);
          setShowExample(false);
          // Pronounce next word
          setTimeout(() => {
            const nextWord = activeWords[shuffledIndices[currentWordIndex + 1]].word;
            speak(nextWord);
          }, 400);
        } else {
          // Game Over / End game
          setGameActive(false);
          alert(`Spiel beendet!\nGesamtpunkte: ${score + (correct ? 1 : 0)}\nFehler: ${mistakes + (correct ? 0 : 1)}`);
          setGameMode(null);
          setCurrentScreen('home');
        }
      }, 3500);
    };

    // Helper definition/examples if missing
    const generateDefinition = (word, lvlName) => `Ein Wort aus der deutschen Sprache (${lvlName}).`;
    const generateExample = (word) => `Der Lehrer fragt: "Wer kann das Wort '${word}' buchstabieren?"`;

    // Elements Layout Config JSON Saving logic
    const saveHTML = async () => {
      const scriptEl = document.getElementById('layout-config-data');
      if (scriptEl) {
        scriptEl.textContent = '\n      ' + JSON.stringify(layoutConfig, null, 2) + '\n    ';
      }
      const clone = document.documentElement.cloneNode(true);
      const rootEl = clone.querySelector('#root');
      if (rootEl) {
        rootEl.innerHTML = '';
      }
      const htmlContent = '<!DOCTYPE html>\n' + clone.outerHTML;
      
      try {
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{
              description: 'HTML Document',
              accept: {'text/html': ['.html']},
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(htmlContent);
          await writable.close();
          alert('Dokument erfolgreich gespeichert!');
        } else {
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'index.html';
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          alert('Fehler beim Speichern der Datei.');
        }
      }
    };

    // Screens Components
    const HomeScreen = () => {
        const cardsData = [
          {
            key: 'contest',
            title: 'Wettbewerb',
            desc: 'Buchstabiere gegen die Zeit. 3 Versuche.',
            img: 'IMG/trofeo.png',
            glowClass: 'card-contest-glow',
            onClick: () => {
              setGameMode('contest');
              setCurrentScreen('menu');
            }
          },
          {
            key: 'training',
            title: 'Training',
            desc: 'Lerne ohne Druck. Mit Aussprachehilfe.',
            img: 'IMG/brazo.png',
            glowClass: 'card-training-glow',
            onClick: () => {
              setGameMode('training');
              setCurrentScreen('menu');
            }
          },
          {
            key: 'instructions',
            title: 'Anleitung',
            desc: 'Spielregeln und detaillierte Infos.',
            img: 'IMG/libro.png',
            glowClass: 'card-instructions-glow',
            onClick: () => {
              setCurrentScreen('instructions');
            }
          },
          {
            key: 'winners',
            title: 'Ruhmeshalle',
            desc: 'Unsere bisherigen Champions.',
            img: 'IMG/medalla.png',
            glowClass: 'card-winners-glow',
            onClick: () => {
              setCurrentScreen('winners');
            }
          }
        ];

      return React.createElement('div', { className: 'flex flex-col justify-between min-h-screen relative w-full' },
        
        React.createElement(TransformWrapper, { id: 'bee', config: layoutConfig, isEditMode, onConfigChange: setLayoutConfig },
          React.createElement('img', {
            src: 'IMG/Abeja.png',
            alt: 'Bee',
            className: 'animate-bee-float',
            style: {
              width: '38vw',
              minWidth: '300px',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 15px 35px rgba(255, 179, 0, 0.15))',
              opacity: themeConfig.beeOpacity
            }
          })
        ),

        // Outer flex layout
        React.createElement('div', { className: 'relative flex-grow flex items-center justify-center px-4 sm:px-8 lg:px-6 pt-4 pb-4 z-10 w-full' },
          React.createElement('div', { className: 'w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8' },
            
            // Left Panel: Hero Section (with TransformWrapper)
            React.createElement(TransformWrapper, { id: 'hero', config: layoutConfig, className: 'flex-1 w-full flex justify-center lg:justify-start', isEditMode, onConfigChange: setLayoutConfig },
              React.createElement('div', { className: 'w-full max-w-md sm:max-w-xl lg:max-w-none mx-auto lg:mx-0 flex flex-col items-center justify-center text-center lg:items-start lg:text-left px-4 sm:px-8 lg:pl-12 xl:pl-20' },
                React.createElement('span', { className: 'text-xs sm:text-base lg:text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-3 block' }, 'WILLKOMMEN ZUM OFFIZIELLEN'),
                React.createElement('h1', { className: 'main-title font-black text-white leading-none tracking-tight text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] w-full text-center lg:text-left' }, 'BUCHSTABIER'),
                React.createElement('h1', { className: 'main-title font-black text-yellow-400 leading-none tracking-tight mb-2 text-5xl sm:text-6xl lg:text-[4.5rem] xl:text-[5rem] flex items-center justify-center lg:justify-start gap-4 w-full' }, 
                  'WETTBEWERB',
                  React.createElement('img', {
                    src: 'IMG/Abeja.png',
                    alt: 'Bee',
                    className: 'w-16 h-16 sm:w-24 sm:h-24 lg:hidden object-contain animate-bee-wiggle',
                    style: {
                      filter: 'drop-shadow(0 5px 15px rgba(255, 179, 0, 0.35))',
                      opacity: themeConfig.beeOpacity
                    }
                  })
                ),
                React.createElement('p', { className: 'hero-text-sub text-lg sm:text-xl md:text-2xl font-black tracking-widest text-purple-400 uppercase mb-6 text-center lg:text-left w-full mx-auto lg:mx-0' }, 'LERNEN. ÜBEN. WETTEIFERN. GEWINNEN.'),
                React.createElement('button', {
                  onClick: () => {
                    setGameMode('contest');
                    setCurrentScreen('menu');
                  },
                  className: 'btn-hero-contest-glass w-full sm:w-auto flex justify-center items-center text-center mx-auto sm:mx-0 max-w-md sm:max-w-none transition-all duration-300'
                },
                  React.createElement('span', { className: 'text-2xl' }, '🏆'),
                  React.createElement('span', { className: 'font-black uppercase tracking-widest text-lg' }, 'JETZT STARTEN')
                )
              )
            ),

              // Right Panel: Glassmorphic cards
              React.createElement(TransformWrapper, { id: 'cards', config: layoutConfig, className: 'w-full lg:w-auto', isEditMode, onConfigChange: setLayoutConfig },
                React.createElement('div', { className: 'w-full flex justify-center lg:justify-end' },
                  React.createElement('div', { 
                    className: 'flex flex-col w-full max-w-lg lg:w-[480px]',
                    style: { gap: `18px` }
                  },
                  cardsData.map(card => 
                    React.createElement('div', {
                      key: card.key,
                      onClick: card.onClick,
                      className: `rounded-glass-card ${card.glowClass}`
                    },
                      // Badge and info text
                      React.createElement('div', { className: 'flex items-center gap-4 text-left' },
                        React.createElement('div', { className: 'badge-hex' },
                          React.createElement('img', {
                            src: card.img,
                            alt: card.title,
                            className: 'badge-hex-img'
                          })
                        ),
                        React.createElement('div', { className: 'flex flex-col' },
                          React.createElement('span', { className: 'card-title-txt' }, card.title),
                          React.createElement('span', { className: 'card-desc-txt' }, card.desc)
                        )
                      ),
                      // Arrow indicator
                      React.createElement('div', { className: 'arrow-circle' }, '→')
                    )
                  )
                )
              )
            )

          )
        )
      );
    };

    const MenuScreen = () => {
      const activeWordsTitle = gameMode === 'contest' ? '🏆 WETTBEWERB' : '💪 TRAINING';
      
      return React.createElement('div', { className: 'min-h-screen p-4 sm:p-8 flex flex-col justify-between' },
        React.createElement('div', { className: 'max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center animate-fadeIn' },
          
          React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between mb-8 gap-4' },
            React.createElement('div', { className: 'flex items-center gap-4 w-full sm:w-auto' },
              React.createElement('button', {
                onClick: () => { setGameMode(null); setCurrentScreen('home'); },
                className: 'bg-black text-yellow-400 p-2 sm:p-3 rounded-full hover:bg-yellow-600 hover:text-black transition-all duration-300 shadow-lg transform hover:scale-110 border border-white/10'
              }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),
              React.createElement('h1', { className: 'text-2xl sm:text-4xl font-bold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' }, `${activeWordsTitle} - NIVEAU WÄHLEN`)
            )
          ),

          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full' },
            Object.entries(levels).map(([key, level]) =>
              React.createElement('div', { key: key, className: 'relative' },
                React.createElement('div', { className: 'bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl transform hover:scale-[1.03] transition-all duration-300 border border-white border-opacity-15 flex flex-col justify-between min-h-[420px]' },
                  React.createElement('div', null,
                    React.createElement('div', { className: `rounded-full w-14 h-14 mx-auto flex items-center justify-center mb-5 shadow-lg text-3xl text-white ${level.color === 'bg-emerald-500' ? 'bg-emerald-500/20 border border-emerald-500/30' : level.color === 'bg-blue-500' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-purple-500/20 border border-purple-500/30'}` },
                      level.icon
                    ),
                    React.createElement('h2', { className: 'text-2xl font-black text-yellow-400 mb-3 text-center' }, level.name),
                    React.createElement('p', { className: 'text-gray-300 text-sm text-center font-semibold leading-relaxed mb-6' },
                      `Enthält ${level.words.length} sorgfältig ausgewählte Wörter des offiziellen Lehrplans. Meistere deine Fähigkeiten.`
                    )
                  ),
                  React.createElement('div', { className: 'space-y-3 w-full' },
                    React.createElement('button', {
                      onClick: () => startGame(key),
                      className: 'w-full bg-yellow-400 text-black hover:bg-yellow-300 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg border border-yellow-400/20'
                    }, 
                      React.createElement('span', { className: 'text-lg' }, '🎮'),
                      'Starten'
                    ),
                    gameMode === 'training' && React.createElement('button', {
                      onClick: () => { setSelectedLevel(key); setCurrentScreen('wordList'); },
                      className: 'w-full bg-white bg-opacity-10 text-white hover:bg-white hover:bg-opacity-20 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white border-opacity-20'
                    }, 
                      React.createElement('span', { className: 'text-base' }, '🔍'),
                      'Wortliste ansehen'
                    )
                  )
                )
              )
            )
          )

        )
      );
    };

    const GameScreen = () => {
      const activeWords = levels[selectedLevel].words;
      const actualIndex = shuffledIndices[currentWordIndex];
      const currentWordObj = activeWords[actualIndex];

      const wordToSpell = currentWordObj.word;
      const definitionText = currentWordObj.definition || generateDefinition(wordToSpell, levels[selectedLevel].name);
      const exampleText = currentWordObj.example || generateExample(wordToSpell);

      return React.createElement('div', { className: 'min-h-screen p-4 sm:p-8 flex flex-col justify-between' },
        React.createElement('div', { className: 'max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center animate-fadeIn' },
          
          React.createElement('div', { className: 'flex justify-between items-center mb-6 sm:mb-8' },
            React.createElement('button', {
              onClick: () => { setGameActive(false); setGameMode(null); setCurrentScreen('home'); },
              className: 'bg-black text-yellow-400 p-2 sm:p-3 rounded-full hover:bg-yellow-600 hover:text-black transition-all duration-300 shadow-lg transform hover:scale-110 border border-white/10'
            }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),
            React.createElement('div', { className: 'bg-black/80 text-yellow-400 font-bold px-5 py-2.5 rounded-xl shadow-lg border border-white border-opacity-10' },
              `Level: ${levels[selectedLevel].name}`
            )
          ),

          React.createElement('div', { className: 'bg-black bg-opacity-40 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-white border-opacity-15 relative overflow-hidden' },
            
            // Statistics Bar
            React.createElement('div', { className: 'grid grid-cols-3 gap-3 mb-6 sm:mb-8 border-b border-white/10 pb-6' },
              React.createElement('div', { className: 'bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-center shadow-inner' },
                React.createElement('div', { className: 'text-xs text-yellow-400/70 font-extrabold uppercase' }, 'Punkte'),
                React.createElement('div', { className: 'text-2xl sm:text-3xl font-black text-yellow-400' }, score)
              ),
              React.createElement('div', { className: 'bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center shadow-inner' },
                React.createElement('div', { className: 'text-xs text-red-400/70 font-extrabold uppercase' }, 'Fehler'),
                React.createElement('div', { className: 'text-2xl sm:text-3xl font-black text-red-500' }, `${mistakes}/3`)
              ),
              React.createElement('div', { className: 'bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center shadow-inner' },
                React.createElement('div', { className: 'text-xs text-blue-400/70 font-extrabold uppercase' }, 'Timer'),
                React.createElement('div', { className: 'text-2xl sm:text-3xl font-black text-blue-400' }, `${timer}s`)
              )
            ),

            // Card Panel content
            React.createElement('div', { className: 'text-center mb-8' },
              React.createElement('h2', { className: 'text-gray-300 text-xs sm:text-sm font-extrabold tracking-widest uppercase mb-2' }, 'Buchstabiere das Wort'),
              React.createElement('div', { className: 'text-yellow-400 font-black text-2xl sm:text-3xl min-h-[40px] tracking-wide font-mono bg-black/40 p-4 border border-white/10 rounded-xl inline-block shadow-inner max-w-full overflow-x-auto' },
                userSpelling ? userSpelling.toUpperCase() : '...'
              ),
              currentWordObj.phonetic && React.createElement('div', { className: 'text-purple-400 font-mono text-sm sm:text-base mt-3' },
                currentWordObj.phonetic
              )
            ),

            // Audio Helper Buttons
            React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8' },
              React.createElement('button', {
                onClick: () => speak(wordToSpell),
                className: 'bg-yellow-400 text-black hover:bg-yellow-300 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg transform hover:scale-103'
              }, 
                React.createElement(Volume2, { className: 'w-5 h-5' }),
                'Wort anhören'
              ),
              React.createElement('button', {
                onClick: () => { setShowDefinition(true); speak(definitionText); },
                className: 'bg-white bg-opacity-10 text-white hover:bg-white hover:bg-opacity-20 border border-white border-opacity-20 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg transform hover:scale-103'
              }, 
                React.createElement('span', { className: 'text-lg' }, '💡'),
                'Bedeutung'
              ),
              React.createElement('button', {
                onClick: () => { setShowExample(true); speak(exampleText); },
                className: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg transform hover:scale-103'
              }, 
                React.createElement('span', { className: 'text-lg' }, '📝'),
                'Beispielsatz'
              )
            ),

            // Helpers text info
            React.createElement('div', { className: 'space-y-3 mb-8 text-left text-sm font-semibold max-w-2xl mx-auto' },
              showDefinition && React.createElement('div', { className: 'bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-xl shadow-md text-gray-200' },
                React.createElement('strong', { className: 'text-yellow-400' }, 'Bedeutung: '),
                definitionText
              ),
              showExample && React.createElement('div', { className: 'bg-purple-500/10 border-l-4 border-purple-500 p-3 rounded-r-xl shadow-md text-gray-200' },
                React.createElement('strong', { className: 'text-purple-400' }, 'Beispielsatz: '),
                exampleText
              )
            ),

            // Spelling Inputs (Keyboard & Speech Input)
            React.createElement('div', { className: 'max-w-md mx-auto space-y-4' },
              React.createElement('div', { className: 'relative' },
                React.createElement('input', {
                  ref: inputRef,
                  type: 'text',
                  placeholder: 'Hier buchstabieren...',
                  value: userSpelling,
                  onChange: (e) => setUserSpelling(e.target.value.replace(/[^a-zA-ZäöüßÄÖÜ]/g, '')),
                  onKeyDown: (e) => e.key === 'Enter' && handleWordSubmit(),
                  disabled: showResult,
                  className: 'w-full px-5 py-3.5 bg-black bg-opacity-50 text-white border border-white border-opacity-15 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold text-center text-lg placeholder-gray-500 shadow-lg'
                }),
                React.createElement('button', {
                  onClick: toggleListening,
                  className: `absolute right-2.5 top-2.5 p-2 rounded-xl border transition-all duration-300 shadow-md ${
                    isListening 
                      ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                      : 'bg-white bg-opacity-10 text-white border-white border-opacity-20 hover:bg-white hover:bg-opacity-20'
                  }`
                }, React.createElement(Mic, { className: 'w-5 h-5' }))
              ),

              // German Accents Virtual Buttons Bar
              React.createElement('div', { className: 'flex justify-center gap-2 mb-3' },
                ['ä', 'ö', 'ü', 'ß'].map((char) =>
                  React.createElement('button', {
                    key: char,
                    onClick: () => setUserSpelling(prev => prev + char),
                    disabled: showResult,
                    className: 'bg-white bg-opacity-10 text-white hover:bg-yellow-500 hover:text-black font-extrabold w-10 h-10 rounded-xl border border-white border-opacity-20 flex items-center justify-center shadow-md transition-all duration-200 text-lg'
                  }, char.toUpperCase())
                )
              ),

              React.createElement('button', {
                onClick: () => handleWordSubmit(),
                disabled: showResult,
                className: 'w-full bg-yellow-400 text-black hover:bg-yellow-300 py-4 rounded-2xl font-black text-lg transition-all duration-300 border border-yellow-400/20 shadow-lg transform hover:scale-102 flex items-center justify-center gap-2'
              }, 
                React.createElement('span', { className: 'text-xl' }, '✅'),
                'Bestätigen'
              )
            ),

            // Correct/Incorrect Feedback Overlays
            showResult && React.createElement('div', { className: `absolute inset-0 bg-opacity-90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 ${
              isCorrect ? 'bg-emerald-950/90 text-white' : 'bg-red-950/90 text-white'
            }` },
              React.createElement('div', { className: 'text-7xl mb-4 animate-bounce' }, isCorrect ? '🎉' : '💥'),
              React.createElement('h2', { className: `text-3xl sm:text-4xl font-black mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}` }, 
                isCorrect ? 'RICHTIG!' : 'FALSCH!'
              ),
              React.createElement('p', { className: 'text-gray-200 text-lg font-bold mb-4' }, 
                isCorrect ? 'Hervorragend buchstabiert!' : `Das richtige Wort war: "${wordToSpell}"`
              )
            )

          )

        )
      );
    };

    const WordListScreen = () => {
      const [searchTerm, setSearchTerm] = useState('');
      
      const levelName = levels[selectedLevel]?.name || 'Wortliste';
      const words = levels[selectedLevel]?.words || [];
      
      const sortedWords = React.useMemo(() => {
        return [...words].sort((a, b) => a.word.localeCompare(b.word, 'de', { sensitivity: 'base' }));
      }, [words]);
      
      const filteredWords = sortedWords.filter(item => 
        item.word.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const handleDownload = () => {
        const headers = ['Wort', 'Aussprache', 'Definition', 'Beispielsatz'];
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        sortedWords.forEach(item => {
          const defRaw = item.definition || generateDefinition(item.word, levels[selectedLevel]?.name);
          const exRaw = item.example || generateExample(item.word, levels[selectedLevel]?.name);
          const def = defRaw.replace(/"/g, '""');
          const ex = exRaw.replace(/"/g, '""');
          const row = [
            `"${item.word}"`,
            `"${item.phonetic || ''}"`,
            `"${def}"`,
            `"${ex}"`
          ];
          csvRows.push(row.join(','));
        });
        
        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Spelling_Bee_${levelName.replace(/\s+/g, '_')}_Woerter.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return React.createElement('div', { className: 'min-h-screen p-4 sm:p-8' },
        React.createElement('div', { className: 'max-w-5xl mx-auto animate-fadeIn' },
          React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4' },
            React.createElement('div', { className: 'flex items-center gap-4 w-full sm:w-auto' },
              React.createElement('button', {
                onClick: () => setCurrentScreen('menu'),
                className: 'bg-black text-yellow-400 p-2 sm:p-3 rounded-full hover:bg-yellow-600 hover:text-black transition-all duration-300 shadow-lg transform hover:scale-110 border border-white/10'
              }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),
              React.createElement('h1', { className: 'text-2xl sm:text-4xl font-bold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' }, `${levelName} - Wortliste`)
            ),
            
            React.createElement('button', {
              onClick: handleDownload,
              className: 'w-full sm:w-auto bg-black text-yellow-400 hover:bg-yellow-600 hover:text-black font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-white/10'
            }, 
              React.createElement('span', { className: 'text-xl' }, '📥'),
              'Liste herunterladen (CSV)'
            )
          ),

          React.createElement('div', { className: 'bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-4 sm:p-8 shadow-2xl border border-white border-opacity-15' },
            React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-white/10 pb-6' },
              React.createElement('div', { className: 'relative w-full sm:w-80' },
                React.createElement('input', {
                  type: 'text',
                  placeholder: '🔍 Wörter suchen...',
                  value: searchTerm,
                  onChange: (e) => setSearchTerm(e.target.value),
                  className: 'w-full px-4 py-3 bg-black bg-opacity-50 text-white border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-semibold shadow-md placeholder-gray-500 transition-all'
                })
              ),
              React.createElement('div', { className: 'text-white font-extrabold text-base bg-white bg-opacity-10 border border-white border-opacity-20 px-4 py-2 rounded-xl shadow-lg' },
                `Zeige ${filteredWords.length} von ${words.length} Wörtern`
              )
            ),

            React.createElement('div', { className: 'overflow-x-auto max-h-[500px] border border-white border-opacity-15 rounded-2xl shadow-2xl bg-black bg-opacity-20' },
              React.createElement('table', { className: 'min-w-full divide-y divide-white/10 text-left' },
                React.createElement('thead', { className: 'bg-black/85 text-yellow-400 sticky top-0 z-10' },
                  React.createElement('tr', null,
                    React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Wort'),
                    React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Aussprache'),
                    React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Definition'),
                    React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base' }, 'Beispielsatz')
                  )
                ),
                React.createElement('tbody', { className: 'divide-y divide-white/10 bg-black/10 font-semibold text-gray-200' },
                  filteredWords.length === 0 
                    ? React.createElement('tr', null,
                        React.createElement('td', { colSpan: 4, className: 'px-6 py-12 text-center text-gray-400 font-bold text-lg' }, 'Keine Wörter gefunden, die Ihrer Suche entsprechen.')
                      )
                    : filteredWords.map((item, idx) => {
                        const definition = item.definition || generateDefinition(item.word, levels[selectedLevel]?.name);
                        const example = item.example || generateExample(item.word, levels[selectedLevel]?.name);
                        return React.createElement('tr', { 
                          key: idx,
                          className: 'hover:bg-white/5 transition-colors duration-150'
                        },
                          React.createElement('td', { className: 'px-6 py-4 text-white font-black text-base whitespace-nowrap border-r border-white/10' }, item.word),
                          React.createElement('td', { className: 'px-6 py-4 text-yellow-400 font-mono text-sm whitespace-nowrap border-r border-white/10 bg-black/20' }, item.phonetic || '-'),
                          React.createElement('td', { className: 'px-6 py-4 text-gray-300 text-sm max-w-xs border-r border-white/10' }, definition),
                          React.createElement('td', { className: 'px-6 py-4 text-gray-300 text-sm italic max-w-sm' }, example)
                        );
                      })
                )
              )
            )
          )
        )
      );
    };

    const WinnersScreen = () => {
      const winners = [
        {
          year: 2024,
          name: "José Carpintero",
          group: "1ºC",
          level: "Level A",
          winningWord: "Apfel",
          trophy: "🥇",
          photo: "IMG/1A.webp"
        },
        {
          year: 2024,
          name: "Ángela García",
          group: "2ºA",
          level: "Level B",
          winningWord: "Bleistift",
          trophy: "🥇",
          photo: "IMG/2B.jpg"
        },
        {
          year: 2024,
          name: "Sofío Contle",
          group: "3ºC",
          level: "Level C",
          winningWord: "Gerechtigkeit",
          trophy: "🥇",
          photo: "IMG/3C.webp"
        },
        {
          year: 2023,
          name: "Ashley Camacho",
          group: "1ºC",
          level: "Level A",
          winningWord: "Schwein",
          trophy: "🏆"
        },
        {
          year: 2023,
          name: "Aisha Hernandez",
          group: "2ºA",
          level: "Level B",
          winningWord: "Wohnung",
          trophy: "🏆"
        },
        {
          year: 2023,
          name: "David Gamaliel",
          group: "3ºA",
          level: "Level C",
          winningWord: "Kaution",
          trophy: "🏆"
        }
      ];

      return React.createElement('div', { className: 'min-h-screen p-8' },
        React.createElement('div', { className: 'max-w-6xl mx-auto animate-fadeIn' },
          React.createElement('div', { className: 'flex items-center justify-between mb-8' },
            React.createElement('button', {
              onClick: () => setCurrentScreen('home'),
              className: 'bg-black text-yellow-400 p-3 rounded-full hover:bg-yellow-600 transition-all duration-300 shadow-lg border border-white/10'
            }, React.createElement(ArrowLeft, { className: 'w-6 h-6' })),
            React.createElement('div', { className: 'bg-black/60 text-yellow-400 py-4 px-8 rounded-xl font-bold text-5xl shadow-lg border border-white/10' },
              'Ruhmeshalle'
            ),
            React.createElement('div', { className: 'w-12' })
          ),
          
          React.createElement('div', { className: 'text-center mb-8' },
            React.createElement('div', { className: 'text-6xl mb-4' }, '🏆'),
            React.createElement('p', { className: 'text-3xl text-white font-semibold' },
              'Wir feiern unsere Rechtschreibwettbewerb-Champions'
            )
          ),

          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
            winners.map((winner, index) =>
              React.createElement('div', { 
                key: index, 
                className: `bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white border-opacity-15 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                  winner.year === 2024 ? 'ring-2 ring-yellow-400/30' : ''
                }`,
                onClick: () => setSelectedWinner(winner)
              },
                React.createElement('div', { className: 'text-center' },
                  // Winner photo
                  winner.photo && React.createElement('div', { className: 'mb-4' },
                    React.createElement('img', {
                      src: winner.photo,
                      alt: `${winner.name} - Winner ${winner.year}`,
                      className: 'w-32 h-32 rounded-full mx-auto object-cover border-4 border-amber-500 shadow-lg'
                    })
                  ),
                  // Trophy & Year
                  React.createElement('div', { className: 'flex items-center justify-center gap-3 mb-3' },
                    React.createElement('div', { className: 'text-4xl' }, winner.trophy),
                    React.createElement('div', { className: 'bg-black text-yellow-400 rounded-full px-3 py-1 text-sm font-bold border border-white/10' },
                      winner.year
                    )
                  ),
                  React.createElement('h3', { className: 'text-xl font-bold text-yellow-400 mb-2' },
                    winner.name
                  ),
                  React.createElement('p', { className: 'text-gray-300 font-semibold mb-2' },
                    winner.group
                  ),
                  React.createElement('div', { className: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg px-3 py-1 text-sm font-bold mb-3 inline-block' },
                    winner.level
                  ),
                  React.createElement('div', { className: 'border-t border-white/10 pt-3' },
                    React.createElement('p', { className: 'text-sm text-gray-400 mb-1' }, 'Winning Word:'),
                    React.createElement('p', { className: 'text-lg font-bold text-white' },
                      `"${winner.winningWord}"`
                    )
                  )
                )
              )
            )
          ),

          // Details Modal popup
          selectedWinner && React.createElement('div', { 
            className: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4',
            onClick: () => setSelectedWinner(null)
          },
            React.createElement('div', { 
              className: 'bg-black bg-opacity-80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white border-opacity-15 max-w-sm sm:max-w-md md:max-w-lg w-full mx-auto relative max-h-[85vh] overflow-y-auto transform transition-all duration-500 ease-out',
              onClick: (e) => e.stopPropagation(),
              style: {
                animation: 'modalGrow 0.5s ease-out'
              }
            },
              React.createElement('div', { className: 'text-center' },
                React.createElement('button', {
                  onClick: () => setSelectedWinner(null),
                  className: 'absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-red-700 transition-all duration-300 text-xs sm:text-sm z-10 border border-white/10'
                }, '✕'),
                selectedWinner.photo && React.createElement('div', { className: 'mb-3 sm:mb-4' },
                  React.createElement('img', {
                    src: selectedWinner.photo,
                    alt: `${selectedWinner.name} - Winner ${selectedWinner.year}`,
                    className: 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full mx-auto object-cover border-3 border-amber-500 shadow-lg'
                  })
                ),
                React.createElement('div', { className: 'flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4' },
                  React.createElement('div', { className: 'text-2xl sm:text-3xl md:text-4xl' }, selectedWinner.trophy),
                  React.createElement('div', { className: 'bg-black text-yellow-400 rounded-full px-2 py-1 sm:px-3 sm:py-1 text-sm sm:text-base md:text-lg font-bold border border-white/10' },
                    selectedWinner.year
                  )
                ),
                React.createElement('h2', { className: 'text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3' },
                  selectedWinner.name
                ),
                React.createElement('p', { className: 'text-sm sm:text-base md:text-lg text-gray-300 font-semibold mb-2 sm:mb-3' },
                  selectedWinner.group
                ),
                React.createElement('div', { className: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm md:text-base font-bold mb-3 sm:mb-4 inline-block' },
                  selectedWinner.level
                ),
                React.createElement('div', { className: 'border-t border-white/10 pt-3 sm:pt-4' },
                  React.createElement('p', { className: 'text-xs sm:text-sm md:text-base text-gray-400 mb-1 sm:mb-2' }, 'Winning Word:'),
                  React.createElement('p', { className: 'text-base sm:text-lg md:text-xl font-bold text-white' },
                    `"${selectedWinner.winningWord}"`
                  )
                )
              )
            )
          ),

          React.createElement('div', { className: 'mt-12 bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white border-opacity-15' },
            React.createElement('h2', { className: 'text-2xl font-bold text-yellow-400 mb-6 text-center' },
              'Wettbewerbsstatistiken'
            ),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 text-center' },
              React.createElement('div', { className: 'bg-gradient-to-br from-black to-gray-800 rounded-xl p-4 border border-white/10 shadow-lg' },
                React.createElement('div', { className: 'text-3xl font-bold text-yellow-400' }, '150+'),
                React.createElement('p', { className: 'text-white font-semibold' }, 'Teilnehmer insgesamt')
              ),
              React.createElement('div', { className: 'bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-xl p-4 border border-red-500/30 shadow-lg' },
                React.createElement('div', { className: 'text-3xl font-bold text-red-500' }, '25'),
                React.createElement('p', { className: 'text-white font-semibold' }, 'Teilnehmende Schulen')
              ),
              React.createElement('div', { className: 'bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-xl p-4 border border-yellow-400/20 shadow-lg' },
                React.createElement('div', { className: 'text-3xl font-bold text-yellow-400' }, '500+'),
                React.createElement('p', { className: 'text-white font-semibold' }, 'Buchstabierte Wörter')
              )
            )
          ),

          React.createElement('div', { className: 'mt-8 text-center' },
            React.createElement('div', { className: 'bg-black/60 backdrop-blur-md text-yellow-400 rounded-2xl p-6 inline-block border border-white/10 shadow-lg' },
              React.createElement('h3', { className: 'text-xl font-bold mb-2' }, 'Nächster Wettbewerb'),
              React.createElement('p', { className: 'text-lg' }, 'Frühling 2025'),
              React.createElement('p', { className: 'text-sm mt-2' }, 'Die Registrierung öffnet im Januar 2025')
            )
          )

        )
      );
    };

    const InstructionsScreen = () => {
      const toggleSection = (sect) => {
        setExpandedSection(expandedSection === sect ? null : sect);
      };

      return React.createElement('div', { className: 'min-h-screen p-4 sm:p-8 flex items-center justify-center' },
        React.createElement('div', { className: 'max-w-5xl w-full bg-black bg-opacity-40 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-white border-opacity-15 relative min-h-[500px] flex flex-col md:flex-row gap-8 animate-fadeIn' },
          
          React.createElement('button', {
            onClick: () => setCurrentScreen('home'),
            className: 'absolute top-4 left-4 bg-black text-yellow-400 p-2 sm:p-3 rounded-full hover:bg-yellow-600 hover:text-black transition-all duration-300 shadow-lg transform hover:scale-110 z-10 border border-white/10'
          }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),

          // Left Panel: Hexagonal badges selector
          React.createElement('div', { className: 'w-full md:w-48 flex flex-row md:flex-col justify-center items-center gap-4 mt-8 md:mt-0 flex-wrap' },
            
            // Hexagon 1: Objective
            React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
              React.createElement('button', {
                onClick: () => toggleSection('objective'),
                className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                  expandedSection === 'objective' ? 'bg-green-500 text-black border-green-600' : ''
                }`,
                style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
              }, 
                React.createElement('div', { className: 'text-2xl mb-1' }, '🎯'),
                React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Ziel')
              )
            ),

            // Hexagon 2: Levels
            React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
              React.createElement('button', {
                onClick: () => toggleSection('levels'),
                className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                  expandedSection === 'levels' ? 'bg-green-500 text-black border-green-600' : ''
                }`,
                style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
              }, 
                React.createElement('div', { className: 'text-2xl mb-1' }, '📚'),
                React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Stufen')
              )
            ),

            // Hexagon 3: Modes
            React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
              React.createElement('button', {
                onClick: () => toggleSection('modes'),
                className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                  expandedSection === 'modes' ? 'bg-green-500 text-black border-green-600' : ''
                }`,
                style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
              }, 
                React.createElement('div', { className: 'text-2xl mb-1' }, '🎮'),
                React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Modi')
              )
            ),

            // Hexagon 4: How to Play
            React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
              React.createElement('button', {
                onClick: () => toggleSection('howToPlay'),
                className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                  expandedSection === 'howToPlay' ? 'bg-green-500 text-black border-green-600' : ''
                }`,
                style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
              }, 
                React.createElement('div', { className: 'text-2xl mb-1' }, '🎲'),
                React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Ablauf')
              )
            ),

            // Hexagon 5: Features
            React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
              React.createElement('button', {
                onClick: () => toggleSection('features'),
                className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                  expandedSection === 'features' ? 'bg-green-500 text-black border-green-600' : ''
                }`,
                style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
              }, 
                React.createElement('div', { className: 'text-2xl mb-1' }, '🔧'),
                React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Features')
              )
            )

          ),

          // Right Panel: Expanded detailed content
          React.createElement('div', { className: 'flex-1 mt-6 md:mt-8' },
            !expandedSection && React.createElement('div', { className: 'flex items-center justify-center h-full text-center' },
              React.createElement('div', null,
                React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🐝'),
                React.createElement('h3', { className: 'text-2xl font-black text-white mb-2' }, 'Wähle einen Bereich'),
                React.createElement('p', { className: 'text-gray-300 font-semibold' }, 'Klicke auf ein Sechseck links, um Details anzuzeigen.')
              )
            ),

            expandedSection === 'objective' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
              React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                React.createElement('span', null, '🎯'), 'Spielziel'
              ),
              React.createElement('p', { className: 'text-gray-200 leading-relaxed font-semibold text-base sm:text-lg' },
                'Das Ziel dieses Spiels ist es, deine Rechtschreibkompetenz im Deutschen spielerisch zu stärken. Durch Zuhören der Aussprache und das Eintippen der korrekten Schreibweise verbesserst du dein Sprachgefühl und Wortverständnis.'
              )
            ),

            expandedSection === 'levels' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
              React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                React.createElement('span', null, '📚'), 'Verfügbare Stufen'
              ),
              React.createElement('ul', { className: 'space-y-4 font-semibold text-gray-200 text-sm sm:text-base' },
                React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                  React.createElement('span', { className: 'w-4 h-4 bg-emerald-500 rounded-full mr-3 mt-1' }),
                  React.createElement('div', null,
                    React.createElement('strong', { className: 'text-yellow-400' }, 'Stufe A: '), 'A1, A2, KET - Grundwörter'
                  )
                ),
                React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                  React.createElement('span', { className: 'w-4 h-4 bg-blue-500 rounded-full mr-3 mt-1' }),
                  React.createElement('div', null,
                    React.createElement('strong', { className: 'text-yellow-400' }, 'Stufe B: '), 'B1, B1+, PET - Mittlere Wörter'
                  )
                ),
                React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                  React.createElement('span', { className: 'w-4 h-4 bg-purple-500 rounded-full mr-3 mt-1' }),
                  React.createElement('div', null,
                    React.createElement('strong', { className: 'text-yellow-400' }, 'Stufe C: '), 'B2, C1, C2, FC, CAE - Fortgeschrittene Wörter'
                  )
                )
              )
            ),

            expandedSection === 'modes' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
              React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                React.createElement('span', null, '🎮'), 'Spielmodi'
              ),
              React.createElement('ul', { className: 'space-y-4 font-semibold text-gray-200 text-sm sm:text-base' },
                React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                  React.createElement('span', { className: 'w-4 h-4 bg-emerald-500 rounded-full mr-3 mt-1' }),
                  React.createElement('div', null,
                    React.createElement('strong', { className: 'text-yellow-400' }, 'Wettbewerb: '), 'Spiele gegen die Zeit (30 Sek.) mit maximal 3 Fehlern.'
                  )
                ),
                React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                  React.createElement('span', { className: 'w-4 h-4 bg-blue-500 rounded-full mr-3 mt-1' }),
                  React.createElement('div', null,
                    React.createElement('strong', { className: 'text-yellow-400' }, 'Training: '), 'Übe frei und ohne Zeitlimit, schaue dir Definitionen und Sätze an.'
                  )
                )
              )
            ),

            expandedSection === 'howToPlay' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn overflow-y-auto max-h-[380px]' },
              React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                React.createElement('span', null, '🎲'), 'Spielablauf'
              ),
              React.createElement('ol', { className: 'space-y-3 font-semibold text-gray-200 text-sm sm:text-base list-decimal pl-4' },
                React.createElement('li', null, 'Wähle dein Schwierigkeitslevel (A, B oder C).'),
                React.createElement('li', null, 'Wähle zwischen Wettbewerb oder Training.'),
                React.createElement('li', null, 'Zuhöre dem Wort, indem du auf die Aussprache-Schaltfläche klickst.'),
                React.createElement('li', null, 'Gib die korrekte Schreibweise im Eingabefeld ein (oder buchstabiere per Mikrofon).'),
                React.createElement('li', null, 'Nutze die Hilfen wie Definitionen oder Beispielsätze im Trainingsmodus.'),
                React.createElement('li', null, 'Tippe auf Bestätigen, um deine Antwort auszuwerten.')
              )
            ),

            expandedSection === 'features' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
              React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                React.createElement('span', null, '🔧'), 'Technische Features'
              ),
              React.createElement('ul', { className: 'space-y-2.5 font-semibold text-gray-200 text-sm sm:text-base' },
                React.createElement('li', null, '• Native Sprachsynthese mit Unterstützung für deutsche Dialekte.'),
                React.createElement('li', null, '• Sprach-zu-Text-Erkennung mit Unterstützung für Diktieren.'),
                React.createElement('li', null, '• Dynamischer Tages-/Nachtmodus mit kosmetischen Anpassungen.'),
                React.createElement('li', null, '• CSV-Export zum Herunterladen vollständiger Vokabellisten.'),
                React.createElement('li', null, '• Premium Glassmorphismus-Design mit flexiblen Animationen.')
              )
            )
          )

        )
      );
    };

    const NavigationBar = () => {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, color: '#FFE259', opacity: 0 });

      const isDay = themeConfig.mode === 'day';
      const navItems = [
        { id: 'home', color: isDay ? '#D97706' : '#FFD54F' },
        { id: 'contest', color: isDay ? '#7C3AED' : '#BA68C8' },
        { id: 'training', color: isDay ? '#0284C7' : '#29B6F6' },
        { id: 'instructions', color: isDay ? '#059669' : '#26A69A' },
        { id: 'winners', color: isDay ? '#D97706' : '#FFD54F' }
      ];

      const getActiveItemId = () => {
        if (currentScreen === 'home') return 'home';
        if (currentScreen === 'menu' && gameMode === 'contest') return 'contest';
        if ((currentScreen === 'menu' || currentScreen === 'wordList') && gameMode === 'training') return 'training';
        if (currentScreen === 'instructions') return 'instructions';
        if (currentScreen === 'winners') return 'winners';
        return null;
      };

      useEffect(() => {
        const timer = setTimeout(() => {
          const container = document.getElementById('desktop-nav-menu');
          if (!container) return;
          const activeEl = container.querySelector('.active-nav-btn');
          if (activeEl) {
            const left = activeEl.offsetLeft;
            const width = activeEl.offsetWidth;
            const activeId = getActiveItemId();
            const activeItem = navItems.find(item => item.id === activeId);
            const color = activeItem ? activeItem.color : '#FFE259';
            
            setIndicatorStyle({
              left: left + (width * 0.15),
              width: width * 0.7,
              color: color,
              opacity: 1
            });
          } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
          }
        }, 50);
        return () => clearTimeout(timer);
      }, [currentScreen, gameMode, windowWidth, themeConfig.mode]);

      const getNavLinkClass = (screenName, extraCheck = null, glowClass = '') => {
        const isActive = extraCheck 
          ? (currentScreen === screenName && extraCheck()) 
          : currentScreen === screenName;
        return `nav-item-btn-glass ${glowClass} px-5 py-2.5 font-bold text-[15px] lg:text-base relative ${
          isActive 
            ? 'active-nav-btn text-white' 
            : 'text-gray-300'
        }`;
      };

      const handleAdminAccess = () => {
        const pass = prompt("Admin-Passwort:");
        if (pass === atob('MTQxNTEzMA==')) {
          setIsAdminLogged(true);
          setCurrentScreen('admin');
          setIsMenuOpen(false);
        } else if (pass !== null) {
          alert("Falsches Passwort");
        }
      };

      const toggleThemeMode = () => {
        setThemeConfig(prev => {
          const newMode = prev.mode === 'night' ? 'day' : 'night';
          localStorage.setItem('bee_de_theme', newMode);
          return { ...prev, mode: newMode };
        });
      };

      return React.createElement('nav', {
        className: 'floating-nav-capsule relative px-6 py-3',
        style: { zIndex: 1000 }
      },
        React.createElement('div', { className: 'w-full flex justify-between items-center' },
          React.createElement('div', { className: 'flex items-center gap-3 cursor-pointer', onClick: () => { setGameMode(null); setCurrentScreen('home'); } },
            React.createElement('div', { className: 'relative w-9 h-9 flex items-center justify-center' },
              React.createElement('div', {
                className: 'absolute inset-0 bg-black border border-yellow-400 border-opacity-70 flex items-center justify-center',
                style: {
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }
              },
                React.createElement('img', {
                  src: 'IMG/Abeja.png',
                  alt: 'Logo Bee',
                  className: 'w-8 h-8 object-contain filter drop-shadow-[0_2px_8px_rgba(253,224,71,0.45)]'
                })
              )
            ),
            React.createElement('span', { className: 'font-black text-sm sm:text-base tracking-wider text-white' },
              'BUCHSTABIER ',
              React.createElement('span', { className: 'text-yellow-400' }, 'BEE')
            )
          ),

          // Menu navigation Links
          React.createElement('div', { 
            id: 'desktop-nav-menu',
            className: 'hidden md:flex items-center gap-2 sm:gap-4 relative py-2 text-xs font-bold uppercase tracking-widest' 
          },
            React.createElement('button', {
              onClick: () => { setGameMode(null); setCurrentScreen('home'); },
              className: getNavLinkClass('home', null, 'card-winners-glow')
            }, 'Start'),
            React.createElement('button', {
              onClick: () => { setGameMode('contest'); setCurrentScreen('menu'); },
              className: getNavLinkClass('menu', () => gameMode === 'contest', 'card-contest-glow')
            }, 'Wettbewerb'),
            React.createElement('button', {
              onClick: () => { setGameMode('training'); setCurrentScreen('menu'); },
              className: getNavLinkClass('menu', () => gameMode === 'training', 'card-training-glow')
            }, 'Training'),
            React.createElement('button', {
              onClick: () => setCurrentScreen('instructions'),
              className: getNavLinkClass('instructions', null, 'card-instructions-glow')
            }, 'Anleitung'),
            React.createElement('button', {
              onClick: () => setCurrentScreen('winners'),
              className: getNavLinkClass('winners', null, 'card-winners-glow')
            }, 'Winners'),
            
            // Day/Night switch
            React.createElement('button', {
              onClick: toggleThemeMode,
              className: 'nav-item-btn-glass p-2 text-base transition-all flex items-center justify-center flex-shrink-0',
              style: { width: '38px', height: '38px' }
            }, themeConfig.mode === 'night' ? '🌙' : '☀️'),
            
            // Other language link
            React.createElement('a', {
              href: 'https://spellingbee-portal.vercel.app/',
              className: 'nav-item-btn-glass px-4 py-2 text-yellow-400 hover:text-black hover:bg-yellow-400 transition-all duration-300 rounded-lg flex items-center gap-1 font-bold text-[11px] tracking-widest uppercase border border-dashed border-yellow-400/30'
            }, '🌐 Andere Sprache?'),

            // Dynamic Sliding Indicator
            React.createElement('div', {
              className: 'absolute transition-all duration-300 ease-out pointer-events-none',
              style: {
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                height: '2.5px',
                bottom: '4px',
                backgroundColor: indicatorStyle.color,
                boxShadow: `0 0 10px ${indicatorStyle.color}, 0 0 18px ${indicatorStyle.color}80`,
                borderRadius: '99px',
                opacity: indicatorStyle.opacity,
                transform: `scaleX(${indicatorStyle.opacity})`,
                transitionProperty: 'left, width, background-color, box-shadow, opacity, transform'
              }
            },
              // Dot centered below the line
              React.createElement('div', {
                className: 'absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 ease-out',
                style: {
                  width: '6px',
                  height: '6px',
                  bottom: '-10px',
                  backgroundColor: indicatorStyle.color,
                  boxShadow: `0 0 8px ${indicatorStyle.color}, 0 0 14px ${indicatorStyle.color}80`,
                }
              })
            )
          ),

          // Right Actions
          React.createElement('div', { className: 'hidden md:flex items-center gap-3' },
            React.createElement('button', {
              onClick: handleAdminAccess,
              className: 'btn-admin-glass'
            }, '🛠️ Admin')
          ),

          // Mobile hamburger button
          React.createElement('button', {
            onClick: () => setIsMenuOpen(!isMenuOpen),
            className: 'md:hidden text-white hover:text-yellow-400 transition-colors duration-300 p-2'
          },
            React.createElement('div', { className: 'w-6 h-6 flex flex-col justify-center items-center' },
              React.createElement('span', { className: `block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}` }),
              React.createElement('span', { className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}` }),
              React.createElement('span', { className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}` })
            )
          )
        ),

        // Mobile drawer overlay menu
        isMenuOpen && React.createElement('div', { className: 'md:hidden absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-lg border border-yellow-400/20 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl z-50 text-xs font-bold text-gray-300 uppercase tracking-widest animate-slideDown' },
          React.createElement('button', {
            onClick: () => { setGameMode(null); setCurrentScreen('home'); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors'
          }, 'Startseite'),
          React.createElement('button', {
            onClick: () => { setGameMode('contest'); setCurrentScreen('menu'); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors'
          }, 'Wettbewerb'),
          React.createElement('button', {
            onClick: () => { setGameMode('training'); setCurrentScreen('menu'); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors'
          }, 'Training'),
          React.createElement('button', {
            onClick: () => { setCurrentScreen('instructions'); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors'
          }, 'Anleitung'),
          React.createElement('button', {
            onClick: () => { setCurrentScreen('winners'); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors'
          }, 'Winners'),
          React.createElement('a', {
            href: 'https://spellingbee-portal.vercel.app/',
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors block border border-dashed border-yellow-400/30 mt-1 text-yellow-400'
          }, 'Andere Sprache? 🌐'),
          React.createElement('button', {
            onClick: () => { toggleThemeMode(); setIsMenuOpen(false); },
            className: 'w-full py-2.5 text-center hover:bg-yellow-400 hover:text-black rounded-lg transition-colors flex items-center justify-center gap-2'
          },
            themeConfig.mode === 'night' ? '🌙 MOND' : '☀️ SONNE'
          ),
          React.createElement('div', { className: 'h-[1px] bg-yellow-400/20 my-1' }),
          React.createElement('button', {
            onClick: handleAdminAccess,
            className: 'w-full bg-yellow-400 text-black py-2.5 rounded-lg text-center font-black shadow-md hover:bg-yellow-300'
          }, '🛠️ Admin')
        )
      );
    };

    const AdminScreen = () => {
      return React.createElement('div', { className: 'min-h-screen bg-gray-900 text-white p-6 sm:p-10 flex flex-col justify-between' },
        React.createElement('div', { className: 'max-w-4xl mx-auto w-full' },
          React.createElement('div', { className: 'flex justify-between items-center mb-8 border-b border-gray-800 pb-5' },
            React.createElement('h1', { className: 'text-3xl font-black text-yellow-400 tracking-wide' }, '⚙️ ADMIN DASHBOARD'),
            React.createElement('button', {
              onClick: () => { setIsEditMode(false); setCurrentScreen('home'); },
              className: 'bg-black text-yellow-400 hover:bg-yellow-600 hover:text-black px-4 py-2 rounded-xl font-bold transition-all border border-yellow-400'
            }, 'Verlassen')
          ),

          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            
            // Box 1: Voice settings
            React.createElement('div', { className: 'bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl' },
              React.createElement('h2', { className: 'text-xl font-bold mb-4 text-white' }, 'Sprachsynthese (TTS)'),
              React.createElement('label', { className: 'block text-xs font-semibold text-gray-400 uppercase mb-2' }, 'Verfügbare Stimmen (Deutsch)'),
              availableVoices.length === 0 
                ? React.createElement('p', { className: 'text-red-400 font-semibold text-sm' }, 'Keine Stimmen auf Deutsch gefunden. Installiere de-DE Pakete.')
                : React.createElement('select', {
                    value: selectedVoice ? selectedVoice.name : '',
                    onChange: (e) => setSelectedVoice(availableVoices.find(v => v.name === e.target.value)),
                    className: 'w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400'
                  },
                    availableVoices.map(v => React.createElement('option', { key: v.name, value: v.name }, `${v.name} (${v.lang})`))
                  ),
              React.createElement('button', {
                onClick: () => speak('Guten Tag, das ist eine Test-Aussprache auf Deutsch.'),
                className: 'mt-5 w-full bg-yellow-400 text-black font-extrabold py-3 px-4 rounded-xl hover:bg-yellow-300 transition shadow'
              }, 'Aussprache testen')
            ),

            // Box 2: Visual Adjustments Coordinates
            React.createElement('div', { className: 'bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl' },
              React.createElement('h2', { className: 'text-xl font-bold mb-4 text-white' }, 'Visueller Editor'),
              React.createElement('p', { className: 'text-gray-400 text-sm leading-relaxed mb-5' },
                'Aktivieren Sie den visuellen Drag-and-Drop Editor, um die Positionen und Skalierung der Elemente live anzupassen.'
              ),
              React.createElement('button', {
                onClick: () => { setIsEditMode(!isEditMode); setCurrentScreen('home'); },
                className: `w-full font-extrabold py-3.5 px-4 rounded-xl shadow transition-all ${
                  isEditMode 
                    ? 'bg-red-500 text-white border-2 border-red-600 animate-pulse' 
                    : 'bg-green-500 text-white border-2 border-green-600 hover:bg-green-400'
                }`
              }, isEditMode ? '🛑 Editor deaktivieren' : '✏️ Editor aktivieren')
            )

          ),

          isEditMode && React.createElement('div', { className: 'mt-8 bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-6 text-center shadow-xl' },
            React.createElement('h3', { className: 'text-lg font-black text-yellow-400 mb-2' }, 'Änderungen dauerhaft speichern'),
            React.createElement('p', { className: 'text-gray-300 text-sm mb-4 leading-relaxed' },
              'Laden Sie die modifizierte HTML-Datei mit Ihren neuen Koordinaten herunter.'
            ),
            React.createElement('button', {
              onClick: saveHTML,
              className: 'bg-green-500 text-white hover:bg-green-400 font-extrabold py-3 px-8 rounded-xl shadow-lg border-2 border-green-600 transition'
            }, '💾 In HTML-Datei speichern')
          )
        )
      );
    };

    // Global background variables builder
    const globalBgStyle = {
      '--bg-image': themeConfig.mode === 'day' ? "url('../IMG/Tag.png')" : "url('../IMG/Nacht.png')",
      '--bg-opacity': themeConfig.bgOpacity,
      '--effect-speed': themeConfig.effectSpeed,
      '--bee-opacity': themeConfig.beeOpacity,
      '--sparkles-brightness': themeConfig.sparklesBrightness,
      '--sky-opacity': themeConfig.mode === 'day' ? 0 : 1
    };

    return React.createElement('div', {
      className: `font-sans spelling-home-bg ${themeConfig.mode === 'day' ? 'day-mode' : ''}`,
      style: globalBgStyle
    },
      // Stars particle overlays for night mode
      currentScreen !== 'home' && React.createElement(StarrySky),
      currentScreen !== 'home' && React.createElement(Fireflies),
      currentScreen !== 'home' && React.createElement(Comets),

      // Floating top capsule navigation bar (visible unless in game screen)
      currentScreen !== 'game' && currentScreen !== 'wordList' && currentScreen !== 'admin' && React.createElement(NavigationBar),

      // Screen router
      currentScreen === 'home' && React.createElement(HomeScreen),
      currentScreen === 'menu' && React.createElement(MenuScreen),
      currentScreen === 'game' && React.createElement(GameScreen),
      currentScreen === 'wordList' && React.createElement(WordListScreen),
      currentScreen === 'instructions' && React.createElement(InstructionsScreen),
      currentScreen === 'winners' && React.createElement(WinnersScreen),
      currentScreen === 'admin' && React.createElement(AdminScreen),

      // Edit Mode banner overlay helper
      isEditMode && currentScreen !== 'admin' && React.createElement('div', { className: 'fixed bottom-4 left-4 bg-yellow-400 text-black py-2.5 px-5 rounded-2xl font-black text-sm border-2 border-black shadow-2xl z-50 animate-bounce flex items-center gap-2' },
        React.createElement('span', null, '✏️ Editor Aktiv'),
        React.createElement('button', {
          onClick: saveHTML,
          className: 'bg-black text-white px-3 py-1 rounded-xl text-xs hover:bg-gray-800'
        }, 'Speichern'),
        React.createElement('button', {
          onClick: () => { setIsEditMode(false); setCurrentScreen('admin'); },
          className: 'bg-red-600 text-white px-3 py-1 rounded-xl text-xs hover:bg-red-700'
        }, 'X')
      )
    );
  };

  // Mount React 18 Application
  const container = document.getElementById('root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(SpellingBeeGame));
  }
})();
