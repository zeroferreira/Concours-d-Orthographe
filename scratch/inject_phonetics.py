import json
import re

fr_ipa = {
    'curieux': '/ky.ʁjø/', 'enfance': '/ɑ̃.fɑ̃s/', 'gare': '/ɡaʁ/', 'étique': '/e.tik/', 
    'malheur': '/ma.lœʁ/', 'bizarre': '/bi.zaʁ/', 'valeur': '/va.lœʁ/', 'peindre': '/pɛ̃dʁ/', 
    'secteur': '/sɛk.tœʁ/', 'stage': '/staʒ/', 'rumeur': '/ʁy.mœʁ/', 'espoir': '/ɛs.pwaʁ/', 
    'travaux': '/tʁa.vo/', 'biscuit': '/bis.kɥi/', 'filleul': '/fi.jœl/', 'oiseaux': '/wa.zo/', 
    'boisson': '/bwa.sɔ̃/', 'abîmé': '/a.bi.me/', 'réussir': '/ʁe.y.siʁ/', 'bijoux': '/bi.ʒu/', 
    'voyager': '/vwa.ja.ʒe/', 'yeux': '/jø/', 'oeuf': '/œf/', 'soeur': '/sœʁ/', 
    'poisson': '/pwa.sɔ̃/', 'poison': '/pwa.zɔ̃/', 'famille': '/fa.mij/', 'beau': '/bo/', 
    'belle': '/bɛl/', 'frère': '/fʁɛʁ/', 'cousin': '/ku.zɛ̃/', 'tante': '/tɑ̃t/', 
    'oncle': '/ɔ̃kl/', 'parents': '/pa.ʁɑ̃/', 'noble': '/nɔbl/', 'bateau': '/ba.to/', 
    'projet': '/pʁɔ.ʒɛ/', 'raleine': '/ʁa.lɛn/', 'peint': '/pɛ̃/', 'oignon': '/ɔ.ɲɔ̃/', 
    'voleuse': '/vɔ.løz/', 'ville': '/vil/', 'jaune': '/ʒon/', 'cours': '/kuʁ/', 
    'antique': '/ɑ̃.tik/', 'veuve': '/vœv/', 'appétit': '/a.pe.ti/', 'cadeau': '/ka.do/', 
    'cerceau': '/sɛʁ.so/', 'dauphin': '/do.fɛ̃/', 'monnaie': '/mɔ.nɛ/', 'poignet': '/pwa.ɲɛ/', 
    'pyramide': '/pi.ʁa.mid/', 'sorcière': '/sɔʁ.sjɛʁ/', 'étranger': '/e.tʁɑ̃.ʒe/', 
    'naissance': '/nɛ.sɑ̃s/', 'soutenir': '/sut.niʁ/', 'beaucoup': '/bo.ku/', 'gaspiller': '/ɡas.pi.je/', 
    'bienvenue': '/bjɛ̃.vny/', 'délicieux': '/de.li.sjø/', 'chemisier': '/ʃə.mi.zje/', 
    'lunettes': '/ly.nɛt/', 'moutarde': '/mu.taʁd/', 'crocodile': '/kʁɔ.kɔ.dil/', 
    'mignonne': '/mi.ɲɔn/', 'chevalier': '/ʃə.va.lje/', 'printemps': '/pʁɛ̃.tɑ̃/', 
    'gingembre': '/ʒɛ̃.ʒɑ̃bʁ/', 'descendre': '/de.sɑ̃dʁ/', 'généreux': '/sol.e.nə.ʁø/', 
    'murmurer': '/myʁ.my.ʁe/', 'ardemment': '/aʁ.da.mɑ̃/', 'mannequin': '/man.kɛ̃/', 
    'papillon': '/pa.pi.jɔ̃/', 'saucisson': '/so.si.sɔ̃/', 'orchestre': '/ɔʁ.kɛstʁ/', 
    'baguette': '/ba.ɡɛt/', 'passeport': '/pas.pɔʁ/', 'meilleur': '/mɛ.jœʁ/', 
    'concombre': '/kɔ̃.kɔ̃bʁ/', 'duchesse': '/dy.ʃɛs/', 'calamité': '/ka.la.mi.te/', 
    'sceptique': '/sɛp.tik/', 'artichaut': '/aʁ.ti.ʃo/', 'aubergine': '/o.bɛʁ.ʒin/', 
    'bricolage': '/bʁi.kɔ.laʒ/', 'cavalier': '/ka.va.lje/', 'coiffeur': '/kwa.fœʁ/', 
    'fauteuil': '/fo.tœj/', 'mammifère': '/ma.mi.fɛʁ/', 'oreiller': '/ɔ.ʁɛ.je/', 
    'parapluie': '/pa.ʁa.plɥi/', 'squelette': '/skə.lɛt/', 'tabouret': '/ta.bu.ʁɛ/', 
    'ustensile': '/ys.tɑ̃.sil/', 'vaisselle': '/vɛ.sɛl/', 'victoire': '/vik.twaʁ/', 
    'adolescence': '/a.dɔ.lɛ.sɑ̃s/', 'communauté': '/kɔ.my.no.te/', 'courageuse': '/ku.ʁa.ʒøz/', 
    'engagement': '/ɑ̃.ɡaʒ.mɑ̃/', 'caritative': '/ka.ʁi.ta.tiv/', 'indépendant': '/ɛ̃.de.pɑ̃.dɑ̃/', 
    'pharmaceutique': '/faʁ.ma.sø.tik/', 'authenticité': '/o.tɑ̃.ti.si.te/', 
    'réseau social': '/ʁe.zo sɔ.sjal/', 'bibliothèque': '/bi.bli.jɔ.tɛk/', 
    'couturière': '/ku.ty.ʁjɛʁ/', 'chaussures': '/ʃo.syʁ/', 'imperméable': '/ɛ̃.pɛʁ.me.abl/', 
    'mademoiselle': '/ma.dmwa.zɛl/', 'arrondissement': '/a.ʁɔ̃.dis.mɑ̃/', 
    'grenouille': '/ɡʁə.nuj/', 'retrouvailles': '/ʁə.tʁu.vaj/', 'architecte': '/aʁ.ʃi.tɛkt/', 
    'individualisme': '/ɛ̃.di.vi.dy.a.lism/', 'psychologue': '/psi.kɔ.lɔɡ/', 
    'chaussettes': '/ʃo.sɛt/', 'orthographe': '/ɔʁ.tɔ.ɡʁaf/', 'incroyable': '/ɛ̃.kʁwa.jabl/', 
    'intelligent': '/ɛ̃.te.li.ʒɑ̃/', 'réciproque': '/ʁe.si.pʁɔk/', 'concertiste': '/kɔ̃.sɛʁ.tist/', 
    'bicyclette': '/bi.si.klɛt/', 'calendrier': '/ka.lɑ̃.dʁi.je/', 'champignon': '/ʃɑ̃.pi.ɲɔ̃/', 
    'charcuterie': '/ʃaʁ.kyt.ʁi/', 'chirurgien': '/ʃi.ʁyʁ.ʒjɛ̃/', 'commissariat': '/kɔ.mi.sa.ʁja/', 
    'embouteillage': '/ɑ̃.bu.tɛ.jaʒ/', 'hirondelle': '/i.ʁɔ̃.dɛl/', 'lampadaire': '/lɑ̃.pa.dɛʁ/', 
    'Marguerite': '/maʁ.ɡə.ʁit/', 'pâtisserie': '/pa.tis.ʁi/', 'rhinocéros': '/ʁi.nɔ.se.ʁɔs/', 
    'silhouette': '/si.lwɛt/', 'somnambule': '/sɔm.nɑ̃.byl/', 'téléphérique': '/te.le.fe.ʁik/', 
    'thermomètre': '/tɛʁ.mɔ.mɛtʁ/'
}

