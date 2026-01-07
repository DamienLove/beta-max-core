import React, { useState } from 'react';
import { Shield, Check, X, AlertTriangle, Code, Eye, ArrowRight } from 'lucide-react';

const TEST_MODULES = [
  {
    id: 'RECIPE',
    type: 'SEQUENCE',
    title: 'The Recipe',
    desc: 'Reconstruct the sequence of events to reproduce this bug.',
    scenario: "Bug Report: 'App crashes when I try to apply a discount code.'",
    data: [
      { id: 'A', text: 'Tap "Apply Coupon"' },
      { id: 'B', text: 'Launch App & Login' },
      { id: 'C', text: 'App Crashes' },
      { id: 'D', text: 'Add item to Cart' },
      { id: 'E', text: 'Navigate to Checkout' }
    ],
    correctOrder: ['B', 'D', 'E', 'A', 'C']
  },
  {
    id: 'MATRIX',
    type: 'MULTIPLE_CHOICE',
    title: 'The Matrix',
    desc: 'Analyze the system log and identify the root cause.',
    scenario: "System Log Output:\nE/AndroidRuntime: FATAL EXCEPTION: main\njava.lang.NullPointerException: Attempt to invoke virtual method 'String.length()' on a null object reference\nat com.betamax.core.ui.User.getName(User.kt:42)",
    options: [
      { id: 'A', text: 'The network connection timed out.' },
      { id: 'B', text: 'The User object or Name field was empty (null).' },
      { id: 'C', text: 'The database is locked.' },
      { id: 'D', text: 'The device ran out of memory.' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'PIXEL',
    type: 'VISUAL',
    title: 'Pixel Perfect',
    desc: 'Identify the critical UI anomaly in this component description.',
    scenario: "Design Spec: 'Primary Action Button should be Hex #22D3EE (Cyan) with 16px padding.'\n\nActual Implementation:\nButton rendered with Hex #22D3EE, but text is unreadable white-on-cyan, and padding is 8px.",
    options: [
      { id: 'A', text: 'The color hex code is wrong.' },
      { id: 'B', text: 'The contrast (text color) and padding are incorrect.' },
      { id: 'C', text: 'The button is missing entirely.' },
      { id: 'D', text: 'The font family is wrong.' }
    ],
    correctAnswer: 'B'
  }
];

export default function TestEngine({ onComplete }) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [, setUserAnswers] = useState({});
  const [sequenceBuffer, setSequenceBuffer] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentTest = TEST_MODULES[currentModuleIndex];

  // -- Handlers --

  const handleSequenceClick = (itemId) => {
    if (sequenceBuffer.includes(itemId)) {
      setSequenceBuffer(sequenceBuffer.filter(id => id !== itemId));
    } else {
      setSequenceBuffer([...sequenceBuffer, itemId]);
    }
  };

  const submitSequence = () => {
    const isCorrect = JSON.stringify(sequenceBuffer) === JSON.stringify(currentTest.correctOrder);
    handleNext(isCorrect);
  };

  const handleChoice = (optionId) => {
    const isCorrect = optionId === currentTest.correctAnswer;
    handleNext(isCorrect);
  };

  const handleNext = (wasCorrect) => {
    const newScore = wasCorrect ? score + 1 : score;
    setScore(newScore);
    
    // Save minimal answer data (for future analytics if needed)
    setUserAnswers(prev => ({ ...prev, [currentTest.id]: wasCorrect }));

    if (currentModuleIndex + 1 < TEST_MODULES.length) {
      setCurrentModuleIndex(prev => prev + 1);
      setSequenceBuffer([]);
    } else {
      setIsFinished(true);
      // Determine Tier based on Score (0-3)
      // 3/3 = Tier 3 (Elite)
      // 2/3 = Tier 2 (Veteran)
      // 0-1 = Tier 1 (Rookie)
      let tier = 1;
      if (newScore === 2) tier = 2;
      if (newScore === 3) tier = 3;
      
      onComplete({ score: newScore, total: TEST_MODULES.length, tier });
    }
  };

  // -- Renderers --

  if (isFinished) {
    return (
      <div className="text-center animate-in fade-in zoom-in">
        <h3 className="text-2xl font-bold text-white mb-2">CALIBRATION COMPLETE</h3>
        <p className="text-cyan-500 mb-6">Analyzing telemetry...</p>
        <div className="inline-block p-6 border border-cyan-500 rounded bg-cyan-950/30 mb-6">
          <span className="text-4xl font-bold text-white">{score} / {TEST_MODULES.length}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 border border-cyan-900/30 rounded-lg p-6 box-glow relative overflow-hidden min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-2 text-fuchsia-400 font-bold uppercase tracking-widest">
          {currentTest.type === 'SEQUENCE' && <Shield size={18} />}
          {currentTest.type === 'MULTIPLE_CHOICE' && <Code size={18} />}
          {currentTest.type === 'VISUAL' && <Eye size={18} />}
          {currentTest.title}
        </div>
        <div className="text-xs text-cyan-700 font-mono">
          MODULE {currentModuleIndex + 1}/{TEST_MODULES.length}
        </div>
      </div>

      {/* Scenario */}
      <div className="mb-8">
        <p className="text-sm text-cyan-200 mb-4">{currentTest.desc}</p>
        <div className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded font-mono text-xs text-cyan-100 whitespace-pre-wrap">
          {currentTest.scenario}
        </div>
      </div>

      {/* Interaction Area */}
      <div className="flex-1">
        
        {/* Sequence Type */}
        {currentTest.type === 'SEQUENCE' && (
          <div className="space-y-4">
            <p className="text-xs text-cyan-600 uppercase">Tap items in chronological order:</p>
            <div className="grid gap-2">
              {currentTest.data.map(item => {
                const isSelected = sequenceBuffer.includes(item.id);
                const orderIndex = sequenceBuffer.indexOf(item.id) + 1;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSequenceClick(item.id)}
                    className={`w-full text-left p-3 border rounded transition-all flex items-center gap-3
                      ${isSelected 
                        ? 'bg-fuchsia-900/20 border-fuchsia-500 text-fuchsia-100' 
                        : 'bg-black/20 border-cyan-900/30 text-cyan-400 hover:border-cyan-500'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isSelected ? 'bg-fuchsia-500 text-black' : 'bg-cyan-900/30 text-cyan-700'}`}>
                      {isSelected ? orderIndex : ''}
                    </div>
                    {item.text}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={submitSequence}
              disabled={sequenceBuffer.length !== currentTest.data.length}
              className="w-full mt-4 cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Sequence
            </button>
          </div>
        )}

        {/* Multiple Choice / Visual Type */}
        {(currentTest.type === 'MULTIPLE_CHOICE' || currentTest.type === 'VISUAL') && (
          <div className="space-y-3">
             {currentTest.options.map(opt => (
               <button
                 key={opt.id}
                 onClick={() => handleChoice(opt.id)}
                 className="w-full text-left p-4 border border-cyan-900/30 rounded bg-black/20 hover:bg-cyan-900/10 hover:border-cyan-400 text-cyan-300 transition-all group flex items-center justify-between"
               >
                 <span>{opt.text}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity" />
               </button>
             ))}
          </div>
        )}

      </div>
    </div>
  );
}
