
import { useState, useEffect } from 'react';
import { List, Map, Settings, Plus, LogOut, Flame, Mail, Calendar, MapPin, Building2, TrendingUp, AlertTriangle, Moon, Sun, Loader2, ChevronLeft, ChevronRight, Search, Filter, ArrowDownUp, Bot } from 'lucide-react';
import { SafetyShield } from '@/app/components/civic/SafetyShield';
import { SeverityBadge } from '@/app/components/civic/SeverityBadge';
import { Button } from '@/app/components/ui/button';
import { fetchFeed, Issue, getAvatar } from '@/services/api';
import { useNavigate } from 'react-router';
import { useTheme } from '@/app/context/ThemeContext';
import { ChatbotView } from './ChatbotView';

export function Dashboard() {
  const [viewMode, setViewMode] = useState<'map' | 'feed' | 'settings' | 'profile' | 'leagues' | 'departments' | 'chatbot'>('feed');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null); // For viewing other profiles
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'government' | 'volunteer'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'severity'>('newest');

  // Mock Current User
  const currentUser = {
    name: "Jon Anderson",
    role: "Civic Hero Level 3",
    avatar: "https://t4.ftcdn.net/jpg/06/08/55/73/360_F_608557356_ELcD2pwQO9pduTRL30umabzgJoQn5fnd.jpg",
    email: "jon.anderson@civicflow.com",
    joined: "January 2024",
    impact: "12 Issues Resolved",
    // Gamification Stats
    xp: 2450,
    nextLevelXp: 3000,
    streak: 12,
    league: "Gold League",
    leagueIcon: "/assets/leagues/gold.png"
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchFeed();

      setIssues(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleProfileClick = (userName: string) => {
    // If it's me, use my data, else generate mock data
    if (userName === currentUser.name) {
      setSelectedUserProfile(currentUser);
    } else {
      setSelectedUserProfile({
        name: userName,
        role: "Concerned Citizen",
        avatar: getAvatar(userName),
        email: "hidden@privacy.com",
        joined: "March 2024",
        impact: "3 Issues Reported"
      });
    }
    setViewMode('profile');
  };

  // Filter Logic
  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || issue.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();

      if (sortOption === 'newest') return timeB - timeA;
      if (sortOption === 'oldest') return timeA - timeB;
      if (sortOption === 'severity') return (b.severity || 0) - (a.severity || 0);
      return 0;
    });

  return (
    <div className="min-h-screen flex transition-colors duration-200" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar - Desktop Only with Collapse */}
      <aside
        className={`border-r hidden md:flex flex-col bg-white dark:bg-slate-900 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}>
              🔥 Civic Flow
            </h1>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-90"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6">
          {/* Profile Section */}
          <div
            className={`flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
            onClick={() => handleProfileClick(currentUser.name)}
          >
            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-slate-200 overflow-hidden border border-slate-300 dark:border-slate-600">
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.role}</p>
              </div>
            )}
          </div>

          {/* Gamification Widget - Sidebar */}
          {!isSidebarCollapsed && (
            <div
              onClick={() => setViewMode('leagues')}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/30 rounded-lg p-3 border border-indigo-100 dark:border-slate-700/50 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 group"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-600">
                  <img src={currentUser.leagueIcon} alt="League" className="w-5 h-5 object-contain filter drop-shadow-sm" />
                  <span>{currentUser.league}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-orange-500">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{currentUser.streak} Day Streak</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Level 3</span>
                  <span>{currentUser.xp} / {currentUser.nextLevelXp} XP</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(currentUser.xp / currentUser.nextLevelXp) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-indigo-600/80 dark:text-indigo-300/80 mt-1 font-medium group-hover:underline decoration-indigo-300">
                  View League Standings ➜
                </p>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            <SidebarItem
              icon={<List className="w-5 h-5" />}
              label="Feed"
              active={viewMode === 'feed'}
              collapsed={isSidebarCollapsed}
              onClick={() => setViewMode('feed')}
            />
            <SidebarItem
              icon={<Map className="w-5 h-5" />}
              label="Map"
              active={viewMode === 'map'}
              collapsed={isSidebarCollapsed}
              onClick={() => setViewMode('map')}
            />
            <SidebarItem
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              active={viewMode === 'settings'}
              collapsed={isSidebarCollapsed}
              onClick={() => setViewMode('settings')}
            />
            <SidebarItem
              icon={<Building2 className="w-5 h-5" />} // New Tab
              label="Departments"
              active={viewMode === 'departments'}
              collapsed={isSidebarCollapsed}
              onClick={() => setViewMode('departments')}
            />

            <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Report Issue Button in Sidebar */}
            <Button
              onClick={() => navigate('/report')}
              className={`group w-full gap-2 transition-all duration-300 hover:brightness-110 active:scale-95 ${isSidebarCollapsed ? 'px-2' : ''}`}
              style={{ backgroundColor: 'var(--royal-blue)' }}
            >
              <Plus className="w-5 h-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
              {!isSidebarCollapsed && "Report Issue"}
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Dark Mode</span>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          )}

          <Button
            variant="destructive"
            className={`w-full gap-2 ${isSidebarCollapsed ? 'px-2' : ''}`}
            onClick={() => alert("Demo account could not be logged out")}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }} className="px-4 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>🔥Civic Flow</h1>
              <SafetyShield score={85} />
            </div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-5xl mx-auto">

            {/* Dynamic Header based on View */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold hidden md:block" style={{ color: 'var(--text-primary)' }}>
                {viewMode === 'feed' && "Community Feed"}
                {viewMode === 'map' && "Live Issue Map"}
                {viewMode === 'settings' && "Account Settings"}
                {viewMode === 'profile' && "User Profile"}
                {viewMode === 'leagues' && "League Standings"}
                {viewMode === 'departments' && "Department Analysis"}
                {viewMode === 'chatbot' && "CivicFlow Intelligence"}
              </h2>

              <div className="hidden md:flex items-center gap-4">
                {/* Top Right Streak Button */}
                <div className="group flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900/50 font-bold text-sm cursor-pointer hover:bg-orange-100 transition-colors" title="12 Day Streak!">
                  <Flame className="w-4 h-4 fill-orange-500 transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
                  <span>{currentUser.streak} Day Streak</span>
                </div>

                <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2"></div>

                <button
                  onClick={() => setViewMode('chatbot')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm transition-all ${viewMode === 'chatbot' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                >
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </button>

                <Button
                  onClick={() => navigate('/report')}
                  className="group gap-2 transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg hover:shadow-blue-500/25 py-1.5 h-auto text-sm"
                  style={{ backgroundColor: 'var(--royal-blue)' }}
                >
                  <Plus className="w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-180 group-hover:scale-110" />
                  Report Issue
                </Button>

                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
            </div>




            {/* Mobile View Toggles */}
            <div className="flex gap-3 w-full md:w-auto md:hidden">
              <div className="inline-flex rounded-lg border p-1 flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white' : 'text-gray-500'}`}
                >
                  <Map className="w-4 h-4" /> Map
                </button>
                <button
                  onClick={() => setViewMode('feed')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'feed' ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" /> Feed
                </button>
              </div>
            </div>

            {/* Only show Report button if NOT in sidebar (mobile) */}
            <div className="md:hidden flex justify-end w-full">
              <Button
                onClick={() => navigate('/report')}
                className="gap-2 w-full"
                style={{ backgroundColor: 'var(--royal-blue)' }}
              >
                <Plus className="w-5 h-5" />
                Report Issue
              </Button>
            </div>


            {/* Filter Bar - Visible in Feed and Map Views */}
            {
              (viewMode === 'feed' || viewMode === 'map') && (
                <div className="mb-6 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search issues by keyword or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <div className="relative">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      >
                        <option value="all">All Types</option>
                        <option value="government">Government</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="severity">Highest Severity</option>
                      </select>
                      <ArrowDownUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )
            }

            {/* Content Views */}
            {
              loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {viewMode === 'map' && <MapView issues={filteredIssues} />}
                  {viewMode === 'feed' && <FeedView issues={filteredIssues} onProfileClick={handleProfileClick} />}
                  {viewMode === 'settings' && <SettingsView />}
                  {viewMode === 'profile' && selectedUserProfile && <ProfileView user={selectedUserProfile} />}
                  {viewMode === 'leagues' && <LeaguesView currentLeague={currentUser.league} currentXp={currentUser.xp} />}
                  {viewMode === 'departments' && <DepartmentStatsView />}
                  {viewMode === 'chatbot' && <ChatbotView />}
                </>
              )
            }
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Components ---

function LeaguesView({ currentLeague, currentXp }: { currentLeague: string, currentXp: number }) {
  const leagues = [
    { name: 'Diamond League', minXp: 5000, color: 'from-cyan-400 to-blue-500', icon: '/assets/leagues/diamond.png', border: 'border-cyan-200' },
    { name: 'Platinum League', minXp: 3000, color: 'from-slate-300 to-slate-400', icon: '/assets/leagues/platinum.png', border: 'border-slate-300' },
    { name: 'Gold League', minXp: 1500, color: 'from-yellow-400 to-amber-500', icon: '/assets/leagues/gold.png', border: 'border-yellow-300' },
    { name: 'Silver League', minXp: 500, color: 'from-gray-300 to-gray-400', icon: '/assets/leagues/silver.png', border: 'border-gray-300' },
    { name: 'Bronze League', minXp: 0, color: 'from-orange-400 to-amber-600', icon: '/assets/leagues/bronze.png', border: 'border-orange-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">League Tiers</h3>
          {leagues.map((league) => {
            const isCurrent = currentLeague === league.name;

            return (
              <div
                key={league.name}
                className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${isCurrent ? 'bg-white dark:bg-slate-800 shadow-xl scale-[1.02] border-2 ' + league.border : 'bg-slate-50 dark:bg-slate-900/50 opacity-80 border border-transparent hover:opacity-100'}`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center filter drop-shadow-lg transition-transform hover:scale-110 duration-300">
                      <img src={league.icon} alt={league.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {league.name}
                      </h4>
                      <p className="text-sm text-slate-500">{league.minXp}+ Karma Points</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      Current Rank
                    </div>
                  )}
                </div>
                {/* Background Glow */}
                {isCurrent && (
                  <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${league.color} opacity-10 blur-3xl rounded-full`}></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Side Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-sm">Total XP</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentXp}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-sm">Global Rank</span>
                <span className="font-bold text-slate-900 dark:text-white">#4,291</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Next Tier</span>
                <span className="font-bold text-indigo-600">550 XP needed</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 text-center">
                Leagues reset in 6 days 14 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className={`w-full justify-start gap-3 transition-all duration-300 ease-out active:scale-95 group ${collapsed ? 'justify-center px-0' : ''} ${active ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
      onClick={onClick}
    >
      <div className="transform transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 origin-center">
        {icon}
      </div>
      {!collapsed && label}
    </Button>
  )
}

function ThemeToggle({ theme, toggleTheme }: any) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-90 dark:hover:bg-slate-800"
      style={{ color: 'var(--text-primary)' }}
    >
      <div className={`transition-transform duration-500 ${theme === 'light' ? 'rotate-0' : 'rotate-180'}`}>
        {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
      </div>
    </button>
  )
}

function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Application Settings</h3>
      <div className="space-y-4">
        {/* Notifications */}
        <div className="p-4 border rounded-lg flex items-center justify-between dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Notifications</p>
            <p className="text-sm text-gray-500">Receive alerts about nearby issues</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`h-6 w-11 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all duration-300 ${notifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* Location */}
        <div className="p-4 border rounded-lg flex items-center justify-between dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Location Services</p>
            <p className="text-sm text-gray-500">Allow app to access your location</p>
          </div>
          <button
            onClick={() => setLocation(!location)}
            className={`h-6 w-11 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${location ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all duration-300 ${location ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        <div className="p-4 border rounded-lg flex items-center justify-between dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Public Profile</p>
            <p className="text-sm text-gray-500">Who can see your reported issues</p>
          </div>
          <div className="text-sm font-medium text-blue-600 cursor-pointer">Edit</div>
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-400 text-center">Version 1.0.2 - Beta Build</p>
    </div>
  )
}

function ProfileView({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User Info Card */}
      <div className="md:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 flex flex-col items-center border dark:border-slate-800">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg mb-4">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
          <p className="text-blue-600 font-medium mb-4">{user.role}</p>

          {/* Gamification Stats Card for Profile */}
          <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg mb-4 border border-amber-100 dark:border-amber-900/30">
            <div className="flex justify-center items-center gap-3 mb-2">
              <img src={user.leagueIcon || "/assets/leagues/gold.png"} alt="League" className="w-12 h-12 object-contain drop-shadow-md" />
              <span className="font-bold text-amber-700 dark:text-amber-400 text-lg">{user.league || "Bronze League"}</span>
            </div>
            <p className="text-center text-xs text-amber-600 dark:text-amber-500">
              Top 5% of Volunteers this month!
            </p>
          </div>

          <div className="w-full space-y-3 mt-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {user.joined}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Bahawalpur, Pakistan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border dark:border-slate-800">
        <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>Civic Hero Progress</span>
          <span className="text-sm font-normal text-slate-500">Level 3</span>
        </h3>

        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-300">{user.xp} XP</span>
            <span className="text-slate-500">{user.nextLevelXp} XP (Next Level)</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-slate-500">
            You need <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.nextLevelXp - user.xp} XP</span> to reach Level 4!
          </p>
        </div>

        <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3 block">XP Breakdown</h4>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800/30">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Issues Reported</div>
            <div className="font-bold text-lg text-slate-800 dark:text-slate-200">1,200 XP</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded border border-emerald-100 dark:border-emerald-800/30">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Volunteering</div>
            <div className="font-bold text-lg text-slate-800 dark:text-slate-200">1,250 XP</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-6 border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">12</div>
            <div className="text-xs text-slate-500">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">8</div>
            <div className="text-xs text-slate-500">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-current" />
              {user.streak}
            </div>
            <div className="text-xs text-slate-500">Day Streak</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <div className="space-y-4">
          {/* Mock Activity Items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                {i === 1 ? '📢' : i === 2 ? '❤️' : '🚀'}
              </div>
              <div>
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {i === 1 ? 'Reported a new issue: "Broken Streetlight"' : i === 2 ? 'Supported "Clean Water Initiative"' : 'Joined the "Park Cleanup" campaign'}
                </p>
                <p className="text-xs text-slate-500">{i} day{i !== 1 ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapView({ issues }: { issues: Issue[] }) {
  // 1. Calculate Bounds dynamically
  const lats = issues.map(i => i.location.lat);
  const lons = issues.map(i => i.location.lng);

  let minLat = lats.length ? Math.min(...lats) : 29.35;
  let maxLat = lats.length ? Math.max(...lats) : 29.45;
  let minLon = lons.length ? Math.min(...lons) : 71.65;
  let maxLon = lons.length ? Math.max(...lons) : 71.72;

  const latPadding = (maxLat - minLat) * 0.1 || 0.005;
  const lonPadding = (maxLon - minLon) * 0.1 || 0.005;

  minLat -= latPadding;
  maxLat += latPadding;
  minLon -= lonPadding;
  maxLon += lonPadding;

  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden shadow-xl border border-slate-700" style={{ height: '600px' }}>
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {issues.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p>No issues found on map</p>
          </div>
        )}

        {issues.map((issue) => {
          const latPct = ((issue.location.lat - minLat) / (maxLat - minLat)) * 100;
          const lonPct = ((issue.location.lng - minLon) / (maxLon - minLon)) * 100;
          const topPos = 100 - Math.max(0, Math.min(100, latPct));
          const leftPos = Math.max(0, Math.min(100, lonPct));

          return (
            <div
              key={issue.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPos}%`, top: `${topPos}%` }}
            >
              <div className={`group relative cursor-pointer transition-all hover:z-10`}>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {issue.title}
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-125"
                  style={{ backgroundColor: issue.type === 'government' ? 'var(--alert-red)' : 'var(--emerald-green)' }}
                >
                  <span className="text-white font-bold text-sm">{issue.severity}</span>
                </div>
                {issue.type === 'government' && issue.severity > 8 && (
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: 'var(--alert-red)', opacity: 0.4 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg border border-gray-200">
        <h4 className="font-semibold mb-2 text-slate-800">Legend</h4>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--alert-red)' }} />
            <span className="text-slate-700">Government</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--emerald-green)' }} />
            <span className="text-slate-700">Volunteer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedView({ issues, onProfileClick }: { issues: Issue[], onProfileClick: (name: string) => void }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="group rounded-lg p-4 border-l-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 active:scale-[0.99]"
          style={{
            borderLeftColor: issue.type === 'government' ? 'var(--alert-red)' : 'var(--emerald-green)',
          }}
          onClick={(e) => {
            // If clicking profile, don't navigate to issue
            if ((e.target as HTMLElement).closest('.profile-link')) return;

            if (issue.type === 'government') {
              navigate(`/issue/government/${issue.id}`);
            } else {
              navigate(`/issue/volunteer/${issue.id}`);
            }
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {issue.type === 'government' ? '🏛️' : '🤝'}
              </span>
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{issue.title}</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{issue.location.address}</p>
              </div>
            </div>
            <SeverityBadge score={issue.severity} />
          </div>

          <p className="mb-3 text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{issue.description}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                className="profile-link flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                onClick={() => onProfileClick(issue.reportedBy || "Anonymous")}
              >
                <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden">
                  <img src={issue.avatar || "https://i.pravatar.cc/150?u=default"} alt="" className="w-full h-full object-cover" />
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Reported by <span className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>{issue.reportedBy}</span>
                </span>
              </button>

              {issue.type === 'government' && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                  🏢 {issue.department || "General"}
                </span>
              )}

              {issue.type === 'government' && issue.supportersJoined !== undefined && (
                <span className="flex items-center gap-1" style={{ color: 'var(--alert-red)' }}>
                  <span className="font-semibold">{issue.supportersJoined}</span> supporters
                </span>
              )}
            </div>
            <span
              className="px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: issue.type === 'government' ? 'var(--red-100)' : 'var(--green-100)',
                color: issue.type === 'government' ? 'var(--red-700)' : 'var(--green-800)',
              }}
            >
              {issue.category}
            </span>
          </div>

        </div>
      ))}
    </div>
  );
}

function DepartmentStatsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from backend
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/departments/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Department Data...</div>;

  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Government Performance Tracker
        </h2>
        <p className="text-blue-100">
          Real-time analysis of department responsiveness and issue resolution metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trending Depts */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-emerald-600 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Departments
          </h3>
          <div className="space-y-4">
            {stats.trending.map((dept: any, i: number) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <span className="text-emerald-600 font-bold">{dept.score}% Score</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:bg-emerald-400"
                    style={{ width: `${dept.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{dept.resolved} Issues Resolved</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending Up
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Departments Needing Attention
          </h3>
          <div className="space-y-4">
            {stats.needs_attention.map((dept: any, i: number) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <span className="text-red-600 font-bold">{dept.score}% Score</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 group-hover:bg-red-400"
                    style={{ width: `${dept.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{dept.resolved} Issues Resolved</span>
                  <span className="text-red-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 rotate-180" /> Trending Down
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200 flex items-start gap-3">
        <div className="mt-1"><Building2 className="w-4 h-4" /></div>
        <div>
          <strong>How is this calculated?</strong><br />
          Scores are based on response time, resolution rate, and citizen satisfaction ratings collected from resolved issues over the last 30 days.
        </div>
      </div>
    </div>
  );
}