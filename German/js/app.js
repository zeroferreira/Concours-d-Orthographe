    const { useState, useEffect, useRef } = React;

    // Iconos como componentes simples
    const Play = () => React.createElement('span', null, '▶️');
      const Book = () => React.createElement('span', null, '📚');
      const Info = () => React.createElement('span', null, 'ℹ️');
      const ArrowLeft = () => React.createElement('span', null, '⬅️');
      const Shuffle = () => React.createElement('span', null, '🔀');
      const RotateCcw = () => React.createElement('span', null, '🔄');
      const Volume2 = () => React.createElement('span', null, '🔊');
      const Home = () => React.createElement('span', null, '🏠');
      const Menü = () => React.createElement('span', null, '📋');
      const Game = () => React.createElement('span', null, '🎮');

    
    
    // === DYNAMIC TRANSFORMS WRAPPER (PRECISE COORDINATES SYSTEM) ===
    const TransformWrapper = ({ id, config, isEditMode, onConfigChange, children, className }) => {
      const [windowSize, setWindowSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
      React.useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      const windowWidth = windowSize.width;
      const windowHeight = windowSize.height;
      const isDesktop = windowWidth >= 1024;

      const state = config[id] || { x: 0, y: 0, scale: 1 };
      const containerRef = React.useRef(null);
      const dragData = React.useRef({ isDragging: false, isScaling: false, startX: 0, startY: 0, startConfig: null });

      React.useEffect(() => {
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
        const refHeight = 900;
        const widthFactor = windowWidth / refWidth;
        const heightFactor = windowHeight / refHeight;
        const factor = Math.min(1.8, Math.min(widthFactor, heightFactor));
        displayScale = state.scale * factor;
        displayX = state.x * factor;

        if (id === 'bee') {
          const distanceFromBottom = refHeight - state.y;
          displayY = windowHeight - (distanceFromBottom * factor);
          displayY = Math.max(state.y * 0.8, Math.min(windowHeight - 150, displayY));
        } else {
          displayY = state.y * factor;
        }

        const containerWidth = 1380;
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
          transformOrigin: 'top left',
          zIndex: isEditMode ? 100 : (id === 'bee' ? 0 : 10),
          width: 'max-content',
          height: 'max-content'
        }
      },
        React.createElement('div', { 
          onMouseDown: handleMouseDown,
          style: { 
            pointerEvents: 'auto', 
            width: '100%', 
            height: '100%',
            cursor: isEditMode ? 'move' : 'auto',
            border: isEditMode ? '2px dashed rgba(255, 255, 255, 0.4)' : 'none',
            backgroundColor: isEditMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            boxSizing: 'border-box',
            position: 'relative'
          } 
        }, 
          children,
          isEditMode && React.createElement('div', {
            onMouseDown: handleScaleMouseDown,
            title: 'Glisser pour redimensionner',
            style: {
              position: 'absolute',
              bottom: '-12px',
              right: '-12px',
              width: '24px',
              height: '24px',
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


    // === ANIMATED BACKDROP & PARTICLES EMITTERS ===
    const StarrySky = () => {
      const [stars, setStars] = React.useState([]);
      React.useEffect(() => {
        const newStars = Array.from({ length: 40 }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 65}%`,
          size: `${Math.random() * 2.5 + 1}px`,
          speed: `${Math.random() * 8 + 4}s`,
          dx: `${Math.random() * 40 - 20}px`,
          dy: `${Math.random() * 40 - 20}px`
        }));
        setStars(newStars);
      }, []);
      return React.createElement('div', { className: 'absolute inset-0 pointer-events-none overflow-hidden z-0' },
        stars.map(star => React.createElement('div', {
          key: star.id,
          className: 'star-element',
          style: {
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            '--speed': star.speed,
            '--dx': star.dx,
            '--dy': star.dy
          }
        }))
      );
    };

    const Fireflies = () => {
      const [flies, setFlies] = React.useState([]);
      React.useEffect(() => {
        const newFlies = Array.from({ length: 25 }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${60 + Math.random() * 35}%`,
          speed: `${Math.random() * 6 + 4}s`,
          dx: `${Math.random() * 160 - 80}px`,
          dy: `${Math.random() * -120 - 40}px`
        }));
        setFlies(newFlies);
      }, []);
      return React.createElement('div', { className: 'absolute inset-0 pointer-events-none overflow-hidden z-0' },
        flies.map(fly => React.createElement('div', {
          key: fly.id,
          className: 'firefly-element',
          style: {
            left: fly.left,
            top: fly.top,
            '--speed': fly.speed,
            '--dx': fly.dx,
            '--dy': fly.dy
          }
        }))
      );
    };

    const Comets = () => {
      const [comets, setComets] = React.useState([]);
      React.useEffect(() => {
        const newComets = Array.from({ length: 4 }).map((_, i) => ({
          id: i,
          top: `${Math.random() * 40}%`,
          left: `${Math.random() * 50 + 50}%`,
          speed: `${Math.random() * 15 + 15}s`,
          delay: `${Math.random() * 20}s`
        }));
        setComets(newComets);
      }, []);
      return React.createElement('div', { className: 'absolute inset-0 pointer-events-none overflow-hidden z-0' },
        comets.map(comet => React.createElement('div', {
          key: comet.id,
          className: 'comet-element',
          style: {
            top: comet.top,
            left: comet.left,
            '--speed': comet.speed,
            animationDelay: comet.delay
          }
        }))
      );
    };

    const ThemeSettingsModal = ({ showThemeModal, setShowThemeModal, themeConfig, setThemeConfig }) => {
      if (!showThemeModal) return null;
      return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-[#1a1625] bg-opacity-95 border border-purple-500 border-opacity-30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-white' },
          React.createElement('button', {
            onClick: () => setShowThemeModal(false),
            className: 'absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold'
          }, '✕'),
          React.createElement('h2', { className: 'text-2xl font-bold mb-6 flex items-center gap-2' }, '⚙️ Paramètres Visuels'),
          
          // Speed Slider
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Vitesse des animations (arrière-plan, lumières)'),
            React.createElement('input', {
              type: 'range', min: '0.1', max: '3', step: '0.1',
              value: themeConfig.effectSpeed,
              onChange: (e) => setThemeConfig(p => ({ ...p, effectSpeed: parseFloat(e.target.value) })),
              className: 'w-full accent-purple-500'
            })
          ),
          
          // Universe Opacity
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, "Opacité de l'univers"),
            React.createElement('input', {
              type: 'range', min: '0', max: '1', step: '0.05',
              value: themeConfig.bgOpacity,
              onChange: (e) => setThemeConfig(p => ({ ...p, bgOpacity: parseFloat(e.target.value) })),
              className: 'w-full accent-blue-500'
            })
          ),
          
          // Bee Opacity
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, "Opacité de l'abeille"),
            React.createElement('input', {
              type: 'range', min: '0', max: '1', step: '0.05',
              value: themeConfig.beeOpacity,
              onChange: (e) => setThemeConfig(p => ({ ...p, beeOpacity: parseFloat(e.target.value) })),
              className: 'w-full accent-yellow-400'
            })
          ),
          
          // Sparkles Brightness
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, "Luminosité des étincelles (lucioles)"),
            React.createElement('input', {
              type: 'range', min: '0', max: '2', step: '0.1',
              value: themeConfig.sparklesBrightness,
              onChange: (e) => setThemeConfig(p => ({ ...p, sparklesBrightness: parseFloat(e.target.value) })),
              className: 'w-full accent-white'
            })
          )
        )
      );
    };

    const SpielRechtschreibung = () => {

    // Theme and Visual Settings State
    
    // Admin & Precise Layout States
    const [isAdminLogged, setIsAdminLogged] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [themeConfig, setThemeConfig] = useState({
      mode: localStorage.getItem('bee_de_theme') || 'night',
      effectSpeed: 1,
      bgOpacity: 1,
      beeOpacity: 1,
      sparklesBrightness: 1
    });
    const [showThemeModal, setShowThemeModal] = useState(false);

    const [currentScreen, setCurrentScreen] = useState('home');
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [gameMode, setGameMode] = useState(null);
    const [currentWord, setCurrentWord] = useState(null);
    const [usedWords, setUsedWords] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);
    const [showDefinition, setShowDefinition] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [currentExample, setCurrentExample] = useState('');
    const [currentDefinition, setCurrentDefinition] = useState('');
    // Agregar este nuevo estado
    const [isMenüOpen, setIsMenüOpen] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [recognitionReady, setRecognitionReady] = useState(false);
    const [shouldKeepListening, setShouldKeepListening] = useState(false);
    const [permissionsRequested, setPermissionsRequested] = useState(false);
    const [recognitionConfidence, setRecognitionConfidence] = useState(0);
    const [lastRecognizedText, setLastRecognizedText] = useState('');
    const [filterSensitivity, setFilterSensitivity] = useState('medium');

    // Estados para el sistema de Ayuda y Reportes (Hilfe et Berichte)
    const [showHelpMenü, setShowHelpMenü] = useState(false);
    const [helpModalType, setHelpModalType] = useState(null); // 'report' o 'suggestion'
    const [helpDocked, setHelpDocked] = useState(false);
    const [reports, setReports] = useState(() => JSON.parse(localStorage.getItem('bee_de_reports') || '[]'));
    const [suggestions, setVorschläge] = useState(() => JSON.parse(localStorage.getItem('bee_de_suggestions') || '[]'));
    
    const [reportForm, setReportForm] = useState({ category: '', part: '', description: '' });
    const [suggestionForm, setSuggestionForm] = useState({ description: '' });

    // Guardar en localStorage cuando cambien los datos
    useEffect(() => {
      localStorage.setItem('bee_de_reports', JSON.stringify(reports));
    }, [reports]);

    useEffect(() => {
      localStorage.setItem('bee_de_suggestions', JSON.stringify(suggestions));
    }, [suggestions]);

    const getFilterThreshold = () => {
      switch(filterSensitivity) {
        case 'low': return 0.5;    // Más permisivo
        case 'medium': return 0.7; // Balanceado
        case 'high': return 0.9;   // Más estricto
        default: return 0.7;
      }
    };


    
    // Referencias para acceder a los valores actuales en los callbacks
    const currentWordRef = useRef(null);
    const shouldKeepListeningRef = useRef(false);


    // Cargar voces disponibles (Integrado con ResponsiveVoice Premium y voces nativas)
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
            setSelectedVoice(prev => prev || voices[0]);
          }
        }
      };
      
      loadVoices();
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Intentar recargar voces después de 1.5s en caso de que ResponsiveVoice cargue asíncronamente
      const timer = setTimeout(loadVoices, 1500);
      return () => clearTimeout(timer);
    }, []);



    // Configuración optimizada para móviles
    const optimizeForMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Configuraciones específicas para móviles
        return {
          continuous: false, // Mejor para móviles
          interimResults: true,
          maxAlternatives: 3, // Reducir para mejor rendimiento
          timeouts: {
            restart: 2000,
            retry: 3000,
            error: 1500
          }
        };
      }
      
      return {
        continuous: true,
        interimResults: true,
        maxAlternatives: 5,
        timeouts: {
          restart: 300,
          retry: 1000,
          error: 500
        }
      };
    };

    // Función de reconocimiento con procesamiento inmediato
    const initSpeechRecognition = () => {
      // Verificar protocolo
      if (location.protocol === 'file:') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          alert('⚠️ PROBLEMA DETECTADO:\n\nEl reconocimiento de voz no funciona en móviles cuando abres el archivo directamente.\n\nSOLUCIÓN:\n1. Usa un servidor local\n2. O sube el archivo a un hosting web');
          return null;
        }
      }
      
      // Verificación mejorada para dispositivos móviles
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          alert('Reconocimiento de voz no disponible en este dispositivo móvil. Intenta usar Chrome en Android o Safari en iOS.');
        } else {
          alert('Reconocimiento de voz no soportado. Usa Chrome o Edge.');
        }
        return null;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Obtener configuración optimizada
      const config = optimizeForMobile();
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Aplicar configuración base
      recognitionInstance.continuous = config.continuous;
      recognitionInstance.interimResults = config.interimResults;
      recognitionInstance.lang = 'de-DE';
      recognitionInstance.maxAlternatives = config.maxAlternatives;
      
      // Configuraciones específicas por dispositivo
      if (isMobile) {
        // Configuraciones adicionales para iOS
        if (isIOS) {
          recognitionInstance.maxAlternatives = 1; // iOS funciona mejor con 1
        }
        
        // Configurar gramática si está disponible
        try {
          const grammarList = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)();
          const alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z ä ö ü ß anton berta cäsar dora emil friedrich gustav heinrich ida julius kaufmann ludwig martha nordpol otto paula quelle richard samuel theodor ulrich viktor wilhelm xanthippe ypsilon zacharias löschen entfernen leer neu anfang vonvorn zurück delete clear';
          const grammar = '#JSGF V1.0; grammar letters; public <letter> = ' + alphabet + ';';
          grammarList.addFromString(grammar, 1);
          recognitionInstance.grammars = grammarList;
        } catch (e) {
          console.log('SpeechGrammarList no disponible:', e);
        }
      }
      
      // Configuraciones avanzadas de calidad
      try {
        // Intentar configuraciones de calidad de audio
        recognitionInstance.audioTrack = true;
        recognitionInstance.serviceURI = ''; // Forzar procesamiento local cuando sea posible
      } catch (e) {
        console.log('Configuraciones avanzadas no disponibles:', e);
      }
      
      let isManualStop = false;
      let lastProcessedLength = 0; // Para evitar procesar el mismo texto múltiples veces
      let noiseFilter = []; // Buffer para filtrar ruido
      let contextBuffer = ''; // Buffer de contexto para mejor precisión
      let confidenceThreshold = 0.3; // Umbral de confianza mínimo
      let detectedNoiseLevel = 0; // Nivel de ruido detectado
      
      // Umbral de confianza optimizado para inglés
      const getEnglishOptimizedThreshold = (context, noiseLevel, letterType) => {
        let baseThreshold = 0.65; // Más estricto por defecto
        
        // Ajustes específicos para tipos de letras
        const confusingLetters = ['b', 'd', 'p', 't', 'c', 's', 'f', 'v'];
        if (confusingLetters.includes(letterType)) {
          baseThreshold += 0.1; // Más estricto para letras confusas
        }
        
        // Ajustar según contexto de deletreo
        if (context && context.length > 2) {
          baseThreshold -= 0.05; // Ligeramente más tolerante con contexto
        }
        
        // Ajustar según nivel de ruido
        if (noiseLevel > 0.6) {
          baseThreshold += 0.15; // Mucho más estricto con ruido
        }
        
        // Límites seguros
        return Math.max(0.5, Math.min(0.85, baseThreshold));
      };
      
      recognitionInstance.onstart = () => {
        console.log('🎤 Reconocimiento INICIADO');
        setIsListening(true);
        setRecognitionReady(true);
        isManualStop = false;
        lastProcessedLength = 0;
      };
      
      // Variables para control de duplicación
      let processedContent = new Set();
      let lastFinalTranscript = '';
      
      recognitionInstance.onresult = (event) => {
        console.log('📝 Resultado recibido:', event.results);
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Procesar todos los resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Procesar resultados intermedios
        if (interimTranscript) {
          const currentText = interimTranscript.toLowerCase().trim();
          console.log('🔄 Texto intermedio:', currentText);
          
          if (currentText.length > lastProcessedLength) {
            const newPortion = currentText.substring(lastProcessedLength);
            const result = processSpokenInput(newPortion);
            
            if (result === 'DELETE') {
              setSpokenText(prev => prev.slice(0, -1));
              console.log('🗑️ Eliminando última letra');
            } else if (result === 'CLEAR') {
              setSpokenText('');
              console.log('🧹 Limpiando texto');
            } else if (result) {
              setSpokenText(prev => prev + result);
              console.log('🔤 Letras agregadas:', result);
            }
            lastProcessedLength = currentText.length;
          }
        }
        
        // Procesar resultados finales
        if (finalTranscript) {
          const currentText = finalTranscript.toLowerCase().trim();
          console.log('✅ Texto final:', currentText);
          
          if (currentText.length > lastProcessedLength) {
            const newPortion = currentText.substring(lastProcessedLength);
            const result = processSpokenInput(newPortion);
            
            if (result === 'DELETE') {
              setSpokenText(prev => prev.slice(0, -1));
            } else if (result === 'CLEAR') {
              setSpokenText('');
            } else if (result) {
              setSpokenText(prev => prev + result);
            }
          }
          lastProcessedLength = 0;
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ Error de reconocimiento:', event.error);
        
        const timeouts = optimizeForMobile().timeouts;
        
        switch(event.error) {
          case 'network':
            console.log('🌐 Error de red - usando modo offline');
            // En lugar de fallar, continuar sin conexión
            if (shouldKeepListening && !isManualStop) {
              setTimeout(() => {
                try {
                  recognitionInstance.start();
                } catch (error) {
                  console.log('Error al reiniciar después de error de red:', error);
                }
              }, timeouts.retry);
            }
            break;
            
          case 'not-allowed':
            const isMobileForPermission = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobileForPermission) {
              alert('Acceso al micrófono denegado. En dispositivos móviles:\n\n1. Ve a configuración del navegador\n2. Busca permisos de sitios web\n3. Permite el micrófono para este sitio\n4. Recarga la página');
            } else {
              alert('Acceso al micrófono denegado. Permite el acceso en la configuración.');
            }
            setShouldKeepListening(false);
            setIsListening(false);
            break;
            
          case 'no-speech':
            console.log('⚠️ No se detectó voz - continuando...');
            // No reiniciar para no-speech en modo continuo
            break;
            
          case 'audio-capture':
            const isMobileForAudio = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobileForAudio) {
              alert('Error de micrófono. En dispositivos móviles:\n\n1. Cierra otras apps que usen el micrófono\n2. Verifica que el micrófono no esté bloqueado\n3. Intenta reiniciar el navegador\n4. Asegúrate de tener buena conexión');
            } else {
              alert('Error de micrófono. Verifica que esté conectado y funcionando.');
            }
            setShouldKeepListening(false);
            setIsListening(false);
            break;
            
          case 'aborted':
            console.log('🛑 Reconocimiento abortado');
            if (shouldKeepListening && !isManualStop) {
              setTimeout(() => {
                try {
                  recognitionInstance.start();
                } catch (error) {
                  console.log('Error al reiniciar después de abort:', error);
                }
              }, timeouts.error);
            }
            break;
            
          default:
            console.log('❓ Error desconocido:', event.error, '- reintentando...');
            if (shouldKeepListening && !isManualStop) {
              setTimeout(() => {
                try {
                  recognitionInstance.start();
                } catch (error) {
                  console.log('Error al reiniciar después de error desconocido:', error);
                }
              }, timeouts.error);
            }
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('🔚 Reconocimiento terminado');
        
        // Limpiar variables de deduplicación al reiniciar
        processedContent.clear();
        lastFinalTranscript = '';
        
        if (shouldKeepListening && !isManualStop) {
          console.log('🔄 Reiniciando automáticamente...');
          const timeouts = optimizeForMobile().timeouts;
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          setTimeout(() => {
            try {
              recognitionInstance.start();
              lastProcessedLength = 0;
            } catch (error) {
              console.log('Error en reinicio automático:', error);
              // En móviles, intentar una vez más con delay adicional
              if (isMobile && shouldKeepListening) {
                setTimeout(() => {
                  try {
                    recognitionInstance.start();
                  } catch (e) {
                    console.log('Segundo intento fallido:', e);
                    setIsListening(false);
                    setShouldKeepListening(false);
                  }
                }, timeouts.retry);
              }
            }
          }, timeouts.restart);
        } else {
          setIsListening(false);
          setRecognitionReady(false);
          lastProcessedLength = 0;
        }
      };
      
      // Función para detener manualmente
      recognitionInstance.manualStop = () => {
        isManualStop = true;
        setShouldKeepListening(false);
        setIsListening(false); // ← Esta línea faltaba
        setRecognitionReady(false); // ← Agregar esta línea también
        setRecognitionConfidence(0); // Limpiar indicador de confianza
        setLastRecognizedText(''); // Limpiar último texto reconocido
        lastProcessedLength = 0;
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.error('Error al detener manualmente:', error);
        }
      };
      
      return recognitionInstance;
    };

    // Cleanup al desmontar el componente
    useEffect(() => {
      return () => {
        if (recognition) {
          setShouldKeepListening(false);
          try {
            recognition.stop();
          } catch (error) {
            console.error('Error en cleanup:', error);
          }
        }
      };
    }, [recognition]);



    // Función para mostrar ayuda de permisos
    const showPermissionHelp = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let helpMessage = '🎤 Para usar el reconocimiento de voz:\n\n';
      
      if (isMobile) {
        helpMessage += '📱 DISPOSITIVOS MÓVILES:\n';
        helpMessage += '1. Asegúrate de usar un navegador compatible\n';
        if (isIOS) {
          helpMessage += '   • iOS: Safari (recomendado)\n';
        } else if (isAndroid) {
          helpMessage += '   • Android: Chrome (recomendado)\n';
        }
        helpMessage += '2. Cuando aparezca el popup, presiona "Permitir"\n';
        helpMessage += '3. Cierra otras apps que usen el micrófono\n';
        helpMessage += '4. Verifica tu conexión a internet\n\n';
        helpMessage += '⚙️ Si sigue sin funcionar:\n';
        if (isIOS) {
          helpMessage += '• Ve a Configuración > Safari > Cámara y Micrófono\n';
        } else if (isAndroid) {
          helpMessage += '• Ve a Configuración > Apps > Chrome > Permisos\n';
        }
      } else {
        helpMessage += '💻 COMPUTADORA:\n';
        helpMessage += '1. Usa Chrome, Edge o Firefox\n';
        helpMessage += '2. Permite el acceso al micrófono\n';
        helpMessage += '3. Verifica que el micrófono funcione\n';
      }
      
      alert(helpMessage);
    };

    // Función de toggle mejorada
    const toggleListening = async () => {
      console.log('🔘 Toggle - Estado actual:', isListening);
      
      if (!recognition) {
        try {
          // Para móviles, solicitar permisos primero
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile) {
            // En móviles, intentar obtener permisos de micrófono primero
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log('✅ Permisos de micrófono obtenidos');
            } catch (permError) {
              console.error('❌ Error de permisos:', permError);
              alert('Para usar el reconocimiento de voz en móvil:\n\n1. Permite el acceso al micrófono\n2. Usa Chrome en Android o Safari en iOS\n3. Asegúrate de tener conexión a internet');
              return;
            }
          }
          
          // Crear nuevo reconocimiento
          const newRecognition = initSpeechRecognition();
          if (newRecognition) {
            setRecognition(newRecognition);
            setShouldKeepListening(true);
            
            // Iniciar con delay optimizado
          const config = optimizeForMobile();
          const startDelay = config.timeouts.error;
          setTimeout(() => {
            try {
              newRecognition.start();
              console.log('✅ Reconocimiento iniciado');
            } catch (error) {
              console.error('Error en inicio:', error);
              alert('Error al iniciar reconocimiento. Intenta de nuevo.');
            }
          }, startDelay);
          }
          return;
        } catch (error) {
          console.error('Error general:', error);
          alert('Error al acceder al micrófono. Verifica los permisos en tu navegador.');
        }
        return;
      }
      
      // Resto de la función para cuando ya existe recognition
      if (isListening) {
        console.log('⏹️ DETENIENDO reconocimiento...');
        recognition.manualStop();
      } else {
        console.log('▶️ INICIANDO reconocimiento...');
        setShouldKeepListening(true);
        
        try {
          recognition.start();
        } catch (error) {
          console.error('Error al iniciar:', error);
          
          if (error.name === 'InvalidStateError') {
            try {
              recognition.stop();
              const timeouts = optimizeForMobile().timeouts;
              setTimeout(() => {
                recognition.start();
              }, timeouts.error);
            } catch (e) {
              console.error('Error en reinicio forzado:', e);
            }
          }
        }
      }
    };





    // Helper function to calculate edit distance
    const levenshteinDistance = (str1, str2) => {
      const matrix = [];
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[str2.length][str1.length];
    };

    // Función para validar contexto de deletreo
    const validateSpellingContext = (input, context) => {
      // Lista de palabras comunes que NO son letras del alfabeto
      const nonLetterWords = [
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
        'above', 'below', 'between', 'among', 'under', 'over', 'inside', 'outside',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'a', 'an',
        'some', 'any', 'many', 'much', 'few', 'little', 'all', 'both', 'each',
        'every', 'either', 'neither', 'one', 'two', 'three', 'four', 'five',
        'first', 'second', 'third', 'last', 'next', 'previous', 'other', 'another',
        'same', 'different', 'new', 'old', 'good', 'bad', 'big', 'small', 'long',
        'short', 'high', 'low', 'right', 'wrong', 'true', 'false', 'yes', 'no',
        'please', 'thank', 'thanks', 'sorry', 'excuse', 'hello', 'hi', 'bye',
        'goodbye', 'okay', 'ok', 'sure', 'maybe', 'perhaps', 'probably', 'definitely'
      ];
      
      // Palabras que indican comandos de deletreo válidos
      const validSpellingWords = [
        'letter', 'spell', 'spelling', 'alphabet', 'character', 'capital', 'lowercase',
        'uppercase', 'phonetic', 'nato', 'alpha', 'bravo', 'charlie', 'delta', 'echo',
        'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike',
        'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango',
        'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu'
      ];
      
      const words = input.toLowerCase().split(/\s+/);
      
      // Si contiene palabras claramente no relacionadas con deletreo
      const hasNonLetterWords = words.some(word => 
        nonLetterWords.includes(word) && word.length > 2
      );
      
      if (hasNonLetterWords) {
        console.log('🚫 Detectadas palabras no relacionadas con deletreo:', words);
        return false;
      }
      
      // Si contiene palabras válidas de deletreo
      const hasValidWords = words.some(word => 
        validSpellingWords.includes(word) || 
        /^[a-z]$/.test(word) || // Letras individuales
        /^(ay|bee|see|dee|ee|eff|gee|aitch|eye|jay|kay|el|em|en|oh|pee|cue|are|ess|tea|you|vee|double|ex|why|zee|zed)$/.test(word)
      );
      
      if (hasValidWords) {
        console.log('✅ Contexto válido de deletreo detectado');
        return true;
      }
      
      // Si el contexto actual sugiere que estamos deletreando
      if (context && context.length > 0) {
        console.log('✅ Continuando deletreo basado en contexto');
        return true;
      }
      
      // Por defecto, permitir si no hay evidencia clara de que no es deletreo
      return words.length <= 3; // Permitir frases cortas
    };

    // Sistema avanzado de filtrado de ruido
    const advancedNoiseFilter = (text, confidence) => {
      const noisePatterns = [
        /^(um|uh|ah|er|hmm|mm|hm|eh|oh|erm)$/i,
        /^(like|you know|basically|actually|literally)$/i,
        /^(and|the|a|an|is|are|was|were)$/i, // Palabras comunes no relevantes
        /^[^a-z]*$/i, // Solo símbolos o números
        /^.{1,2}$/i && confidence < 0.5 // Palabras muy cortas con baja confianza
      ];
      
      const isNoise = noisePatterns.some(pattern => pattern.test(text));
      
      // Detectar repeticiones excesivas
      const words = text.split(' ');
      const uniqueWords = new Set(words);
      const repetitionRatio = words.length / uniqueWords.size;
      
      if (repetitionRatio > 2) {
        console.log('🔇 Repetición excesiva detectada:', text);
        return true;
      }
      
      return isNoise;
    };

    // Sistema de discriminación fonética avanzado
    const phoneticDiscriminator = (input, confidence) => {
      const confusionPairs = {
        // B vs D - Principal problema identificado
        'b': { similar: ['d', 'p', 'v'], phonetic: ['bee', 'be', 'beta'] },
        'd': { similar: ['b', 't', 'g'], phonetic: ['dee', 'de', 'delta'] },
        
        // Otras confusiones comunes en inglés
        'p': { similar: ['b', 't', 'v'], phonetic: ['pee', 'pe', 'papa'] },
        't': { similar: ['d', 'p', 'c'], phonetic: ['tea', 'tee', 'tango'] },
        'c': { similar: ['s', 'k', 'g'], phonetic: ['see', 'sea', 'charlie'] },
        's': { similar: ['c', 'z', 'f'], phonetic: ['ess', 'es', 'sierra'] },
        'f': { similar: ['s', 'v', 'th'], phonetic: ['eff', 'ef', 'foxtrot'] },
        'v': { similar: ['f', 'b', 'w'], phonetic: ['vee', 've', 'victor'] },
        'g': { similar: ['j', 'k', 'd'], phonetic: ['gee', 'ge', 'golf'] },
        'j': { similar: ['g', 'ch', 'y'], phonetic: ['jay', 'jaye', 'juliet'] },
        'm': { similar: ['n', 'w'], phonetic: ['em', 'mike'] },
        'n': { similar: ['m', 'ng'], phonetic: ['en', 'november'] }
      };
      
      const inputLower = input.toLowerCase();
      
      // Buscar coincidencias fonéticas específicas
      for (const [letter, data] of Object.entries(confusionPairs)) {
        if (data.phonetic.includes(inputLower)) {
          // Aumentar confianza si usa pronunciación fonética específica
          return { letter, confidence: Math.min(1.0, confidence + 0.2) };
        }
      }
      
      // Si es una letra directa, verificar contexto
      if (inputLower.length === 1 && /[a-z]/.test(inputLower)) {
        const letterData = confusionPairs[inputLower];
        if (letterData && confidence < 0.7) {
          // Reducir confianza para letras ambiguas con baja confianza
          return { letter: inputLower, confidence: confidence * 0.8 };
        }
      }
      
      return { letter: inputLower, confidence };
    };

    // Sistema de auto-corrección
    const intelligentAutoCorrect = (input, context) => {
      const commonMistakes = {
        'see': 'c', 'sea': 'c', 'si': 'c',
        'kay': 'k', 'kaye': 'k',
        'you': 'u', 'yu': 'u',
        'why': 'y', 'wye': 'y',
        'are': 'r', 'ar': 'r',
        'tea': 't', 'tee': 't',
        'pee': 'p', 'pe': 'p',
        'bee': 'b', 'be': 'b',
        'dee': 'd', 'de': 'd',
        'gee': 'g', 'ge': 'g',
        'jay': 'j', 'jaye': 'j',
        'el': 'l', 'ell': 'l',
        'em': 'm', 'me': 'm',
        'en': 'n', 'ne': 'n',
        'oh': 'o', 'owe': 'o',
        'ess': 's', 'es': 's',
        'vee': 'v', 've': 'v',
        'double you': 'w', 'doubleyou': 'w',
        'ex': 'x', 'eks': 'x',
        'zee': 'z', 'zed': 'z'
      };
      
      // Aplicar corrección si existe
      const corrected = commonMistakes[input.toLowerCase()];
      if (corrected) {
        console.log(`🔧 Auto-corrección: "${input}" → "${corrected}"`);
        return corrected;
      }
      
      return input;
    };

    // Sistema de predicción basado en contexto
    const contextualPredictor = (currentInput, wordToSpell, spokenSoFar) => {
      const remaining = wordToSpell.substring(spokenSoFar.length);
      const nextExpectedLetter = remaining[0]?.toLowerCase();
      
      // Si el input coincide con la siguiente letra esperada
      if (currentInput === nextExpectedLetter) {
        return { confidence: 1.0, suggestion: currentInput };
      }
      
      // Buscar coincidencias fonéticas
      const phoneticMatches = {
        'c': ['see', 'sea', 'si'],
        'k': ['kay', 'kaye', 'que'],
        'q': ['cue', 'queue', 'kyu'],
        'u': ['you', 'yu'],
        'y': ['why', 'wye']
      };
      
      if (phoneticMatches[nextExpectedLetter]?.includes(currentInput)) {
        return { confidence: 0.9, suggestion: nextExpectedLetter };
      }
      
      return { confidence: 0.5, suggestion: currentInput };
    };

    // Función mejorada para detectar comandos con tolerancia a errores
      const detectVoiceCommand = (text) => {
        const cleanText = text.toLowerCase().trim();
        
        // Comandos de borrado con variaciones
        const deleteCommands = [
          'delete', 'del', 'remove', 'erase', 'backspace', 'back',
          'delete that', 'remove that', 'erase that', 'take that back',
          'undo', 'undo that', 'scratch that', 'cancel that'
        ];
        
        // Comandos de limpieza con variaciones
        const clearCommands = [
          'clear', 'clear all', 'reset', 'start over', 'new word',
          'clear everything', 'delete all', 'remove all', 'erase all',
          'restart', 'begin again', 'fresh start'
        ];
        
        // Buscar coincidencias exactas primero
        if (deleteCommands.some(cmd => cleanText.includes(cmd))) {
          return 'DELETE';
        }
        
        if (clearCommands.some(cmd => cleanText.includes(cmd))) {
          return 'CLEAR';
        }
        
        // Buscar coincidencias aproximadas usando distancia de edición
        for (const cmd of deleteCommands) {
          if (levenshteinDistance(cleanText, cmd) <= Math.max(1, Math.floor(cmd.length * 0.3))) {
            console.log(`🎯 Comando DELETE detectado por similitud: "${cleanText}" ≈ "${cmd}"`);
            return 'DELETE';
          }
        }
        
        for (const cmd of clearCommands) {
          if (levenshteinDistance(cleanText, cmd) <= Math.max(1, Math.floor(cmd.length * 0.3))) {
            console.log(`🎯 Comando CLEAR detectado por similitud: "${cleanText}" ≈ "${cmd}"`);
            return 'CLEAR';
          }
        }
        
        return null;
      };
      
      // Mapeo mejorado de letras con variaciones de pronunciación en inglés
      const normalizeForCompare = (text) => {
      return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[’']/g, '')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z]/g, '');
    };

    // Mapeo de pronunciaciones y comandos alemanes
    const enhancedGermanLetterMap = {
      'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
      'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
      'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
      'y': 'y', 'z': 'z', 'ä': 'ä', 'ö': 'ö', 'ü': 'ü', 'ß': 'ß',
      'ah': 'a', 'bay': 'b', 'beh': 'b', 'tsay': 'c', 'ceh': 'c', 'day': 'd', 'deh': 'd',
      'eh': 'e', 'eff': 'f', 'gay': 'g', 'geh': 'g', 'hah': 'h', 'ee': 'i', 'yot': 'j', 'jot': 'j',
      'kah': 'k', 'ell': 'l', 'emm': 'm', 'enn': 'n', 'oh': 'o', 'pay': 'p', 'peh': 'p',
      'koo': 'q', 'kuh': 'q', 'err': 'r', 'ess': 's', 'tay': 't', 'teh': 't', 'oo': 'u',
      'fow': 'v', 'vau': 'v', 'vay': 'w', 'weh': 'w', 'iks': 'x', 'üpsilon': 'y', 'ypsilon': 'y',
      'tset': 'z', 'zet': 'z', 'zett': 'z',
      'umlaut a': 'ä', 'ae': 'ä', 'a umlaut': 'ä',
      'umlaut o': 'ö', 'oe': 'ö', 'o umlaut': 'ö',
      'umlaut u': 'ü', 'ue': 'ü', 'u umlaut': 'ü',
      'eszett': 'ß', 'scharfes s': 'ß', 'beta': 'ß',
      'umlauta': 'ä', 'aumlaut': 'ä',
      'umlauto': 'ö', 'oumlaut': 'ö',
      'umlautu': 'ü', 'uumlaut': 'ü',
      'scharfess': 'ß',
      'anton': 'a', 'berta': 'b', 'cäsar': 'c', 'dora': 'd', 'emil': 'e',
      'friedrich': 'f', 'gustav': 'g', 'heinrich': 'h', 'ida': 'i', 'julius': 'j',
      'kaufmann': 'k', 'ludwig': 'l', 'martha': 'm', 'nordpol': 'n', 'otto': 'o',
      'paula': 'p', 'quelle': 'q', 'richard': 'r', 'samuel': 's', 'theodor': 't',
      'ulrich': 'u', 'viktor': 'v', 'wilhelm': 'w', 'xanthippe': 'x',
      'ypsilon': 'y', 'zacharias': 'z',
      'ay': 'a', 'bee': 'b', 'see': 'c', 'sea': 'c', 'dee': 'd',
      'gee': 'g', 'aitch': 'h', 'eye': 'i', 'jay': 'j', 'kay': 'k',
      'el': 'l', 'em': 'm', 'en': 'n', 'pee': 'p', 'cue': 'q',
      'are': 'r', 'tea': 't', 'you': 'u', 'vee': 'v',
      'double you': 'w', 'doubleyou': 'w', 'ex': 'x', 'why': 'y', 'zee': 'z', 'zed': 'z',
      'alpha': 'a', 'bravo': 'b', 'charlie': 'c', 'delta': 'd', 'echo': 'e',
      'foxtrot': 'f', 'golf': 'g', 'hotel': 'h', 'india': 'i', 'juliet': 'j',
      'kilo': 'k', 'lima': 'l', 'mike': 'm', 'november': 'n', 'oscar': 'o',
      'papa': 'p', 'quebec': 'q', 'romeo': 'r', 'sierra': 's', 'tango': 't',
      'uniform': 'u', 'victor': 'v', 'whiskey': 'w', 'xray': 'x', 'yankee': 'y', 'zulu': 'z',
      'löschen': 'DELETE', 'loeschen': 'DELETE', 'loschen': 'DELETE',
      'zurück': 'DELETE', 'zurueck': 'DELETE', 'entfernen': 'DELETE',
      'leer': 'CLEAR', 'neu': 'CLEAR', 'anfang': 'CLEAR', 'von vorn': 'CLEAR', 'vonvorn': 'CLEAR',
      'delete': 'DELETE', 'backspace': 'DELETE', 'clear': 'CLEAR', 'reset': 'CLEAR',
      'groß': 'CAPITAL', 'gross': 'CAPITAL', 'capital': 'CAPITAL'
    };

    const enhancedLetterMap = enhancedGermanLetterMap;

    // Función para detectar si el input contiene palabras completas en alemán
    const containsCompleteWords = (transcript) => {
      const cleaned = (transcript || '')
        .toLowerCase()
        .replace(/[’']/g, ' ')
        .replace(/[^a-zäöüß\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) return false;

      const tokens = cleaned
        .replace(/\bumlaut\s+a\b/g, 'umlauta')
        .replace(/\ba\s+umlaut\b/g, 'aumlaut')
        .replace(/\bumlaut\s+o\b/g, 'umlauto')
        .replace(/\bo\s+umlaut\b/g, 'oumlaut')
        .replace(/\bumlaut\s+u\b/g, 'umlautu')
        .replace(/\bu\s+umlaut\b/g, 'uumlaut')
        .replace(/\bscharfes\s+s\b/g, 'scharfess')
        .replace(/\bdouble\s+you\b/g, 'doubleyou')
        .replace(/\bvon\s+vorn\b/g, 'vonvorn')
        .split(/\s+/)
        .filter(Boolean);

      // Si es una coincidencia exacta de una sola palabra esperada
      if (currentWordRef.current && currentWordRef.current.word) {
        const merged = normalizeForCompare(cleaned);
        const target = normalizeForCompare(currentWordRef.current.word);
        const letterishCount = tokens.filter(t => enhancedGermanLetterMap[t] || (t.length === 1 && /[a-zäöüß]/.test(t))).length;
        if (letterishCount < 2 && merged === target) return true;
      }

      // Palabras comunes alemanas conversacionales que no son deletreo
      const commonWords = [
        'hallo', 'danke', 'ja', 'nein', 'bitte', 'und', 'oder', 'aber', 'nicht',
        'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mein', 'dein', 'sein',
        'gut', 'schlecht', 'hilfe', 'warum', 'wann', 'wie', 'wo', 'wer', 'was'
      ];

      for (const token of tokens) {
        if (token.length >= 4 && !enhancedGermanLetterMap[token] && commonWords.includes(token)) return true;
      }

      return false;
    };

    // Función para detectar si el input parece deletreo en alemán
    const isLikelySpelling = (transcript) => {
      const cleaned = (transcript || '')
        .toLowerCase()
        .replace(/[’']/g, ' ')
        .replace(/[^a-zäöüß\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) return false;

      const tokens = cleaned
        .replace(/\bumlaut\s+a\b/g, 'umlauta')
        .replace(/\ba\s+umlaut\b/g, 'aumlaut')
        .replace(/\bumlaut\s+o\b/g, 'umlauto')
        .replace(/\bo\s+umlaut\b/g, 'oumlaut')
        .replace(/\bumlaut\s+u\b/g, 'umlautu')
        .replace(/\bu\s+umlaut\b/g, 'uumlaut')
        .replace(/\bscharfes\s+s\b/g, 'scharfess')
        .replace(/\bdouble\s+you\b/g, 'doubleyou')
        .replace(/\bvon\s+vorn\b/g, 'vonvorn')
        .split(/\s+/)
        .filter(Boolean);

      if (!tokens.length) return false;

      let recognized = 0;
      let unknownLong = 0;
      for (const token of tokens) {
        if (enhancedGermanLetterMap[token] || (token.length === 1 && /[a-zäöüß]/.test(token))) {
          recognized++;
        } else if (token.length > 1) {
          unknownLong++;
        }
      }

      if (recognized === 0) return false;
      if (unknownLong > 0 && recognized / tokens.length < 0.8) return false;
      return recognized / tokens.length >= 0.6;
    };

    // Procesar input de voz en alemán
    const processSpokenInput = (transcript) => {
      console.log('🔤 Procesando input:', transcript);

      if (containsCompleteWords(transcript)) {
        console.log('🚫 Input ignorado por contener palabras completas o conversación');
        return '';
      }
      
      if (!isLikelySpelling(transcript)) {
        console.log('🚫 No parece deletreo, ignorando:', transcript);
        return '';
      }

      const words = (transcript || '')
        .toLowerCase()
        .replace(/[’']/g, ' ')
        .replace(/[^a-zäöüß\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\bumlaut\s+a\b/g, 'umlauta')
        .replace(/\ba\s+umlaut\b/g, 'aumlaut')
        .replace(/\bumlaut\s+o\b/g, 'umlauto')
        .replace(/\bo\s+umlaut\b/g, 'oumlaut')
        .replace(/\bumlaut\s+u\b/g, 'umlautu')
        .replace(/\bu\s+umlaut\b/g, 'uumlaut')
        .replace(/\bscharfes\s+s\b/g, 'scharfess')
        .replace(/\bdouble\s+you\b/g, 'doubleyou')
        .replace(/\bvon\s+vorn\b/g, 'vonvorn')
        .split(/\s+/)
        .filter(Boolean);

      let letters = '';
      let nextUpper = false;
      
      for (const word of words) {
        const cleanWord = word.trim();
        if (!cleanWord) continue;
        
        if (enhancedGermanLetterMap[cleanWord]) {
          const mappedValue = enhancedGermanLetterMap[cleanWord];
          if (mappedValue === 'DELETE') return 'DELETE';
          if (mappedValue === 'CLEAR') return 'CLEAR';
          if (mappedValue === 'CAPITAL') {
            nextUpper = true;
            continue;
          }
          
          let charToAdd = mappedValue;
          if (nextUpper && charToAdd.length === 1) {
            charToAdd = charToAdd.toUpperCase();
            nextUpper = false;
          }
          letters += charToAdd;
          console.log('🔤 Letra detectada:', cleanWord, '->', charToAdd);
        } else if (cleanWord.length === 1 && /[a-zäöüß]/.test(cleanWord)) {
          let charToAdd = cleanWord;
          if (nextUpper) {
            charToAdd = charToAdd.toUpperCase();
            nextUpper = false;
          }
          letters += charToAdd;
          console.log('🔤 Letra directa:', cleanWord, '->', charToAdd);
        }
      }
      
      console.log('🔤 Letras extraídas:', letters);
      return letters;
    };

    const checkSpelling = () => {
        if (currentWord && spokenText.toLowerCase() === currentWord.word.toLowerCase()) {
          setIsCorrect(true);
          // Detener reconocimiento de voz si está activo
          if (isListening && recognition) {
            recognition.manualStop();
          }
          setTimeout(() => {
            setIsCorrect(null);
            setSpokenText('');
            selectRandomWord();
          }, 2000);
        } else {
          setIsCorrect(false);
          setTimeout(() => setIsCorrect(null), 2000);
        }
      };

    // Función para limpiar el texto
      const clearSpokenText = () => {
          setSpokenText('');
          setIsCorrect(null);
          // Reiniciar el reconocimiento si estaba activo
          if (isListening && recognition) {
            try {
              recognition.manualStop();
              setTimeout(() => {
                if (shouldKeepListening) {
                  recognition.start();
                }
              }, 500);
            } catch (error) {
              console.error('Error al reiniciar reconocimiento:', error);
            }
          }
        };

    // Palabras del Level A con fonética
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
      'A': {
        name: 'Stufe A (Anfänger)',
        sublevels: ['🌱'],
        words: levelAWords,
        color: '#10B981'
      },
      'B': {
        name: 'Stufe B (Mittelstufe)',
        sublevels: ['🚀'],
        words: levelBWords,
        color: '#3B82F6'
      },
      'C': {
        name: 'Stufe C (Fortgeschritten)',
        sublevels: ['👑'],
        words: levelCWords,
        color: '#8B5CF6'
      }
    };

      const speak = (text) => {
        if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function' && selectedVoice && selectedVoice.isResponsiveVoice) {
          responsiveVoice.speak(text, selectedVoice.name);
        } else if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'de-DE';
          if (selectedVoice) {
            if (selectedVoice.isResponsiveVoice) {
              utterance.lang = selectedVoice.lang;
            } else {
              utterance.voice = selectedVoice;
            }
          }
          speechSynthesis.speak(utterance);
        } else {
          console.warn('Speech synthesis not available.');
        }
      };

      const selectRandomWord = () => {
        if (!selectedLevel || !levels[selectedLevel].words.length) return;
        
        const availableWords = levels[selectedLevel].words.filter(
          word => !usedWords.includes(word.word)
        );
        
        if (availableWords.length === 0) {
          alert('¡Todas las palabras han sido utilizadas! El juego se reiniciará.');
          setUsedWords([]);
          return;
        }
        
        setIsSpinning(true);
        setAnimationStep(0);
        setSpokenText(''); // Limpiar el texto deletreado
        
        const numbers = Array.from({length: 10}, (_, i) => i + 1);
        let currentIndex = 0;
        
        const numberInterval = setInterval(() => {
          setAnimationStep(numbers[currentIndex]);
          currentIndex = (currentIndex + 1) % numbers.length;
        }, 100);
        
        setTimeout(() => {
          clearInterval(numberInterval);
          const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
          setCurrentWord(randomWord);
          setUsedWords(prev => [...prev, randomWord.word]);
          setIsSpinning(false);
          setAnimationStep(0);
          setShowDefinition(false);
        }, 2000);
      };

      const resetGame = () => {
        setUsedWords([]);
        setCurrentWord(null);
        setAnimationStep(0);
        setShowDefinition(false);
        setShowExample(false);
        setSpokenText(''); // Limpiar el texto deletreado
      };

      const HomeScreen = ({ isEditMode }) => {
        const [layoutConfig, setLayoutConfig] = useState(() => {
          const saved = localStorage.getItem('bee_de_layout_config');
          if (saved) {
            try { return JSON.parse(saved); } catch(e){}
          }
          const scriptEl = document.getElementById('layout-config-data');
          if (scriptEl) {
            try { return JSON.parse(scriptEl.textContent); } catch(e){}
          }
          return {
            hero: { x: -193, y: -135, scale: 1.32 },
            cards: { x: 27, y: -75, scale: 1.1 },
            bee: { x: 528, y: 525, scale: 0.6 }
          };
        });

        const cardsData = [
          {
            key: 'contest',
            title: 'CONCOURS',
            desc: 'Nehmen Sie an echten Wettbewerben teil und testen Sie Ihre Fähigkeiten.',
            img: 'IMG/trofeo.png',
            glowClass: 'card-contest-glow',
            onClick: () => {
              setGameMode('contest');
              setCurrentScreen('menu');
            }
          },
          {
            key: 'training',
            title: 'TRAINING',
            desc: 'Üben und verbessern Sie sich mit intelligenten Übungen.',
            img: 'IMG/brazo.png',
            glowClass: 'card-training-glow',
            onClick: () => {
              setGameMode('training');
              setCurrentScreen('menu');
            }
          },
          {
            key: 'instructions',
            title: 'ANLEITUNG',
            desc: 'Lernen Sie, wie Sie teilnehmen und entdecken Sie die Wettbewerbsregeln.',
            img: 'IMG/libro.png',
            glowClass: 'card-instructions-glow',
            onClick: () => {
              setCurrentScreen('instructions');
            }
          },
          {
            key: 'winners',
            title: 'GEWINNER',
            desc: 'Entdecken Sie die Führenden und ehemaligen Champions.',
            img: 'IMG/medalla.png',
            glowClass: 'card-winners-glow',
            onClick: () => {
              setCurrentScreen('winners');
            }
          }
        ];

        const saveHTML = async () => {
          // Update the script tag with current layoutConfig
          const scriptEl = document.getElementById('layout-config-data');
          if (scriptEl) {
            scriptEl.textContent = '\n      ' + JSON.stringify(layoutConfig, null, 2) + '\n    ';
          }
          
          // Save locally
          localStorage.setItem('bee_de_layout_config', JSON.stringify(layoutConfig));
          
          // Trigger file picker or download
          const clone = document.documentElement.cloneNode(true);
          const rootEl = clone.querySelector('#root');
          if (rootEl) {
            rootEl.innerHTML = ''; // Keep layout clean
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
              alert('Enregistré avec succès !');
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
              console.error('Error al guardar:', err);
              alert('Fehler lors de la sauvegarde du fichier.');
            }
          }
        };

        return React.createElement('div', { 
          className: 'flex flex-col justify-between min-h-screen relative w-full'
        },
          // Layout Edit Panel
          isEditMode && React.createElement('div', { className: 'absolute top-24 right-8 bg-black bg-opacity-80 p-4 rounded-xl border border-yellow-400 z-50 text-white shadow-2xl flex flex-col items-center gap-2' },
            React.createElement('span', { className: 'font-bold text-yellow-400' }, '✏️ Mode Édition Actif'),
            React.createElement('span', { className: 'text-xs text-gray-300 mb-2' }, 'Glissez les éléments et utilisez le coin pour redimensionner.'),
            React.createElement('button', {
              onClick: saveHTML,
              className: 'w-full px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-400 transition-colors'
            }, '💾 Enregistrer les modif. en HTML')
          ),

          // 3D Abeille Foreground Layer (with TransformWrapper!)
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

          // Central container with Hero text and menu cards
          React.createElement('div', { className: 'relative flex-grow flex items-center justify-center px-4 sm:px-8 lg:px-6 pt-4 pb-4 z-10 w-full' },
            React.createElement('div', { className: 'w-full max-w-[1380px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8' },
              
              // Left Panel: Hero Section (with TransformWrapper!)
              React.createElement(TransformWrapper, { id: 'hero', config: layoutConfig, className: 'flex-1 w-full flex justify-center lg:justify-start', isEditMode, onConfigChange: setLayoutConfig },
                React.createElement('div', { className: 'w-full max-w-md sm:max-w-xl lg:max-w-none mx-auto lg:mx-0 flex flex-col items-center justify-center text-center lg:items-start lg:text-left px-4 sm:px-8 lg:pl-12 xl:pl-20' },
                  React.createElement('span', { className: 'text-xs sm:text-base lg:text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-3 block' }, "WILLKOMMEN ZUR OFFIZIELLEN ANWENDUNG"),
                  React.createElement('h1', { 
                    className: 'main-title font-black text-white leading-none tracking-tight mb-4 text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] w-full text-center lg:text-left uppercase'
                  }, "RECHTSCHREIB-"),
                  React.createElement('h1', { 
                    className: 'main-title font-black text-yellow-400 leading-none tracking-tight mb-4 text-4xl sm:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] flex items-center justify-center lg:justify-start gap-4 w-full uppercase'
                  }, 
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
                  React.createElement('p', { 
                    className: 'hero-text-sub text-lg sm:text-xl md:text-2xl font-black tracking-widest text-blue-400 uppercase mb-6 text-center lg:text-left w-full mx-auto lg:mx-0' 
                  }, "TRAINIEREN. ÜBEN. WETTEIFERN. GEWINNEN."),
                  React.createElement('button', {
                    onClick: () => {
                      setGameMode('contest');
                      setCurrentScreen('menu');
                    },
                    className: 'btn-hero-contest-glass w-full sm:w-auto flex justify-center items-center text-center mx-auto sm:mx-0 max-w-md sm:max-w-none'
                  },
                    React.createElement('span', { className: 'text-2xl' }, '🏆'),
                    React.createElement('span', { className: 'font-black uppercase tracking-widest text-lg' }, 'WETTBEWERB STARTEN'),
                  )
                )
              ),

              // Right Panel: Glassmorphic cards (with TransformWrapper!)
              React.createElement(TransformWrapper, { id: 'cards', config: layoutConfig, className: 'w-full lg:w-auto', isEditMode, onConfigChange: setLayoutConfig },
                React.createElement('div', { className: 'w-full flex justify-center lg:justify-end' },
                  React.createElement('div', { 
                    className: 'flex flex-col w-full max-w-lg lg:w-[480px]',
                    style: { gap: '18px' }
                  },
                    cardsData.map(card => 
                      React.createElement('div', {
                        key: card.key,
                        onClick: card.onClick,
                        className: `rounded-glass-card ${card.glowClass}`
                      },
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

      const MenüScreen = () => React.createElement('div', { className: 'min-h-screen p-4 sm:p-8' },
        React.createElement('div', { className: 'max-w-4xl mx-auto' },
          React.createElement('div', { className: 'flex items-center justify-between mb-6 sm:mb-8' },
            React.createElement('button', {
              onClick: () => {
                setGameMode(null);
                setCurrentScreen('home');
              },
              className: 'bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300 shadow-lg'
            }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),
            React.createElement('h1', { className: 'text-2xl sm:text-4xl font-bold text-black text-center' }, 'Sélectionnez Votre Niveau'),
            React.createElement('div', { className: 'w-8 sm:w-12' })
          ),

          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8' },
            Object.entries(levels).map(([key, level]) =>
              React.createElement('div', { key: key, className: 'relative' },
                React.createElement('div', { className: 'bg-gradient-to-br from-blue-100 to-red-100 rounded-2xl p-4 sm:p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-blue-600' },
                  React.createElement('div', { className: 'text-center mb-4 sm:mb-6' },
                    React.createElement('div', { 
                      className: `rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-3 sm:mb-4 shadow-lg ${
                        gameMode === 'contest' ? 'bg-black text-white' : 'bg-white text-black'
                      }` 
                    },
                      React.createElement('span', { 
                        className: `text-lg sm:text-2xl font-bold`,
                        ...(gameMode !== 'contest' && { style: { textShadow: '2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 0 2px 0 white, 2px 0 0 white, 0 -2px 0 white, -2px 0 0 white' } })
                      }, key)
                    ),
                    React.createElement('h2', { 
                      className: `text-xl sm:text-2xl font-bold mb-2 ${
                        gameMode === 'contest' ? 'text-white bg-black px-4 py-2 rounded-xl' : 'text-black bg-white px-4 py-2 rounded-xl'
                      }` 
                    }, level.name),
                    React.createElement('div', { className: 'flex flex-wrap justify-center gap-1 sm:gap-2' },
                      level.sublevels.map((sublevel, index) =>
                        React.createElement('span', {
                          key: index,
                          className: `px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                            gameMode === 'contest' ? 'bg-black text-white' : 'bg-white text-black'
                          }`
                        }, sublevel)
                      )
                    )
                  ),
                  React.createElement('div', { className: 'space-y-3 sm:space-y-4' },
                    gameMode === 'contest' && React.createElement('button', {
                      onClick: () => {
                        resetGame();
                        setSelectedLevel(key);
                        setCurrentScreen('game');
                      },
                      className: 'w-full bg-black text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-yellow-600 hover:text-black shadow-lg',
                      disabled: level.words.length === 0
                    }, level.words.length > 0 ? 'Concours' : 'Bald verfügbar'),
                    gameMode === 'training' && React.createElement('button', {
                      onClick: () => {
                        resetGame();
                        setSelectedLevel(key);
                        setCurrentScreen('game');
                      },
                      className: 'w-full bg-white text-black py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-amber-200 shadow-lg',
                      disabled: level.words.length === 0
                    }, level.words.length > 0 ? 'Entraînement' : 'Bald verfügbar'),
                    gameMode === 'training' && React.createElement('button', {
                      onClick: () => {
                        setSelectedLevel(key);
                        setCurrentScreen('wordList');
                      },
                      className: 'w-full bg-black text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-yellow-600 hover:text-black shadow-lg',
                      disabled: level.words.length === 0
                    }, level.words.length > 0 ? 'Wortliste' : 'Bald verfügbar')
                  ),
                  React.createElement('div', { className: 'mt-3 sm:mt-4 text-center' },
                    React.createElement('span', { className: 'text-black font-semibold text-sm sm:text-base' },
                      level.words.length + ' mots disponibles'
                    )
                  )
                )
              )
            )
          )
        )
      );

      // Función para renderizar el texto con colores
      const renderSpokenTextWithColors = () => {
        if (!currentWord || !spokenText) {
          return React.createElement('div', {
            className: 'text-base sm:text-lg lg:text-xl font-mono font-bold text-gray-400 text-center py-3'
          }, 'Start spelling...');
        }

        const targetWord = currentWord.word.toLowerCase();
        const spoken = spokenText.toLowerCase();
        const letters = [];

        for (let i = 0; i < Math.max(targetWord.length, spoken.length); i++) {
          const spokenLetter = spoken[i] || '';
          const targetLetter = targetWord[i] || '';
          
          let letterClass = 'inline-block text-lg sm:text-xl lg:text-2xl font-mono font-bold mx-1 px-2 py-2 rounded-lg transition-all duration-300 ';
          
          if (i < spoken.length) {
            if (spokenLetter === targetLetter) {
              letterClass += 'text-green-700 bg-green-100 border-2 border-green-300';
            } else {
              letterClass += 'text-red-700 bg-red-100 border-2 border-red-300 animate-pulse';
            }
          } else {
            letterClass += 'text-gray-400 bg-gray-100 border-2 border-gray-200';
          }

          letters.push(
            React.createElement('span', {
              key: i,
              className: letterClass
            }, spokenLetter || '_')
          );
        }

        return React.createElement('div', {
          className: 'text-center py-3 sm:py-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px] sm:min-h-[70px] flex items-center justify-center flex-wrap gap-1'
        }, letters);
      };

      const GameScreen = () => {
        return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-blue-600 via-white to-red-600 p-4 sm:p-8' },
          React.createElement('div', { className: 'max-w-4xl mx-auto' },
            React.createElement('div', { className: 'flex items-center justify-between mb-6 sm:mb-8' },
              React.createElement('button', {
                onClick: () => setCurrentScreen('menu'),
                className: 'bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300 shadow-lg'
              }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),
              React.createElement('div', { className: 'text-center flex-1 mx-2 sm:mx-4' },
                React.createElement('h1', { className: 'text-lg sm:text-3xl font-bold text-black' },
                  `${levels[selectedLevel]?.name} - ${gameMode === 'contest' ? 'Concours' : 'Entraînement'}`
                ),
                React.createElement('p', { className: 'text-sm sm:text-base text-black font-semibold' },
                  `Verwendete Wörter: ${usedWords.length} / ${levels[selectedLevel]?.words.length}`
                ),
                React.createElement('div', { className: 'mt-2' },
                  React.createElement('select', {
                    value: selectedVoice?.name || '',
                    onChange: (e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      setSelectedVoice(voice);
                    },
                    className: 'bg-white text-black px-2 sm:px-3 py-1 rounded border border-gray-300 text-xs sm:text-sm'
                  },
                    availableVoices.map(voice =>
                      React.createElement('option', { key: voice.name, value: voice.name },
                        `${voice.name} (${voice.lang})`
                      )
                    )
                  )
                )
              ),
              React.createElement('button', {
                onClick: resetGame,
                className: 'bg-red-600 text-white p-2 sm:p-3 rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg'
              }, React.createElement(RotateCcw, { className: 'w-5 h-5 sm:w-6 sm:h-6' }))
            ),
            
            React.createElement('div', { className: 'text-center' },
              React.createElement('div', { className: 'bg-white rounded-2xl p-6 sm:p-12 shadow-2xl border-4 border-blue-600 max-w-2xl mx-auto' },
                isSpinning ?
                  React.createElement('div', { className: 'animate-spin text-4xl sm:text-6xl font-bold text-black mb-6 sm:mb-8' },
                    animationStep || '🎲'
                  ) :
                  currentWord ?
                    React.createElement('div', { className: 'space-y-3' },
                      // Palabra y botones - responsive
                      React.createElement('div', { 
                        className: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200' 
                      },
                        React.createElement('div', { className: 'space-y-3' },
                          // Palabra a deletrear
                          React.createElement('div', { className: 'text-center' },
                            React.createElement('h3', { 
                              className: 'text-base sm:text-lg font-bold text-black mb-1 sm:mb-2' 
                            }, 'Zu buchstabierendes Wort:'),
                            React.createElement('div', { 
                              className: 'text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1' 
                            }, currentWord.word),
                            React.createElement('div', { 
                              className: 'text-xs sm:text-sm lg:text-base text-gray-600 font-mono' 
                            }, currentWord.phonetic || '')
                          ),
                          
                          // Botones - vertical en móvil
                          React.createElement('div', { 
                            className: 'flex flex-col sm:flex-row justify-center gap-2' 
                          },
                            React.createElement('button', {
                              onClick: () => {
                                speak(currentWord.word);
                              },
                              className: 'bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto'
                            }, 
                              React.createElement(Volume2, { className: 'w-4 h-4' }),
                              'Anhören'
                            ),
                            React.createElement('button', {
                              onClick: showWordExample,
                              className: 'bg-white text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-md font-bold text-sm w-full sm:w-auto border-2 border-blue-600'
                            }, 'Exemple'),
                            React.createElement('button', {
                              onClick: showWordDefinition,
                              className: 'bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md font-bold text-sm w-full sm:w-auto'
                            }, 'Définition')
                          )
                        )
                      ),
                      
                      // Progreso visual - responsive
                      React.createElement('div', { 
                        className: 'bg-white rounded-xl p-3 sm:p-4 border-2 border-gray-200 mb-6' 
                      },
                        React.createElement('h4', { 
                          className: 'text-sm sm:text-base font-bold text-black mb-2 text-center' 
                        }, 'Ihr Fortschritt:'),
                        renderSpokenTextWithColors()
                      ),
                      
                      // Botones de selección de palabras - NUEVA UBICACIÓN
                      React.createElement('div', { className: 'mb-6' },
                        React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3 sm:gap-4' },
                          React.createElement('button', {
                            onClick: selectRandomWord,
                            className: 'bg-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 hover:bg-blue-700 hover:text-white shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 flex-1',
                            disabled: isSpinning
                          },
                            React.createElement(Shuffle, { className: 'w-5 h-5 sm:w-6 sm:h-6' }),
                            isSpinning ? 'Auswählen...' : 'Wortauswahl'
                          ),
                          currentWord && React.createElement('button', {
                            onClick: selectRandomWord,
                            className: 'bg-gradient-to-r from-blue-600 to-red-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:from-red-600 hover:to-blue-600 shadow-lg transform hover:scale-105 flex-1 border-2 border-white',
                            disabled: isSpinning
                          }, '🔄 Neues Wort')
                        )
                      ),
                      
                      // Controles de voz - responsive
                      React.createElement('div', { 
                        className: 'bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-200' 
                      },
                        React.createElement('div', { className: 'space-y-3' },
                          // Botones de control
                          React.createElement('div', { className: 'flex flex-col sm:flex-row gap-2' },
                            React.createElement('button', {
                              onClick: toggleListening,
                              className: `flex-1 px-4 py-3 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm font-bold ${
                                isListening 
                                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse ring-2 ring-red-200' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`
                            }, 
                              React.createElement('span', { className: 'text-lg' }, 
                                isListening ? '🛑' : '🎤'
                              ),
                              React.createElement('span', {}, 
                                isListening ? 'Sprachsteuerung stoppen' : 'Sprachsteuerung'
                              )
                            ),
                            React.createElement('button', {
                              onClick: clearSpokenText,
                              className: 'bg-white text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto border-2 border-blue-600'
                            }, 
                              React.createElement('span', { className: 'text-base' }, '🗑️'),
                              'Löschen'
                            ),

                            React.createElement('button', {
                              onClick: showPermissionHelp,
                              className: 'bg-white text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto border-2 border-red-600'
                            }, 
                              React.createElement('span', { className: 'text-base' }, '❓'),
                              'Hilfe'
                            )
                          ),
                        
                          // Estado y resultado
                          React.createElement('div', { 
                            className: 'flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm' 
                          },
                            React.createElement('div', { 
                              className: 'text-gray-600 text-center sm:text-left' 
                            },
                              isListening ? 
                                React.createElement('div', { className: 'listening-status space-y-2' },
                                  React.createElement('div', { className: 'flex items-center gap-2' },
                                    React.createElement('span', { className: 'status-icon text-red-500' }, '🔴'),
                                    React.createElement('span', { className: 'status-text font-semibold' }, 'Zuhören... Bitte buchstabiere jedes Wort deutlich')
                                  ),
                                  recognitionConfidence > 0 && React.createElement('div', { className: 'confidence-display' },
                                    React.createElement('div', {
                                      className: `confidence-bar px-2 py-1 rounded text-xs font-bold ${
                                        recognitionConfidence > 0.8 ? 'bg-green-100 text-green-700' : 
                                        recognitionConfidence > 0.6 ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-red-100 text-red-700'
                                      }`
                                    }, `Konfidenz: ${Math.round(recognitionConfidence * 100)}%`),
                                    lastRecognizedText && React.createElement('div', {
                                      className: 'last-heard text-xs text-blue-600 italic mt-1'
                                    }, `Zuletzt gehört: "${lastRecognizedText}"`)
                                  ),
                                  React.createElement('div', { className: 'real-time-feedback mt-2' },
                                    // Nueva estructura horizontal mejorada para Current, Target y Progress
                                    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4' },
                                      // Current (Izquierda)
                                      spokenText && React.createElement('div', { className: 'text-center' },
                                        React.createElement('div', { className: 'text-xs font-medium text-gray-600 mb-1' }, 'Aktuell'),
                                        React.createElement('div', { className: 'current-spelling' },
                                          React.createElement('strong', { className: 'text-blue-600 text-sm font-mono' }, spokenText)
                                        )
                                      ),
                                      // Target (Centro)
                                      currentWord && React.createElement('div', { className: 'text-center' },
                                        React.createElement('div', { className: 'text-xs font-medium text-gray-600 mb-1' }, 'Ziel'),
                                        React.createElement('div', { className: 'target-word' },
                                          React.createElement('strong', { className: 'text-gray-800 text-sm font-mono' }, currentWord.word)
                                        )
                                      ),
                                      // Progress Indicator (Derecha)
                                      currentWord && React.createElement('div', { className: 'text-center' },
                                        React.createElement('div', { className: 'text-xs font-medium text-gray-600 mb-1' }, 'Fortschritt'),
                                        React.createElement('div', { className: 'progress-indicator flex gap-1 flex-wrap justify-center' },
                                          currentWord.word.split('').map((letter, index) =>
                                            React.createElement('span', {
                                              key: index,
                                              className: `letter px-1 py-0.5 rounded text-xs font-mono ${
                                                index < spokenText.length ? 
                                                  (spokenText[index]?.toLowerCase() === letter.toLowerCase() ? 
                                                    'bg-green-200 text-green-800 correct' : 
                                                    'bg-red-200 text-red-800 incorrect') : 
                                                  'bg-gray-200 text-gray-600 pending'
                                              }`
                                            }, letter)
                                          )
                                        )
                                      )
                                    )
                                  )
                                ) : 
                                recognitionReady ? '🟡 Bereit zum Zuhören' : '⚪ Klicke auf das Mikrofon, um zu starten'
                            ),
                            isCorrect !== null && React.createElement('div', {
                              className: `px-4 py-2 rounded-full font-bold text-center text-sm ${
                                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`
                            }, isCorrect ? '✅ Correct !' : '❌ Versuchen Sie es nochmal!')
                          )
                        )
                      ),
                      
                      // Input manual y verificación - responsive
                      React.createElement('div', { className: 'bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mt-4' },
                        React.createElement('div', { className: 'flex flex-col sm:flex-row gap-2' },
                          React.createElement('div', { className: 'flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1' },
                            React.createElement('label', { 
                              className: 'text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap' 
                            }, 'Buchstabe für Buchstabe eingeben:'),
                            React.createElement('input', {
                              type: 'text',
                              value: spokenText,
                              onChange: (e) => setSpokenText(e.target.value.toLowerCase()),
                              placeholder: 'Tapez lettre par lettre...',
                              className: `w-full p-2 sm:p-3 text-base sm:text-lg font-mono border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                isCorrect === true ? 'border-green-500 bg-green-50 focus:ring-green-300' :
                                isCorrect === false ? 'border-red-500 bg-red-50 focus:ring-red-300' :
                                'border-gray-300 focus:ring-blue-300'
                              }`
                            })
                          ),
                          
                          React.createElement('button', {
                            onClick: checkSpelling,
                            disabled: !spokenText.trim(),
                            className: `px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 text-sm w-full sm:w-auto mt-2 sm:mt-0 ${
                              !spokenText.trim() 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600 shadow-md transform hover:scale-105'
                            }`
                          }, 'Rechtschreibung prüfen')
                        )
                      ),
                      
                      // Resultado final - responsive
                      isCorrect !== null && React.createElement('div', {
                        className: `mt-4 p-3 sm:p-4 rounded-lg text-center font-bold text-base sm:text-lg ${
                          isCorrect ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`
                      }, isCorrect ? '✅ Richtig! Gut gemacht!' : '❌ Versuchen Sie es nochmal!')
                    ) :
                    React.createElement('div', { className: 'space-y-4' },
                      React.createElement('div', { className: 'text-lg sm:text-2xl text-gray-600 font-semibold text-center py-8' },
                        'Appuyez sur "Wortauswahl" pour commencer'
                      ),
                      React.createElement('div', { className: 'text-center' },
                        React.createElement('button', {
                          onClick: selectRandomWord,
                          className: 'bg-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 hover:bg-blue-700 hover:text-white shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 mx-auto',
                          disabled: isSpinning
                        },
                          React.createElement(Shuffle, { className: 'w-5 h-5 sm:w-6 sm:h-6' }),
                          isSpinning ? 'Auswählen...' : 'Wortauswahl'
                        )
                      )
                    )
              )
            )
          ),
          
          showExample && React.createElement('div', { className: 'fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4' },
            React.createElement('div', { className: 'bg-white rounded-2xl p-8 shadow-2xl border-4 border-blue-600 max-w-2xl w-full mx-auto' },
              React.createElement('div', { className: 'flex justify-between items-center mb-6' },
                React.createElement('h2', { className: 'text-2xl font-bold text-black' }, 'Verwendungsbeispiel'),
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('button', {
                    onClick: () => {
                      if (currentExample) {
                        const cleanText = currentExample.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]*>/g, '');
                        speak(cleanText);
                      }
                    },
                    className: 'bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg',
                    title: 'Leer ejemplo completo'
                  }, React.createElement(Volume2, { className: 'w-4 h-4' })),
                  React.createElement('button', {
                    onClick: () => setShowExample(false),
                    className: 'bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-300'
                  }, '✕')
                )
              ),
              React.createElement('div', {
                className: 'text-lg text-gray-800 leading-relaxed',
                dangerouslySetInnerHTML: {
                  __html: currentExample.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600 font-bold">$1</strong>')
                }
              }),
              React.createElement('div', { className: 'mt-6 text-center' },
                React.createElement('button', {
                  onClick: () => setShowExample(false),
                  className: 'bg-blue-600 text-white py-2 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300'
                }, 'Schließen')
              )
            )
          ),
          
          showDefinition && React.createElement('div', { className: 'fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4' },
            React.createElement('div', { className: 'bg-white rounded-2xl p-8 shadow-2xl border-4 border-blue-600 max-w-2xl w-full mx-auto' },
              React.createElement('div', { className: 'flex justify-between items-center mb-6' },
                React.createElement('h2', { className: 'text-2xl font-bold text-black' }, 'Définition'),
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('button', {
                    onClick: () => {
                      if (currentWord && currentDefinition) {
                        speak(currentWord.word);
                        setTimeout(() => {
                          speak(currentDefinition);
                        }, 1200);
                      }
                    },
                    className: 'bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg',
                    title: 'Listen to word and definition'
                  }, React.createElement(Volume2, { className: 'w-4 h-4' })),
                  React.createElement('button', {
                    onClick: () => setShowDefinition(false),
                    className: 'bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-300'
                  }, '✕')
                )
              ),
              React.createElement('div', { className: 'text-lg text-gray-800 leading-relaxed' },
                React.createElement('strong', { className: 'text-green-600 text-xl' }, `${currentWord?.word}:`),
                ` ${currentDefinition}`
              ),
              React.createElement('div', { className: 'mt-6 text-center' },
                React.createElement('button', {
                  onClick: () => setShowDefinition(false),
                  className: 'bg-blue-600 text-white py-2 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300'
                }, 'Schließen')
              )
            )
          )
        );
      };

      const InstructionsScreen = () => {
        const [expandedSection, setExpandedSection] = useState(null);

        const toggleSection = (sect) => {
          setExpandedSection(expandedSection === sect ? null : sect);
        };

        return React.createElement('div', { className: 'min-h-screen p-4 sm:p-8 flex items-center justify-center' },
          React.createElement('div', { className: 'max-w-5xl w-full bg-black bg-opacity-40 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-white border-opacity-15 relative min-h-[500px] flex flex-col md:flex-row gap-8 animate-fadeIn' },
            
            React.createElement('button', {
              onClick: () => setCurrentScreen('home'),
              className: 'absolute top-4 left-4 bg-black text-yellow-400 p-2 sm:p-3 rounded-full hover:bg-yellow-600 hover:text-black transition-all duration-300 shadow-lg transform hover:scale-110 z-10 border border-white/10'
            }, React.createElement(ArrowLeft, { className: 'w-5 h-5 sm:w-6 sm:h-6' })),

            // Panel gauche: Sélecteur de badges hexagonaux
            React.createElement('div', { className: 'w-full md:w-48 flex flex-row md:flex-col justify-center items-center gap-4 mt-8 md:mt-0 flex-wrap' },
              
              // Hexagone 1: Ziel
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

              // Hexagone 2: Stufen
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

              // Hexagone 3: Spielmodi
              React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
                React.createElement('button', {
                  onClick: () => toggleSection('modes'),
                  className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                    expandedSection === 'modes' ? 'bg-green-500 text-black border-green-600' : ''
                  }`,
                  style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
                }, 
                  React.createElement('div', { className: 'text-2xl mb-1' }, '🎮'),
                  React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Spielmodi')
                )
              ),

              // Hexagone 4: Regeln
              React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
                React.createElement('button', {
                  onClick: () => toggleSection('howToPlay'),
                  className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                    expandedSection === 'howToPlay' ? 'bg-green-500 text-black border-green-600' : ''
                  }`,
                  style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
                }, 
                  React.createElement('div', { className: 'text-2xl mb-1' }, '🎲'),
                  React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Regeln')
                )
              ),

              // Hexagone 5: Details
              React.createElement('div', { className: 'relative w-20 h-20 sm:w-24 sm:h-24' },
                React.createElement('button', {
                  onClick: () => toggleSection('features'),
                  className: `absolute inset-0 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex flex-col items-center justify-center shadow-lg transition-all duration-300 border border-yellow-400/20 ${
                    expandedSection === 'features' ? 'bg-green-500 text-black border-green-600' : ''
                  }`,
                  style: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
                }, 
                  React.createElement('div', { className: 'text-2xl mb-1' }, '🔧'),
                  React.createElement('div', { className: 'text-[10px] font-bold uppercase' }, 'Details')
                )
              )

            ),

            // Panel droit: Contenu détaillé étendu
            React.createElement('div', { className: 'flex-1 mt-6 md:mt-8' },
              !expandedSection && React.createElement('div', { className: 'flex items-center justify-center h-full text-center' },
                React.createElement('div', null,
                  React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🐝'),
                  React.createElement('h3', { className: 'text-2xl font-black text-white mb-2' }, 'Wählen Sie eine Rubrik'),
                  React.createElement('p', { className: 'text-gray-300 font-semibold' }, 'Klicken Sie links auf ein Sechseck, um Details anzuzeigen.')
                )
              ),

              expandedSection === 'objective' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
                React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                  React.createElement('span', null, '🎯'), 'Spielziel'
                ),
                React.createElement('p', { className: 'text-gray-200 leading-relaxed font-semibold text-base sm:text-lg' },
                  "Das Ziel dieses Spiels ist es, Ihre deutschen Rechtschreibkenntnisse spielerisch zu festigen. Indem Sie sich die Aussprache anhören und die richtige Schreibweise eingeben, verbessern Sie Ihr Sprachgefühl und Ihr Verständnis der Wörter."
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
                      React.createElement('strong', { className: 'text-yellow-400' }, 'Stufe B: '), 'B1, B1+, PET - Mittelstufe Wörter'
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
                      React.createElement('strong', { className: 'text-yellow-400' }, 'Wettbewerb: '), "Spielen Sie gegen die Uhr (30 Sekunden) mit maximal 3 Leben."
                    )
                  ),
                  React.createElement('li', { className: 'flex items-start p-4 bg-black/40 rounded-xl shadow-md border border-white/10' },
                    React.createElement('span', { className: 'w-4 h-4 bg-blue-500 rounded-full mr-3 mt-1' }),
                    React.createElement('div', null,
                      React.createElement('strong', { className: 'text-yellow-400' }, 'Training: '), "Üben Sie frei und ohne Zeitlimit, mit Definitionen und Beispielsätzen."
                    )
                  )
                )
              ),

              expandedSection === 'howToPlay' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn overflow-y-auto max-h-[380px]' },
                React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                  React.createElement('span', null, '🎲'), 'Spielanleitung'
                ),
                React.createElement('ol', { className: 'space-y-3 font-semibold text-gray-200 text-sm sm:text-base list-decimal pl-4' },
                  React.createElement('li', null, 'Wählen Sie Ihren Schwierigkeitsgrad (A, B oder C).'),
                  React.createElement('li', null, 'Wählen Sie den Spielmodus (Wettbewerb oder Training).'),
                  React.createElement('li', null, 'Hören Sie sich das Wort an, indem Sie auf die Aussprache-Schaltfläche klicken.'),
                  React.createElement('li', null, "Geben Sie die richtige Schreibweise in das Textfeld ein (oder nutzen Sie das Mikrofon zum Delettieren)."),
                  React.createElement('li', null, "Nutzen Sie die Hilfen (Definitionen, Beispiele) im Trainingsmodus."),
                  React.createElement('li', null, 'Drücken Sie auf Bestätigen, um Ihre Antwort abzusenden.')
                )
              ),

              expandedSection === 'features' && React.createElement('div', { className: 'p-6 bg-black bg-opacity-30 rounded-2xl border border-white border-opacity-10 h-full animate-fadeIn' },
                React.createElement('h3', { className: 'text-2xl sm:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-3' }, 
                  React.createElement('span', null, '🔧'), 'Funktionen'
                ),
                React.createElement('ul', { className: 'space-y-2.5 font-semibold text-gray-200 text-sm sm:text-base' },
                  React.createElement('li', null, '• Native Sprachsynthese mit Unterstützung für Premium-Akzente.'),
                  React.createElement('li', null, '• Erweiterte Spracherkennung mit sofortiger Transkription.'),
                  React.createElement('li', null, '• Dynamischer Tag-/Nachtmodus mit automatischer Speicherung Ihrer Einstellungen.'),
                  React.createElement('li', null, '• Exportieren Sie Ihre Vokabellisten und Ergebnisse im CSV-Format.'),
                  React.createElement('li', null, '• Premium-Interface basierend auf hochreaktivem Glassmorphic-Design.')
                )
              )
            )

          )
        );
      };

      const WinnersScreen = () => {
        const [selectedWinner, setSelectedWinner] = useState(null);
        const winners = [
          {
            year: 2024,
            name: "José Carpintero",
            group: "1ºC",
            level: "Level A",
            winningWord: "beautiful",
            trophy: "🥇",
            photo: "IMG/1A.webp"
          },
          {
            year: 2024,
            name: "Ángela García",
            group: "2ºA",
            level: "Level B",
            winningWord: "magnificent",
            trophy: "🥇",
            photo: "IMG/2B.jpg"
          },
          {
            year: 2024,
            name: "Sofío Contle",
            group: "3ºC",
            level: "Level C",
            winningWord: "exhilarating",
            trophy: "🥇",
            photo: "IMG/3C.webp"
          },
          {
            year: 2023,
            name: "Ashley Camacho",
            group: "1ºC",
            level: "Level A",
            winningWord: "wonderful",
            trophy: "🏆"
          },
          {
            year: 2023,
            name: "Aisha Hernandez",
            group: "2ºA",
            level: "Level B",
            winningWord: "extraordinary",
            trophy: "🏆"
          },
          {
            year: 2023,
            name: "David Gamaliel",
            group: "3ºA",
            level: "Level C",
            winningWord: "conscientious",
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
                "Wir feiern unsere Rechtschreib-Champions"
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
                        alt: `${winner.name} - Sieger ${winner.year}`,
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
                      React.createElement('p', { className: 'text-sm text-gray-400 mb-1' }, 'Mot Sieger:'),
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
                      alt: `${selectedWinner.name} - Sieger ${selectedWinner.year}`,
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
                    React.createElement('p', { className: 'text-xs sm:text-sm md:text-base text-gray-400 mb-1 sm:mb-2' }, 'Mot Sieger:'),
                    React.createElement('p', { className: 'text-base sm:text-lg md:text-xl font-bold text-white' },
                      `"${selectedWinner.winningWord}"`
                    )
                  )
                )
              )
            ),

            React.createElement('div', { className: 'mt-12 bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white border-opacity-15' },
              React.createElement('h2', { className: 'text-2xl font-bold text-yellow-400 mb-6 text-center' },
                'Statistiken du Concours'
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
          const headers = ['Mot', 'Aussprache', 'Définition', 'Beispielsatz'];
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
          link.setAttribute("download", `Spelling_Bee_${levelName.replace(/\s+/g, '_')}_Mots.csv`);
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
                'Télécharger la liste (CSV)'
              )
            ),

            React.createElement('div', { className: 'bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl p-4 sm:p-8 shadow-2xl border border-white border-opacity-15' },
              React.createElement('div', { className: 'flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-white/10 pb-6' },
                React.createElement('div', { className: 'relative w-full sm:w-80' },
                  React.createElement('input', {
                    type: 'text',
                    placeholder: '🔍 Rechercher des mots...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    className: 'w-full px-4 py-3 bg-black bg-opacity-50 text-white border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 font-semibold shadow-md placeholder-gray-500 transition-all'
                  })
                ),
                React.createElement('div', { className: 'text-white font-extrabold text-base bg-white bg-opacity-10 border border-white border-opacity-20 px-4 py-2 rounded-xl shadow-lg' },
                  `Anzeige de ${filteredWords.length} sur ${words.length} mots`
                )
              ),

              React.createElement('div', { className: 'overflow-x-auto max-h-[500px] border border-white border-opacity-15 rounded-2xl shadow-2xl bg-black bg-opacity-20' },
                React.createElement('table', { className: 'min-w-full divide-y divide-white/10 text-left' },
                  React.createElement('thead', { className: 'bg-black/85 text-yellow-400 sticky top-0 z-10' },
                    React.createElement('tr', null,
                      React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Mot'),
                      React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Aussprache'),
                      React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base border-r border-white/10' }, 'Définition'),
                      React.createElement('th', { className: 'px-6 py-4 font-extrabold text-sm sm:text-base' }, 'Beispielsatz')
                    )
                  ),
                  React.createElement('tbody', { className: 'divide-y divide-white/10 bg-black/10 font-semibold text-gray-200' },
                    filteredWords.length === 0 
                      ? React.createElement('tr', null,
                          React.createElement('td', { colSpan: 4, className: 'px-6 py-12 text-center text-gray-400 font-bold text-lg' }, 'Aucun mot trouvé correspondant à votre recherche.')
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

      const NavigationBar = () => {
        if (typeof setIsMenüOpen === 'undefined' || typeof isMenüOpen === 'undefined') {
          console.error('NavigationBar: isMenüOpen state not available');
          return null;
        }

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
          return `nav-item-btn-glass ${glowClass} px-3 py-2 font-bold text-[13px] lg:text-sm relative ${
            isActive 
              ? 'active-nav-btn text-white' 
              : 'text-gray-300'
          }`;
        };

        const handleAdminAccess = () => {
          const pass = prompt("Mot de passe Admin :");
          if (pass === atob('MTQxNTEzMA==')) {
            setIsAdminLogged(true);
            setCurrentScreen('admin');
            setIsMenüOpen(false);
          } else if (pass !== null) {
            alert("Mot de passe incorrect");
          }
        };

        const toggleTheme = () => {
          setThemeConfig(prev => {
            const newMode = prev.mode === 'night' ? 'day' : 'night';
            localStorage.setItem('bee_de_theme', newMode);
            return { ...prev, mode: newMode };
          });
        };

        const ThemeToggleButton = () => {
          return React.createElement('button', {
            onClick: toggleTheme,
            className: 'bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all ml-2 flex items-center justify-center flex-shrink-0',
            title: themeConfig.mode === 'night' ? 'Modo Día' : 'Modo Noche',
            style: { width: '38px', height: '38px', fontSize: '1.1rem' }
          }, themeConfig.mode === 'night' ? '🌙' : '☀️');
        };

        const AdminSettingsButton = () => {
          return React.createElement('button', {
            onClick: () => setShowThemeModal(true),
            className: 'bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all ml-2 flex items-center justify-center flex-shrink-0',
            title: 'Paramètres Visuels',
            style: { width: '38px', height: '38px', fontSize: '1.1rem' }
          }, '⚙️');
        };

        const ChangeLanguageButton = () => {
          return React.createElement('a', {
            href: 'https://spellingbee-portal.vercel.app/',
            className: 'bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-yellow-400 border-opacity-40 hover:bg-yellow-400 hover:text-black transition-all ml-2 flex items-center justify-center text-yellow-400 hover:border-yellow-400 flex-shrink-0 font-bold text-[11px] px-3 uppercase tracking-wider',
            title: 'Changer de langue',
            style: { height: '38px', lineHeight: '38px' }
          }, '🌐 Anderes langue ?');
        };

        const EditModeToggleButton = () => {
          if (!isAdminLogged) return null;
          return React.createElement('button', {
            onClick: () => setIsEditMode(!isEditMode),
            className: 'bg-yellow-400 text-black px-4 py-2 rounded-full font-bold ml-2 transition-all hover:bg-yellow-300 text-sm flex-shrink-0',
            title: isEditMode ? 'Terminer Édition' : '✏️ Éditer Layout',
          }, isEditMode ? 'Fin Édition' : '✏️ Éditer Layout');
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
              React.createElement('div', { className: 'flex flex-col leading-[1.1] text-left animate-fade-in' },
                React.createElement('span', { className: 'font-black text-[9px] tracking-wider text-slate-300 uppercase' }, "CONCOURS"),
                React.createElement('span', { className: 'font-black text-[12px] tracking-widest text-yellow-400 uppercase -mt-0.5' }, "D'WETTBEWERB")
              )
            ),
            
            React.createElement('button', {
              onClick: () => setIsMenüOpen(!isMenüOpen),
              className: 'md:hidden text-white hover:text-yellow-400 transition-colors duration-300 p-2'
            },
              React.createElement('div', { className: 'w-6 h-6 flex flex-col justify-center items-center' },
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 ${isMenüOpen ? 'rotate-45 translate-y-1.5' : ''}`
                }),
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenüOpen ? 'opacity-0' : ''}`
                }),
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenüOpen ? '-rotate-45 -translate-y-1.5' : ''}`
                })
              )
            ),
            
            React.createElement('div', { 
              id: 'desktop-nav-menu',
              className: 'hidden md:flex items-center gap-3 sm:gap-6 relative py-2' 
            },
              React.createElement('button', {
                onClick: () => {
                  setGameMode(null);
                  setCurrentScreen('home');
                  setIsMenüOpen(false);
                },
                className: getNavLinkClass('home', null, 'card-winners-glow')
              }, 'Accueil'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('contest');
                  setCurrentScreen('menu');
                  setIsMenüOpen(false);
                },
                className: getNavLinkClass('menu', () => gameMode === 'contest', 'card-contest-glow')
              }, 'Concours'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('training');
                  setCurrentScreen('menu');
                  setIsMenüOpen(false);
                },
                className: getNavLinkClass('menu', () => gameMode === 'training', 'card-training-glow')
              }, 'Entraînement'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('instructions');
                  setIsMenüOpen(false);
                },
                className: getNavLinkClass('instructions', null, 'card-instructions-glow')
              }, 'Instructions'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('winners');
                  setIsMenüOpen(false);
                },
                className: getNavLinkClass('winners', null, 'card-winners-glow')
              }, 'Siegers'),
              ThemeToggleButton(),
              ChangeLanguageButton(),
              EditModeToggleButton(),

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
            React.createElement('div', { className: 'hidden md:block' },
              React.createElement('button', {
                onClick: handleAdminAccess,
                className: 'btn-admin-glass flex items-center gap-1 font-bold'
              }, '⚙️ Admin')
            )
          ),
          
          React.createElement('div', {
            className: `md:hidden absolute top-full left-0 right-0 bg-black transition-all duration-300 ease-in-out overflow-hidden z-50 ${
              isMenüOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`
          },
            React.createElement('div', { className: 'py-4 space-y-2 border-t border-gray-700' },
              React.createElement('button', {
                onClick: () => {
                  setGameMode(null);
                  setCurrentScreen('home');
                  setIsMenüOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentScreen === 'home' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '🏠 Accueil'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('contest');
                  setCurrentScreen('menu');
                  setIsMenüOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentScreen === 'menu' && gameMode === 'contest'
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '🏆 Concours'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('training');
                  setCurrentScreen('menu');
                  setIsMenüOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  (currentScreen === 'menu' || currentScreen === 'wordList') && gameMode === 'training'
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '💪 Entraînement'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('instructions');
                  setIsMenüOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentScreen === 'instructions' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '📖 Instructions'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('winners');
                  setIsMenüOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentScreen === 'winners' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '🏅 Siegers'),
              React.createElement('button', {
                onClick: handleAdminAccess,
                className: `w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentScreen === 'admin' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-gray-800 hover:text-yellow-400'
                }`
              }, '⚙️ Admin'),
              React.createElement('a', {
                href: 'https://spellingbee-portal.vercel.app/',
                className: 'w-full text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 text-yellow-400 hover:bg-gray-800 hover:text-yellow-300 block border border-dashed border-yellow-400/30 mt-2'
              }, '🌐 Anderes langue ?'),
              React.createElement('div', { className: 'flex flex-col gap-2 px-4 py-2 border-t border-gray-800 mt-2' },
                React.createElement('div', { className: 'flex justify-center gap-4' },
                  ThemeToggleButton()
                ),
                EditModeToggleButton()
              )
            )
          ),
          
          isMenüOpen && React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden',
            onClick: () => setIsMenüOpen(false)
          })
        );
      };

      // Agregar log para verificar que el componente se renderiza
      console.log('Rendering SpellingBeeGame, currentScreen:', currentScreen);
      
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
        currentScreen !== 'home' && React.createElement(StarrySky),
        currentScreen !== 'home' && React.createElement(Fireflies),
        currentScreen !== 'home' && React.createElement(Comets),
        React.createElement(NavigationBar),
        React.createElement(ThemeSettingsModal, {
          showThemeModal,
          setShowThemeModal,
          themeConfig,
          setThemeConfig
        }),
        currentScreen === 'home' && React.createElement(HomeScreen, { isEditMode }),
        currentScreen === 'menu' && React.createElement(MenüScreen),
        currentScreen === 'game' && React.createElement(GameScreen),
        currentScreen === 'instructions' && React.createElement(InstructionsScreen),
        currentScreen === 'winners' && React.createElement(WinnersScreen),
        currentScreen === 'wordList' && React.createElement(WordListScreen),
        currentScreen === 'admin' && React.createElement(AdminScreen),
        
        // Botón Flotante de Ayuda
        React.createElement('div', {
          className: `help-button-container ${helpDocked ? 'help-button-docked' : ''}`
        },
          // Botón principal
          React.createElement('button', {
            onClick: () => setShowHelpMenü(!showHelpMenü),
            className: 'w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 border-2 border-gray-200'
          }, '?'),
          
          // Gesto/Botón para acoplar (dock)
          React.createElement('button', {
            onClick: (e) => {
              e.stopPropagation();
              setHelpDocked(!helpDocked);
              setShowHelpMenü(false);
            },
            className: 'absolute -top-2 -left-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'
          }, helpDocked ? '➡️' : '⬅️'),
          
          // Menú de opciones (desplegable arriba del botón)
          showHelpMenü && React.createElement('div', {
            className: 'absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl p-2 w-48 border-2 border-gray-200 animate-slideUp'
          },
            React.createElement('button', {
              onClick: () => {
                setHelpModalType('report');
                setShowHelpMenü(false);
              },
              className: 'w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold rounded-lg flex items-center gap-2 help-option-btn'
            }, '⚠️ Problem melden'),
            React.createElement('button', {
              onClick: () => {
                setHelpModalType('suggestion');
                setShowHelpMenü(false);
              },
              className: 'w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-bold rounded-lg flex items-center gap-2 mt-1 help-option-btn'
            }, '💡 Vorschläge')
          )
        ),
        
        // Modales de Ayuda
        helpModalType && React.createElement(HelpModal, {
          type: helpModalType,
          onClose: () => setHelpModalType(null),
          onSubmit: (data) => {
            if (helpModalType === 'report') {
              setReports([...reports, { ...data, id: Date.now(), date: new Date().toLocaleString() }]);
            } else {
              setVorschläge([...suggestions, { ...data, id: Date.now(), date: new Date().toLocaleString() }]);
            }
            setHelpModalType(null);
            alert('Merci ! Votre message a été enregistré.');
          }
        })
      );
    };

    // Componente Modal de Ayuda
    const HelpModal = ({ type, onClose, onSubmit }) => {
      const [step, setStep] = useState(1);
      const [formData, setFormData] = useState(
        type === 'report' 
          ? { category: '', part: '', description: '' } 
          : { description: '' }
      );

      const isReport = type === 'report';

      return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000] p-4 animate-fadeIn'
      },
        React.createElement('div', {
          className: 'bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-yellow-400 animate-modalGrow'
        },
          // Header
          React.createElement('div', { className: 'bg-yellow-400 p-6 flex justify-between items-center' },
            React.createElement('h2', { className: 'text-2xl font-black text-black' }, 
              isReport ? '⚠️ Signaler un Problème' : '💡 Suggestion'
            ),
            React.createElement('button', { onClick: onClose, className: 'text-2xl font-bold' }, '✕')
          ),
          
          // Cuerpo
          React.createElement('div', { className: 'p-6' },
            isReport ? (
              // FLUJO DE REPORTE
              step === 1 ? (
                React.createElement('div', { className: 'space-y-4' },
                  React.createElement('p', { className: 'font-bold text-gray-700' }, 'Quel type de problème avez-vous rencontré ?'),
                  ['Audio/Voix', 'Visualisation', 'Rechtschreibung', 'Anderes'].map(cat => 
                    React.createElement('button', {
                      key: cat,
                      onClick: () => {
                        setFormData({...formData, category: cat});
                        setStep(2);
                      },
                      className: 'w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all font-bold'
                    }, cat)
                  )
                )
              ) : step === 2 ? (
                React.createElement('div', { className: 'space-y-4' },
                  React.createElement('p', { className: 'font-bold text-gray-700' }, 'Dans quelle partie de l\'application cela s\'est-il produit ?'),
                  ['Accueil', 'Menü', 'Dans le Spiel', 'Siegers'].map(part => 
                    React.createElement('button', {
                      key: part,
                      onClick: () => {
                        setFormData({...formData, part: part});
                        setStep(3);
                      },
                      className: 'w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all font-bold'
                    }, part)
                  ),
                  React.createElement('button', { onClick: () => setStep(1), className: 'text-blue-600 font-bold underline w-full text-center mt-2' }, '← Zurück')
                )
              ) : (
                React.createElement('div', { className: 'space-y-4' },
                  React.createElement('p', { className: 'font-bold text-gray-700' }, 'Dites-nous en un peu plus :'),
                  React.createElement('textarea', {
                    className: 'w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none h-32',
                    placeholder: 'Schreiben Sie Ihre Beschreibung hier...',
                    value: formData.description,
                    onChange: (e) => setFormData({...formData, description: e.target.value})
                  }),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', { onClick: () => setStep(2), className: 'flex-1 p-4 bg-gray-100 rounded-xl font-bold' }, 'Zurück'),
                    React.createElement('button', { 
                      onClick: () => onSubmit(formData),
                      disabled: !formData.description.trim(),
                      className: 'flex-1 p-4 bg-yellow-400 rounded-xl font-black disabled:opacity-50' 
                    }, 'ENVOYER')
                  )
                )
              )
            ) : (
              // FLUJO DE SUGERENCIAS
              React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'bg-blue-50 p-4 rounded-xl border-l-4 border-blue-400' },
                  React.createElement('p', { className: 'text-sm text-blue-800' }, 
                    '🌟 Ihre Ideen helfen uns zu wachsen! Vous pouvez suggérer de nouveaux mots, des changements de design ou des fonctionnalités supplémentaires.'
                  )
                ),
                React.createElement('p', { className: 'font-bold text-gray-700' }, 'Schreiben Sie Ihren Vorschlag:'),
                React.createElement('textarea', {
                  className: 'w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 outline-none h-40',
                  placeholder: 'Ex : J\'aimerais qu\'il y ait un mode contre-la-montre...',
                  value: formData.description,
                  onChange: (e) => setFormData({...formData, description: e.target.value})
                }),
                React.createElement('button', { 
                  onClick: () => onSubmit(formData),
                  disabled: !formData.description.trim(),
                  className: 'w-full p-4 bg-yellow-400 rounded-xl font-black disabled:opacity-50' 
                }, 'ENVOYER LA SUGGESTION')
              )
            )
          )
        )
      );
    };

    // Componente Pantalla de Admin
    const AdminScreen = () => {
      const [view, setView] = useState('reports'); // 'reports' o 'suggestions'
      const reports = JSON.parse(localStorage.getItem('bee_de_reports') || '[]');
      const suggestions = JSON.parse(localStorage.getItem('bee_de_suggestions') || '[]');

      const clearData = () => {
        if (confirm('Sind Sie sicher, dass Sie alle gespeicherten Daten löschen möchten?')) {
          localStorage.setItem('bee_de_reports', '[]');
          localStorage.setItem('bee_de_suggestions', '[]');
          location.reload();
        }
      };

      return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-6 pt-24' },
        React.createElement('div', { className: 'max-w-4xl mx-auto' },
          React.createElement('div', { className: 'flex justify-between items-center mb-8' },
            React.createElement('h1', { className: 'text-4xl font-black text-black' }, '⚙️ Panneau d\'Admin'),
            React.createElement('button', { 
              onClick: clearData,
              className: 'bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm'
            }, 'Tout Löschen')
          ),

          // Tabs
          React.createElement('div', { className: 'flex gap-4 mb-6' },
            React.createElement('button', {
              onClick: () => setView('reports'),
              className: `flex-1 p-4 rounded-xl font-bold transition-all ${view === 'reports' ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white text-gray-50'}`
            }, `Berichte (${reports.length})`),
            React.createElement('button', {
              onClick: () => setView('suggestions'),
              className: `flex-1 p-4 rounded-xl font-bold transition-all ${view === 'suggestions' ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white text-gray-50'}`
            }, `Vorschläge (${suggestions.length})`)
          ),

          // Lista
          React.createElement('div', { className: 'space-y-4' },
            view === 'reports' ? (
              reports.length === 0 ? React.createElement('p', { className: 'text-center py-20 text-gray-400 font-bold' }, 'Noch keine Berichte.') :
              reports.map(r => React.createElement('div', { key: r.id, className: 'bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-400' },
                React.createElement('div', { className: 'flex justify-between mb-2' },
                  React.createElement('span', { className: 'bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black' }, r.category),
                  React.createElement('span', { className: 'text-gray-400 text-xs' }, r.date)
                ),
                React.createElement('p', { className: 'font-black text-lg mb-1' }, `Partie : ${r.part}`),
                React.createElement('p', { className: 'text-gray-700' }, r.description)
              ))
            ) : (
              suggestions.length === 0 ? React.createElement('p', { className: 'text-center py-20 text-gray-400 font-bold' }, 'Noch keine Vorschläge.') :
              suggestions.map(s => React.createElement('div', { key: s.id, className: 'bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-400' },
                React.createElement('div', { className: 'flex justify-between mb-2' },
                  React.createElement('span', { className: 'bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black' }, 'SUGGESTION'),
                  React.createElement('span', { className: 'text-gray-400 text-xs' }, s.date)
                ),
                React.createElement('p', { className: 'text-gray-700' }, s.description)
              ))
            )
          )
        )
      );
    };

    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(SpielRechtschreibung));
