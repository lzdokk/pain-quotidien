# Musique de fond — comment ajouter tes pistes

Le lecteur est prêt (bouton flottant en bas à gauche). Il ne s'affiche que si
au moins un fichier audio existe en ligne. Il te reste à déposer tes MP3.

## 1. Déposer les fichiers
Crée le dossier `public/music/` et places-y tes instrumentaux :

```
public/music/paix.mp3
public/music/adoration.mp3
public/music/contemplation.mp3
```

(Tu peux en mettre une seule ou plusieurs — le bouton « › » passe à la suivante.)

## 2. Adapter la liste (si tu changes les noms)
Dans `components/MusicPlayer.tsx`, en haut :

```ts
const TRACKS = [
  { src: '/music/paix.mp3', name: 'Paix' },
  { src: '/music/adoration.mp3', name: 'Adoration' },
  { src: '/music/contemplation.mp3', name: 'Contemplation' }
];
```

## 3. Pousser
```bash
git add public/music && git commit -m "Musique de fond" && git push
```

## Notes
- La lecture démarre **au clic** (les navigateurs interdisent le son
  automatique) — donc jamais de surprise sonore.
- Volume doux par défaut (35 %), lecture en boucle, la piste continue quand tu
  changes de page.
- **Droits** : utilise ta propre musique ou des instrumentaux **libres de
  droits** (royalty-free) que tu as le droit de diffuser. Évite les musiques
  commerciales sous copyright.
- Format conseillé : MP3, ~128 kbps, pour un chargement rapide sur mobile.
