"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
// Importing the 50 questions from your clean data folder
import { ALL_LEVEL_1 } from '@/data/ribo1-bank';

function shuffle(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function RiboLevel1Page() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // 1. Shuffle the ENTIRE Master Bank of questions
    const fullBankShuffled = shuffle(ALL_LEVEL_1);
    
    // 2. Take only the first 50 for this exam run
    const selectedQuestions = fullBankShuffled.slice(0, 50);

    // 3. Shuffle the multiple choice options inside those 50 questions
    const finalExam = selectedQuestions.map(q => ({
        ...q,
        options: shuffle(q.options)
    }));
    
    setQuestions(finalExam);
  }, []);

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else { 
      setShowResults(true); 
    }
  };

  const startTest = () => {
      setHasStarted(true);
  };

  const softBlueShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.15)';
  const indigo = "#6366f1";
  
  const currentQ = questions.length > 0 ? questions[currentIndex] : null;

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        <Link href="/lounge" style={{ textDecoration: 'none', color: indigo, fontWeight: 800, fontSize: '14px', display: 'block', marginBottom: '32px' }}>
            ← Back to Lounge
        </Link>

        {/* 1. START SCREEN */}
        {!hasStarted && !showResults && (
            <div style={{ background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow, textAlign: 'center' }}>
                <span style={{ fontSize: '11px', background: '#e0e7ff', color: indigo, padding: '6px 16px', borderRadius: '999px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Entry Certification</span>
                <h1 style={{ fontSize: '42px', fontWeight: 900, marginTop: '20px', marginBottom: '16px' }}>RIBO Level 1 Prep</h1>
                <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px', lineHeight: '1.6' }}>
                    This practice exam covers the fundamentals of Property, Auto, and Travel insurance, <br/>
                    along with core RIBO ethics and regulations.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '40px' }}>
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontWeight: 900, color: '#16a34a', marginBottom: '4px', fontSize: '20px' }}>{questions.length} Questions</div>
                        <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>This Practice Run</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 900, color: '#475569', marginBottom: '4px', fontSize: '20px' }}>100 Questions</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Actual Exam Length</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 900, color: '#475569', marginBottom: '4px', fontSize: '20px' }}>75% to Pass</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Standard Requirement</div>
                    </div>
                </div>

                <button onClick={startTest} style={{ width: '100%', background: indigo, color: 'white', padding: '20px', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#4f46e5'} onMouseOut={e => e.currentTarget.style.background = indigo}>
                    Start Practice Exam
                </button>
            </div>
        )}

        {/* 2. QUESTION VIEW */}
        {hasStarted && !showResults && currentQ && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: indigo, textTransform: 'uppercase' }}>{currentQ.topic}</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8' }}>Q {currentIndex + 1} / {questions.length}</span>
             </div>
             
             <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '999px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ width: `${((currentIndex) / questions.length) * 100}%`, height: '100%', background: indigo, transition: 'width 0.3s ease' }}></div>
             </div>

             <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '32px', lineHeight: '1.4' }}>{currentQ.question}</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQ.options.map((opt: any, i: any) => (
                  <button 
                    key={i} 
                    disabled={!!selectedAnswer}
                    onClick={() => { setSelectedAnswer(opt); if(opt===currentQ.answer) setScore(s=>s+1); }} 
                    style={{ 
                        padding: '18px', textAlign: 'left', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                        border: '2px solid',
                        borderColor: selectedAnswer === opt ? (opt === currentQ.answer ? '#10b981' : '#ef4444') : (selectedAnswer && opt === currentQ.answer ? '#10b981' : '#e2e8f0'),
                        background: selectedAnswer === opt ? (opt === currentQ.answer ? '#f0fdf4' : '#fef2f2') : (selectedAnswer && opt === currentQ.answer ? '#f0fdf4' : 'white'),
                        cursor: selectedAnswer ? 'default' : 'pointer', color: '#334155' 
                    }}
                  >
                    {opt}
                  </button>
                ))}
             </div>
             {selectedAnswer && (
               <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${indigo}` }}>
                 <p style={{ fontSize: '14px', lineHeight: '1.5' }}><strong>Explanation:</strong> {currentQ.explanation}</p>
                 <button onClick={handleNext} style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                    {currentIndex + 1 === questions.length ? 'Finish Test' : 'Next Question →'}
                 </button>
               </div>
             )}
          </div>
        )}

        {/* 3. RESULTS VIEW */}
        {showResults && (
          <div style={{ background: 'white', padding: '60px', borderRadius: '32px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: softBlueShadow }}>
            <h2 style={{ fontSize: '72px', fontWeight: 900, color: (score/questions.length >= 0.75) ? '#10b981' : indigo }}>
                {Math.round((score/questions.length)*100)}%
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>
                You scored {score} out of {questions.length}. <br/>
                {score >= (questions.length * 0.75) ? "Passing Grade! Great job." : "Studying required to hit the 75% mark."}
            </p>
            <button onClick={() => window.location.reload()} style={{ background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Try Another Run</button>
          </div>
        )}
      </main>
    </div>
  );
}