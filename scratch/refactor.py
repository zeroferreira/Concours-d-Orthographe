import os

html_path = 'English/index.html'
css_path = 'English/css/style.css'
js_path = 'English/js/app.js'

# Read original index.html lines
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Verify boundaries
assert lines[16].strip() == '<style>'
assert lines[751].strip() == '</style>'
assert lines[755].strip() == '<script type="text/javascript">'
assert lines[8620].strip() == '</script>'

# 1. Extract CSS
css_content = "".join(lines[17:751])

# Fix relative image paths in style.css
css_content = css_content.replace("url('../img/Universo.png')", "url('../../img/Universo.png')")
css_content = css_content.replace("url('../img/Abeja.png')", "url('../../img/Abeja.png')")

# Replace old static indicator style
old_nav_indicator_style = """/* Active Nav Indicator (Mockup Underline + Dot) */
    .active-nav-indicator {
      position: relative;
      color: #ffffff !important;
    }
    .active-nav-indicator::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 15%;
      width: 70%;
      height: 2px;
      background: #FFE259;
      box-shadow: 0 0 8px #FFE259, 0 0 15px rgba(255, 226, 89, 0.5);
      border-radius: 99px;
    }
    .active-nav-indicator::before {
      content: '•';
      position: absolute;
      bottom: -23px;
      left: 50%;
      transform: translateX(-50%);
      color: #FFE259;
      font-size: 1.1rem;
      text-shadow: 0 0 8px #FFE259;
    }"""

new_nav_indicator_style = """/* Active Nav Indicator */
    .active-nav-indicator {
      position: relative;
      color: #ffffff !important;
    }"""

css_content = css_content.replace(old_nav_indicator_style, new_nav_indicator_style)

# Write style.css
os.makedirs(os.path.dirname(css_path), exist_ok=True)
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)
print("CSS written successfully!")

# 2. Extract original JS lines
js_lines = lines[756:8620]

# Convert to a single string for robust modifications
js_code = "".join(js_lines)

# Find the start of the Theme Settings / NavigationBar block inside SpellingBeeGame
# It starts around: "// Theme Settings Components"
# and ends right after NavigationBar block which ends with:
# "          // Overlay para cerrar el menú en móviles\n          isMenuOpen && React.createElement('div', {\n            className: 'fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden',\n            onClick: () => setIsMenuOpen(false)\n          })\n        );\n      };"

