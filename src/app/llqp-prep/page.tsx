"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
// Using the direct relative path to bypass the Next.js folder bug
import { ALL_LLQP } from '../../data/llqp-bank';

function shuffle(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function LlqpPrepPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // 1. Shuffle the ENTIRE Master Bank of questions
    const fullBankShuffled = shuffle(ALL_LLQP);
    
    // 2. Take only the first 50 for this practice run
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

  const softBlueShadow = '0 10px 30px -5px rgba(5, 150, 105, 0.15)'; // Green shadow
  const emerald = "#059669"; // LLQP Theme Color
  
  const currentQ = questions.length > 0 ? questions[currentIndex] : null;

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        
        <Link href="/lounge" style={{ textDecoration: 'none', color: emerald, fontWeight: 800, fontSize: '14px', display: 'block', marginBottom: '32px' }}>
            ← Back to Lounge
        </Link>

        {/* 1. START SCREEN */}
        {!hasStarted && !showResults && (
            <div style={{ background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow, textAlign: 'center' }}>
                <span style={{ fontSize: '11px', background: '#d1fae5', color: emerald, padding: '6px 16px', borderRadius: '999px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Life Certification</span>
                <h1 style={{ fontSize: '42px', fontWeight: 900, marginTop: '20px', marginBottom: '16px' }}>LLQP Practice Exam</h1>
                <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px', lineHeight: '1.6' }}>
                    This practice exam focuses on <b>Life, A&S, Segregated Funds, and Ethics</b>. <br/>
                    Essential prep for the harmonized provincial Life License.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '40px' }}>
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontWeight: 900, color: '#16a34a', marginBottom: '4px', fontSize: '20px' }}>{questions.length} Questions</div>
                        <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>This Practice Run</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 900, color: '#475569', marginBottom: '4px', fontSize: '20px' }}>140 Questions</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Actual Exam Total</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 900, color: '#475569', marginBottom: '4px', fontSize: '20px' }}>60% to Pass</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Regulatory Standard</div>
                    </div>
                </div>

                <button onClick={startTest} style={{ width: '100%', background: emerald, color: 'white', padding: '20px', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#047857'} onMouseOut={e => e.currentTarget.style.background = emerald}>
                    Start Practice Exam
                </button>
            </div>
        )}

        {/* 2. QUESTION VIEW */}
        {hasStarted && !showResults && currentQ && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: softBlueShadow }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: emerald, textTransform: 'uppercase' }}>{currentQ.topic}</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8' }}>Q {currentIndex + 1} / {questions.length}</span>
             </div>
             
             <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '999px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ width: `${((currentIndex) / questions.length) * 100}%`, height: '100%', background: emerald, transition: 'width 0.3s ease' }}></div>
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
               <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${emerald}` }}>
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
            <h2 style={{ fontSize: '72px', fontWeight: 900, color: (score/questions.length >= 0.60) ? emerald : '#f87171' }}>
                {Math.round((score/questions.length)*100)}%
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>
                You scored {score} out of {questions.length}. <br/>
                {score >= (questions.length * 0.60) ? "Passing Grade! (60% Required)" : "Studying required to hit the 60% mark."}
            </p>
            <button onClick={() => window.location.reload()} style={{ background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Try Another Run</button>
          </div>
        )}
      </main>
    </div>
  );
}