import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Trophy, 
  BarChart2, 
  Database, 
  Code, 
  PieChart, 
  ChevronRight, 
  ArrowLeft, 
  Star,
  Activity,
  Award,
  Lock,
  Sparkles,
  HelpCircle,
  Play,
  RefreshCw,
  ExternalLink,
  Volume2,
  Image as ImageIcon,
  Video,
  Loader2,
  MessageSquare,
  FileSpreadsheet,
  Send,
  Copy,
  Bug,
  Briefcase,
  FileText,
  ArrowRightLeft,
  Mail,
  ScrollText,
  ClipboardCheck
} from 'lucide-react';

// --- Gemini API Configuration ---
// NOTE FOR NETLIFY/LOCAL USE: 
// When running locally or on Netlify, you can change the line below to:
// const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const apiKey = "";

// --- Helper: PCM to WAV Converter for TTS ---
const pcmToWav = (base64PCM, sampleRate = 24000) => {
  const binaryString = window.atob(base64PCM);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const pcmData = new Int16Array(bytes.buffer);
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  return new Blob([view, pcmData], { type: 'audio/wav' });
};

// --- Data: 30-Day Curriculum with Real World Analogies ---
const curriculum = [
  // Phase 1: Excel & Foundations
  { id: 1, phase: "Foundations", title: "Intro to Data Analytics", type: "theory", icon: BarChart2, 
    content: "Understand the data ecosystem. Learn the difference between Data Analysts, Scientists, and Engineers. Explore the CRISP-DM methodology.", 
    analogy: "Think of Data Analytics like cooking. Data is the raw ingredients. The Analyst is the chef who prepares the meal. The Scientist creates new experimental recipes (algorithms). The Engineer builds the kitchen (infrastructure).",
    challenge: "Identify 3 questions you could answer with data in your daily life." },
  { id: 2, phase: "Foundations", title: "Spreadsheet Basics", type: "excel", icon: BarChart2, 
    content: "Mastering the interface. Understanding rows, columns, cells, and data types (String, Integer, Float, Boolean).", 
    analogy: "A spreadsheet is like a giant, digital filing cabinet where every drawer (cell) has a specific address (A1, B2) so you never lose anything.",
    challenge: "Create a budget spreadsheet with at least 5 categories and 3 months of data." },
  { id: 3, phase: "Foundations", title: "Data Cleaning in Excel", type: "excel", icon: BarChart2, 
    content: "Handling missing values, removing duplicates, and using Text-to-Columns. Learning functions: TRIM, PROPER, CLEAN.", 
    analogy: "Data cleaning is like doing laundry. You have to sort the colors (types), remove the stains (errors), and fold everything neatly (formatting) before you can wear it (analyze it).",
    challenge: "Download a messy dataset (e.g., Kaggle) and clean the name and address columns." },
  { id: 4, phase: "Foundations", title: "Pivot Tables Mastery", type: "excel", icon: BarChart2, 
    content: "The analyst's best friend. Grouping, summarizing, and filtering data dynamically.", 
    analogy: "A Pivot Table is like a magical kaleidoscope. You simply turn the dial (drag fields), and the same scattered pieces of glass (data) instantly form a beautiful, organized pattern.",
    challenge: "Create a Pivot Table showing total sales by Region and Product Category." },
  { id: 5, phase: "Foundations", title: "Basic Statistics", type: "theory", icon: Activity, 
    content: "Mean, Median, Mode, Standard Deviation. Understanding distributions and outliers.", 
    analogy: "Mean is the 'fair share' if everyone pooled their money. Median is the 'middle person' in a line. Mode is what's 'trending'. Standard Deviation is just how spread out the crowd is.",
    challenge: "Calculate the descriptive statistics for your budget spreadsheet." },
  
  // Phase 2: SQL
  { id: 6, phase: "SQL Databases", title: "Intro to SQL & SELECT", type: "sql", icon: Database, 
    content: "What is a Relational Database? Writing your first query: SELECT * FROM table.", 
    analogy: "SQL is like ordering food at a restaurant. You tell the waiter (database engine) exactly what you want ('SELECT burger'), where from ('FROM menu'), and any specific requests ('WHERE no pickles').",
    challenge: "Write a query to select specific columns from a mock employee table." },
  { id: 7, phase: "SQL Databases", title: "Filtering with WHERE", type: "sql", icon: Database, 
    content: "Filtering results using WHERE, AND, OR, NOT, and BETWEEN.", 
    analogy: "Using WHERE is like using filters on a shopping site. You don't want to see *all* shoes, you only want 'Black' AND 'Size 10' AND 'Under $100'.",
    challenge: "Filter a product list to show items costing > $50 and in stock." },
  { id: 8, phase: "SQL Databases", title: "Aggregations", type: "sql", icon: Database, 
    content: "Summarizing data: COUNT, SUM, AVG, MIN, MAX.", 
    analogy: "Aggregations are like the scoreboard at a game. You don't care about every single pass (row); you care about the total score (SUM) and remaining time (MIN).",
    challenge: "Find the average salary per department." },
  { id: 9, phase: "SQL Databases", title: "Grouping & Sorting", type: "sql", icon: Database, 
    content: "Using GROUP BY and ORDER BY. Understanding execution order.", 
    analogy: "GROUP BY is like sorting laundry into baskets (Whites, Darks, Colors) before you wash them. ORDER BY is simply arranging books on a shelf alphabetically.",
    challenge: "Rank customers by total spend." },
  { id: 10, phase: "SQL Databases", title: "Joins Explained", type: "sql", icon: Database, 
    content: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN. Connecting tables.", 
    analogy: "Joins are like introducing two groups of friends at a party. INNER JOIN is only the people who know *both* hosts. LEFT JOIN is everyone from your side, plus anyone they know from the other side.",
    challenge: "Join an Orders table with a Customers table to see who bought what." },
  { id: 11, phase: "SQL Databases", title: "Advanced Filtering", type: "sql", icon: Database, 
    content: "HAVING vs WHERE. Using LIKE for pattern matching and wildcards.", 
    analogy: "WHERE filters raw ingredients (throw out bad apples). HAVING filters the finished dish (serve only pies that weigh over 1kg).",
    challenge: "Find all customers whose names start with 'J' and spent over $100." },
  { id: 12, phase: "SQL Databases", title: "SQL Mini-Project", type: "project", icon: Trophy, 
    content: "Analyze a mock e-commerce database. Answer business questions using complex queries.", 
    analogy: "This is your first recital. You've practiced the scales (syntax), now play a song (solve business problems).",
    challenge: "Complete the 'Store Sales Analysis' case study." },

  // Phase 3: Python
  { id: 13, phase: "Python Programming", title: "Python Basics", type: "code", icon: Code, 
    content: "Variables, Data Types, Lists, and Dictionaries. Setting up Jupyter Notebooks.", 
    analogy: "Variables are like labeled boxes in a moving truck. You write 'Kitchen' (variable name) on the box so you know what's inside (value).",
    challenge: "Write a script that prints the first 10 Fibonacci numbers." },
  { id: 14, phase: "Python Programming", title: "Control Flow", type: "code", icon: Code, 
    content: "If/Else statements, For loops, and While loops. Functions.", 
    analogy: "Control flow is like traffic signs. IF red light, stop. ELSE, go. FOR every car in the lane, move forward one by one.",
    challenge: "Create a function that categorizes age groups (Child, Teen, Adult)." },
  { id: 15, phase: "Python Programming", title: "Intro to Pandas", type: "code", icon: Code, 
    content: "Series vs DataFrames. Loading CSV files. Inspecting data (.head(), .info(), .describe()).", 
    analogy: "Pandas is 'Excel on Steroids'. A DataFrame is just a spreadsheet that lives inside Python's brain, which you can control with code instead of a mouse.",
    challenge: "Load the Titanic dataset and display the first 5 rows." },
  { id: 16, phase: "Python Programming", title: "Data Manipulation", type: "code", icon: Code, 
    content: "Filtering, sorting, and adding columns in Pandas. Handling NaNs.", 
    analogy: "This is digital sculpting. You chisel away the rows you don't need and smooth out the rough edges (NaNs) to reveal the statue underneath.",
    challenge: "Filter Titanic survivors who were in 1st class." },
  { id: 17, phase: "Python Programming", title: "EDA with Python", type: "code", icon: Code, 
    content: "Exploratory Data Analysis. Grouping data in Pandas (groupby).", 
    analogy: "EDA is detective work. You are interviewing the data, asking it questions, and looking for clues (patterns) before you solve the case.",
    challenge: "Find the average fare price paid by survival status." },
  { id: 18, phase: "Python Programming", title: "Visualization (Matplotlib)", type: "code", icon: Code, 
    content: "Creating line charts, bar charts, and histograms with Matplotlib.", 
    analogy: "Matplotlib is your drafting table. It's precise and technical, allowing you to draw every single line and axis exactly how you want it.",
    challenge: "Plot the age distribution of passengers." },
  { id: 19, phase: "Python Programming", title: "Advanced Viz (Seaborn)", type: "code", icon: Code, 
    content: "Heatmaps, boxplots, and pairplots. Making charts beautiful.", 
    analogy: "Seaborn is like applying an Instagram filter. It takes the raw drawing from Matplotlib and instantly makes it look professional and aesthetic.",
    challenge: "Create a correlation heatmap of numerical features." },

  // Phase 4: Visualization & Storytelling
  { id: 20, phase: "Visual Storytelling", title: "Design Principles", type: "viz", icon: PieChart, 
    content: "Data-ink ratio, color theory, and clutter reduction. Choosing the right chart.", 
    analogy: "A dashboard is like a billboard. You have 3 seconds to get the message across. If there's too much text or clutter, people just drive past.",
    challenge: "Critique a 'bad' chart found online and redesign it on paper." },
  { id: 21, phase: "Visual Storytelling", title: "Dashboarding Basics", type: "viz", icon: PieChart, 
    content: "Intro to tools like PowerBI/Tableau. Layout design for KPIs.", 
    analogy: "Building a dashboard is like designing a car dashboard. Speed and Fuel (KPIs) go right in front. Climate control (details) goes to the side.",
    challenge: "Sketch a wireframe for a Sales Dashboard." },
  { id: 22, phase: "Visual Storytelling", title: "Interactive Viz", type: "viz", icon: PieChart, 
    content: "Adding filters, drill-downs, and tooltips effectively.", 
    analogy: "Interactivity is like a 'Choose Your Own Adventure' book. You let the user decide which path of the data they want to explore next.",
    challenge: "Define the user journey for your dashboard." },
  { id: 23, phase: "Visual Storytelling", title: "Storytelling with Data", type: "viz", icon: PieChart, 
    content: "The Narrative Arc. Context, Climax, and Conclusion in presentations.", 
    analogy: "Don't just show the data. Tell a ghost story. 'Once upon a time, sales were high (Context). Then, a monster appeared (Problem). Here is how we fought it (Analysis).'",
    challenge: "Write a 3-sentence narrative explaining a trend." },
  { id: 24, phase: "Visual Storytelling", title: "Data Ethics", type: "theory", icon: Activity, 
    content: "Bias in data, privacy concerns (GDPR), and ethical reporting.", 
    analogy: "Data Ethics is the 'Spider-Man Rule': With great power (big data) comes great responsibility. Just because you *can* track someone, doesn't mean you *should*.",
    challenge: "Find a case study where data bias caused a real-world problem." },
  
  // Phase 5: Capstone
  { id: 25, phase: "Capstone", title: "Project Planning", type: "project", icon: Trophy, 
    content: "Defining the problem statement. Finding a dataset (Kaggle, Govt data).", 
    analogy: "This is the blueprint phase. You wouldn't build a house without drawings; don't start coding without a plan.",
    challenge: "Select your Capstone topic and dataset." },
  { id: 26, phase: "Capstone", title: "Data Preparation", type: "project", icon: Trophy, 
    content: "Cleaning and merging your capstone data. Documenting steps.", 
    analogy: "Mise en place. Chop all your vegetables and measure your spices before you turn on the stove.",
    challenge: "Clean your dataset and export the 'Master' file." },
  { id: 27, phase: "Capstone", title: "Analysis Phase", type: "project", icon: Trophy, 
    content: "Performing deep EDA. finding insights and patterns.", 
    analogy: "Mining for gold. You have to sift through tons of dirt (data) to find the few shiny nuggets (insights) that are valuable.",
    challenge: "Discover 3 major insights from your data." },
  { id: 28, phase: "Capstone", title: "Building the Dashboard", type: "project", icon: Trophy, 
    content: "Creating the final visual output (PowerBI/Tableau/Python).", 
    analogy: "The Gallery Opening. Frame your work beautifully so the audience can appreciate the art without seeing the mess in the studio.",
    challenge: "Build your final dashboard." },
  { id: 29, phase: "Capstone", title: "Portfolio Building", type: "career", icon: Star, 
    content: "Hosting code on GitHub. Writing a README. Building a portfolio site.", 
    analogy: "Your portfolio is your trading card. It tells teams exactly what your stats are and why they should draft you.",
    challenge: "Upload your project to GitHub with a solid README." },
  { id: 30, phase: "Graduation", title: "Career & Next Steps", type: "career", icon: Award, 
    content: "Resume tips for data roles. Interview prep. Networking.", 
    analogy: "The Launchpad. You've built the rocket (skills), now you need to ignite the engines (applications) to reach the stars (job).",
    challenge: "Apply to one job or reach out to one recruiter." },
];