old_nav_components = """      // Theme Settings Components
      const toggleTheme = () => {
        setThemeConfig(prev => ({
          ...prev,
          mode: prev.mode === 'night' ? 'day' : 'night'
        }));
      };

      const ThemeToggleButton = () => {
        return React.createElement('button', {
          onClick: toggleTheme,
          className: 'px-3 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all text-xl ml-2',
          title: themeConfig.mode === 'night' ? 'Modo Día' : 'Modo Noche'
        }, themeConfig.mode === 'night' ? '🌙' : '☀️');
      };

      const AdminSettingsButton = () => {
        return React.createElement('button', {
          onClick: () => setShowThemeModal(true),
          className: 'px-3 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all text-xl ml-2',
          title: 'Ajustes Visuales'
        }, '⚙️');
      };

      const ThemeSettingsModal = () => {
        if (!showThemeModal) return null;
        return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
          React.createElement('div', { className: 'bg-[#1a1625] bg-opacity-95 border border-purple-500 border-opacity-30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-white' },
            React.createElement('button', {
              onClick: () => setShowThemeModal(false),
              className: 'absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold'
            }, '✕'),
            React.createElement('h2', { className: 'text-2xl font-bold mb-6 flex items-center gap-2' }, '⚙️ Ajustes Visuales'),
            
            // Speed Slider
            React.createElement('div', { className: 'mb-6' },
              React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Velocidad de Animaciones (Fondo, Luces)'),
              React.createElement('input', {
                type: 'range', min: '0.1', max: '3', step: '0.1',
                value: themeConfig.effectSpeed,
                onChange: (e) => setThemeConfig(p => ({ ...p, effectSpeed: parseFloat(e.target.value) })),
                className: 'w-full accent-purple-500'
              })
            ),
            
            // Universe Opacity
            React.createElement('div', { className: 'mb-6' },
              React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Opacidad del Universo'),
              React.createElement('input', {
                type: 'range', min: '0', max: '1', step: '0.05',
                value: themeConfig.bgOpacity,
                onChange: (e) => setThemeConfig(p => ({ ...p, bgOpacity: parseFloat(e.target.value) })),
                className: 'w-full accent-blue-500'
              })
            ),
            
            // Bee Opacity
            React.createElement('div', { className: 'mb-6' },
              React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Opacidad de la Abeja'),
              React.createElement('input', {
                type: 'range', min: '0', max: '1', step: '0.05',
                value: themeConfig.beeOpacity,
                onChange: (e) => setThemeConfig(p => ({ ...p, beeOpacity: parseFloat(e.target.value) })),
                className: 'w-full accent-yellow-400'
              })
            ),
            
            // Sparkles Brightness
            React.createElement('div', { className: 'mb-4' },
              React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Brillo de Destellos (Luciérnagas)'),
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

      const NavigationBar = () => {
        // Asegurar que las variables estén disponibles
        if (typeof setIsMenuOpen === 'undefined' || typeof isMenuOpen === 'undefined') {
          console.error('NavigationBar: isMenuOpen state not available');
          return null;
        }

        const handleAdminAccess = () => {
          const pass = prompt("Admin Password:");
          // Ofuscación simple: 1415130* -> MTQxNTEzMCo=
          if (pass === atob('MTQxNTEzMCo=')) {
            setIsAdminLogged(true);
            setCurrentScreen('admin');
            setIsMenuOpen(false);
          } else if (pass !== null) {
            alert("Incorrect password");
          }
        };

        const getNavLinkClass = (screenName, extraCheck = null, glowClass = '') => {
          const isActive = extraCheck 
            ? (currentScreen === screenName && extraCheck()) 
            : currentScreen === screenName;
          return `nav-item-btn-glass ${glowClass} px-4 py-2 font-semibold text-sm relative ${
            isActive 
              ? 'active-nav-indicator text-white' 
              : 'text-gray-300'
          }`;
        };

        const GearIcon = () => React.createElement('svg', {
          className: 'w-4 h-4',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2',
          viewBox: '0 0 24 24',
          style: { display: 'inline-block' }
        }, React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        }), React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        }));
        
        return React.createElement('nav', { 
          className: 'floating-nav-capsule relative px-6 py-3',
          style: { zIndex: 1000 }
        },
          React.createElement('div', { className: 'w-full flex justify-between items-center' },
            // Logo o título con hexágono y estilo mockup
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
                    src: '../img/Abeja.png',
                    alt: 'Logo Bee',
                    className: 'w-8 h-8 object-contain filter drop-shadow-[0_2px_8px_rgba(253,224,71,0.45)]'
                  })
                )
              ),
              React.createElement('span', { className: 'font-black text-sm sm:text-base tracking-wider text-white' },
                'SPELLING ',
                React.createElement('span', { className: 'text-yellow-400' }, 'BEE')
              )
            ),
            
            // Botón hamburguesa (visible solo en móviles)
            React.createElement('button', {
              onClick: () => setIsMenuOpen(!isMenuOpen),
              className: 'md:hidden text-white hover:text-yellow-400 transition-colors duration-300 p-2'
            },
              React.createElement('div', { className: 'w-6 h-6 flex flex-col justify-center items-center' },
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`
                }),
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`
                }),
                React.createElement('span', {
                  className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`
                })
              )
            ),
            
            // Menú de navegación (visible en desktop)
            React.createElement('div', { className: 'hidden md:flex items-center gap-2 sm:gap-4' },
              React.createElement('button', {
                onClick: () => {
                  setGameMode(null);
                  setCurrentScreen('home');
                  setIsMenuOpen(false);
                },
                className: getNavLinkClass('home', null, 'card-winners-glow')
              }, 'Home'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('contest');
                  setCurrentScreen('menu');
                  setIsMenuOpen(false);
                },
                className: getNavLinkClass('menu', () => gameMode === 'contest', 'card-contest-glow')
              }, 'Contest'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('training');
                  setCurrentScreen('menu');
                  setIsMenuOpen(false);
                },
                className: getNavLinkClass('menu', () => gameMode === 'training', 'card-training-glow')
              }, 'Training'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('instructions');
                  setIsMenuOpen(false);
                },
                className: getNavLinkClass('instructions', null, 'card-instructions-glow')
              }, 'Instructions'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('winners');
                  setIsMenuOpen(false);
                },
                className: getNavLinkClass('winners', null, 'card-winners-glow')
              }, 'Winners'),
              React.createElement(ThemeToggleButton),
              isAdminLogged && React.createElement(AdminSettingsButton),
              isAdminLogged && React.createElement('button', {
                onClick: () => {
                  setIsEditMode(!isEditMode);
                  setCurrentScreen('home'); // Asegurarnos de ver los elementos
                },
                className: 'ml-2 px-3 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-colors shadow-lg'
              }, isEditMode ? 'Terminar Edición' : '✏️ Editar Layout')
            ),

            // Botón Admin a la derecha (en desktop)
            React.createElement('div', { className: 'hidden md:block' },
              React.createElement('button', {
                onClick: handleAdminAccess,
                className: 'btn-admin-glass'
              },
                React.createElement(GearIcon),
                React.createElement('span', null, 'Admin')
              )
            )
          ),
          
          // Menú móvil desplegable con fondo de cristal
          React.createElement('div', {
            className: `md:hidden absolute top-full left-0 right-0 mt-2 bg-slate-950 bg-opacity-95 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden z-50 ${
              isMenuOpen ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 pointer-events-none'
            }`
          },
            React.createElement('div', { className: 'flex flex-col gap-2' },
              React.createElement('button', {
                onClick: () => {
                  setGameMode(null);
                  setCurrentScreen('home');
                  setIsMenuOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentScreen === 'home' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
                }`
              }, '🏠 Home'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('contest');
                  setCurrentScreen('menu');
                  setIsMenuOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentScreen === 'menu' && gameMode === 'contest'
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
                }`
              }, '🏆 Contest'),
              React.createElement('button', {
                onClick: () => {
                  setGameMode('training');
                  setCurrentScreen('menu');
                  setIsMenuOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  (currentScreen === 'menu' || currentScreen === 'wordList') && gameMode === 'training'
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
                }`
              }, '💪 Training'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('instructions');
                  setIsMenuOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentScreen === 'instructions' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
                }`
              }, '📖 Instructions'),
              React.createElement('button', {
                onClick: () => {
                  setCurrentScreen('winners');
                  setIsMenuOpen(false);
                },
                className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentScreen === 'winners' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
                }`
              }, '🏅 Winners'),
              isAdminLogged && React.createElement('div', { className: 'py-2 flex flex-col gap-2 justify-center items-center' },
                React.createElement(ThemeToggleButton),
                isAdminLogged && React.createElement(AdminSettingsButton),
                React.createElement('button', {
                  onClick: () => {
                    setIsEditMode(!isEditMode);
                    setCurrentScreen('home');
                    setIsMenuOpen(false);
                  },
                  className: 'px-4 py-2 bg-yellow-400 text-black font-bold rounded-full w-full'
                }, isEditMode ? 'Terminar Edición' : '✏️ Editar Layout')
              ),
              React.createElement('button', {
                onClick: handleAdminAccess,
                className: 'w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400 flex items-center gap-2 border-t border-white border-opacity-10 mt-2 pt-4'
              }, 
                React.createElement(GearIcon),
                React.createElement('span', null, 'Admin')
              )
            )
          ),
          
          // Overlay para cerrar el menú en móviles
          isMenuOpen && React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden',
            onClick: () => setIsMenuOpen(false)
          })
        );
      };"""

