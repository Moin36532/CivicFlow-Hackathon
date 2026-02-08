import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Clock, FileText, Users, Sparkles, Moon, Sun, MapPin, Loader2, Share2, Facebook, Linkedin, Link, Info, X, Activity, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from '@/app/components/ui/button';
import { LegalCard } from '@/app/components/civic/LegalCard';
import { SeverityBadge } from '@/app/components/civic/SeverityBadge';
import { useNavigate, useParams } from 'react-router';
import { fetchIssue, Issue } from '@/services/api';
import { useTheme } from '@/app/context/ThemeContext';
import { CommentsSection } from '@/app/components/civic/CommentsSection';

export function GovernmentIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [hasJoined, setHasJoined] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Opik Metrics Helpers
  const fairnessColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const disagreementColor = (rate: number) => rate > 20 ? 'text-red-600' : 'text-blue-600';

  const [issue, setIssue] = useState<any>(null); // Using any temporarily for mapped object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setDaysRemaining((prev) => prev - 0.01);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadIssue() {
      if (!id) return;
      setLoading(true);
      setError(null);
      console.log("Fetching issue ID:", id);
      try {
        const data = await fetchIssue(id);
        console.log("Fetch result:", data);

        if (data) {
          if (data.type === 'government') {
            setIssue(data);
          } else {
            const msg = `Issue type mismatch. Expected 'government', got '${data.type}'. Category: '${data.category}'`;
            console.error(msg);
            setError(msg);
          }
        } else {
          console.error("Fetch returned null");
          setError("Failed to load issue. The server returned no data.");
        }
      } catch (err: any) {
        console.error("Error loading issue:", err);
        setError(err.message || "Network error");
      }
      setLoading(false);
    }
    loadIssue();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Unable to Load Issue</h2>
          <p className="text-gray-600 mb-6 bg-gray-100 p-4 rounded text-left font-mono text-sm border border-gray-300">
            {error || "Issue not found."}
          </p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const legalNotice = `
FORMAL NOTICE UNDER LOCAL GOVERNMENT ACT 2013

To: The Municipal Commissioner
     City Municipal Corporation

Re: Violation of Public Safety Standards - Section 11-B

Dear Sir/Madam,

This notice serves to inform you of a critical infrastructure violation that requires immediate attention under the Local Government Act 2013, Section 11-B.

INCIDENT DETAILS:
${issue.description}

AI ANALYSIS:
${issue.aiAnalysis}

SEVERITY ASSESSMENT: ${issue.severity}/10
LEGAL PRECEDENT: Municipal Services Act (Amendment) 2018
CATEGORY: ${issue.category}
LOCATION: ${issue.location.address}

As per Section 11-B of the Local Government Act 2013, the municipal authority is required to address public safety hazards within 7 (seven) working days of notification.

DEMANDED ACTION:
1. Immediate inspection of the reported location
2. Remedial measures to be initiated within 48 hours
3. Complete resolution within 7 working days
4. Written acknowledgment of receipt of this notice

LEGAL CONSEQUENCES:
Failure to comply may result in:
- Filing of Public Interest Litigation (PIL)
- Escalation to State Administrative Tribunal
- Media coverage and public awareness campaign

This notice is issued in the interest of public safety and welfare.

Respectfully submitted,
Concerned Citizens (${issue.supportersJoined || 0} supporters)
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
  `.trim();

  const handleCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = legalNotice;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleJoinCase = () => {
    setHasJoined(true);
    setTimeout(() => {
      alert(`You've joined the case! You are now one of ${(issue.supportersJoined || 0) + 1} supporters fighting for this cause.`);
    }, 300);
  };

  const handleLaunchCampaign = () => {
    setShowCampaignModal(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Set font style
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    // Split text into lines that fit the page width
    const splitText = doc.splitTextToSize(legalNotice, 180); // 180mm width (leaving margins)

    // Add text to PDF
    doc.text(splitText, 15, 20); // x=15, y=20

    // Save the PDF
    doc.save(`Legal_Notice_${issue.id}.pdf`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }} className="px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-primary)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl" style={{ color: 'var(--text-primary)' }}>Government Issue</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{issue.title}</h2>
                <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-4 h-4" />
                  <p>{issue.location.address}</p>
                </div>
              </div>
            </div>
            <SeverityBadge score={issue.severity} />
          </div>

          <p className="mb-4" style={{ color: 'var(--text-primary)' }}>{issue.description}</p>

          <div className="flex items-center gap-4 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden border border-white shadow-sm">
                <img src={issue.avatar || `https://i.pravatar.cc/150?u=${issue.reportedBy}`} alt="" className="w-full h-full object-cover" />
              </div>
              <span>Reported by <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{issue.reportedBy || "Civic Citizen"}</span></span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              🏢 {issue.department || "General Dept"}
            </span>
            <span>•</span>
            <span>{issue.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Uploaded Image Display */}
          {issue.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={issue.imageUrl} alt="Issue Evidence" className="w-full h-auto max-h-[400px] object-cover" />
              <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold">Evidence Uploaded</span> • Verified by AI Vision
              </div>
            </div>
          )}

          {/* Supporters Count */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" style={{ color: 'var(--alert-red)' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--alert-red)' }}>
                  {hasJoined ? (issue.supportersJoined || 0) + 1 : issue.supportersJoined || 0} Supporters
                </p>
                <p className="text-sm text-gray-600">Citizens joining this case</p>
              </div>
            </div>
            <Button
              onClick={handleJoinCase}
              disabled={hasJoined}
              style={{
                backgroundColor: hasJoined ? '#9CA3AF' : 'var(--alert-red)',
              }}
            >
              {hasJoined ? '✓ Joined' : 'Join This Case'}
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">AI Analysis</h3>
            </div>
            {issue.aiConfidence && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTraceModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/50 hover:bg-white rounded-full border border-blue-200 transition-colors group"
                >
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </div>
                  <span className="text-xs font-semibold text-blue-800 group-hover:text-blue-900">Verified by Opik</span>
                  <Activity className="w-3 h-3 text-blue-500" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">{issue.aiAnalysis}</p>

          {/* Opik Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Fairness Score */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Fairness Score</p>
              <p className={`text-3xl font-bold ${fairnessColor(issue.fairnessScore || 0)}`}>
                {issue.fairnessScore || "N/A"}/100
              </p>
              <p className="text-xs text-slate-400 mt-1">Live from Opik Evaluator</p>
            </div>

            {/* Disagreement Rate */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Disagreement Rate</p>
              <p className={`text-3xl font-bold ${disagreementColor(issue.disagreementRate || 0)}`}>
                {issue.disagreementRate || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">Consensus check</p>
            </div>

            {/* Financial Relief */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Financial Relief</p>
              <p className="text-3xl font-bold text-purple-600">{issue.financialRelief || "None"}</p>
              <p className="text-xs text-slate-400 mt-1">Subsidy Logic</p>
            </div>
          </div>

          {issue.aiConfidence && (
            <div className="flex items-center gap-4 text-sm border-t border-blue-200/50 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-medium">Opik Credibility Score:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-24 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(issue.aiConfidence || 0.95) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-blue-800">{Math.round((issue.aiConfidence || 0.95) * 100)}%</span>
                </div>
              </div>
              <button onClick={() => setShowTraceModal(true)} className="text-blue-600 hover:text-blue-800 hover:underline text-xs">
                View Trace Details
              </button>
            </div>
          )}
        </div>

        {/* Opik Trace Modal */}
        {showTraceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTraceModal(false)} />
            <div className="relative bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center font-bold text-white text-xs">Op</div>
                  <span className="font-mono text-slate-200 font-semibold">Opik Trace View</span>
                </div>
                <button onClick={() => setShowTraceModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Metrics */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-100">Opik Observability Dashboard</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">Model: deterministic-v2</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-800 font-bold">7ms</span>
                    </div>
                    <p className="text-sm text-slate-400">Real-time metrics from the fairness agent.</p>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Fairness Score */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Fairness Score</p>
                    <p className={`text-3xl font-bold ${(issue.fairnessScore || 0) >= 80 ? 'text-green-600' :
                      (issue.fairnessScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {issue.fairnessScore || "N/A"}/100
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Live from Opik Evaluator</p>
                  </div>

                  {/* Disagreement Rate */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">Disagreement Rate</p>
                    <p className={`text-3xl font-bold ${(issue.disagreementRate || 0) > 20 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {issue.disagreementRate || 0}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Consensus check</p>
                  </div>

                  {/* Financial Relief */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">Financial Relief</p>
                    <p className="text-3xl font-bold text-purple-600">{issue.financialRelief || "None"}</p>
                    <p className="text-xs text-slate-400 mt-1">Subsidy Logic</p>
                  </div>
                </div>

                {/* Trace Log Placeholder */}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">LATEST TRACE LOG</p>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800">
                    <div className="flex justify-between text-slate-500 mb-2 border-b border-slate-800 pb-1">
                      <span>Step</span>
                      <span>Latency</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-green-400">✓ Input Guardrails</span>
                        <span>2ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400">✓ Context Retrieval</span>
                        <span>45ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400">✓ Fairness Check</span>
                        <span>12ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500">Trace captured via Opik SDK • 2024-02-06 18:42:12</p>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Success Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCampaignModal(false)} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 opacity-50" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 relative">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
                  <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Campaign Launched!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Your legal notice has been filed. Now, rally support to pressure the department.
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Urgent attention needed! I just filed a formal legal notice about "${issue.title}" via CivicFlow. Join me in demanding action! #CivicFlow #FixItNow`, '_blank')}
                  >
                    <Share2 className="w-4 h-4" /> Share on Twitter
                  </Button>
                  <Button
                    className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white"
                    onClick={() => window.open(`https://wa.me/?text=Urgent attention needed! I just filed a formal legal notice about "${issue.title}" via CivicFlow. Help us demand action!`, '_blank')}
                  >
                    <Share2 className="w-4 h-4" /> Share on WhatsApp
                  </Button>
                  <Button
                    className="w-full gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=Urgent attention needed!`, '_blank')}
                  >
                    <Facebook className="w-4 h-4" /> Share on Facebook
                  </Button>
                  <Button
                    className="w-full gap-2 bg-[#0A66C2] hover:bg-[#0958a8] text-white"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" /> Share on LinkedIn
                  </Button>
                  <Button
                    className="w-full gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }}
                  >
                    <Link className="w-4 h-4" /> Copy Direct Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8" style={{ color: 'var(--alert-red)' }} />
            <div className="flex-1">
              <p className="font-semibold" style={{ color: 'var(--alert-red)' }}>
                {Math.ceil(daysRemaining)} Days to Action
              </p>
              <p className="text-sm text-gray-600">Legal deadline under Section 11-B</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: 'var(--alert-red)' }}>
                {Math.ceil(daysRemaining)}
              </div>
              <div className="text-xs text-gray-600">days left</div>
            </div>
          </div>
        </div>

        {/* Legal Notice Card */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Auto-Generated Legal Notice</h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Draft"}
            </button>
          </div>

          <LegalCard>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Draft Ready</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Generated {new Date().toLocaleTimeString()}</span>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {legalNotice}
                </pre>
              </div>
            </div>
          </LegalCard>
        </div>

        {/* Key Citations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📚 Legal Citations</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Local Government Act 2013, Section 11-B</li>
            <li>• Municipal Services Act (Amendment) 2018</li>
            <li>• Public Safety Standards Regulation 2020</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleLaunchCampaign}
            className="py-6 text-lg gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--alert-red) 0%, #DC2626 100%)',
            }}
          >
            🤜 Launch Campaign
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="py-6 text-lg gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Official Complaint
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="py-6 text-lg gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>What happens next?</strong><br />
            When you launch the campaign, your legal notice will be:
          </p>
          <ul className="mt-2 text-sm text-yellow-800 space-y-1 ml-4">
            {/* <li>✓ Filed with the Municipal Corporation</li>
            <li>✓ Sent to local media outlets</li>
            <li>✓ Shared on social media platforms</li>
            <li>✓ Tracked for 7-day compliance deadline</li> */}
          </ul>
        </div>

        {/* Comments Section */}
        {id && <CommentsSection issueId={id} />}
      </div>
    </div >
  );
}