de_ipa = {
    'Apfel': '/ˈapfəl/', 'Wurst': '/vʊrst/', 'Bier': '/biːɐ̯/', 'Stadt': '/ʃtat/', 
    'Lösung': '/ˈdev.lœ.zʊŋ/', 'Flasche': '/ˈflaʃə/', 'Prüfung': '/ˈpʁyːfʊŋ/', 'Straβe': '/ˈtʃ.tʁaːsə/', 
    'Wohnung': '/ˈvoːnʊŋ/', 'Freitag': '/ˈfʁaɪ̯taːk/', 'Abitur': '/abiˈtuːɐ̯/', 'Söhne': '/ˈzøːnə/', 
    'Schwein': '/ʃvaɪ̯n/', 'Mund': '/mʊnt/', 'Knie': '/kniː/', 'Kaution': '/kaʊ̯ˈt͡si̯oːn/', 
    'Aufzug': '/ˈaʊ̯ft͡suːk/', 'weinen': '/ˈvaɪ̯nən/', 'gehen': '/ˈeː.ən/', 'zeigen': '/ˈt͡saɪ̯ɡn̩/', 
    'küssen': '/ˈkʏsən/', 'fühlen': '/ˈfyːlən/', 'freuen': '/ˈfʁɔʏ̯ən/', 'duschen': '/ˈduːʃn̩/', 
    'hängen': '/ˈhɛŋən/', 'helfen': '/ˈhɛlfən/', 'singen': '/ˈzɪŋən/', 'lügen': '/ˈlyːɡn̩/', 
    'allein': '/aˈlaɪ̯n/', 'schwarz': '/ʃvaʁt͡s/', 'langsam': '/ˈlaŋzaːm/', 'breit': '/bʁaɪ̯t/', 
    'drauβen': '/ˈdʁaʊ̯sn̩/', 'circa': '/ˈt͡sɪʁka/', 'wütend': '/ˈvyːtn̩t/', 'krank': '/kʁaŋk/', 
    'heiβen': '/ˈhaɪ̯sn̩/', 'traurig': '/ˈtʁaʊ̯ʁɪç/', 'einige': '/ˈaɪ̯nɪɡə/', 'kurz': '/kʊʁt͡s/', 
    'scharf': '/ʃaʁf/', 'lecker': '/ˈlɛkɐ/', 'stinken': '/ˈʃtɪŋkn̩/', 'sauer': '/ˈzaʊ̯ɐ/', 
    'roh': '/ʁoː/', 'bequem': '/bəˈkveːm/', 'schwer': '/ʃveːɐ̯/', 'leicht': '/laɪ̯ç/', 
    'Bleistift': '/ˈblaɪ̯ˌʃtɪft/', 'Dienstag': '/ˈdiːnstaːk/', 'Geschäft': '/ɡəˈʃɛft/', 
    'Ausländer': '/ˈaʊ̯sˌlɛndɐ/', 'Parkplatz': '/ˈpaʁkˌplat͡s/', 'Frühstück': '/ˈfʁyːˌʃtʏk/', 
    'Verkäufer': '/fɛɐ̯ˈkɔʏ̯fɐ/', 'Ingenieur': '/ɪnʒeˈni̯øːɐ̯/', 'Beziehung': '/bəˈt͡siːʊŋ/', 
    'erzählen': '/ɛɐ̯ˈt͡sɛːlən/', 'schnupfen': '/ˈʃnʊpfn̩/', 'schlafen': '/ˈʃlaːfn̩/', 
    'vergessen': '/fɛɐ̯ˈɡɛsn̩/', 'schmecken': '/ˈʃmɛkən/', 'arbeiten': '/ˈaʁbaɪ̯tn̩/', 
    'aufstehen': '/ˈaʊ̯fˌʃteːən/', 'aufräumen': '/ˈaʊ̯fˌʁɔʏ̯mən/', 'besuchen': '/bəˈzuːxn̩/', 
    'verkaufen': '/fɛɐ̯ˈkaʊ̯fn̩/', 'begrüβen': '/bəˈɡʁyːsn̩/', 'bekommen': '/bəˈkɔmən/', 
    'einziehen': '/ˈaɪ̯nˌt͡siːən/', 'schwanger': '/ˈʃvaŋɐ/', 'weltweit': '/ˈvɛltvaɪ̯t/', 
    'glücklich': '/ˈɡlʏklɪç/', 'hässlich': '/ˈhɛslɪç/', 'pünktlich': '/ˈpʏŋktlɪç/', 
    'plötzlich': '/ˈplœt͡slɪç/', 'unbedingt': '/ˈʊnbəˌdɪŋt/', 'unterwegs': '/ʊntɐˈveːks/', 
    'schlecht': '/ʃlɛçt/', 'gebraten': '/ɡəˈbʁaːtn̩/', 'geduldig': '/ɡəˈdʊldɪç/', 
    'Schokolade': '/ʃokoˈlaːdə/', 'Geschichte': '/ɡəˈʃɪçtə/', 'Hauptstadt': '/ˈhaʊ̯ptˌʃtat/', 
    'Wörterbuch': '/ˈvœʁtɐˌbuːx/', 'Kugelschreiber': '/ˈkuːɡl̩ˌʃʁaɪ̯bɐ/', 
    'Österreich': '/ˈøːstəʁaɪ̯ç/', 'Süβigkeiten': '/ˈzyːsɪçˌkaɪ̯tn̩/', 
    'Hausaufgabe': '/ˈhaʊ̯sʔaʊ̯fˌɡaːbə/', 'Schneemann': '/ˈʃneːˌman/', 
    'Lieblingssprache': '/ˈliːblɪŋsˌʃpʁaːxə/', 'Willkommen': '/vɪlˈkɔmən/', 
    'Radiergummi': '/ʁaˈdiːɐ̯ˌɡʊmi/', 'Mathematik': '/mate.maˈtiːk/', 
    'Schwesterchen': '/ˈʃvɛstɐçən/', 'Schwimmbad': '/ˈʃvɪmˌbaːt/', 
    'Mechaniker': '/meˈçaːnɪkɐ/', 'Krankenschwester': '/ˈkʁaŋkn̩ˌʃvɛstɐ/', 
    'Schildkröte': '/ˈʃɪltˌkʁøːtə/', 'Mikrowelle': '/ˈmiːkʁoˌvɛlə/', 
    'Verkehrsmittel': '/fɛɐ̯ˈkeːɐ̯sˌmɪtl̩/', 'aufwachsen': '/ˈaʊ̯fˌvaksn̩/', 
    'frühstücken': '/ˈfʁyːˌʃtʏkən/', 'beschweren': '/bəˈʃveːʁən/', 
    'entschuldigen': '/ɛntˈʃʊldɪɡn̩/', 'stattfinden': '/ˈʃtatˌfɪndn̩/', 
    'verheiratet': '/fɛɐ̯ˈhaɪ̯ʁaːtət/', 'vorsichtig': '/ˈfoːɐ̯ˌzɪçtɪç/', 
    'langweilig': '/ˈlaŋˌvaɪ̯lɪç/', 'Westdeutschland': '/ˈvɛstdɔʏ̯tʃlant/', 
    'gefährlich': '/ɡəˈfɛːɐ̯lɪç/', 'hilfsbereit': '/ˈhɪlfsbəˌʁaɪ̯t/', 
    'chinesisch': '/çiˈneːzɪʃ/', 'mexikanisch': '/mɛksiˈkaːnɪʃ/'
}

