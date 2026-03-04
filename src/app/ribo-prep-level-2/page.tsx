"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';

// --- THE REAL 50 QUESTION BANK (LEVEL 2 - UNRESTRICTED) ---
const ALL_LEVEL_2 = [
  // COMMERCIAL PROPERTY & BI (10)
  { topic: "Commercial Property", question: "In a Commercial Property policy, 'Stock' is typically defined as:", options: ["Finished goods only", "Raw materials, goods in process, and finished goods including packaging", "Only goods owned by the insured", "Building materials used for repairs"], answer: "Raw materials, goods in process, and finished goods including packaging", explanation: "Stock coverage is broad and includes all stages of the product plus the materials required to package and ship it." },
  { topic: "Commercial Property", question: "A 'Profits' form of Business Interruption insurance covers the period until:", options: ["The building is physically repaired", "The stock is replaced", "The business achieves the level of income it would have had if no loss occurred", "The policy expires"], answer: "The business achieves the level of income it would have had if no loss occurred", explanation: "Unlike the 'Gross Earnings' form, the 'Profits' form continues to pay until the business is fully back to its previous income level." },
  { topic: "Commercial Property", question: "The 'Co-Insurance' clause is designed to:", options: ["Punish the insured for making claims", "Encourage the insured to carry insurance to value", "Ensure the broker gets a higher commission", "Prevent the insured from buying excess insurance"], answer: "Encourage the insured to carry insurance to value", explanation: "Co-insurance penalizes partial losses if the insured does not maintain a limit of at least 80% or 90% of the property's replacement value." },
  { topic: "Commercial Property", question: "A 'Peak Season' endorsement is used for a business that:", options: ["Has high employee turnover", "Experiences seasonal fluctuations in inventory values", "Operates only in the winter", "Has a high risk of windstorm damage"], answer: "Experiences seasonal fluctuations in inventory values", explanation: "It automatically increases the stock limit during specific months (e.g., a toy store in December) without paying peak premiums all year." },
  { topic: "Commercial Property", question: "Equipment Breakdown (Boiler & Machinery) insurance covers:", options: ["Wear and tear", "Explosion of fired vessels and sudden mechanical breakdown", "Fire damage to the boiler", "Rust and corrosion"], answer: "Explosion of fired vessels and sudden mechanical breakdown", explanation: "Standard commercial property policies exclude explosion of boilers and mechanical breakdown, requiring a separate cover." },
  { topic: "Commercial Property", question: "What does 'By-laws' coverage provide?", options: ["Legal defense costs", "The additional cost to rebuild a structure to comply with current building codes after a loss", "Fines for zoning violations", "Coverage for city property"], answer: "The additional cost to rebuild a structure to comply with current building codes after a loss", explanation: "Without this, a policy only pays to rebuild the building exactly as it was, even if new codes require expensive upgrades like sprinklers." },
  { topic: "Commercial Property", question: "Extra Expense insurance is designed for businesses that:", options: ["Cannot afford to shut down and must continue operations at any cost", "Have a lot of physical stock", "Want to cover their employees' salaries", "Are permanently closing"], answer: "Cannot afford to shut down and must continue operations at any cost", explanation: "Extra Expense pays the premium costs (e.g., renting temporary space) to keep a business running, often used by banks or newspapers." },
  { topic: "Commercial Property", question: "A 'Bailee for Hire' is someone who:", options: ["Rents property to others", "Has temporary custody of the personal property of others for a purpose other than sale", "Transports goods across borders", "Leases commercial vehicles"], answer: "Has temporary custody of the personal property of others for a purpose other than sale", explanation: "Examples include dry cleaners or repair shops. They require Bailee's Customers insurance to protect clients' goods." },
  { topic: "Commercial Property", question: "Builder's Risk insurance typically ceases when:", options: ["The building is occupied or put to its intended use", "The foundation is poured", "The contractor gets paid", "The policy reaches its 1-year anniversary, regardless of status"], answer: "The building is occupied or put to its intended use", explanation: "Builder's Risk is strictly for the course of construction. Once occupied, it must be switched to a standard property policy." },
  { topic: "Commercial Property", question: "In transit insurance, 'FOB Destination' means:", options: ["The buyer assumes risk as soon as goods leave the seller", "The seller is responsible for the goods until they reach the buyer's location", "The transport company is solely liable", "The goods are uninsured"], answer: "The seller is responsible for the goods until they reach the buyer's location", explanation: "FOB (Free on Board) Destination means title and risk remain with the seller during transit." },

  // CGL & LIABILITY (10)
  { topic: "Commercial Liability", question: "The 'Completed Operations' coverage in a CGL policy triggers when injury or damage occurs:", options: ["While the work is in progress", "After the work has been finished and the insured has left the site", "Only if the insured is found criminally negligent", "When the contract is signed"], answer: "After the work has been finished and the insured has left the site", explanation: "Completed Operations is the liability equivalent of Product Liability for contractors and service providers." },
  { topic: "Commercial Liability", question: "Tenant's Legal Liability (TLL) covers:", options: ["Damage to the tenant's own property", "Damage caused by the tenant to the portion of the building they rent or occupy", "Injuries to the landlord", "Eviction costs"], answer: "Damage caused by the tenant to the portion of the building they rent or occupy", explanation: "Standard CGL excludes damage to property in the insured's 'care, custody, or control'. TLL buys back this coverage for rented premises." },
  { topic: "Commercial Liability", question: "A 'Claims-Made' liability policy triggers when:", options: ["The injury occurs", "The claim is first made against the insured during the policy period", "The product is manufactured", "The contract is signed"], answer: "The claim is first made against the insured during the policy period", explanation: "Unlike an 'Occurrence' policy, Claims-Made relies on when the claim is reported, not when the accident happened." },
  { topic: "Commercial Liability", question: "Personal and Advertising Injury under a CGL covers:", options: ["Bodily injury to a competitor", "Slander, libel, false arrest, and copyright infringement", "Intentional physical assault", "Damage to billboards"], answer: "Slander, libel, false arrest, and copyright infringement", explanation: "It covers non-physical injuries, largely related to reputational harm or advertising mistakes." },
  { topic: "Commercial Liability", question: "An Umbrella Liability policy differs from an Excess Liability policy because an Umbrella:", options: ["Only covers weather damage", "Provides narrower coverage than the underlying policy", "Can provide broader coverage than the primary policy, subject to a Self-Insured Retention (SIR)", "Does not require a primary policy"], answer: "Can provide broader coverage than the primary policy, subject to a Self-Insured Retention (SIR)", explanation: "Umbrellas can 'drop down' to cover claims the primary policy excludes, after the insured pays the SIR." },
  { topic: "Commercial Liability", question: "Medical Payments coverage under a CGL pays:", options: ["Only if the insured is legally liable", "Regardless of fault, to prevent lawsuits and build goodwill", "The insured's own medical bills", "For lost wages"], answer: "Regardless of fault, to prevent lawsuits and build goodwill", explanation: "It's a no-fault 'goodwill' coverage for minor injuries on the premises to deter formal litigation." },
  { topic: "Commercial Liability", question: "What is an 'Aggregate Limit' in a CGL?", options: ["The maximum amount payable per single occurrence", "The maximum total amount the insurer will pay for all claims during the policy term", "The deductible amount", "The total property value"], answer: "The maximum total amount the insurer will pay for all claims during the policy term", explanation: "Once the aggregate limit is exhausted by multiple claims, the policy provides no further coverage for the year." },
  { topic: "Commercial Liability", question: "Contractual Liability in a standard CGL covers:", options: ["Breach of contract for failing to deliver goods", "Liability assumed under specific types of 'incidental' contracts (like a lease agreement)", "All contracts signed by the insured", "Union disputes"], answer: "Liability assumed under specific types of 'incidental' contracts (like a lease agreement)", explanation: "Standard CGL excludes contractual liability, but gives back coverage for specific 'insured contracts' like leases or elevator maintenance agreements." },
  { topic: "Commercial Liability", question: "The standard CGL Pollution Exclusion:", options: ["Excludes all pollution events entirely", "Provides coverage for gradual seepage", "Typically covers sudden and accidental 'hostile fire' smoke, but excludes general pollution", "Only applies to chemical companies"], answer: "Typically covers sudden and accidental 'hostile fire' smoke, but excludes general pollution", explanation: "A standard CGL has an absolute pollution exclusion, with very minor exceptions like smoke from a hostile fire. Environmental Liability must be bought separately." },
  { topic: "Commercial Liability", question: "Employers Liability coverage is needed when:", options: ["Employees are covered by WSIB", "Employees are NOT covered by Workers Compensation and sue the employer for workplace injuries", "An employee steals from the company", "An employer wants to provide health benefits"], answer: "Employees are NOT covered by Workers Compensation and sue the employer for workplace injuries", explanation: "If employees opt-out or are exempt from WSIB/Workers Comp, Employers Liability protects the business if the employee sues for injury." },

  // COMMERCIAL AUTO (10)
  { topic: "Commercial Auto", question: "An OAP 4 (Garage Policy) is required for which type of business?", options: ["A delivery company with a fleet of 5 vans", "A car dealership or repair garage having custody of customers' vehicles", "A long-haul trucking firm", "A taxi service"], answer: "A car dealership or repair garage having custody of customers' vehicles", explanation: "OAP 4 is specifically designed for 'Garage Risks' where the business handles third-party vehicles." },
  { topic: "Commercial Auto", question: "Under a Garage Auto Policy (OAP 4), 'Legal Liability for Damage to Customers' Automobiles' is the equivalent of:", options: ["Third Party Liability", "Accident Benefits", "Bailee's coverage for autos in the insured's care, custody, or control", "Loss of Use"], answer: "Bailee's coverage for autos in the insured's care, custody, or control", explanation: "Standard property policies exclude vehicles. The OAP 4 provides the necessary coverage for a mechanic holding a client's car." },
  { topic: "Commercial Auto", question: "In Ontario, a Commercial Auto 'Fleet' is typically defined as having a minimum of:", options: ["2 vehicles", "5 or more vehicles under common ownership/management", "10 vehicles", "20 vehicles"], answer: "5 or more vehicles under common ownership/management", explanation: "5 vehicles is the standard threshold to rate vehicles as a fleet rather than individually." },
  { topic: "Commercial Auto", question: "What is the purpose of a Non-Owned Automobile policy (OAP 6)?", options: ["To cover vehicles the business leases long-term", "To protect the employer if an employee causes an accident while driving their personal car on company business", "To cover rental cars on vacation", "To cover stolen vehicles"], answer: "To protect the employer if an employee causes an accident while driving their personal car on company business", explanation: "If an employee goes to the bank for the company and hits a pedestrian, the company can be sued. OAP 6 protects the employer." },
  { topic: "Commercial Auto", question: "An OPCF 21B (Blanket Fleet Endorsement) does what?", options: ["Removes the need for driver abstracts", "Automatically provides coverage for newly acquired vehicles without notifying the insurer immediately", "Provides free rental cars", "Waives all deductibles"], answer: "Automatically provides coverage for newly acquired vehicles without notifying the insurer immediately", explanation: "It simplifies administration for large fleets, requiring only an annual reconciliation of vehicles." },
  { topic: "Commercial Auto", question: "Motor Truck Cargo insurance is purchased by:", options: ["The owner of the goods being shipped", "A trucking company (carrier) to cover their legal liability for damage to the goods they are transporting", "The manufacturer", "The government"], answer: "A trucking company (carrier) to cover their legal liability for damage to the goods they are transporting", explanation: "It protects the carrier against liability for loss to the client's freight." },
  { topic: "Commercial Auto", question: "For heavy commercial vehicles, what is a CVOR?", options: ["Commercial Vehicle Owners Record, which tracks safety and abstract data for operators", "A type of cargo insurance", "A specific heavy-duty transmission", "Commercial Value Override Rating"], answer: "Commercial Vehicle Owners Record, which tracks safety and abstract data for operators", explanation: "A clean CVOR is critical for heavy truck fleets to maintain favorable insurance rates." },
  { topic: "Commercial Auto", question: "An SEF 44 (or OPCF 44R) Family Protection Endorsement on a commercial fleet policy:", options: ["Is illegal", "Provides excess limits for employees driving company vehicles if injured by an underinsured third party", "Covers family members riding in the back of a cargo truck", "Waives collision deductibles"], answer: "Provides excess limits for employees driving company vehicles if injured by an underinsured third party", explanation: "Just like personal auto, it protects the driver if the at-fault party lacks sufficient liability limits." },
  { topic: "Commercial Auto", question: "A 'Radius of Operation' in commercial auto rating refers to:", options: ["The turning radius of the truck", "The maximum distance the vehicle typically travels from its home terminal", "The size of the tires", "The area a GPS covers"], answer: "The maximum distance the vehicle typically travels from its home terminal", explanation: "Local (0-80km), Regional, and Long-Haul (>800km) have drastically different risk profiles and premiums." },
  { topic: "Commercial Auto", question: "Which of the following is excluded under the collision section of a standard commercial auto policy?", options: ["Damage from a rollover", "Damage caused by shifting cargo that is not properly secured", "Hitting a pothole", "Colliding with a fence"], answer: "Damage caused by shifting cargo that is not properly secured", explanation: "Damage to the vehicle caused by the insured's own shifting cargo is typically excluded unless specific endorsements are added." },

  // SURETY, CRIME, D&O, E&O (10)
  { topic: "Specialty & Surety", question: "How does a Surety Bond differ from an Insurance Policy?", options: ["Bonds have deductibles", "Insurance is a 2-party contract; Surety is a 3-party contract where the surety expects no losses", "Bonds are paid monthly", "Insurance can be cancelled, bonds cannot"], answer: "Insurance is a 2-party contract; Surety is a 3-party contract where the surety expects no losses", explanation: "In surety, the Principal guarantees an obligation to the Obligee, backed by the Surety. The Surety will seek full reimbursement from the Principal if a loss occurs." },
  { topic: "Specialty & Surety", question: "What is the purpose of a Bid Bond?", options: ["To guarantee the project is finished on time", "To guarantee the bidder will enter into the contract at the bid price and provide final bonds if awarded the job", "To pay subcontractors", "To guarantee the quality of materials"], answer: "To guarantee the bidder will enter into the contract at the bid price and provide final bonds if awarded the job", explanation: "It prevents frivolous bidding and assures the owner the contractor is serious and qualified." },
  { topic: "Specialty & Surety", question: "A Labour and Material Payment Bond guarantees:", options: ["The owner will pay the contractor", "The contractor will pay their subcontractors and suppliers, preventing liens on the property", "The workers will not strike", "The materials will not be defective"], answer: "The contractor will pay their subcontractors and suppliers, preventing liens on the property", explanation: "It protects the project owner from having mechanics' liens placed on their property by unpaid subs." },
  { topic: "Specialty & Surety", question: "Directors and Officers (D&O) Liability protects corporate directors from:", options: ["Bodily injury claims on the premises", "Lawsuits alleging financial loss due to wrongful acts, errors, or mismanagement", "Employee theft", "Cyber attacks"], answer: "Lawsuits alleging financial loss due to wrongful acts, errors, or mismanagement", explanation: "D&O protects the personal assets of the board members from shareholders or regulators alleging poor governance." },
  { topic: "Specialty & Surety", question: "Errors & Omissions (E&O) insurance is also known as:", options: ["General Liability", "Professional Liability / Malpractice", "Fidelity Bonding", "Completed Operations"], answer: "Professional Liability / Malpractice", explanation: "E&O covers professionals (brokers, lawyers, architects) for financial harm caused by their advice or services." },
  { topic: "Specialty & Surety", question: "A Commercial Blanket Fidelity Bond covers:", options: ["Damage to the building", "Theft of money or property by the insured's own employees", "Theft by third-party burglars", "Cyber extortion"], answer: "Theft of money or property by the insured's own employees", explanation: "Fidelity bonds (Employee Dishonesty) protect the employer from their own staff stealing from them." },
  { topic: "Specialty & Surety", question: "Broad Form Money and Securities covers theft of money:", options: ["Only inside the premises", "Inside and outside the premises, including disappearance and destruction", "Only by employees", "Only during business hours"], answer: "Inside and outside the premises, including disappearance and destruction", explanation: "It is very broad, covering money lost in a fire, stolen from a safe, or robbed from a messenger on the way to the bank." },
  { topic: "Specialty & Surety", question: "First-Party Cyber Liability covers:", options: ["The insured being sued for leaking client data", "The insured's own costs for data recovery, ransomware payments, and business interruption", "Damage to physical servers", "Employee injury from a computer shock"], answer: "The insured's own costs for data recovery, ransomware payments, and business interruption", explanation: "First-party is the insured's own direct financial loss. Third-party covers lawsuits from others whose data was breached." },
  { topic: "Specialty & Surety", question: "A 3D Policy stands for:", options: ["Directors, Defense, and Deductibles", "Dishonesty, Disappearance, and Destruction", "Damage, Delay, and Depreciation", "Direct Damage and Deviation"], answer: "Dishonesty, Disappearance, and Destruction", explanation: "The 3D policy is a comprehensive crime package covering employee dishonesty and loss of money." },
  { topic: "Specialty & Surety", question: "In Surety, what is 'Indemnity'?", options: ["The premium paid", "The legal agreement where the Principal and their spouses pledge personal assets to reimburse the Surety for any losses", "The limit of the bond", "The project timeline"], answer: "The legal agreement where the Principal and their spouses pledge personal assets to reimburse the Surety for any losses", explanation: "Sureties require an Indemnity Agreement to ensure they can recover funds if they have to pay out a bond." },

  // BROKER MANAGEMENT & RIBO (10)
  { topic: "Broker Management", question: "Which of the following is a mandatory requirement for a brokerage to maintain its 'Unrestricted' management status?", options: ["The Principal Representative must have at least 10 years experience", "The brokerage must maintain a minimum equity position as defined by RIBO", "Every employee must be a Level 2 broker", "The brokerage must represent at least 5 insurers"], answer: "The brokerage must maintain a minimum equity position as defined by RIBO", explanation: "RIBO requires strict financial liquidity and equity positions for brokerages to ensure they can meet their trust obligations." },
  { topic: "Broker Management", question: "A brokerage's Trust Account is used exclusively to hold:", options: ["Brokerage profits", "Premiums collected from clients and return premiums owed to clients", "Payroll funds", "Marketing budgets"], answer: "Premiums collected from clients and return premiums owed to clients", explanation: "Commingling operating funds with trust funds is a severe violation of the RIB Act." },
  { topic: "Broker Management", question: "What is a 'Form 1' under RIBO regulations?", options: ["A new auto insurance application", "A financial Position Report detailing the brokerage's trust and equity position, filed regularly", "A client complaint form", "An E&O claim form"], answer: "A financial Position Report detailing the brokerage's trust and equity position, filed regularly", explanation: "The Form 1 proves to RIBO that the brokerage is solvent and trust accounts are fully funded." },
  { topic: "Broker Management", question: "If a brokerage has a trust deficit, the Principal Broker must notify RIBO:", options: ["Within 30 days", "On the next Form 1", "Immediately", "Only if it exceeds $10,000"], answer: "Immediately", explanation: "A trust deficit means client money is missing. RIBO must be notified immediately." },
  { topic: "Broker Management", question: "To act as the Principal Broker of an Ontario brokerage, the individual must hold which license?", options: ["Level 1 Acting", "Level 2 Unrestricted", "CIP Designation", "Life License"], answer: "Level 2 Unrestricted", explanation: "Only Unrestricted brokers can be the Principal Broker responsible for the financial and regulatory compliance of the firm." },
  { topic: "Broker Management", question: "RIBO requires all brokerages to carry their own E&O insurance. What is the minimum limit required?", options: ["$1 Million", "$3 Million", "$5 Million", "$10 Million"], answer: "$3 Million", explanation: "RIBO mandates a minimum of $3M per claim for a brokerage's own Errors and Omissions policy." },
  { topic: "Broker Management", question: "If an insurer owns a financial interest in a brokerage (e.g., 20% ownership), the brokerage must:", options: ["Only sell that insurer's products", "Disclose this ownership interest to clients in writing", "Pay higher RIBO fees", "Change its name to match the insurer"], answer: "Disclose this ownership interest to clients in writing", explanation: "Transparency rules require clients to know if an insurer has a financial stake or provides a significant loan to the brokerage." },
  { topic: "Broker Management", question: "What is 'Contingent Profit Commission' (CPC)?", options: ["A fee charged to the client", "A bonus paid by an insurer to a brokerage based on the overall profitability and volume of the book of business", "A penalty for cancelled policies", "A flat fee for marketing"], answer: "A bonus paid by an insurer to a brokerage based on the overall profitability and volume of the book of business", explanation: "Brokers must disclose the potential receipt of CPCs to clients, as it represents a potential conflict of interest." },
  { topic: "Broker Management", question: "Which of the following constitutes 'Commingling'?", options: ["Selling home and auto together", "Depositing a client's premium cheque directly into the brokerage's Operating Account", "Using multiple insurers on one commercial account", "Paying two producers a split commission"], answer: "Depositing a client's premium cheque directly into the brokerage's Operating Account", explanation: "Trust funds and operating funds must never mix." },
  { topic: "Broker Management", question: "Under RIBO, what is the 'Concentration of Market' rule?", options: ["A broker cannot operate in only one city", "If a brokerage places more than a certain percentage of its total volume with one insurer, it must disclose this to clients", "A broker cannot sell to family members", "A broker must have at least 10 markets"], answer: "If a brokerage places more than a certain percentage of its total volume with one insurer, it must disclose this to clients", explanation: "If a broker places >60% of their business with one market, they must disclose it, as they may lack true independence." }
];

