'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAiKey, setAiKey, testAiKey, KEY_RE } from '@/lib/ai-key';

/**
 * « Mon assistant IA » : guide pas à pas pour créer sa clé Gemini gratuite
 * (Google AI Studio) et la coller dans l'app. S'ouvre par l'évènement
 * global « pq-open-ai » (bouton du profil, cartes « Ajoute ta clé »…).
 */
export default function AiKeySheet() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const [saved, setSaved] = useState('');
  const [state, setState] = useState<'idle' | 'test' | 'ok' | 'bad' | 'net' | 'format'>('idle');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => { const k = getAiKey(); setSaved(k); setVal(k); setState('idle'); setShow(false); setOpen(true); };
    window.addEventListener('pq-open-ai', on);
    return () => window.removeEventListener('pq-open-ai', on);
  }, []);

  if (!open || typeof document === 'undefined') return null;

  const save = async () => {
    const k = val.replace(/\s+/g, '');
    if (!KEY_RE.test(k)) { setState('format'); return; }
    setState('test');
    const r = await testAiKey(k);
    if (r === 'bad') { setState('bad'); return; }
    setAiKey(k); setSaved(k); setState(r === 'ok' ? 'ok' : 'net');
  };
  const remove = () => { setAiKey(''); setSaved(''); setVal(''); setState('idle'); };
  const masked = saved ? `${saved.slice(0, 6)}••••••••${saved.slice(-4)}` : '';

  return createPortal(
    <div className="sheet on ai-sheet" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="sheet-in">
        <button className="ai-x" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
        <span className="kicker">Mon assistant IA</span>
        <h2 className="ai-h">Ta clé Gemini, gratuite</h2>
        <p className="ai-lede">La méditation des versets, les questions et le mot à mot utilisent <b>Gemini</b>, l’IA gratuite de Google. Chacun utilise sa propre clé : c’est gratuit pour toi, et l’app reste gratuite pour tous.</p>

        {saved && state !== 'bad' ? (
          <div className="ai-ok">
            <span className="ai-ok-dot">✓</span>
            <div><b>Ta clé est enregistrée sur ce téléphone</b><span>{masked}</span></div>
          </div>
        ) : null}

        <ol className="ai-steps">
          <li><b>Ouvre Google AI Studio</b>
            <a className="btn sm primary" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Ouvrir aistudio.google.com ›</a></li>
          <li><b>Connecte-toi</b> avec ton compte Google (ton adresse Gmail).</li>
          <li><b>Touche « Create API key »</b> (Créer une clé API), puis accepte les conditions de Google si elles s’affichent.</li>
          <li><b>Copie la clé</b> (elle commence par <code>AIza</code> ou <code>AQ.</code>). Reviens ici et colle-la.</li>
        </ol>

        <div className="ai-field">
          <input className="field" type={show ? 'text' : 'password'} value={val} autoComplete="off" spellCheck={false}
                 onChange={e => { setVal(e.target.value); setState('idle'); }} placeholder="Colle ta clé ici" />
          <button className="ai-eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Masquer' : 'Afficher'}>{show ? 'Masquer' : 'Voir'}</button>
        </div>
        {state === 'format' && <p className="ai-msg err">Ce n’est pas une clé Gemini : elle commence par « AIza » ou « AQ. ». Recopie-la en entier.</p>}
        {state === 'bad' && <p className="ai-msg err">Google refuse cette clé. Recopie-la depuis AI Studio.</p>}
        {state === 'net' && <p className="ai-msg">Clé enregistrée. Impossible de la vérifier pour l’instant (réseau) : elle sera testée à la première question.</p>}
        {state === 'ok' && <p className="ai-msg ok">Clé vérifiée et enregistrée. Tout est prêt.</p>}

        <div className="ai-actions">
          <button className="btn primary" onClick={save} disabled={state === 'test' || !val.trim()}>
            {state === 'test' ? 'Vérification…' : 'Enregistrer ma clé'}
          </button>
          {saved && <button className="btn" onClick={remove}>Retirer</button>}
        </div>

        <p className="ai-fine">Ta clé reste sur ce téléphone : elle n’est jamais enregistrée chez nous, elle sert seulement au moment où tu demandes une méditation ou poses une question. Le palier gratuit de Google suffit largement pour un usage personnel. Ce qui a déjà été médité pour quelqu’un reste disponible pour tous, sans clé.</p>
      </div>
    </div>,
    document.body
  );
}