# Replace it with our placeholder comment to remove them from SpellingBeeGame component
assert old_nav_components in js_code, "Failed to find original subcomponents inside extracted JS!"
js_code = js_code.replace(old_nav_components, "      // Subcomponents moved globally to the bottom of the file to prevent React remounting")
print("Removed old subcomponents from SpellingBeeGame scope successfully!")

# Now replace where NavigationBar and ThemeSettingsModal are called in SpellingBeeGame's return block
# Old calls:
#        React.createElement(NavigationBar),
#        currentScreen !== 'home' && React.createElement(ThemeSettingsModal),
# ...
#        currentScreen === 'home' && React.createElement(ThemeSettingsModal),

old_nav_render = "        React.createElement(NavigationBar),"
new_nav_render = """        React.createElement(NavigationBar, {
          currentScreen,
          setCurrentScreen,
          gameMode,
          setGameMode,
          isMenuOpen,
          setIsMenuOpen,
          isAdminLogged,
          setIsAdminLogged,
          isEditMode,
          setIsEditMode,
          themeConfig,
          setThemeConfig,
          showThemeModal,
          setShowThemeModal
        }),"""

js_code = js_code.replace(old_nav_render, new_nav_render)

old_modal_render_1 = "        currentScreen !== 'home' && React.createElement(ThemeSettingsModal),"
new_modal_render_1 = "        currentScreen !== 'home' && React.createElement(ThemeSettingsModal, { showThemeModal, setShowThemeModal, themeConfig, setThemeConfig }),"
js_code = js_code.replace(old_modal_render_1, new_modal_render_1)

