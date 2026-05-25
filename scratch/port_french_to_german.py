import re

# Read the French app.js template
with open('/Users/zeroferreira/Documents/Material English/Spelling 2026/French/js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace language codes and voice references
code = code.replace("fr-FR", "de-DE")
code = code.replace("startsWith('fr')", "startsWith('de')")
code = code.replace("French Female", "Deutsch Female")
code = code.replace("French Male", "Deutsch Male")
code = code.replace("bee_fr_", "bee_de_")

# Define German fallback words and levels
german_fallback_code = """    const levelAWords = (window.SPELLING_DATA && Array.isArray(window.SPELLING_DATA.levelAWords) && window.SPELLING_DATA.levelAWords.length)
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
    };"""

# Locate the huge French fallback word lists block
start_marker = "const levelAWords = (window.SPELLING_DATA"
end_marker = "const levels = {"

start_idx = code.find(start_marker)
if start_idx == -1:
    print("Error: Could not find start of levelAWords")
    exit(1)

end_idx = code.find(end_marker)
if end_idx == -1:
    print("Error: Could not find start of levels definition")
    exit(1)

closing_brace_idx = code.find("};", end_idx)
if closing_brace_idx == -1:
    print("Error: Could not find closing brace of levels definition")
    exit(1)

# Replace the block from start_idx to closing_brace_idx + 2 with german_fallback_code
code = code[:start_idx] + german_fallback_code + code[closing_brace_idx + 2:]

# Now replace the French speech spelling functions with our upgraded German speech spelling functions
french_is_likely_spelling_start = code.find("const isLikelySpelling =")
french_process_spoken_input_end = code.find("const checkSpelling =", french_is_likely_spelling_start)

if french_is_likely_spelling_start == -1 or french_process_spoken_input_end == -1:
    print("Error: Could not find speech recognition helpers in French app.js")
    exit(1)

german_speech_helpers = """const normalizeForCompare = (text) => {
      return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
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

    // Función para detectar si el input contiene palabras completas en alemán
    const containsCompleteWords = (transcript) => {
      const cleaned = (transcript || '')
        .toLowerCase()
        .replace(/[’']/g, ' ')
        .replace(/[^a-zäöüß\\s-]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();

      if (!cleaned) return false;

      const tokens = cleaned
        .replace(/\\bumlaut\\s+a\\b/g, 'umlauta')
        .replace(/\\ba\\s+umlaut\\b/g, 'aumlaut')
        .replace(/\\bumlaut\\s+o\\b/g, 'umlauto')
        .replace(/\\bo\\s+umlaut\\b/g, 'oumlaut')
        .replace(/\\bumlaut\\s+u\\b/g, 'umlautu')
        .replace(/\\bu\\s+umlaut\\b/g, 'uumlaut')
        .replace(/\\bscharfes\\s+s\\b/g, 'scharfess')
        .replace(/\\bdouble\\s+you\\b/g, 'doubleyou')
        .replace(/\\bvon\\s+vorn\\b/g, 'vonvorn')
        .split(/\\s+/)
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
        .replace(/[^a-zäöüß\\s-]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();

      if (!cleaned) return false;

      const tokens = cleaned
        .replace(/\\bumlaut\\s+a\\b/g, 'umlauta')
        .replace(/\\ba\\s+umlaut\\b/g, 'aumlaut')
        .replace(/\\bumlaut\\s+o\\b/g, 'umlauto')
        .replace(/\\bo\\s+umlaut\\b/g, 'oumlaut')
        .replace(/\\bumlaut\\s+u\\b/g, 'umlautu')
        .replace(/\\bu\\s+umlaut\\b/g, 'uumlaut')
        .replace(/\\bscharfes\\s+s\\b/g, 'scharfess')
        .replace(/\\bdouble\\s+you\\b/g, 'doubleyou')
        .replace(/\\bvon\\s+vorn\\b/g, 'vonvorn')
        .split(/\\s+/)
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
        .replace(/[^a-zäöüß\\s-]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim()
        .replace(/\\bumlaut\\s+a\\b/g, 'umlauta')
        .replace(/\\ba\\s+umlaut\\b/g, 'aumlaut')
        .replace(/\\bumlaut\\s+o\\b/g, 'umlauto')
        .replace(/\\bo\\s+umlaut\\b/g, 'oumlaut')
        .replace(/\\bumlaut\\s+u\\b/g, 'umlautu')
        .replace(/\\bu\\s+umlaut\\b/g, 'uumlaut')
        .replace(/\\bscharfes\\s+s\\b/g, 'scharfess')
        .replace(/\\bdouble\\s+you\\b/g, 'doubleyou')
        .replace(/\\bvon\\s+vorn\\b/g, 'vonvorn')
        .split(/\\s+/)
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

    """

code = code[:french_is_likely_spelling_start] + german_speech_helpers + code[french_process_spoken_input_end:]

# Update the HTML grammar alphabet in initSpeechRecognition
code = code.replace(
    "const alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu delete clear backspace reset';",
    "const alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z ä ö ü ß anton berta cäsar dora emil friedrich gustav heinrich ida julius kaufmann ludwig martha nordpol otto paula quelle richard samuel theodor ulrich viktor wilhelm xanthippe ypsilon zacharias löschen entfernen leer neu anfang vonvorn zurück delete clear';"
)

# Translate French UI/Modal text labels to German
replacements = [
    # Hero/Menu elements & general translations
    ("BIENVENUE SUR L'APPLICATION OFFICIELLE", "WILLKOMMEN ZUR OFFIZIELLEN ANWENDUNG"),
    ("CONCOURS D'", "RECHTSCHREIB-"),
    ("ORTHOGRAPHE", "WETTBEWERB"),
    ("S'ENTRAÎNER. PRATIQUER. CONCOURIR. GAGNER.", "TRAINIEREN. ÜBEN. WETTEIFERN. GEWINNEN."),
    ("Participez à de vrais concours et testez vos compétences.", "Nehmen Sie an echten Wettbewerben teil und testen Sie Ihre Fähigkeiten."),
    ("Pratiquez et améliorez-vous avec des exercices intelligents.", "Üben und verbessern Sie sich mit intelligenten Übungen."),
    ("Apprenez à participer et découvrez les règles du concours.", "Lernen Sie, wie Sie teilnehmen und entdecken Sie die Wettbewerbsregeln."),
    ("Découvrez les leaders et les anciens champions.", "Entdecken Sie die Führenden und ehemaligen Champions."),
    ("GAGNANTS", "GEWINNER"),
    ("ENTRAÎNEMENT", "TRAINING"),
    ("INSTRUCTIONS", "ANLEITUNG"),
    ("DÉMARRER CONCOURS", "WETTBEWERB STARTEN"),
    ("Bientôt Disponible", "Bald verfügbar"),
    ("Accès Admin", "Admin-Zugang"),
    ("Mode d'emploi", "Bedienungsanleitung"),
    ("Choisissez un mot dans la liste ou laissez l'application choisir pour vous.", "Wählen Sie ein Wort aus der Liste oder lassen Sie die App für Sie wählen."),
    ("Aucun mot trouvé dans ce niveau.", "Keine Wörter in dieser Stufe gefunden."),
    ("Enregistrer la configuration", "Konfiguration speichern"),
    ("Configuration enregistrée localement !", "Konfiguration lokal gespeichert!"),
    ("Erreur lors de l'enregistrement", "Fehler beim Speichern"),
    ("Niveau :", "Stufe:"),
    ("Erreur", "Fehler"),
    ("Succès", "Erfolg"),
    ("Félicitations !", "Herzlichen Glückwunsch!"),
    ("Vous avez épelé le mot correctement !", "Sie haben das Wort richtig buchstabiert!"),
    ("Le mot correct était :", "Das richtige Wort war:"),
    ("Le mot correct était", "Das richtige Wort war"),
    
    # Hex/Rules translations
    ("Objectif du jeu", "Spielziel"),
    ("Niveaux disponibles", "Verfügbare Stufen"),
    ("Modes de jeu", "Spielmodi"),
    ("Comment jouer", "Spielanleitung"),
    ("Fonctionnalités", "Funktionen"),
    ("Choisissez une section", "Wählen Sie eine Rubrik"),
    ("Cliquez sur un hexagone à gauche pour afficher les détails.", "Klicken Sie links auf ein Sechseck, um Details anzuzeigen."),
    ("Niveau A : ", "Stufe A: "),
    ("Niveau B : ", "Stufe B: "),
    ("Niveau C : ", "Stufe C: "),
    ("Mots de base", "Grundwörter"),
    ("Mots intermédiaires", "Mittelstufe Wörter"),
    ("Mots avancés", "Fortgeschrittene Wörter"),
    ("Objectif", "Ziel"),
    ("Niveaux", "Stufen"),
    ("Modes", "Spielmodi"),
    ("Règles", "Regeln"),
    ("Détails", "Details"),
    ("L'objectif de ce jeu est de renforcer vos compétences en orthographe française de manière ludique. En écoutant la prononciation et en écrivant l'orthographe correcte, vous améliorez votre intuition linguistique et votre compréhension des mots.", "Das Ziel dieses Spiels ist es, Ihre deutschen Rechtschreibkenntnisse spielerisch zu festigen. Indem Sie sich die Aussprache anhören und die richtige Schreibweise eingeben, verbessern Sie Ihr Sprachgefühl und Ihr Verständnis der Wörter."),
    
    # Main headers & labels
    ("Concours d'Orthographe", "Rechtschreibwettbewerb"),
    ("Concours d'orthographe 🐝", "Rechtschreibwettbewerb 🐝"),
    ("Mot à épeler:", "Zu buchstabierendes Wort:"),
    ("Mot à épeler :", "Zu buchstabierendes Wort:"),
    ("Votre progrès:", "Ihr Fortschritt:"),
    ("Votre progrès :", "Ihr Fortschritt:"),
    ("Progrès", "Fortschritt"),
    ("Progrès :", "Fortschritt:"),
    ("Sélection de Mot", "Wortauswahl"),
    ("Nouveau Mot", "Neues Wort"),
    ("Démarrer Voix", "Sprachsteuerung"),
    ("Arrêter Voix", "Sprachsteuerung stoppen"),
    ("Effacer", "Löschen"),
    ("Aide", "Hilfe"),
    ("Tapez manuellement :", "Buchstabe für Buchstabe eingeben:"),
    ("Tapez manuellement", "Buchstabe für Buchstabe eingeben"),
    ("Vérifier Orthographe", "Rechtschreibung prüfen"),
    ("Vérifier l'orthographe", "Rechtschreibung prüfen"),
    ("Écoute... Dites chaque lettre clairement", "Zuhören... Bitte buchstabiere jedes Wort deutlich"),
    ("Confiance:", "Konfidenz:"),
    ("Dernier entendu:", "Zuletzt gehört:"),
    ("Dernier entendu :", "Zuletzt gehört:"),
    ("Correct ! Bien joué !", "Richtig! Gut gemacht!"),
    ("Réessayez !", "Versuchen Sie es nochmal!"),
    ("Appuyez sur \"Sélection de Mot\" pour commencer", "Drücken Sie \"Wortauswahl\" zum Starten"),
    ("Sélection de Mot pour commencer", "Wortauswahl zum Starten"),
    ("Sélection de Mot pour commencer.", "Wortauswahl zum Starten."),
    ("Appuyez sur \\\"Sélection de Mot\\\" pour commencer", "Drücken Sie \\\"Wortauswahl\\\" zum Starten"),
    ("Sélection...", "Auswählen..."),
    ("Exemple d'Usage", "Verwendungsbeispiel"),
    ("Exemple d\\'Usage", "Verwendungsbeispiel"),
    ("Definition", "Definition"),
    ("Fermer", "Schließen"),
    ("Schließen", "Schließen"),
    ("Accès au microphone refusé", "Zugriff auf das Mikrofon verweigert"),
    ("Reconnaissance de voix non supportée", "Spracherkennung nicht unterstützt"),
    ("Règle du Jeu", "Spielregeln"),
    ("Règles du Jeu", "Spielregeln"),
    ("Règles du jeu 🐝", "Spielregeln 🐝"),
    ("Tableau des Champions", "Ruhmeshalle"),
    ("Tableau des Champions 🏆", "Ruhmeshalle 🏆"),
    ("Panneau d'Administration", "Admin-Panel"),
    ("Panneau d'Administration ⚙️", "Admin-Panel ⚙️"),
    ("Retour", "Zurück"),
    ("Retourner", "Zurück"),
    ("Commencer", "Starten"),
    ("Suivant", "Weiter"),
    ("Drapeau", "Flagge"),
    ("Langue", "Sprache"),
    ("Mots utilisés :", "Verwendete Wörter:"),
    ("Mots utilisés", "Verwendete Wörter"),
    ("Mots au total :", "Wörter insgesamt:"),
    ("Statixtiques", "Statistiken"),
    ("Statistiques", "Statistiken"),
    ("Rapport d'Erreur ou Suggestion", "Fehlerbericht oder Vorschlag"),
    ("Signaler un problème", "Problem melden"),
    ("Faire une suggestion", "Vorschlag machen"),
    ("Envoyer le rapport", "Bericht senden"),
    ("Merci pour votre retour !", "Vielen Dank für Ihr Feedback!"),
    ("Prêt à écouter", "Bereit zum Zuhören"),
    ("Cliquez sur le microphone pour commencer", "Klicke auf das Mikrofon, um zu starten"),
    ("Cliquez sur le microphone pour commencer.", "Klicke auf das Mikrofon, um zu starten."),
    
    # Accordion instructions translations
    ("Concours : ", "Wettbewerb: "),
    ("Jouez contre la montre (30 secondes) avec un maximum de 3 vies.", "Spielen Sie gegen die Uhr (30 Sekunden) mit maximal 3 Leben."),
    ("Entraînement : ", "Training: "),
    ("Pratiquez librement et sans limite de temps, avec définitions et phrases d'exemple.", "Üben Sie frei und ohne Zeitlimit, mit Definitionen und Beispielsätzen."),
    ("🎲 Comment jouer", "🎲 Spielanleitung"),
    ("Sélectionnez votre niveau de dificultad (A, B ou C).", "Wählen Sie Ihren Schwierigkeitsgrad (A, B oder C)."),
    ("Sélectionnez votre niveau de difficulté (A, B ou C).", "Wählen Sie Ihren Schwierigkeitsgrad (A, B oder C)."),
    ("Choisissez le mode de jeu (Concours ou Entraînement).", "Wählen Sie den Spielmodus (Wettbewerb oder Training)."),
    ("Écoutez le mot en appuyant sur le bouton de prononciation.", "Hören Sie sich das Wort an, indem Sie auf die Aussprache-Schaltfläche klicken."),
    ("Saisissez l'orthographe correcte dans la zone de texte (ou utilisez le micro pour épeler).", "Geben Sie die richtige Schreibweise in das Textfeld ein (oder nutzen Sie das Mikrofon zum Delettieren)."),
    ("Consultez les aides (définitions, exemples) en mode Entraînement.", "Nutzen Sie die Hilfen (Definitionen, Beispiele) im Trainingsmodus."),
    ("Appuyez sur valider pour soumettre votre réponse.", "Drücken Sie auf Bestätigen, um Ihre Antwort abzusenden."),
    ("🔧 Fonctionnalités", "🔧 Funktionen"),
    ("Synthèse vocale native avec support des accents de qualité premium.", "Native Sprachsynthese mit Unterstützung für Premium-Akzente."),
    ("Reconnaissance vocale avancée avec transcription instantanée.", "Erweiterte Spracherkennung mit sofortiger Transkription."),
    ("Mode Jour / Nuit dynamique avec persistance automatique de vos préférences.", "Dynamischer Tag-/Nachtmodus mit automatischer Speicherung Ihrer Einstellungen."),
    ("Exportation de vos listes de vocabulaire et scores en format CSV.", "Exportieren Sie Ihre Vokabellisten und Ergebnisse im CSV-Format."),
    ("Interface premium basée sur le design Glassmorphism hautement réactif.", "Premium-Interface basierend auf hochreaktivem Glassmorphic-Design."),
    
    # Winners Screen translations
    ("Temple de la Renommée", "Ruhmeshalle"),
    ("Célébrons nos Champions d'Orthographe", "Wir feiern unsere Rechtschreib-Champions"),
    ("Gagnant", "Sieger"),
    ("Mot Gagnant:", "Siegerwort:"),
    ("Statistiques du Concours", "Wettbewerbsstatistiken"),
    ("Participants au total", "Teilnehmer insgesamt"),
    ("Écoles participantes", "Teilnehmende Schulen"),
    ("Mots Épelés", "Buchstabierte Wörter"),
    ("Mot Gagnant :", "Siegerwort :"),
    
    # Word list translations
    ("Liste de mots", "Wortliste"),
    ("Rechercher un mot...", "Wort suchen..."),
    ("Télécharger CSV", "CSV herunterladen"),
    ("Prononciation", "Aussprache"),
    ("Exemple de phrase", "Beispielsatz"),
    
    # Admin dashboard translations
    ("Admin - Rapports & Suggestions", "Admin - Berichte & Vorschläge"),
    ("Tout effacer", "Alles löschen"),
    ("Rapports", "Berichte"),
    ("Suggestions", "Vorschläge"),
    ("Aucun rapport pour le moment.", "Noch keine Berichte."),
    ("Aucune suggestion pour le moment.", "Noch keine Vorschläge."),
    ("Êtes-vous sûr de vouloir tout effacer ?", "Sind Sie sicher, dass Sie alles löschen möchten?"),
    ("Êtes-vous sûr de vouloir effacer toutes les données enregistrées ?", "Sind Sie sicher, dass Sie alle gespeicherten Daten löschen möchten?"),
    ("Catégorie de rapport :", "Berichtskategorie:"),
    ("Audio / Voix", "Audio / Stimme"),
    ("Affichage", "Anzeige"),
    ("Orthographe", "Rechtschreibung"),
    ("Autre", "Anderes"),
    ("Où cela s'est-il produit ?", "Wo ist es passiert?"),
    ("Page d'accueil", "Startseite"),
    ("Menu", "Menü"),
    ("Pendant le jeu", "Im Spiel"),
    ("Tableau des champions", "Ruhmeshalle"),
    ("Dites-nous en plus :", "Erzählen Sie uns mehr:"),
    ("Écrivez votre description ici...", "Schreiben Sie Ihre Beschreibung hier..."),
    ("Précédent", "Zurück"),
    ("Envoyer", "Senden"),
    ("Envoyer la suggestion", "Vorschlag senden"),
    ("Vos idées nous aident à grandir !", "Ihre Ideen helfen uns zu wachsen!"),
    ("Écrivez votre suggestion :", "Schreiben Sie Ihren Vorschlag:"),
    ("Par exemple : J'aimerais un mode contre la montre...", "Z.B.: Ich hätte gerne einen Zeitfahrmodus..."),
    
    # Navigation header links
    ("Jeu", "Spiel"),
    ("Champions", "Champions"),
    
    # Case sensitive button translations
    ("Écouter", "Anhören"),
]

# Apply UI text translations
for old_str, new_str in replacements:
    code = code.replace(old_str, new_str)

# Write the final ported German app.js
with open('/Users/zeroferreira/Documents/Material English/Spelling 2026/German/js/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Successfully ported French template to German app.js with ALL translations completed!")
