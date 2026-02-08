import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, CheckCircle2, Sparkles, Moon, Sun, Loader2, Activity, X, Heart } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useNavigate, useParams } from 'react-router';
import { fetchIssue, Issue } from '@/services/api';
import { useTheme } from '@/app/context/ThemeContext';
import { CommentsSection } from '@/app/components/civic/CommentsSection';

export function VolunteerIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hasVolunteered, setHasVolunteered] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTraceModal, setShowTraceModal] = useState(false);

  // Opik Metrics Helpers
  const fairnessColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const disagreementColor = (rate: number) => rate > 20 ? 'text-red-600' : 'text-blue-600';

  useEffect(() => {
    async function loadIssue() {
      if (!id) return;
      setLoading(true);
      const data = await fetchIssue(id);
      if (data && data.type === 'volunteer') {
        setIssue(data);
      }
      setLoading(false);
    }
    loadIssue();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Task Not Found</h2>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleVolunteer = () => {
    setHasVolunteered(true);
    setTimeout(() => {
      alert(`Thank you for volunteering! You are now one of ${(issue.volunteersJoined || 0) + 1} volunteers helping with this task. The task organizer will contact you soon with details.`);
    }, 300);
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
            <h1 className="text-2xl" style={{ color: 'var(--text-primary)' }}>Volunteer Opportunity</h1>
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
        {/* Main Card */}
        <div className="rounded-lg p-6 shadow-sm border-l-4" style={{ backgroundColor: 'var(--bg-primary)', borderLeftColor: 'var(--emerald-green)' }}>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🤝</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{issue.title}</h2>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                <MapPin className="w-4 h-4" />
                <span>{issue.location.address}</span>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Organized by <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{issue.reportedBy}</span></span>
                <span>•</span>
                <span>{issue.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <span
              className="px-3 py-1.5 rounded-full font-medium text-sm"
              style={{
                backgroundColor: 'var(--green-100)',
                color: 'var(--green-800)',
              }}
            >
              {issue.category}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{issue.description}</p>

          {/* Uploaded Image Display */}
          {issue.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={issue.imageUrl} alt="Issue Evidence" className="w-full h-auto max-h-[400px] object-cover" />
              <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold">Evidence Uploaded</span> • Verified by AI Vision
              </div>
            </div>
          )}

          {/* Volunteer Progress */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" style={{ color: 'var(--emerald-green)' }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--emerald-green)' }}>
                    {hasVolunteered ? (issue.volunteersJoined || 0) + 1 : issue.volunteersJoined || 0} / {issue.volunteersNeeded || 0} Volunteers
                  </p>
                  <p className="text-sm text-gray-600">
                    {(issue.volunteersNeeded || 0) - (hasVolunteered ? (issue.volunteersJoined || 0) + 1 : issue.volunteersJoined || 0)} more volunteers needed
                  </p>
                </div>
              </div>
              <Button
                onClick={handleVolunteer}
                disabled={hasVolunteered}
                style={{
                  backgroundColor: hasVolunteered ? '#9CA3AF' : 'var(--emerald-green)',
                }}
              >
                {hasVolunteered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Volunteered
                  </>
                ) : (
                  'I Want to Volunteer'
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(((hasVolunteered ? (issue.volunteersJoined || 0) + 1 : issue.volunteersJoined || 0) / (issue.volunteersNeeded || 1)) * 100, 100)}%`,
                  backgroundColor: 'var(--emerald-green)',
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">AI Analysis & Fairness Metrics</h3>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{issue.aiAnalysis}</p>

          {/* Opik Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fairness Score */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-green-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Fairness Score</p>
              <p className={`text-3xl font-bold ${fairnessColor(issue.fairnessScore || 0)}`}>
                {issue.fairnessScore || "N/A"}/100
              </p>
              <p className="text-xs text-slate-400 mt-1">Live from Opik Evaluator</p>
            </div>

            {/* Disagreement Rate */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-green-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Disagreement Rate</p>
              <p className={`text-3xl font-bold ${disagreementColor(issue.disagreementRate || 0)}`}>
                {issue.disagreementRate || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">Consensus check</p>
            </div>

            {/* Financial Relief */}
            <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-green-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Financial Relief</p>
              <p className="text-3xl font-bold text-purple-600">{issue.financialRelief || "None"}</p>
              <p className="text-xs text-slate-400 mt-1">Subsidy Logic</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 hover:text-green-800 hover:bg-green-100 gap-1"
              onClick={() => setShowTraceModal(true)}
            >
              <Activity className="w-4 h-4" />
              View Opik Trace
            </Button>
          </div>
        </div>

        {/* What You'll Do */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">What You'll Be Doing</h3>
          <div className="space-y-3">
            {issue.category === 'Food' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    1
                  </div>
                  <div>
                    <p className="font-medium">Collect Donations</p>
                    <p className="text-sm text-gray-600">Help collect non-perishable food items from the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    2
                  </div>
                  <div>
                    <p className="font-medium">Sort and Pack</p>
                    <p className="text-sm text-gray-600">Organize donated items into care packages</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    3
                  </div>
                  <div>
                    <p className="font-medium">Distribute</p>
                    <p className="text-sm text-gray-600">Help distribute packages to families in need</p>
                  </div>
                </div>
              </>
            )}
            {issue.category === 'Medical' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    1
                  </div>
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-sm text-gray-600">Complete health screening and registration process</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    2
                  </div>
                  <div>
                    <p className="font-medium">Blood Donation</p>
                    <p className="text-sm text-gray-600">Donate blood under medical supervision (15-20 minutes)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    3
                  </div>
                  <div>
                    <p className="font-medium">Rest & Refreshment</p>
                    <p className="text-sm text-gray-600">Relax with provided snacks and beverages</p>
                  </div>
                </div>
              </>
            )}
            {issue.category === 'Social' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    1
                  </div>
                  <div>
                    <p className="font-medium">Weekly Visits</p>
                    <p className="text-sm text-gray-600">Spend quality time with senior citizens (2-3 hours/week)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    2
                  </div>
                  <div>
                    <p className="font-medium">Companionship</p>
                    <p className="text-sm text-gray-600">Engage in conversations, games, or activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    3
                  </div>
                  <div>
                    <p className="font-medium">Light Assistance</p>
                    <p className="text-sm text-gray-600">Help with grocery shopping or minor household tasks</p>
                  </div>
                </div>
              </>
            )}
            {issue.category === 'Environment' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    1
                  </div>
                  <div>
                    <p className="font-medium">Training Session</p>
                    <p className="text-sm text-gray-600">Learn proper tree planting techniques from experts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    2
                  </div>
                  <div>
                    <p className="font-medium">Plant Trees</p>
                    <p className="text-sm text-gray-600">Help plant native saplings in designated areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: 'var(--emerald-green)' }}>
                    3
                  </div>
                  <div>
                    <p className="font-medium">Adopt & Monitor</p>
                    <p className="text-sm text-gray-600">Receive certificate and monitor your adopted tree's growth</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Community Impact */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🌟</span>
            Your Impact
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {issue.category === 'Medical' ? '3' : issue.category === 'Food' ? '5' : issue.category === 'Social' ? '1' : '200'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {issue.category === 'Medical' ? 'Lives Saved' : issue.category === 'Food' ? 'Families Helped' : issue.category === 'Social' ? 'Senior Helped' : 'Trees Planted'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {issue.category === 'Medical' ? '20 min' : issue.category === 'Food' ? '4 hrs' : issue.category === 'Social' ? '3 hrs/week' : 'Weekend'}
              </div>
              <div className="text-xs text-gray-600 mt-1">Time Commitment</div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>After volunteering:</strong><br />
            The task organizer will contact you within 24 hours with detailed instructions, meeting location, and timing. You'll also receive updates about the task progress.
          </p>
        </div>

        {/* Comments Section */}
        {id && <CommentsSection issueId={id} />}
      </div>

      {/* Opik Trace Modal */}
      {
        showTraceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    Opik
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Trace Details</h3>
                    <p className="text-xs text-slate-500 font-mono">{issue?.opikTraceId || "trace-missing-id"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTraceModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Input Span</h4>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {`{\n  "description": "${issue?.description}",\n  "category": "${issue?.category}"\n}`}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">LLM Evaluation Span</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded border border-green-100 bg-green-50/50">
                      <span className="text-sm font-medium text-green-900">Fairness Check</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-green-200 text-green-700">score: {issue?.fairnessScore}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border border-blue-100 bg-blue-50/50">
                      <span className="text-sm font-medium text-blue-900">Disagreement Analysis</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">rate: {issue?.disagreementRate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Output Span</h4>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {`{\n  "financial_relief": "${issue?.financialRelief || "None"}",\n  "decision": "Approved"\n}`}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <a
                  href={`https://www.comet.com/opik/traces/${issue?.opikTraceId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Open in Opik Dashboard <Activity className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}