export default function DataAnalyticsApp() {
  const [completedDays, setCompletedDays] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, lesson
  const [showConfetti, setShowConfetti] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null); // For Text
  const [aiImage, setAiImage] = useState(null); // For Image
  const [aiAudio, setAiAudio] = useState(null); // For Audio Blob URL
  const [aiError, setAiError] = useState(null);
  const [activeAiMode, setActiveAiMode] = useState(null); // 'explain', 'quiz', 'audio', 'visual', 'ask', 'data', 'fix', 'verify', 'interview', 'cheatsheet', 'translate', 'resume', 'email'
  
  // Chat/Input State
  const [userQuery, setUserQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [specialInput, setSpecialInput] = useState(""); // For "Fix", "Translate", "Verify"

  // New State for Main Lesson Content Generation
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [isLessonLoading, setIsLessonLoading] = useState(false);

  // Load progress from local storage
  useEffect(() => {
    const savedProgress = localStorage.getItem('da_bootcamp_progress');
    if (savedProgress) {
      setCompletedDays(JSON.parse(savedProgress));
    }
  }, []);

  // Save progress
  const toggleComplete = (dayId) => {
    let newCompleted;
    if (completedDays.includes(dayId)) {
      newCompleted = completedDays.filter(id => id !== dayId);
    } else {
      newCompleted = [...completedDays, dayId];
      // Trigger mini celebration if completing a day
      if (view === 'lesson') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
    setCompletedDays(newCompleted);
    localStorage.setItem('da_bootcamp_progress', JSON.stringify(newCompleted));
  };

  const openLesson = (day) => {
    setCurrentDay(day);
    setView('lesson');
    
    // Reset AI state when opening new lesson
    setAiResponse(null);
    setAiImage(null);
    setAiAudio(null);
    setAiError(null);
    setActiveAiMode(null);
    setChatHistory([]); 
    setUserQuery("");
    setSpecialInput("");
    
    // Trigger Lesson Generation
    setGeneratedLesson(null);
    fetchLessonContent(day);
    
    window.scrollTo(0, 0);
  };

  const calculateProgress = () => {
    return Math.round((completedDays.length / 30) * 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // --- Helper for Resource Links ---
  const getResources = (day) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(day.title + " data analytics tutorial")}`;
    
    let practiceUrl = "https://www.google.com/search?q=data+analytics+practice";
    let practiceLabel = "Practice Exercise";
    let practiceDesc = "Search for exercises";

    if (day.type === 'excel') {
      practiceUrl = "https://sheets.new";
      practiceLabel = "Open New Spreadsheet";
      practiceDesc = "Google Sheets";
    } else if (day.type === 'sql') {
      practiceUrl = "https://sqliteonline.com/";
      practiceLabel = "SQL Playground";
      practiceDesc = "SQLite Online";
    } else if (day.type === 'code') {
      practiceUrl = "https://jupyter.org/try";
      practiceLabel = "Python Notebook";
      practiceDesc = "JupyterLab";
    } else if (day.type === 'viz') {
      practiceUrl = "https://public.tableau.com/app/discover";
      practiceLabel = "Visualization Gallery";
      practiceDesc = "Tableau Public";
    } else if (day.type === 'project' || day.type === 'career') {
        practiceUrl = "https://www.kaggle.com/datasets";
        practiceLabel = "Find Datasets";
        practiceDesc = "Kaggle";
    }

    return { searchUrl, practiceUrl, practiceLabel, practiceDesc };
  };

  // --- Fetch Main Lesson Content (Auto-generated) ---
  const fetchLessonContent = async (day) => {
    setIsLessonLoading(true);
    const prompt = `
      You are the lead instructor of a world-class Data Analytics Bootcamp. 
      Write the official lesson content for Day ${day.id}: "${day.title}".
      
      Context details: ${day.content}
      Core Analogy to use: ${day.analogy}
      
      Structure the lesson exactly as follows (keep tone concise, professional, yet beginner-friendly):
      1. **The Core Concept**: Explain the topic simply in 2-3 sentences.
      2. **Why It Matters**: Explain why a data analyst needs this skill in the real world.
      3. **Deep Dive**: A step-by-step explanation or detailed breakdown of the concept. (Approx 150 words).
      4. **Key Terminology**: Bullet points of 2-3 key terms related to this topic.
      
      Do not include the "Challenge" in this text, as it is displayed separately.
      Format using clear paragraphs and bullet points where appropriate.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!response.ok) throw new Error('Failed to generate lesson');
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setGeneratedLesson(text);
    } catch (err) {
      console.error(err);
      setGeneratedLesson("We couldn't generate the live lesson at this moment. Please rely on the overview and external resources below.");
    } finally {
      setIsLessonLoading(false);
    }
  };

  // --- Gemini API Handler (Interactive Tools) ---
  const callGemini = async (mode, customQuery = "") => {
    if (!currentDay) return;
    
    setAiLoading(true);
    setAiError(null);
    setActiveAiMode(mode);
    // Clear responses for specific text modes
    if (['explain', 'quiz', 'data', 'fix', 'verify', 'interview', 'cheatsheet', 'translate', 'resume', 'email'].includes(mode)) setAiResponse(null);
    if (mode === 'visual') setAiImage(null);
    if (mode === 'audio') setAiAudio(null);

    let prompt = "";
    
    try {
      if (mode === 'audio') {
        // Text-to-Speech
        const textToSay = `Welcome to Day ${currentDay.id}: ${currentDay.title}. Here is the core concept: ${currentDay.content}. Remember this analogy: ${currentDay.analogy}. Your challenge today is: ${currentDay.challenge}. Good luck!`;
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: textToSay }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
              }
            }),
          }
        );
        if (!response.ok) throw new Error('Failed to generate audio');
        const data = await response.json();
        const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
           const wavBlob = pcmToWav(base64Audio);
           const audioUrl = URL.createObjectURL(wavBlob);
           setAiAudio(audioUrl);
        }

      } else if (mode === 'visual') {
        // Image Generation
        const imagePrompt = `A simple, flat vector illustration explaining the concept of "${currentDay.title}" in data analytics. The analogy is: ${currentDay.analogy}. Minimalist style, blue and purple colors, educational infographic style.`;
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: imagePrompt }],
                    parameters: { sampleCount: 1 }
                })
            }
        );
        if (!response.ok) throw new Error('Failed to generate image');
        const data = await response.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) {
            setAiImage(`data:image/png;base64,${base64Image}`);
        }

      } else {
        // Text Generation Modes
        if (mode === 'explain') {
          prompt = `I am learning ${currentDay.title}. Please provide a real-world example different from "${currentDay.analogy}" to help me understand deeply. Keep it conversational and encouraging.`;
        } else if (mode === 'quiz') {
          prompt = `Create a mini-quiz with 3 multiple-choice questions about "${currentDay.title}". Format nicely. Put answers behind a spoiler warning at the end.`;
        } else if (mode === 'ask') {
          prompt = `I am a student learning about "${currentDay.title}". My question is: "${customQuery}". Please answer clearly and concisely.`;
          setChatHistory(prev => [...prev, { role: 'user', text: customQuery }]);
        } else if (mode === 'data') {
           prompt = `Generate a realistic dummy dataset related to "${currentDay.title}" (or general business data) with 10 rows. Format it as a CSV block (using comma separators) that I can copy and paste into Excel or a Database. Include a header row. Make the data slightly "messy" if the topic is data cleaning.`;
        } else if (mode === 'fix') {
           prompt = `I am trying to learn "${currentDay.title}". I have this code/formula that isn't working:\n\n${customQuery}\n\nPlease identify the error, fix the code, and explain the fix simply.`;
        } else if (mode === 'verify') {
           prompt = `I am a student completing the challenge: "${currentDay.challenge}".\n\nHere is my solution/answer:\n${customQuery}\n\nPlease review my work. Is it correct? Is it efficient? Explain any mistakes politely and show me the "Gold Standard" answer.`;
        } else if (mode === 'translate') {
           prompt = `I am a Data Analyst student. I know how to do "${customQuery}" in one tool (like Excel), but I want to know how to do it in another (like Python or SQL). Please translate the concept and provide a code snippet/example.`;
        } else if (mode === 'cheatsheet') {
           prompt = `Create a concise "Cheat Sheet" for "${currentDay.title}". Focus on syntax, key commands, shortcuts, and best practices. Format it as a neat Markdown table.`;
        } else if (mode === 'interview') {
           prompt = `Act as a hiring manager. Generate one challenging interview question specifically about "${currentDay.title}". Then, provide a "Model Answer" that I can learn from. Use a professional but helpful tone.`;
        } else if (mode === 'resume') {
            prompt = `Write 3 strong, quantifiable resume bullet points that a Data Analyst could use to demonstrate their skill in '${currentDay.title}'. Focus on business impact (e.g., "Improved efficiency by 20%").`;
        } else if (mode === 'email') {
            prompt = `Draft a short, professional email to a non-technical manager explaining the value of '${currentDay.title}' and how it helps the business make better decisions. Keep it jargon-free and persuasive.`;
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        if (!response.ok) throw new Error('Failed to fetch text');
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          if (mode === 'ask') {
            setChatHistory(prev => [...prev, { role: 'ai', text: text }]);
            setUserQuery(""); 
          } else {
            setAiResponse(text);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAiError("Thinking... (or failing to connect). Try again!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    callGemini('ask', userQuery);
  };

  // Group days by phase for cleaner dashboard
  const phases = [
    { name: "Foundations", days: curriculum.filter(d => d.phase === "Foundations"), color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "SQL Databases", days: curriculum.filter(d => d.phase === "SQL Databases"), color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { name: "Python Programming", days: curriculum.filter(d => d.phase === "Python Programming"), color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { name: "Visual Storytelling", days: curriculum.filter(d => d.phase === "Visual Storytelling"), color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "Capstone & Career", days: curriculum.filter(d => d.phase === "Capstone" || d.phase === "Graduation"), color: "bg-purple-100 text-purple-800 border-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Zero to Analyst <span className="text-blue-400">30 Days</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase font-semibold">Progress</span>
              <span className="text-sm font-bold text-white">{calculateProgress()}% Complete</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * calculateProgress()) / 100} />
              </svg>
              <span className="absolute text-xs font-bold">{completedDays.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {view === 'dashboard' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{completedDays.length}</h3>
                <p className="text-slate-500 text-sm">Days Completed</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold">{30 - completedDays.length}</h3>
                <p className="text-slate-500 text-sm">Days Remaining</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-1">Keep it up!</h3>
                <p className="text-indigo-100 text-sm opacity-90">Consistency is key in data analytics. Do a little bit every day.</p>
              </div>
            </div>

            {/* Curriculum Grid */}
            {phases.map((phase, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${phase.color}`}>
                    {phase.name}
                  </span>
                  <div className="h-px bg-slate-200 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phase.days.map((day) => {
                    const isCompleted = completedDays.includes(day.id);
                    const isLocked = day.id > 1 && !completedDays.includes(day.id - 1) && !isCompleted;
                    
                    return (
                      <button
                        key={day.id}
                        onClick={() => openLesson(day)}
                        className={`
                          relative group flex flex-col p-5 rounded-xl border transition-all duration-200 text-left
                          ${isCompleted 
                            ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300' 
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-3 w-full">
                          <span className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                            ${isCompleted ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                          `}>
                            {day.id}
                          </span>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        
                        <h4 className={`font-semibold mb-1 ${isCompleted ? 'text-slate-700' : 'text-slate-900'}`}>
                          {day.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{day.content}</p>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-slate-400 group-hover:text-blue-600">
                          Start Lesson <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Lesson View
          <div className="animate-in slide-in-from-right-4 duration-300 pb-12">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            {currentDay && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Lesson Header */}
                  <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-wider text-xs mb-2">
                        <span>Day {currentDay.id}</span>
                        <span>•</span>
                        <span>{currentDay.phase}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentDay.title}</h2>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                          <currentDay.icon className="w-4 h-4" />
                          <span>{currentDay.type === 'theory' ? 'Concept' : currentDay.type === 'excel' ? 'Spreadsheets' : currentDay.type === 'sql' ? 'Database Querying' : currentDay.type === 'code' ? 'Python Coding' : 'Project'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                          <Activity className="w-4 h-4" />
                          <span>~45 Minutes</span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative BG */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                  </div>

                  {/* Lesson Content */}
                  <div className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Lesson Content</h3>
                      
                      {/* --- Auto-Generated Lesson Area --- */}
                      <div className="min-h-[200px]">
                        {isLessonLoading ? (
                          <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="flex items-center gap-2 text-blue-500 text-sm mt-4">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating your custom lesson plan...
                            </div>
                          </div>
                        ) : generatedLesson ? (
                           <div className="whitespace-pre-line leading-relaxed text-slate-700 text-lg">
                             {generatedLesson}
                           </div>
                        ) : (
                          <div className="text-slate-500 italic">
                            {currentDay.content}
                          </div>
                        )}
                      </div>

                      {/* Real World Analogy Section */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 text-amber-100 opacity-50">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2 relative z-10">
                            <Sparkles className="w-5 h-5" />
                            Remember this Analogy
                        </h4>
                        <p className="text-amber-800 italic relative z-10 text-lg font-medium">
                            "{currentDay.analogy}"
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                          <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-800">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            Overview
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">{currentDay.content}</p>
                          <ul className="space-y-2 text-sm text-slate-600 mt-4">
                            <li className="flex gap-2">
                              <span className="text-blue-500">•</span>
                              Core concepts and syntax
                            </li>
                            <li className="flex gap-2">
                              <span className="text-blue-500">•</span>
                              Best practices in the industry
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                          <h4 className="font-bold flex items-center gap-2 mb-3 text-indigo-900">
                            <Trophy className="w-5 h-5 text-indigo-600" />
                            Daily Challenge
                          </h4>
                          <p className="text-sm text-indigo-800 mb-4">
                            {currentDay.challenge}
                          </p>
                          <div className="text-xs text-indigo-600 font-medium bg-white/50 inline-block px-2 py-1 rounded">
                            Estimated time: 20 mins
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-8">
                        <h3 className="text-lg font-bold mb-4">External Resources</h3>
                        <div className="flex flex-col gap-3">
                           {/* Dynamic Resources based on day type */}
                           {(() => {
                             const resources = getResources(currentDay);
                             return (
                               <>
                                 <a 
                                   href={resources.searchUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group no-underline"
                                 >
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
                                       <BookOpen className="w-4 h-4" />
                                     </div>
                                     <div>
                                       <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Read: Web Tutorials</div>
                                       <div className="text-xs text-slate-500">Google Search</div>
                                     </div>
                                   </div>
                                   <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                 </a>

                                 <a 
                                   href={resources.practiceUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group no-underline"
                                 >
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                       <Code className="w-4 h-4" />
                                     </div>
                                     <div>
                                       <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{resources.practiceLabel}</div>
                                       <div className="text-xs text-slate-500">{resources.practiceDesc}</div>
                                     </div>
                                   </div>
                                   <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                 </a>
                               </>
                             );
                           })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* --- AI Tutor Section --- */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-t border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-slate-900">AI Learning Companion</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-6">
                      Boost your learning with interactive AI tools. Generate visuals, listen to summaries, or test yourself.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <button 
                        onClick={() => callGemini('explain')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {aiLoading && activeAiMode === 'explain' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                        Simplify
                      </button>
                      
                      <button 
                        onClick={() => callGemini('quiz')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'quiz' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Quiz Me
                      </button>

                      <button 
                        onClick={() => callGemini('cheatsheet')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-cyan-200 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'cheatsheet' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Cheat Sheet
                      </button>

                      <button 
                        onClick={() => callGemini('audio')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'audio' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        Audio Summary
                      </button>

                      <button 
                        onClick={() => callGemini('visual')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 text-pink-700 rounded-lg hover:bg-pink-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'visual' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        Generate Visual
                      </button>

                       {(currentDay.type === 'excel' || currentDay.type === 'sql' || currentDay.type === 'code' || currentDay.type === 'project') && (
                        <button 
                          onClick={() => callGemini('data')}
                          disabled={aiLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                           {aiLoading && activeAiMode === 'data' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                          Mock Data
                        </button>
                      )}

                       {(currentDay.type === 'excel' || currentDay.type === 'sql' || currentDay.type === 'code') && (
                        <button 
                          onClick={() => setActiveAiMode(activeAiMode === 'fix' ? null : 'fix')}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm
                             ${activeAiMode === 'fix' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-red-200 text-red-700 hover:bg-red-50'}
                          `}
                        >
                           <Bug className="w-4 h-4" />
                          Fix My Code
                        </button>
                      )}

                      <button 
                          onClick={() => setActiveAiMode(activeAiMode === 'translate' ? null : 'translate')}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm
                             ${activeAiMode === 'translate' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}
                          `}
                        >
                           <ArrowRightLeft className="w-4 h-4" />
                          Translator
                      </button>

                      <button 
                          onClick={() => setActiveAiMode(activeAiMode === 'verify' ? null : 'verify')}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm
                             ${activeAiMode === 'verify' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-teal-200 text-teal-700 hover:bg-teal-50'}
                          `}
                        >
                           <ClipboardCheck className="w-4 h-4" />
                          Check My Work
                      </button>

                      <button 
                        onClick={() => callGemini('resume')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'resume' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScrollText className="w-4 h-4" />}
                        Resume Booster
                      </button>

                      <button 
                        onClick={() => callGemini('email')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'email' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Draft Email
                      </button>

                      <button 
                        onClick={() => callGemini('interview')}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
                      >
                         {aiLoading && activeAiMode === 'interview' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                        Interview Prep
                      </button>
                    </div>

                    {/* Chat Input Area (Standard Chat) */}
                    {activeAiMode !== 'fix' && activeAiMode !== 'translate' && activeAiMode !== 'verify' && (
                        <div className="mb-6">
                        <form onSubmit={handleChatSubmit} className="relative">
                            <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            placeholder="Ask a specific question (e.g., 'What is the syntax for GROUP BY?')"
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            disabled={aiLoading}
                            />
                            <button 
                            type="submit"
                            disabled={!userQuery.trim() || aiLoading}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            {aiLoading && activeAiMode === 'ask' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                        </div>
                    )}

                    {/* Specialized Input Area (Fix, Translate, Verify) */}
                    {(activeAiMode === 'fix' || activeAiMode === 'translate' || activeAiMode === 'verify') && (
                        <div className={`mb-6 p-4 rounded-xl border animate-in slide-in-from-top-2 
                            ${activeAiMode === 'fix' ? 'bg-red-50 border-red-100' : 
                              activeAiMode === 'translate' ? 'bg-indigo-50 border-indigo-100' : 
                              'bg-teal-50 border-teal-100'
                            }`}>
                            <h4 className={`font-bold mb-2 flex items-center gap-2 
                                ${activeAiMode === 'fix' ? 'text-red-800' : 
                                  activeAiMode === 'translate' ? 'text-indigo-800' : 
                                  'text-teal-800'
                                }`}>
                                {activeAiMode === 'fix' ? <Bug className="w-4 h-4" /> : activeAiMode === 'translate' ? <ArrowRightLeft className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
                                {activeAiMode === 'fix' ? 'Paste broken code/formula:' : activeAiMode === 'translate' ? 'What do you want to translate?' : 'Paste your solution here:'}
                            </h4>
                            <textarea
                                value={specialInput}
                                onChange={(e) => setSpecialInput(e.target.value)}
                                placeholder={
                                    activeAiMode === 'fix' ? "e.g., =VLOOKUP(A2, 'Data'!A:B, 5, FALSE)" : 
                                    activeAiMode === 'translate' ? "e.g., 'How do I do VLOOKUP in Python?'" :
                                    "Paste your SQL query, Python code, or describe your steps..."
                                }
                                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 min-h-[100px] font-mono text-sm
                                  ${activeAiMode === 'fix' ? 'border-red-200 focus:ring-red-500' : 
                                    activeAiMode === 'translate' ? 'border-indigo-200 focus:ring-indigo-500' :
                                    'border-teal-200 focus:ring-teal-500'
                                  }
                                `}
                            />
                            <button 
                                onClick={() => callGemini(activeAiMode, specialInput)}
                                disabled={!specialInput.trim() || aiLoading}
                                className={`mt-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2
                                  ${activeAiMode === 'fix' ? 'bg-red-600 hover:bg-red-700' : 
                                    activeAiMode === 'translate' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                    'bg-teal-600 hover:bg-teal-700'
                                  }
                                `}
                            >
                                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
                                    (activeAiMode === 'fix' ? "Debug with AI" : activeAiMode === 'translate' ? "Translate Concept" : "Grade My Work")
                                }
                            </button>
                        </div>
                    )}

                    {/* AI Chat History & Responses */}
                    <div className="space-y-4">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white border border-slate-200 shadow-sm rounded-bl-none'}`}>
                            {msg.role === 'ai' && <div className="text-xs font-bold uppercase text-purple-600 mb-1">AI Tutor</div>}
                            <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-slate-100' : 'text-slate-700'}`}>{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Response Area (One-off tools) */}
                    {aiError && (
                      <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        {aiError}
                      </div>
                    )}
                    
                    {/* Text Response (Explain/Quiz/Data/Fix/Interview/CheatSheet/Translate/Resume/Email/Verify) */}
                    {aiResponse && (
                      <div className="mt-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 relative group">
                         <div className="text-xs font-bold uppercase text-slate-400 mb-2">
                           {activeAiMode === 'explain' ? 'Simplifed Explanation' : activeAiMode === 'quiz' ? 'Knowledge Check' : activeAiMode === 'fix' ? 'Code Fix' : activeAiMode === 'verify' ? 'Solution Feedback' : activeAiMode === 'interview' ? 'Interview Prep' : activeAiMode === 'cheatsheet' ? 'Quick Reference' : activeAiMode === 'translate' ? 'Concept Translation' : activeAiMode === 'resume' ? 'Resume Bullet Points' : activeAiMode === 'email' ? 'Stakeholder Email Draft' : 'Generated Data'}
                         </div>
                         {activeAiMode === 'data' ? (
                            <div className="relative">
                              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                {aiResponse}
                              </pre>
                              <button 
                                onClick={() => copyToClipboard(aiResponse)}
                                className="absolute top-2 right-2 p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                                title="Copy to Clipboard"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                         ) : (
                           <div className="prose prose-sm prose-slate max-w-none">
                             <div className="whitespace-pre-line leading-relaxed text-slate-700">
                               {aiResponse}
                             </div>
                           </div>
                         )}
                      </div>
                    )}

                    {/* Audio Response */}
                    {aiAudio && (
                       <div className="mt-4 bg-white p-6 rounded-xl border border-green-200 shadow-sm animate-in slide-in-from-bottom-2 flex flex-col items-center">
                          <div className="text-xs font-bold uppercase text-green-600 mb-3 w-full text-left">
                           Audio Lesson
                          </div>
                          <div className="w-full bg-green-50 rounded-full p-2 flex items-center justify-center">
                             <audio controls autoPlay src={aiAudio} className="w-full h-10" />
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Generated by Gemini TTS</p>
                       </div>
                    )}

                    {/* Image Response */}
                    {aiImage && (
                       <div className="mt-4 bg-white p-6 rounded-xl border border-pink-200 shadow-sm animate-in slide-in-from-bottom-2">
                          <div className="text-xs font-bold uppercase text-pink-600 mb-3">
                           AI Concept Art
                          </div>
                          <div className="rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                            <img src={aiImage} alt="AI Generated Concept" className="w-full h-auto object-cover" />
                          </div>
                       </div>
                    )}

                  </div>

                  {/* Footer / Action */}
                  <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                      Done with the reading and challenge?
                    </div>
                    <button
                      onClick={() => toggleComplete(currentDay.id)}
                      className={`
                        px-8 py-3 rounded-xl font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-2
                        ${completedDays.includes(currentDay.id)
                          ? 'bg-green-500 text-white hover:bg-green-600 ring-4 ring-green-100'
                          : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg'
                        }
                      `}
                    >
                      {completedDays.includes(currentDay.id) ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Completed!
                        </>
                      ) : (
                        <>
                          Mark as Complete
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Celebration Confetti Overlay (Simple CSS implementation) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="animate-bounce text-6xl">🎉</div>
          </div>
        </div>
      )}
    </div>
  );
}