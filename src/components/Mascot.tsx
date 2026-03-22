import React from 'react';
import { motion } from 'motion/react';
import { HelperType } from '../types';

interface MascotProps {
  className?: string;
  isAnalyzing?: boolean;
  type?: HelperType;
}

export default function Mascot({ className = "", isAnalyzing = false, type = 'C-BOT' }: MascotProps) {
  const renderMascot = () => {
    switch (type) {
      case 'MONO':
        return (
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[35%] h-[90%] bg-[#1a1a1a] rounded-xl border-l-[8px] border-t-[8px] border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)] overflow-hidden flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            {/* Eyes */}
            <div className="flex gap-3 mb-6">
              <motion.div 
                animate={isAnalyzing ? { opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-5 h-5 bg-white rounded-sm shadow-[0_0_25px_white]" 
              />
              <motion.div 
                animate={isAnalyzing ? { opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                className="w-5 h-5 bg-white rounded-sm shadow-[0_0_25px_white]" 
              />
            </div>
            {/* Mouth */}
            <div className="w-8 h-[3px] bg-white/80 rounded-full" />
          </motion.div>
        );

      case 'HEX':
        return (
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[80%] h-[80%] flex items-center justify-center"
          >
            {/* Hexagonal Amber Crystal - Solid and Vibrant */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 shadow-[0_0_60px_rgba(245,158,11,0.5)]"
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
            />
            {/* Inner Core with Cubes */}
            <div className="relative grid grid-cols-3 gap-2 p-5 bg-black/30 rounded-xl">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className={`w-4 h-4 rounded-sm shadow-lg ${
                    [0, 2, 4, 6, 8].includes(i) ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        );

      case 'LENTE':
        return (
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[80%] aspect-square bg-[#050505] rounded-full border-2 border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden"
          >
            {/* Glossy Reflection - Stronger */}
            <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[80%] bg-gradient-to-br from-white/30 to-transparent rounded-full blur-3xl"></div>
            
            {/* Orange Visor Line - Sharp and Glowing */}
            <motion.div 
              animate={isAnalyzing ? { 
                height: ['5px', '10px', '5px'],
                boxShadow: ['0 0 20px #f97316', '0 0 45px #f97316', '0 0 20px #f97316']
              } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-[85%] h-[6px] bg-orange-500 rounded-full shadow-[0_0_25px_rgba(249,115,22,1)]" 
            />
          </motion.div>
        );

      case 'C-BOT':
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Glowing Ring Base */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] w-[70%] h-[10%] rounded-[100%] bg-yellow-400/30 blur-xl"
            />
            <div className="absolute bottom-[-5%] w-[50%] h-[4%] rounded-[100%] border border-yellow-400/40" />

            {/* Main Body Container */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex items-center"
            >
              {/* Main Cube Body */}
              <div className="relative w-36 h-36 bg-gradient-to-br from-[#b87333] via-[#cd7f32] to-[#8b4513] rounded-xl shadow-2xl border-2 border-white/20 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
                
                {/* Eyes */}
                <div className="absolute top-[35%] left-[20%] right-[20%] flex justify-between">
                  <motion.div 
                    animate={isAnalyzing ? { opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="w-7 h-7 bg-yellow-300 rounded-sm shadow-[0_0_20px_rgba(253,224,71,1)]" 
                  />
                  <motion.div 
                    animate={isAnalyzing ? { opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                    className="w-7 h-7 bg-yellow-300 rounded-sm shadow-[0_0_20px_rgba(253,224,71,1)]" 
                  />
                </div>

                {/* Mouth */}
                <div className="absolute bottom-[25%] left-[35%] right-[35%] h-[3px] bg-yellow-400/60 rounded-full" />
              </div>

              {/* Side Attachment - Angled like in the image */}
              <motion.div 
                animate={{ rotate: [5, 8, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-24 bg-gradient-to-br from-[#b87333] to-[#8b4513] rounded-lg shadow-xl border-2 border-white/10 ml-2 flex flex-col items-center justify-center gap-6"
              >
                 <div className="w-5 h-[3px] bg-red-500 shadow-[0_0_10px_red]" />
                 <div className="w-5 h-[3px] bg-red-500 shadow-[0_0_10px_red]" />
              </motion.div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {renderMascot()}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/5 blur-3xl animate-pulse rounded-full" />
      )}
    </div>
  );
}