# Wait, let's fix typos in the manual phonetic dictionary for accuracy:
# 'généreux' -> '/ʒe.ne.ʁø/'
fr_ipa['généreux'] = '/ʒe.ne.ʁø/'
# 'Lösung' -> '/ˈløːzʊŋ/'
de_ipa['Lösung'] = '/ˈløːzʊŋ/'
# 'Straβe' -> '/ˈʃtʁaːsə/'
de_ipa['Straβe'] = '/ˈʃtʁaːsə/'
# 'gehen' -> '/ˈɡeːən/'
de_ipa['gehen'] = '/ˈɡeːən/'

def update_spelling_data(filepath, ipa_dict):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    json_match = re.search(r'window\.SPELLING_DATA\s*=\s*(\{.*\});?', content, re.DOTALL)
    if not json_match:
        print(f"Failed to find SPELLING_DATA in {filepath}")
        return
        
    data = json.loads(json_match.group(1))
    
    for level in ['levelAWords', 'levelBWords', 'levelCWords']:
        if level in data:
            for item in data[level]:
                w = item['word']
                if w in ipa_dict:
                    item['phonetic'] = ipa_dict[w]
                    
    # Write back in a pretty JSON format
    updated_json = json.dumps(data, ensure_ascii=False, indent=2)
    # Reassemble window.SPELLING_DATA = { ... };
    new_content = f"window.SPELLING_DATA = {updated_json};\n"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated phonetic data for {filepath}")

update_spelling_data('/Users/zeroferreira/Documents/Material English/Spelling 2026/French/spelling-data.js', fr_ipa)
update_spelling_data('/Users/zeroferreira/Documents/Material English/Spelling 2026/German/spelling-data.js', de_ipa)