old_modal_render_2 = "        currentScreen === 'home' && React.createElement(ThemeSettingsModal),"
new_modal_render_2 = "        currentScreen === 'home' && React.createElement(ThemeSettingsModal, { showThemeModal, setShowThemeModal, themeConfig, setThemeConfig }),"
js_code = js_code.replace(old_modal_render_2, new_modal_render_2)
print("Updated subcomponent render props successfully!")

# Define the new, corrected global subcomponents to be appended at the bottom
global_subcomponents = """
    // ==========================================
    // GLOBAL SUBCOMPONENTS (PREVENT REACT REMOUNTING)
    // ==========================================

    const ThemeSettingsModal = ({ showThemeModal, setShowThemeModal, themeConfig, setThemeConfig }) => {
      if (!showThemeModal) return null;
      return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4' },
        React.createElement('div', { className: 'bg-[#1a1625] bg-opacity-95 border border-purple-500 border-opacity-30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-white' },
          React.createElement('button', {
            onClick: () => setShowThemeModal(false),
            className: 'absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold'
          }, '✕'),
          React.createElement('h2', { className: 'text-2xl font-bold mb-6 flex items-center gap-2' }, '⚙️ Ajustes Visuales'),
          
          // Speed Slider
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Velocidad de Animaciones (Fondo, Luces)'),
            React.createElement('input', {
              type: 'range', min: '0.1', max: '3', step: '0.1',
              value: themeConfig.effectSpeed,
              onChange: (e) => setThemeConfig(p => ({ ...p, effectSpeed: parseFloat(e.target.value) })),
              className: 'w-full accent-purple-500'
            })
          ),
          
          // Universe Opacity
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Opacidad del Universo'),
            React.createElement('input', {
              type: 'range', min: '0', max: '1', step: '0.05',
              value: themeConfig.bgOpacity,
              onChange: (e) => setThemeConfig(p => ({ ...p, bgOpacity: parseFloat(e.target.value) })),
              className: 'w-full accent-blue-500'
            })
          ),
          
          // Bee Opacity
          React.createElement('div', { className: 'mb-6' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Opacidad de la Abeja'),
            React.createElement('input', {
              type: 'range', min: '0', max: '1', step: '0.05',
              value: themeConfig.beeOpacity,
              onChange: (e) => setThemeConfig(p => ({ ...p, beeOpacity: parseFloat(e.target.value) })),
              className: 'w-full accent-yellow-400'
            })
          ),
          
          // Sparkles Brightness
          React.createElement('div', { className: 'mb-4' },
            React.createElement('label', { className: 'block text-sm text-purple-200 mb-2 font-semibold' }, 'Brillo de Destellos (Luciérnagas)'),
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

    const NavigationBar = ({
      currentScreen,
      setCurrentScreen,
      gameMode,
      setGameMode,
      isMenuOpen,
      setIsMenuOpen,
      isAdminLogged,
      setIsAdminLogged,
      isEditMode,
      setIsEditMode,
      themeConfig,
      setThemeConfig,
      showThemeModal,
      setShowThemeModal
    }) => {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, color: '#FFE259', opacity: 0 });

      const navItems = [
        { id: 'home', color: '#FFD54F' },       // Yellow/Gold
        { id: 'contest', color: '#BA68C8' },    // Purple
        { id: 'training', color: '#29B6F6' },   // Blue
        { id: 'instructions', color: '#26A69A' },// Emerald
        { id: 'winners', color: '#FFD54F' }     // Yellow/Gold
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
      }, [currentScreen, gameMode, windowWidth]);

      const handleAdminAccess = () => {
        const pass = prompt("Admin Password:");
        if (pass === atob('MTQxNTEzMCo=')) {
          setIsAdminLogged(true);
          setCurrentScreen('admin');
          setIsMenuOpen(false);
        } else if (pass !== null) {
          alert("Incorrect password");
        }
      };

      const toggleTheme = () => {
        setThemeConfig(prev => ({
          ...prev,
          mode: prev.mode === 'night' ? 'day' : 'night'
        }));
      };

      const ThemeToggleButton = () => {
        return React.createElement('button', {
          onClick: toggleTheme,
          className: 'px-3 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all text-xl ml-2',
          title: themeConfig.mode === 'night' ? 'Modo Día' : 'Modo Noche'
        }, themeConfig.mode === 'night' ? '🌙' : '☀️');
      };

      const AdminSettingsButton = () => {
        return React.createElement('button', {
          onClick: () => setShowThemeModal(true),
          className: 'px-3 py-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full border border-white border-opacity-20 hover:bg-white hover:bg-opacity-20 transition-all text-xl ml-2',
          title: 'Ajustes Visuales'
        }, '⚙️');
      };

      const getNavLinkClass = (screenName, extraCheck = null, glowClass = '') => {
        const isActive = extraCheck 
          ? (currentScreen === screenName && extraCheck()) 
          : currentScreen === screenName;
        return `nav-item-btn-glass ${glowClass} px-4 py-2 font-semibold text-sm relative ${
          isActive 
            ? 'active-nav-btn text-white' 
            : 'text-gray-300'
        }`;
      };

      const GearIcon = () => React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        viewBox: '0 0 24 24',
        style: { display: 'inline-block' }
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
      }), React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      }));
      
      return React.createElement('nav', { 
        className: 'floating-nav-capsule relative px-6 py-3',
        style: { zIndex: 1000 }
      },
        React.createElement('div', { className: 'w-full flex justify-between items-center' },
          // Logo o título con hexágono y estilo mockup
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
                  src: '../img/Abeja.png',
                  alt: 'Logo Bee',
                  className: 'w-8 h-8 object-contain filter drop-shadow-[0_2px_8px_rgba(253,224,71,0.45)]'
                })
              )
            ),
            React.createElement('span', { className: 'font-black text-sm sm:text-base tracking-wider text-white' },
              'SPELLING ',
              React.createElement('span', { className: 'text-yellow-400' }, 'BEE')
            )
          ),
          
          // Botón hamburguesa (visible solo en móviles)
          React.createElement('button', {
            onClick: () => setIsMenuOpen(!isMenuOpen),
            className: 'md:hidden text-white hover:text-yellow-400 transition-colors duration-300 p-2'
          },
            React.createElement('div', { className: 'w-6 h-6 flex flex-col justify-center items-center' },
              React.createElement('span', {
                className: `block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`
              }),
              React.createElement('span', {
                className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`
              }),
              React.createElement('span', {
                className: `block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`
              })
            )
          ),
          
          // Menú de navegación (visible en desktop)
          React.createElement('div', { 
            id: 'desktop-nav-menu',
            className: 'hidden md:flex items-center gap-2 sm:gap-4 relative py-2' 
          },
            React.createElement('button', {
              onClick: () => {
                setGameMode(null);
                setCurrentScreen('home');
                setIsMenuOpen(false);
              },
              className: getNavLinkClass('home', null, 'card-winners-glow')
            }, 'Home'),
            React.createElement('button', {
              onClick: () => {
                setGameMode('contest');
                setCurrentScreen('menu');
                setIsMenuOpen(false);
              },
              className: getNavLinkClass('menu', () => gameMode === 'contest', 'card-contest-glow')
            }, 'Contest'),
            React.createElement('button', {
              onClick: () => {
                setGameMode('training');
                setCurrentScreen('menu');
                setIsMenuOpen(false);
              },
              className: getNavLinkClass('menu', () => gameMode === 'training', 'card-training-glow')
            }, 'Training'),
            React.createElement('button', {
              onClick: () => {
                setCurrentScreen('instructions');
                setIsMenuOpen(false);
              },
              className: getNavLinkClass('instructions', null, 'card-instructions-glow')
            }, 'Instructions'),
            React.createElement('button', {
              onClick: () => {
                setCurrentScreen('winners');
                setIsMenuOpen(false);
              },
              className: getNavLinkClass('winners', null, 'card-winners-glow')
            }, 'Winners'),
            React.createElement(ThemeToggleButton),
            isAdminLogged && React.createElement(AdminSettingsButton),
            isAdminLogged && React.createElement('button', {
              onClick: () => {
                setIsEditMode(!isEditMode);
                setCurrentScreen('home'); // Asegurarnos de ver los elementos
              },
              className: 'ml-2 px-3 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-colors shadow-lg'
            }, isEditMode ? 'Terminar Edición' : '✏️ Editar Layout'),

            // Dynamic Sliding Indicator (Raised to bottom: 4px)
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

          // Botón Admin a la derecha (en desktop)
          React.createElement('div', { className: 'hidden md:block' },
            React.createElement('button', {
              onClick: handleAdminAccess,
              className: 'btn-admin-glass'
            },
              React.createElement(GearIcon),
              React.createElement('span', null, 'Admin')
            )
          )
        ),
        
        // Menú móvil desplegable con fondo de cristal
        React.createElement('div', {
          className: `md:hidden absolute top-full left-0 right-0 mt-2 bg-slate-950 bg-opacity-95 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden z-50 ${
            isMenuOpen ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 pointer-events-none'
          }`
        },
          React.createElement('div', { className: 'flex flex-col gap-2' },
            React.createElement('button', {
              onClick: () => {
                setGameMode(null);
                setCurrentScreen('home');
                setIsMenuOpen(false);
              },
              className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                currentScreen === 'home' 
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
              }`
            }, '🏠 Home'),
            React.createElement('button', {
              onClick: () => {
                setGameMode('contest');
                setCurrentScreen('menu');
                setIsMenuOpen(false);
              },
              className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                currentScreen === 'menu' && gameMode === 'contest'
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
              }`
            }, '🏆 Contest'),
            React.createElement('button', {
              onClick: () => {
                setGameMode('training');
                setCurrentScreen('menu');
                setIsMenuOpen(false);
              },
              className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                (currentScreen === 'menu' || currentScreen === 'wordList') && gameMode === 'training'
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
              }`
            }, '💪 Training'),
            React.createElement('button', {
              onClick: () => {
                setCurrentScreen('instructions');
                setIsMenuOpen(false);
              },
              className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                currentScreen === 'instructions' 
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
              }`
            }, '📖 Instructions'),
            React.createElement('button', {
              onClick: () => {
                setCurrentScreen('winners');
                setIsMenuOpen(false);
              },
              className: `w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                currentScreen === 'winners' 
                  ? 'bg-yellow-400 text-black' 
                  : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400'
              }`
            }, '🏅 Winners'),
            isAdminLogged && React.createElement('div', { className: 'py-2 flex flex-col gap-2 justify-center items-center' },
              React.createElement(ThemeToggleButton),
              isAdminLogged && React.createElement(AdminSettingsButton),
              React.createElement('button', {
                onClick: () => {
                  setIsEditMode(!isEditMode);
                  setCurrentScreen('home');
                  setIsMenuOpen(false);
                },
                className: 'px-4 py-2 bg-yellow-400 text-black font-bold rounded-full w-full'
              }, isEditMode ? 'Terminar Edición' : '✏️ Editar Layout')
            ),
            React.createElement('button', {
              onClick: handleAdminAccess,
              className: 'w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 text-white hover:bg-white hover:bg-opacity-10 hover:text-yellow-400 flex items-center gap-2 border-t border-white border-opacity-10 mt-2 pt-4'
            }, 
              React.createElement(GearIcon),
              React.createElement('span', null, 'Admin')
            )
          )
        ),
        
        // Overlay para cerrar el menú en móviles
        isMenuOpen && React.createElement('div', {
          className: 'fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden',
          onClick: () => setIsMenuOpen(false)
        })
      );
    };
"""

# Append the global subcomponents cleanly right before the ReactDOM.createRoot render call
# Render call starts with: "    ReactDOM.createRoot"
render_call_marker = "    ReactDOM.createRoot"
assert render_call_marker in js_code, "Failed to find ReactDOM render call in JS!"
js_code = js_code.replace(render_call_marker, global_subcomponents + "\n" + render_call_marker)
print("Appended global subcomponents successfully!")

# Write the final premiumized app.js
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_code)
print("JS written successfully!")

# 3. Clean index.html
head_part = lines[:16]
css_ref = ['  <link rel="stylesheet" href="css/style.css">\n']
middle_part = lines[752:755]
js_ref = ['  <script src="js/app.js" defer></script>\n']
tail_part = lines[8621:]

new_html_lines = head_part + css_ref + middle_part + js_ref + tail_part
with open(html_path, 'w', encoding='utf-8') as f:
    f.writelines(new_html_lines)
print("HTML written successfully!")
