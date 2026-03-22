import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  RotateCcw, 
  TrendingUp, 
  BarChart, 
  Lightbulb, 
  Mic2, 
  Brain, 
  Code2, 
  Users, 
  Sparkles, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { generateFeedback } from '../services/geminiService';

interface FeedbackDashboardProps {
  role: string;
  history: { role: 'user' | 'model', text: string }[];
  onRetry: () => void;
}

export default function FeedbackDashboard({ role, history, onRetry }: FeedbackDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await generateFeedback(role, history);
        setFeedback(data);
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes('429') || err.status === 'RESOURCE_EXHAUSTED') {
          setError('Se ha agotado la cuota gratuita de la IA. Por favor, intenta de nuevo en unos minutos.');
        } else {
          setError('Hubo un error al generar el feedback. Por favor, intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (history.length > 0) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [role, history]);

  if (error) {
    return (
      <div className="min-h-screen bg-sky-soft flex flex-col items-center justify-center text-navy p-6 text-center">
        <div className="size-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error de Cuota</h2>
        <p className="text-slate-gray max-w-md mb-8">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-electric text-pure-white rounded-lg font-bold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reintentar Análisis
          </button>
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-navy/5 text-navy rounded-lg font-bold border border-navy/10"
          >
            Nueva Entrevista
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-soft flex flex-col items-center justify-center text-navy">
        <Loader2 className="w-12 h-12 text-electric animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Generando tu feedback...</h2>
        <p className="text-slate-gray mt-2">Nuestra IA está analizando tu desempeño.</p>
      </div>
    );
  }

  const displayFeedback = feedback || {
    overallScore: 0,
    skillScores: [
      { label: 'Profundidad Técnica', score: 0 },
      { label: 'Comunicación', score: 0 },
      { label: 'Confianza', score: 0 }
    ],
    tips: [
      { icon: Mic2, title: 'Sin datos', desc: 'No hay suficiente información para generar consejos.' }
    ],
    summary: error || 'No se pudo generar el feedback. Por favor, intenta de nuevo.'
  };

  return (
    <div className="min-h-screen bg-sky-soft text-navy font-sans flex flex-col">
      <header className="flex items-center justify-between border-b border-pure-white/10 px-6 py-4 lg:px-20 bg-navy text-pure-white">
        <div className="flex items-center gap-3 text-electric">
          <div className="size-8">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
            </svg>
          </div>
          <h2 className="text-pure-white text-xl font-bold leading-tight tracking-tight">EntrevistAI</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 mr-6 text-sm font-medium">
            <a href="#" className="text-electric">Panel</a>
            <a href="#" className="text-pure-white/60 hover:text-electric transition-colors">Historial</a>
            <a href="#" className="text-pure-white/60 hover:text-electric transition-colors">Recursos</a>
          </div>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-pure-white/5 text-pure-white/80">
            <Bell className="w-5 h-5" />
          </button>
          <div className="h-10 w-10 rounded-full bg-electric/20 border border-electric/30 flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/user-avatar/100/100" 
              alt="User"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">Feedback de la Entrevista</h1>
            <p className="text-slate-gray mt-2 text-lg">Análisis detallado de tu sesión de práctica para '{role}'.</p>
            {displayFeedback.summary && (
              <div className={`mt-4 p-4 rounded-lg border ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-pure-white border-navy/10 text-navy/80'} text-sm`}>
                {displayFeedback.summary}
              </div>
            )}
          </motion.div>
          <div className="flex gap-3">
            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-navy/10 font-semibold text-navy/70 hover:bg-pure-white/50 transition-all">
              Descargar PDF
            </button>
            <button 
              onClick={onRetry}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-electric text-pure-white font-semibold shadow-lg shadow-electric/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reintentar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl bg-pure-white border border-navy/10 flex flex-col items-center text-center shadow-sm"
            >
              <p className="text-slate-gray font-semibold uppercase tracking-wider text-xs mb-4">RENDIMIENTO GENERAL</p>
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle className="text-navy/5" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <motion.circle 
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * displayFeedback.overallScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-electric" 
                    cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeWidth="12" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-navy">{displayFeedback.overallScore}</span>
                  <span className="text-slate-gray text-sm">de 100</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +12% desde la última vez
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-pure-white border border-navy/10 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-navy">
                <BarChart className="w-5 h-5 text-electric" /> Desglose de habilidades
              </h3>
              <div className="space-y-5">
                {displayFeedback.skillScores.map((skill: any) => (
                  <div key={skill.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-navy">{skill.label}</span>
                      <span className="text-slate-gray">{skill.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-navy/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-electric rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-pure-white border border-navy/10 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-navy">
                <Lightbulb className="w-6 h-6 text-amber-500" /> Consejos Específicos para Mejorar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayFeedback.tips.map((tip: any, i: number) => {
                  const Icon = i % 4 === 0 ? Mic2 : i % 4 === 1 ? Brain : i % 4 === 2 ? Code2 : Users;
                  return (
                    <div key={i} className="p-4 rounded-lg bg-sky-soft/50 border border-navy/5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-electric/10 text-electric rounded-md">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm mb-1 text-navy">{tip.title}</h4>
                          <p className="text-xs text-slate-gray leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-electric/10 border border-electric/20 shadow-sm relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 text-navy">Siguientes Pasos Recomendados</h3>
                <p className="text-slate-gray mb-6 max-w-lg">Basado en tu desempeño, hemos seleccionado una ruta de aprendizaje personalizada para dominar tus áreas débiles.</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] p-4 bg-pure-white rounded-lg border border-navy/10">
                    <span className="text-xs font-bold text-electric uppercase">CURSO</span>
                    <h4 className="font-bold mt-1 text-navy">Diseño de Sistemas Avanzado</h4>
                    <p className="text-xs text-slate-gray mt-2">2h 15m • Serie de Videos</p>
                    <button className="mt-4 text-electric text-sm font-bold flex items-center gap-1">Empezar ahora <ArrowRight className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 min-w-[200px] p-4 bg-pure-white rounded-lg border border-navy/10">
                    <span className="text-xs font-bold text-electric uppercase">PRÁCTICA</span>
                    <h4 className="font-bold mt-1 text-navy">Taller de Habilidades Blandas</h4>
                    <p className="text-xs text-slate-gray mt-2">45m • Laboratorio de IA</p>
                    <button className="mt-4 text-electric text-sm font-bold flex items-center gap-1">Continuar <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Sparkles className="w-[160px] h-[160px] text-electric" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-navy text-pure-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">¿Listo para la entrevista real?</h2>
              <p className="text-pure-white/80">Agenda una simulación con un experto de la industria.</p>
            </div>
            <button className="px-8 py-3 bg-pure-white text-navy font-bold rounded-lg hover:bg-sky-soft transition-colors">
              Reservar Experto Humano
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-electric/40 to-transparent pointer-events-none"></div>
        </div>
      </main>

      <footer className="mt-auto border-t border-navy/10 px-6 py-8 lg:px-20 bg-navy text-pure-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-pure-white/60 text-sm">
          <p>© 2024 EntrevistAI. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-electric">Política de Privacidad</a>
            <a href="#" className="hover:text-electric">Términos de Servicio</a>
            <a href="#" className="hover:text-electric">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
