import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { HelperType, Helper } from '../types';
import { generateSpeech } from '../services/geminiService';
import { base64ToWav } from '../utils/audio';
import Mascot from './Mascot';

interface HelpersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHelper: HelperType;
  onSelect: (helper: HelperType) => void;
}

const HELPERS: Helper[] = [
  { id: 'MONO', name: 'MONO', description: 'Analítico y preciso. Ideal para roles técnicos.' },
  { id: 'C-BOT', name: 'C-BOT', description: 'Amigable y equilibrado. Tu compañero todoterreno.' },
  { id: 'HEX', name: 'HEX', description: 'Creativo y dinámico. Perfecto para roles de diseño.' },
  { id: 'LENTE', name: 'LENTE', description: 'Observador y detallista. Enfocado en la comunicación.' },
];

const GREETINGS: Record<HelperType, string> = {
  'MONO': 'Hola, soy MONO. Vamos a analizar tus habilidades con precisión.',
  'C-BOT': '¡Hola! Soy C-BOT. Gracias por elegirme, ¡vamos a aprender juntos!',
  'HEX': '¡Qué tal! Soy HEX. Estoy listo para explorar tu potencial creativo.',
  'LENTE': 'Hola, soy LENTE. Observaremos cada detalle para mejorar tu entrevista.'
};

export default function HelpersModal({ isOpen, onClose, selectedHelper, onSelect }: HelpersModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playGreeting = async (helper: HelperType) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const text = GREETINGS[helper];
      const base64Audio = await generateSpeech(text, helper);
      if (base64Audio) {
        const audioUrl = base64ToWav(base64Audio, 24000);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error("Error playing greeting:", error);
    }
  };

  const handleSelect = (helper: HelperType) => {
    onSelect(helper);
    playGreeting(helper);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-pure-white rounded-[2rem] border border-navy/10 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-navy/10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-navy">Selecciona tu Ayudante</h2>
                <p className="text-slate-gray mt-1">Cada ayudante tiene una personalidad única para tu entrevista.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-sky-soft rounded-full transition-colors"
              >
                <X className="w-8 h-8 text-slate-gray" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HELPERS.map((helper) => (
                <motion.div
                  key={helper.id}
                  whileHover={{ y: -5 }}
                  onClick={() => handleSelect(helper.id)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-6 ${
                    selectedHelper === helper.id 
                    ? 'border-electric bg-electric/10 shadow-lg shadow-electric/20' 
                    : 'border-navy/5 bg-sky-soft hover:border-navy/20'
                  }`}
                >
                  {selectedHelper === helper.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-electric rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-pure-white" />
                    </div>
                  )}
                  
                  <div className="w-32 h-32">
                    <Mascot type={helper.id} className="w-full h-full" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-black text-navy mb-2 uppercase tracking-wider">{helper.name}</h3>
                    <p className="text-xs text-slate-gray leading-relaxed">{helper.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 bg-sky-soft/50 flex justify-end">
              <button 
                onClick={onClose}
                className="bg-electric hover:bg-electric/90 text-pure-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-electric/20"
              >
                Confirmar Selección
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
