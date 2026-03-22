import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Briefcase, Video, BarChart, ArrowRight, PlayCircle, Share2, Megaphone, ChevronRight } from 'lucide-react';
import { ROLES } from '../constants';
import { HelperType } from '../types';
import { generateSpeech } from '../services/geminiService';
import { base64ToWav } from '../utils/audio';
import Mascot from './Mascot';

interface LandingPageProps {
  onStart: (role: string) => void;
  onOpenHelpers: () => void;
  onOpenDemo: () => void;
  selectedHelper: HelperType;
}

const GREETINGS: Record<HelperType, string> = {
  'MONO': 'Hola, soy MONO. Vamos a analizar tus habilidades con precisión.',
  'C-BOT': '¡Hola! Soy C-BOT. Gracias por elegirme, ¡vamos a aprender juntos!',
  'HEX': '¡Qué tal! Soy HEX. Estoy listo para explorar tu potencial creativo.',
  'LENTE': 'Hola, soy LENTE. Observaremos cada detalle para mejorar tu entrevista.'
};

export default function LandingPage({ onStart, onOpenHelpers, onOpenDemo, selectedHelper }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playGreeting = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const text = GREETINGS[selectedHelper];
      const base64Audio = await generateSpeech(text, selectedHelper);
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
  return (
    <div className="min-h-screen bg-sky-soft text-navy font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-navy/10 bg-navy backdrop-blur-md text-pure-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-electric">
              <BarChart3 className="w-8 h-8" />
              <span className="text-xl font-extrabold tracking-tight uppercase">EntrevistAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-semibold hover:text-electric transition-colors">Características</a>
              <a href="#" className="text-sm font-semibold hover:text-electric transition-colors">Cómo funciona</a>
              <button 
                onClick={onOpenHelpers}
                className="text-sm font-semibold hover:text-electric transition-colors"
              >
                Ayudantes
              </button>
              <a href="#" className="text-sm font-semibold hover:text-electric transition-colors">Roles</a>
              <a href="#" className="text-sm font-semibold hover:text-electric transition-colors">Precios</a>
            </nav>
            <div className="flex items-center gap-3">
              <button className="hidden sm:block px-4 py-2 text-sm font-bold text-pure-white/80 hover:text-electric transition-colors">Iniciar Sesión</button>
              <button className="bg-electric hover:bg-electric/90 text-pure-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-electric/20">Registrarse</button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-electric"></span>
                  </span>
                  <span className="text-xs font-bold text-electric tracking-wider uppercase">Nuevo: Feedback de Video en Vivo</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-navy">
                  Domina tu próxima <span className="text-electric">Entrevista</span> de trabajo con IA
                </h1>
                <p className="text-lg md:text-xl text-slate-gray max-w-xl leading-relaxed">
                  Únete a miles de solicitantes de empleo que mejoraron sus puntuaciones de entrevista en un 40% después de solo tres sesiones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => onStart(selectedRole)}
                    className="bg-electric hover:bg-electric/90 text-pure-white h-14 px-8 rounded-xl text-lg font-bold transition-all shadow-xl shadow-electric/30 flex items-center justify-center gap-2"
                  >
                    Iniciar Sesión Gratis <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onOpenDemo}
                    className="border-2 border-navy/10 h-14 px-8 rounded-xl text-lg font-bold hover:bg-navy/5 transition-all flex items-center justify-center gap-2 text-navy"
                  >
                    <PlayCircle className="w-5 h-5" /> Ver Demo
                  </button>
                </div>
                <div className="flex items-center gap-4 text-slate-gray text-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        className="h-8 w-8 rounded-full border-2 border-sky-soft" 
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <span>Más de 10,000 candidatos se han unido este mes</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-electric/10 blur-[120px] rounded-full"></div>
                <div 
                  className="relative w-full aspect-square max-w-[500px] flex items-center justify-center cursor-pointer group"
                  onClick={playGreeting}
                >
                  <Mascot type={selectedHelper} className="w-[80%] h-[80%] group-hover:scale-105 transition-transform" />
                  
                  <div className="absolute bottom-0 left-6 right-6 p-4 rounded-xl bg-pure-white/90 backdrop-blur-md border border-navy/10 flex items-center gap-4 shadow-2xl group-hover:border-electric/50 transition-colors">
                    <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-navy/60 uppercase font-bold tracking-widest">{selectedHelper} IA</span>
                      <span className="text-sm font-medium text-navy italic">"Hola, soy {selectedHelper}. ¿Listo para practicar tu entrevista?"</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-pure-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-navy">Cómo funciona</h2>
              <p className="text-slate-gray">Nuestra plataforma utiliza IA de vanguardia para simular escenarios de entrevistas del mundo real adaptados a tu carrera profesional.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl border border-navy/10 bg-sky-soft hover:border-electric/50 transition-all shadow-sm hover:shadow-xl hover:shadow-electric/5">
                <div className="w-14 h-14 rounded-xl bg-electric/10 flex items-center justify-center text-electric mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Elige tu rol</h3>
                <p className="text-slate-gray leading-relaxed">Selecciona entre más de 50 trayectorias profesionales especializadas, incluyendo roles en Tecnología, Finanzas y Creativos.</p>
              </div>
              <div className="group p-8 rounded-2xl border border-navy/10 bg-sky-soft hover:border-electric/50 transition-all shadow-sm hover:shadow-xl hover:shadow-electric/5">
                <div className="w-14 h-14 rounded-xl bg-electric/10 flex items-center justify-center text-electric mb-6 group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Entrevista de IA en vivo</h3>
                <p className="text-slate-gray leading-relaxed">Participa en una conversación natural y en tiempo real con nuestros avatares de entrevistadores de IA de baja latencia.</p>
              </div>
              <div className="group p-8 rounded-2xl border border-navy/10 bg-sky-soft hover:border-electric/50 transition-all shadow-sm hover:shadow-xl hover:shadow-electric/5">
                <div className="w-14 h-14 rounded-xl bg-electric/10 flex items-center justify-center text-electric mb-6 group-hover:scale-110 transition-transform">
                  <BarChart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy">Feedback instantáneo</h3>
                <p className="text-slate-gray leading-relaxed">Recibe una puntuación detallada sobre el lenguaje corporal, la calidad de la respuesta y las áreas de mejora.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Select Your Role */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-black text-navy">Elige tu Rol</h2>
                <p className="text-slate-gray">Bancos de preguntas personalizados para cada industria.</p>
              </div>
              <a href="#" className="text-electric font-bold flex items-center gap-1 hover:underline underline-offset-4">
                Ver los más de 50 roles <ChevronRight className="w-5 h-5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ROLES.map((role) => (
                <div 
                  key={role.id} 
                  onClick={() => setSelectedRole(role.title)}
                  className={`group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selectedRole === role.title ? 'border-electric scale-[1.02] shadow-2xl shadow-electric/20' : 'border-transparent'}`}
                >
                  <img 
                    src={role.image} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={role.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="text-xs font-black tracking-widest text-electric uppercase mb-2 block">{role.category}</span>
                    <h3 className="text-2xl font-bold text-pure-white mb-2">{role.title}</h3>
                    <p className="text-sm text-pure-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-electric rounded-[2.5rem] p-12 overflow-hidden shadow-2xl shadow-electric/40">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Megaphone className="w-[15rem] h-[15rem]" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl font-black text-pure-white mb-6">¿Listo para triunfar en tu próxima entrevista?</h2>
                <p className="text-pure-white/90 text-lg mb-8">Únete a miles de solicitantes de empleo que mejoraron sus puntuaciones de entrevista en un 40% después de solo tres sesiones.</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => onStart(selectedRole)} className="bg-pure-white text-electric hover:bg-sky-soft px-8 py-4 rounded-xl font-black text-lg transition-all shadow-lg">Comenzar Ahora</button>
                  <button className="bg-electric/20 hover:bg-electric/30 text-pure-white border border-pure-white/30 px-8 py-4 rounded-xl font-black text-lg transition-all">Ver Precios</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy border-t border-pure-white/10 py-16 text-pure-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-electric mb-6">
                <BarChart3 className="w-8 h-8" />
                <span className="text-xl font-extrabold tracking-tight uppercase">EntrevistAI</span>
              </div>
              <p className="text-pure-white/60 max-w-xs mb-6">Empoderando a los candidatos con inteligencia de entrevistas impulsada por IA. Consigue el trabajo de tus sueños hoy mismo.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-pure-white/5 flex items-center justify-center hover:bg-electric hover:text-pure-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pure-white/5 flex items-center justify-center hover:bg-electric hover:text-pure-white transition-colors">
                  <Megaphone className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="flex flex-col gap-3 text-sm text-pure-white/60">
                <li><a href="#" className="hover:text-electric transition-colors">IA de Entrevista</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Panel de Control</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Motor de Feedback</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Directorio de Roles</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Compañía</h4>
              <ul className="flex flex-col gap-3 text-sm text-pure-white/60">
                <li><a href="#" className="hover:text-electric transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Soporte</h4>
              <ul className="flex flex-col gap-3 text-sm text-pure-white/60">
                <li><a href="#" className="hover:text-electric transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-electric transition-colors">Estado</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-pure-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-pure-white/40 uppercase tracking-widest font-bold">
            <p>© 2024 EntrevistAI. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <a href="#">Privacidad</a>
              <a href="#">Política de Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
