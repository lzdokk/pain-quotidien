"""
Construit lib/accents-fr.json : table « mot sans accent -> mot accentue »
tiree du vocabulaire des Bibles francaises modernes du dossier bibles/.
Seuls les mots dont la forme SANS accent n'existe jamais sont gardes
(ex. « eternelle » -> « éternelle », mais jamais « a » -> « à »).
Lancer : python3 scripts/build-accents.py
"""
import re, json, unicodedata, collections, os, html

SOURCES = ['s21.xml'] + [os.path.join('bibles', f) for f in [
    'BDS 2015 (La Bible du Semeur)', 'BFC 1997 (Bible en Français Courant)',
    'NFC 2019 (Nouvelle Français courant)', 'PDV 2017 (Parole de Vie 2017)',
    'NBS 2002 (Nouvelle Bible Segond)', 'NEG79 1979 (Segond Nouvelle Edition de Genève 1979)',
    'BEX 2004 (La Bible expliquée)', 'Jerusalem 1998', 'LSG 1910 (La Sainte Bible par Louis Segond)']]

WORD = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+")
def strip(w):
    w = w.replace('œ', 'oe').replace('Œ', 'OE').replace('æ', 'ae').replace('Æ', 'AE')
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')

counts = collections.Counter()   # toutes les formes, en minuscules
lower = collections.Counter()    # formes ecrites en minuscule dans le texte
# (« Etre » en debut de phrase s'ecrit souvent sans accent : on ne s'y fie pas)
for src in SOURCES:
    if not os.path.exists(src):
        print('absent :', src); continue
    txt = open(src, encoding='utf-8').read()
    for v in re.findall(r'<verse[^>]*>(.*?)</verse>', txt, re.S):
        for w in WORD.findall(html.unescape(v)):
            counts[w.lower()] += 1
            if w[0].islower():
                lower[w] += 1

cands = collections.defaultdict(list)
for w, n in counts.items():
    k = strip(w)
    if k != w and n >= 2:
        cands[k].append(w)
best = {}
for k, ws in cands.items():
    ws.sort(key=lambda w: -counts[w])
    choice = ws[0]
    # « depose » : on prefere « dépose » (verbe) a « déposé » (participe),
    # la forme la plus probable dans une priere a la premiere personne.
    if k.endswith('e') and choice.endswith('é'):
        alt = [w for w in ws if w.endswith('e')]
        if alt:
            choice = alt[0]
    best[k] = choice
# On ne garde que si la forme sans accent est rare (coquille, vieille graphie) :
# au moins 15 fois moins frequente que la forme accentuee.
best = {k: w for k, w in best.items() if lower[k] * 15 <= sum(counts[x] for x in cands[k])}
# Corrections manuelles (formes courantes ambigues dans la Bible).
best.update({'ca': 'ça', 'coeur': 'cœur', 'coeurs': 'cœurs', 'oeuvre': 'œuvre',
             'oeuvres': 'œuvres', 'soeur': 'sœur', 'soeurs': 'sœurs', 'voeu': 'vœu',
             'voeux': 'vœux', 'oeil': 'œil', 'noeud': 'nœud'})
for k in ['a', 'la', 'ou', 'des', 'sur', 'du', 'mur', 'peche', 'pecheur', 'eleve', 'cote', 'age', 'mais']:
    best.pop(k, None)

json.dump(dict(sorted(best.items())), open('lib/accents-fr.json', 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
print(len(best), 'mots')