function shuffle(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function RiboLevel2Page() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const shuffled = shuffle(ALL_LEVEL_2).map(q => ({
        ...q,
        options: shuffle(q.options)
    }));
    setQuestions(shuffled);
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
                <span style={{ fontSize: '11px', background: '#0f172a', color: 'white', padding: '6px 16px', borderRadius: '999px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Advanced Certification</span>
                <h1 style={{ fontSize: '42px', fontWeight: 900, marginTop: '20px', marginBottom: '16px' }}>RIBO Level 2 Prep</h1>
                <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '40px', lineHeight: '1.6' }}>
                    This practice exam focuses on <b>Unrestricted Management</b> concepts. <br/>
                    Expect complex Commercial Property, Liability, and Brokerage Financials.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '40px' }}>
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontWeight: 900, color: '#16a34a', marginBottom: '4px', fontSize: '20px' }}>{questions.length} Questions</div>
                        <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>This Practice Run</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 900, color: '#475569', marginBottom: '4px', fontSize: '20px' }}>90 Questions</div>
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
                {score >= (questions.length * 0.75) ? "Passing Grade! Ready for management." : "Studying required to hit the 75% mark."}
            </p>
            <button onClick={() => window.location.reload()} style={{ background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Try Another Run</button>
          </div>
        )}
      </main>
    </div>
  );
}