import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Settings, Mic, MicOff, Video, VideoOff, Send, MessageSquare, Clock, ClipboardList, Bot, Loader2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { generateInterviewQuestion, generateSpeech } from '../services/geminiService';
import { HelperType } from '../types';
import { base64ToWav } from '../utils/audio';
import Mascot from './Mascot';

interface InterviewRoomProps {
  role: string;
  onFinish: (history: { role: 'user' | 'model', text: string }[]) => void;
  onOpenHelpers: () => void;
  selectedHelper: HelperType;
}

export default function InterviewRoom({ role, onFinish, onOpenHelpers, selectedHelper }: InterviewRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('Cargando entrevista...');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [hasQuotaError, setHasQuotaError] = useState(false);
  const [isNarrating, setIsNarrating] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRequestIdRef = useRef<number>(0);
  const lastPlayedTextRef = useRef<string>('');
  const maxQuestions = 5;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    setIsTyping(true);
    try {
      setHasQuotaError(false);
      const firstQuestion = await generateInterviewQuestion(role, []);
      setCurrentQuestion(firstQuestion || '');
      setMessages([{ role: 'model', text: firstQuestion || '' }]);
      setQuestionCount(1);
      setProgress(20);
    } catch (error: any) {
      console.error(error);
      const isQuota = error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.message?.toLowerCase().includes('quota');
      if (isQuota) {
        setHasQuotaError(true);
        setCurrentQuestion('Se ha agotado la cuota gratuita de la IA. Por favor, espera un momento e intenta de nuevo.');
      } else {
        setCurrentQuestion('Hubo un error al iniciar la entrevista. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendResponse = async () => {
    if (!userInput.trim() || isTyping) return;

    const newUserMessage = { role: 'user' as const, text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      setHasQuotaError(false);
      if (questionCount >= maxQuestions) {
        onFinish(updatedMessages);
        return;
      }

      const nextQuestion = await generateInterviewQuestion(role, updatedMessages);
      setCurrentQuestion(nextQuestion || '');
      setMessages([...updatedMessages, { role: 'model', text: nextQuestion || '' }]);
      setQuestionCount(prev => prev + 1);
      setProgress(Math.min(100, (questionCount + 1) * (100 / maxQuestions)));
    } catch (error: any) {
      console.error(error);
      const isQuota = error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.message?.toLowerCase().includes('quota');
      if (isQuota) {
        setHasQuotaError(true);
        setCurrentQuestion('Se ha agotado la cuota gratuita de la IA. Por favor, espera un momento e intenta de nuevo.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (currentQuestion && isNarrating && !isTyping && messages.length > 0 && currentQuestion !== lastPlayedTextRef.current) {
      playAudio(currentQuestion);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentQuestion, isNarrating, isTyping, messages.length]);

  const playAudio = async (text: string) => {
    if (!isNarrating || !text) return;
    
    // Mark as played to avoid double triggers
    lastPlayedTextRef.current = text;
    const requestId = ++audioRequestIdRef.current;

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const base64Audio = await generateSpeech(text, selectedHelper);
      
      // If a newer request has started, abort this one
      if (requestId !== audioRequestIdRef.current) return;

      if (base64Audio) {
        const audioUrl = base64ToWav(base64Audio, 24000);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
        };
        audio.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };


  return (
    <div className="min-h-screen bg-sky-soft text-navy font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-pure-white/10 px-6 py-4 bg-navy text-pure-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-electric rounded-lg flex items-center justify-center text-pure-white">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">EntrevistAI</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-8">
          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-pure-white/60">ENTREVISTA: {role}</span>
              <span className="text-xs font-bold text-electric">{Math.round(progress)}% Completado</span>
            </div>
            <div className="h-1.5 w-full bg-pure-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-electric" 
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenHelpers}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-pure-white/5 hover:bg-pure-white/10 border border-pure-white/10 transition-all text-sm font-bold"
          >
            <Bot className="w-4 h-4 text-electric" />
            Ayudantes
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/10 text-electric border border-electric/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-tight">EN VIVO</span>
          </div>
          <button className="p-2 hover:bg-pure-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="size-10 rounded-full bg-navy/50 overflow-hidden border-2 border-electric/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/user-avatar/100/100" 
              alt="User profile"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Video Feeds */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI Mascot Feed */}
          <div className="relative aspect-video bg-navy rounded-xl border border-navy/10 overflow-hidden shadow-2xl group flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-electric/20">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <Mascot type={selectedHelper} className="w-48 h-48 md:w-64 md:h-64" isAnalyzing={isTyping} />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="size-12 rounded-full bg-electric flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-pure-white" />
              </div>
              <div>
                <p className="text-pure-white font-bold text-lg">{isTyping ? 'Analizando...' : 'Escuchando...'}</p>
                <p className="text-electric text-sm font-medium tracking-wide uppercase">{selectedHelper}: Tu Compañero IA</p>
              </div>
            </div>
            {isTyping && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-electric animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-electric/30 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          {/* Transcription / Subtitles */}
          <div className="bg-pure-white p-6 rounded-xl border border-navy/10 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-electric" />
                <h3 className="font-bold text-navy uppercase text-xs tracking-widest">PREGUNTA ACTUAL</h3>
              </div>
              <button 
                onClick={() => setIsNarrating(!isNarrating)}
                className={`p-1.5 rounded-lg transition-colors ${isNarrating ? 'text-electric bg-electric/10' : 'text-slate-gray bg-navy/5'}`}
                title={isNarrating ? "Desactivar narración" : "Activar narración"}
              >
                {isNarrating ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-navy">
                {currentQuestion}
              </p>
              {hasQuotaError && (
                <button 
                  onClick={() => messages.length === 0 ? startInterview() : handleSendResponse()}
                  className="mt-4 px-4 py-2 bg-electric text-pure-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-electric/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Reintentar ahora
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: User Feed & Controls */}
        <div className="flex flex-col gap-6">
          {/* User Webcam Preview */}
          <div className="relative aspect-[4/3] bg-navy rounded-xl border-2 border-electric overflow-hidden shadow-lg">
            {!isVideoOff ? (
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" 
                alt="Candidate webcam"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-navy/50">
                <VideoOff className="w-12 h-12 text-pure-white/20" />
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
              <p className="text-pure-white text-xs font-medium">Tú (Vista previa)</p>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center border ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Input Controls */}
          <div className="flex-1 bg-pure-white rounded-xl border border-navy/10 p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex-1 bg-sky-soft rounded-xl border border-navy/5 p-4 overflow-y-auto max-h-[200px]">
                {messages.filter(m => m.role === 'user').map((m, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <span className="text-electric font-bold">Tú: </span>
                    <span className="text-navy/80">{m.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full bg-sky-soft border border-navy/10 rounded-xl p-4 text-sm focus:outline-none focus:border-electric transition-colors resize-none h-24 text-navy"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendResponse();
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className="flex flex-col items-center gap-2 py-3 rounded-xl border border-navy/10 hover:bg-sky-soft transition-colors text-navy"
              >
                {isVideoOff ? <Video className="w-5 h-5 text-slate-gray" /> : <VideoOff className="w-5 h-5 text-slate-gray" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isVideoOff ? 'Iniciar' : 'Detener'}</span>
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="flex flex-col items-center gap-2 py-3 rounded-xl border border-navy/10 hover:bg-sky-soft transition-colors text-navy"
              >
                {isMuted ? <Mic className="w-5 h-5 text-slate-gray" /> : <MicOff className="w-5 h-5 text-slate-gray" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isMuted ? 'Activar' : 'Silenciar'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSendResponse}
                disabled={isTyping || !userInput.trim()}
                className="w-full bg-electric disabled:opacity-50 hover:bg-electric/90 text-pure-white font-bold py-4 rounded-xl shadow-lg shadow-electric/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {questionCount >= maxQuestions ? 'Finalizar Entrevista' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-navy border-t border-pure-white/10 px-6 py-3 text-pure-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pure-white/40" />
              <span className="text-xs font-medium text-pure-white/60">Sesión iniciada hace 2m</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-pure-white/40" />
              <span className="text-xs font-medium text-pure-white/60">Pregunta {questionCount} de {maxQuestions}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-pure-white/60">Conexión estable</span>
            <div className="flex gap-1 items-end h-3">
              {[2, 4, 3, 5].map((h, i) => (
                <div key={i} className="w-1 bg-emerald-500 rounded-full" style={{ height: `${h * 20}%` }} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

