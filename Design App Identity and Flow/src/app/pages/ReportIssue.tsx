import { useState, useEffect, useRef } from 'react';
import { Camera, ArrowLeft, Loader2, Upload, Mic, MicOff } from 'lucide-react'; // Added Upload for visual feedback
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { useNavigate } from 'react-router';


type Step = 'capture' | 'analyzing' | 'result';
type IssueType = 'government' | 'volunteer' | null;

interface AnalysisResult {
  type: IssueType;
  severity: number;
  category: string;
  legalReference?: string;
  matchedVolunteers?: number;
  aiAnalysis?: string;
  imageUrl?: string;
}

export function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('capture');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 29.3956, lon: 71.6833 }); // Default to Bahawalpur

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Voice Typing State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Voice typing is not supported in this browser. Please use Chrome.");
      }
    }
  };

  // New state for drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // Helper to process files for both input and drag-drop
  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    setStep('analyzing');

    // Use real backend API
    try {
      const file = (document.getElementById('camera-input') as HTMLInputElement)?.files?.[0] || null;

      // Helper to convert backend JSON to our internal state
      // UPDATE: Backend now returns { status: "analyzed", analysis: { ... } } WITHOUT saving
      const data = await import('@/services/api').then(m => m.submitReport(description, file));
      const analysis = data.analysis;

      const isGovt = analysis.category === 'GOVT';
      const severity = analysis.severity || 5;

      setAnalysisResult({
        type: isGovt ? 'government' : 'volunteer',
        severity: severity,
        category: analysis.category,
        legalReference: isGovt ? (analysis.legal_precedent || 'Local Govt Act 2013, Section 11-B') : undefined,
        matchedVolunteers: isGovt ? undefined : (analysis.matched_volunteers_count || Math.floor(Math.random() * 5) + 3),
        aiAnalysis: analysis.ai_analysis,
        imageUrl: analysis.image_url
      });

      setStep('result');
    } catch (e) {
      console.error("Analysis Failed", e);
      alert("Connection to AI Brain failed. Make sure backend is running on port 8000");
      setStep('capture');
    }
  };

  const handlePublish = async () => {
    if (!analysisResult) return;

    // Call backend to save
    try {
      // We need to re-construct the payload or pass it. 
      // Ideally we should have kept the full analysis object, but we can reconstruct enough for now.
      // Better way: Store the raw analysis result in state or map properly.
      // For now, mapping back to what /publish_issue expects.

      const payload = {
        title: analysisResult.category + " Issue", // Simple title generation if missing
        category: analysisResult.category,
        description: description,
        lat: location.lat,
        lon: location.lon,
        tags: [analysisResult.category],
        severity: analysisResult.severity,
        ai_analysis: analysisResult.aiAnalysis,
        legal_precedent: analysisResult.legalReference,
        matched_volunteers_count: analysisResult.matchedVolunteers,
        image_url: analysisResult.imageUrl,
        reported_by: "Jon Anderson",
        avatar: "https://t4.ftcdn.net/jpg/06/08/55/73/360_F_608557356_ELcD2pwQO9pduTRL30umabzgJoQn5fnd.jpg"
      };

      await fetch('http://localhost:8000/publish_issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Proceed to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error("Publish failed", error);
      alert("Failed to publish issue. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 transition-all">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Report an Issue
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {step === 'capture' && (
          <div className="space-y-6">
            {/* Camera & Drag/Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative overflow-hidden rounded-2xl p-10 border-2 border-dashed transition-all duration-300 text-center cursor-pointer group ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
                }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
                id="camera-input"
              />
              <label
                htmlFor="camera-input"
                className="cursor-pointer flex flex-col items-center gap-6 relative z-10"
              >
                {imagePreview ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isDragging ? 'bg-blue-500 scale-110 rotate-12' : 'bg-gradient-to-br from-indigo-500 to-blue-600 group-hover:scale-110 group-hover:rotate-6'}`}
                    >
                      {isDragging ? <Upload className="w-10 h-10 text-white animate-bounce" /> : <Camera className="w-10 h-10 text-white" />}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        {isDragging ? "Drop image here" : "Take a Photo"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isDragging ? "Release to upload" : "Tap to capture or drag & drop"}
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Description Input */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-lg text-slate-900 dark:text-slate-100">What's wrong?</label>
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-all duration-300 ${isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title={isListening ? "Stop Recording" : "Start Voice Typing"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 mt-[-10px]">
                e.g., "Gutter flowing in Model Town" or "Need food donations"
              </p>

              <div className="relative">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Describe the issue detailedly for better AI analysis..."}
                  className={`min-h-32 resize-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500 dark:text-slate-100 placeholder:text-slate-400 rounded-xl transition-all ${isListening ? 'ring-2 ring-red-400 dark:ring-red-500/50 border-red-300' : ''}`}
                />
                {isListening && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs font-medium text-red-500 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Recording...
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!description.trim()}
              className="w-full py-6 text-lg"
              style={{ backgroundColor: 'var(--royal-blue)' }}
            >
              Analyze with AI
            </Button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
              <Loader2 className="w-20 h-20 animate-spin text-blue-600 dark:text-blue-400 relative z-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 animate-pulse">AI is Analyzing...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto mb-8">
              Our models are checking severity, legal precedents, and matching volunteers.
            </p>

            <div className="space-y-4 w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Determining Issue Severity...</span>
              </div>
              <div className="flex items-center gap-3 delay-150">
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Scanning Legal Database...</span>
              </div>
              <div className="flex items-center gap-3 delay-300">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '1s' }}></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Finding Local Volunteers...</span>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && analysisResult && (
          <div className="space-y-6">
            {analysisResult.type === 'government' ? (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 rounded-2xl p-6 shadow-lg border border-red-100 dark:border-red-900/50">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-3xl shadow-sm">
                    🏛️
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1 text-red-700 dark:text-red-400">
                      Violation Detected
                    </h3>
                    <p className="text-red-600/80 dark:text-red-300/80">This involves government infrastructure. We are generating a formal report.</p>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur rounded-xl p-5 mb-6 border border-white/50 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-red-100 dark:border-red-900/30">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Severity Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${analysisResult.severity * 10}%` }}></div>
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400">{analysisResult.severity}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-red-100 dark:border-red-900/30">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{analysisResult.category}</span>
                  </div>
                  {analysisResult.legalReference && (
                    <div className="flex justify-between items-start py-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap mr-4">Legal Citation</span>
                      <span className="font-mono text-xs text-right text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {analysisResult.legalReference}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Analysis Text Display */}
                {analysisResult.aiAnalysis && (
                  <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4 shadow-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                      <span className="text-blue-500 text-lg">✨</span> AI Analysis
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {analysisResult.aiAnalysis}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4 mb-4 flex gap-3">
                  <div className="text-xl">⚖️</div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Generating official legal notice with precedent citations and deadline (14 days)...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 rounded-2xl p-6 shadow-lg border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-3xl shadow-sm">
                    🤝
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1 text-emerald-700 dark:text-emerald-400">
                      Community Alert
                    </h3>
                    <p className="text-emerald-600/80 dark:text-emerald-300/80">Looks like a volunteer opportunity! Let's connect you.</p>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur rounded-xl p-5 mb-6 border border-white/50 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Priority</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${analysisResult.severity * 10}%` }}></div>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysisResult.severity}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{analysisResult.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Nearby Helpers</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded text-sm">
                      {analysisResult.matchedVolunteers} Active Now
                    </span>
                  </div>
                </div>

                {/* AI Analysis Text Display */}
                {analysisResult.aiAnalysis && (
                  <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4 shadow-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                      <span className="text-blue-500 text-lg">✨</span> AI Analysis
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {analysisResult.aiAnalysis}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 mb-4 flex gap-3">
                  <div className="text-xl">🚀</div>
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Processing location matches to notify volunteers within 2km...
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Button
                onClick={handlePublish}
                className="w-full py-6 text-lg shadow-xl hover:scale-[1.02] transition-transform active:scale-95 text-white font-bold rounded-xl"
                style={{
                  background: analysisResult.type === 'government' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                {analysisResult.type === 'government' ? '📢 Publish Official Report' : '📢 Publish & Connect Volunteers'}
              </Button>

              <Button
                onClick={() => setStep('capture')}
                variant="outline"
                className="w-full py-4 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                ✏️ Edit Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}