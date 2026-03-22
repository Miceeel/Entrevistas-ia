import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipForward, Bot, ChevronRight } from 'lucide-react';
import { HelperType } from '../types';
import { generateSpeech } from '../services/geminiService';
import { base64ToWav } from '../utils/audio';
import Mascot from './Mascot';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DialogueLine {
  helper: HelperType;
  text: string;
}

const DIALOGUE: DialogueLine[] = [
  { 
    helper: 'LENTE', 
    text: 'Hola C-BOT, he estado analizando las métricas de las últimas entrevistas. ¿Cómo ves el progreso de los candidatos?' 
  },
  { 
    helper: 'C-BOT', 
    text: '¡Hola LENTE! He notado una mejora increíble. Los candidatos se sienten mucho más cómodos gracias a tu feedback detallado.' 
  },
  { 
    helper: 'LENTE', 
    text: 'Es cierto. Mi análisis de lenguaje corporal muestra que la confianza ha subido un 30%. Pero aún debemos trabajar en la estructura de las respuestas técnicas.' 
  },
  { 
    helper: 'C-BOT', 
    text: '¡Exacto! Por eso estoy aquí para guiarlos paso a paso. Juntos somos el equipo perfecto para que consigan ese trabajo.' 
  }
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const playLine = async (index: number) => {
    if (index >= DIALOGUE.length) {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      return;
    }

    setIsLoading(true);
    setCurrentLineIndex(index);
    const line = DIALOGUE[index];

    try {
      const base64Audio = await generateSpeech(line.text, line.helper);
      if (!isMounted.current) return;

      if (base64Audio) {
        const audioUrl = base64ToWav(base64Audio, 24000);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (isPlaying && isMounted.current) {
            playLine(index + 1);
          }
        };

        await audio.play();
        setIsLoading(false);
      } else {
        // Fallback if audio fails
        setTimeout(() => {
          if (isPlaying && isMounted.current) playLine(index + 1);
        }, 3000);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in demo playback:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleStartDemo = () => {
    setIsPlaying(true);
    playLine(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playLine(currentLineIndex === -1 ? 0 : currentLineIndex);
    }
  };

  const handleNext = () => {
    stopAudio();
    setIsPlaying(false);
    const nextIndex = currentLineIndex + 1;
    if (nextIndex < DIALOGUE.length) {
      playLine(nextIndex);
    } else {
      setCurrentLineIndex(-1);
    }
  };

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-navy rounded-[2.5rem] border border-pure-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-pure-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-electric rounded-2xl flex items-center justify-center shadow-lg shadow-electric/20">
                  <Play className="w-6 h-6 text-pure-white fill-current" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-pure-white uppercase tracking-tight">Demo en Vivo</h2>
                  <p className="text-slate-gray text-sm">Escucha cómo interactúan nuestros ayudantes IA.</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-3 hover:bg-pure-white/5 rounded-full transition-colors"
              >
                <X className="w-8 h-8 text-slate-gray" />
              </button>
            </div>

            {/* Stage */}
            <div className="flex-1 p-12 flex flex-col items-center justify-center gap-12 min-h-[400px]">
              <div className="flex items-center justify-center gap-16 md:gap-32 w-full">
                {/* LENTE */}
                <div className={`flex flex-col items-center gap-6 transition-all duration-500 ${currentLineIndex !== -1 && DIALOGUE[currentLineIndex]?.helper !== 'LENTE' ? 'opacity-30 scale-90 grayscale' : 'scale-110'}`}>
                  <div className="w-40 h-40 md:w-56 md:h-56 relative">
                    <Mascot type="LENTE" className="w-full h-full" />
                    {currentLineIndex !== -1 && DIALOGUE[currentLineIndex]?.helper === 'LENTE' && !isLoading && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -top-4 -right-4 bg-electric p-2 rounded-full shadow-lg"
                      >
                        <Bot className="w-6 h-6 text-pure-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-electric tracking-[0.2em] uppercase">Observador</span>
                    <h3 className="text-2xl font-black text-pure-white">LENTE</h3>
                  </div>
                </div>

                {/* VS / Interaction */}
                <div className="hidden md:flex flex-col items-center gap-4">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-pure-white/20 to-transparent"></div>
                  <div className="text-slate-gray font-black text-xl italic">TALK</div>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-pure-white/20 to-transparent"></div>
                </div>

                {/* C-BOT */}
                <div className={`flex flex-col items-center gap-6 transition-all duration-500 ${currentLineIndex !== -1 && DIALOGUE[currentLineIndex]?.helper !== 'C-BOT' ? 'opacity-30 scale-90 grayscale' : 'scale-110'}`}>
                  <div className="w-40 h-40 md:w-56 md:h-56 relative">
                    <Mascot type="C-BOT" className="w-full h-full" />
                    {currentLineIndex !== -1 && DIALOGUE[currentLineIndex]?.helper === 'C-BOT' && !isLoading && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -top-4 -left-4 bg-electric p-2 rounded-full shadow-lg"
                      >
                        <Bot className="w-6 h-6 text-pure-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-electric tracking-[0.2em] uppercase">Compañero</span>
                    <h3 className="text-2xl font-black text-pure-white">C-BOT</h3>
                  </div>
                </div>
              </div>

              {/* Subtitles / Text */}
              <div className="w-full max-w-2xl bg-black/40 rounded-3xl p-8 border border-pure-white/5 min-h-[120px] flex items-center justify-center text-center">
                {currentLineIndex === -1 ? (
                  <p className="text-slate-gray font-medium italic">Haz clic en reproducir para iniciar la conversación simulada...</p>
                ) : isLoading ? (
                  <div className="flex items-center gap-3 text-electric">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <SkipForward className="w-6 h-6" />
                    </motion.div>
                    <span className="font-bold uppercase tracking-widest text-sm">Generando voz...</span>
                  </div>
                ) : (
                  <motion.p 
                    key={currentLineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl md:text-2xl font-bold text-pure-white leading-relaxed"
                  >
                    "{DIALOGUE[currentLineIndex].text}"
                  </motion.p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="p-8 bg-black/40 border-t border-pure-white/10 flex items-center justify-center gap-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleTogglePlay}
                  disabled={isLoading}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isPlaying 
                    ? 'bg-pure-white text-navy hover:scale-105' 
                    : 'bg-electric text-pure-white hover:bg-electric/90 hover:scale-105 shadow-electric/20'
                  } disabled:opacity-50 disabled:scale-100`}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>

                <button 
                  onClick={handleNext}
                  disabled={isLoading || (currentLineIndex === DIALOGUE.length - 1 && !isPlaying)}
                  className="w-16 h-16 rounded-full bg-pure-white/5 border border-pure-white/10 flex items-center justify-center text-pure-white hover:bg-pure-white/10 transition-all disabled:opacity-30"
                  title="Siguiente"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
              
              <div className="flex flex-col gap-1 min-w-[140px]">
                <span className="text-xs font-black text-slate-gray uppercase tracking-widest">Estado</span>
                <span className="text-sm font-bold text-pure-white">
                  {isPlaying ? (isLoading ? 'Cargando...' : 'Reproduciendo Demo') : 'Demo Pausada'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
