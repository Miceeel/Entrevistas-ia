import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import InterviewRoom from './components/InterviewRoom';
import FeedbackDashboard from './components/FeedbackDashboard';
import HelpersModal from './components/HelpersModal';
import DemoModal from './components/DemoModal';
import { Screen, HelperType } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('Software Engineer');
  const [selectedHelper, setSelectedHelper] = useState<HelperType>('C-BOT');
  const [isHelpersModalOpen, setIsHelpersModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);

  const navigateTo = (screen: Screen, role?: string, history?: { role: 'user' | 'model', text: string }[]) => {
    if (role) setSelectedRole(role);
    if (history) setInterviewHistory(history);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#101822]">
      {currentScreen === 'landing' && (
        <LandingPage 
          onStart={(role) => navigateTo('interview', role)} 
          onOpenHelpers={() => setIsHelpersModalOpen(true)}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          selectedHelper={selectedHelper}
        />
      )}
      {currentScreen === 'interview' && (
        <InterviewRoom 
          role={selectedRole} 
          onFinish={(history) => navigateTo('feedback', undefined, history)} 
          onOpenHelpers={() => setIsHelpersModalOpen(true)}
          selectedHelper={selectedHelper}
        />
      )}
      {currentScreen === 'feedback' && (
        <FeedbackDashboard 
          role={selectedRole}
          history={interviewHistory}
          onRetry={() => navigateTo('interview')} 
        />
      )}

      <HelpersModal 
        isOpen={isHelpersModalOpen}
        onClose={() => setIsHelpersModalOpen(false)}
        selectedHelper={selectedHelper}
        onSelect={(helper) => setSelectedHelper(helper)}
      />

      <DemoModal 
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
