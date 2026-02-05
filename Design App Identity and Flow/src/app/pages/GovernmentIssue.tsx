import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Clock, FileText, Users, Sparkles, Moon, Sun, MapPin, Loader2, Share2, Facebook, Linkedin, Link } from 'lucide-react';
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
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [hasJoined, setHasJoined] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }} className="px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-primary)' }}>
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">AI Analysis</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{issue.aiAnalysis}</p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>What happens next?</strong><br />
            When you launch the campaign, your legal notice will be:
          </p>
          <ul className="mt-2 text-sm text-yellow-800 space-y-1 ml-4">
            <li>✓ Filed with the Municipal Corporation</li>
            <li>✓ Sent to local media outlets</li>
            <li>✓ Shared on social media platforms</li>
            <li>✓ Tracked for 7-day compliance deadline</li>
          </ul>
        </div>

        {/* Comments Section */}
        {id && <CommentsSection issueId={id} />}
      </div>
    </div>
  );
}