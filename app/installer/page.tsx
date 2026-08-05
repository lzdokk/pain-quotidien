import Link from 'next/link';
import InstallGuide from '@/components/InstallGuide';
import ShareButton from '@/components/ShareButton';

export const metadata = {
  title: 'Installer l\'app',
  description: 'Ajoute Pain de Vie à ton téléphone et active les rappels quotidiens.'
};

export default function InstallerPage() {
  return (
    <main className="wrap installer-page">
      <Link href="/" className="installer-back">‹ Retour</Link>

      <h1 className="installer-h1">Installer Pain de Vie</h1>
      <p className="installer-intro">
        La Parole chaque matin, une veillée chaque soir — directement sur ton téléphone,
        avec un rappel doux le matin ☀️ et le soir 🌙. Suis les étapes selon ton appareil :
      </p>

      <div className="installer-card">
        <InstallGuide />
      </div>

      <div className="installer-share">
        <span>Partage l'app à un proche :</span>
        <ShareButton
          title="Pain de Vie"
          text="Je te partage Pain de Vie — un temps avec la Parole chaque jour. Voici comment l'installer :"
          label="Partager l'app"
          className="btn"
        />
      </div>
    </main>
  );
}
