const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: 'government' | 'volunteer';
  category: string;
  severity: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance?: string;
  aiAnalysis?: string;
  status?: string;
  supportersJoined?: number;
  volunteersNeeded?: number;
  volunteersJoined?: number;
  reportedBy?: string;
  department?: string;
  avatar?: string; // New field
  timestamp?: Date;
  aiConfidence?: number;
  opikTraceId?: string;
  fairnessScore?: number;
  disagreementRate?: number;
  financialRelief?: string;
  imageUrl?: string;
}

// Helper to determine type from category
const isGovernmentCategory = (cat: string) => {
  const govtCategories = ['GOVT', 'Road Safety', 'Public Safety', 'Sanitation', 'Urban Planning', 'Infrastructure', 'Electricity'];
  return govtCategories.includes(cat);
};

const getDepartment = (item: any) => {
  if (item.department && item.department !== 'General' && item.department !== 'General Dept') {
    return item.department;
  }
  // Smart fallback for legacy data
  const map: Record<string, string> = {
    'GOVT': 'City Administration',
    'Road Safety': 'Traffic Police / Highways',
    'Public Safety': 'Police Department',
    'Sanitation': 'Waste Management Co.',
    'Urban Planning': 'Development Authority',
    'Infrastructure': 'Works & Services Dept',
    'Electricity': 'WAPDA / Energy Dept'
  };
  return map[item.category] || "Municipal Corporation";
};

export const getAvatar = (name: string) => {
  // 1. Define your custom profiles here
  const customProfiles: Record<string, string> = {
    // Current User
    "Jon Anderson": "https://img.freepik.com/premium-photo/happy-selfie-fitness-with-man-city-social-media-profile-picture-running-smile-workout-relax-with-portrait-male-runner-photo-road-exercise-training-freedom_590464-198210.jpg",

    // Mock Data Users (populate_db.py)
    "Robert Brown": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "Emma Wilson": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "James Smith": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "Dr. Michael Chen": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "William Davis": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "Emily Rodriguez": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "David Miller": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "Sarah Connor": "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",

    // DB Demo Users
    "Dr. Ayesha Khan": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    "Rescue 1122 Squad": "https://cdn-icons-png.flaticon.com/512/4006/4006520.png",
    "Sarah Smith": "https://img.freepik.com/premium-photo/portrait-businesswoman-smile-office-with-pride-work-small-business-receptionist-creative-agency-personal-assistant-startup-happiness-with-face-girl-career-new-york_590464-375800.jpg?semt=ais_hybrid&w=740&q=80"
  };

  // 2. Return the custom image if it exists
  if (customProfiles[name]) {
    return customProfiles[name];
  }

  // 3. Smart Fallback: Try to guess gender from name for undetermined users
  const nameLower = name.toLowerCase();
  if (nameLower.includes('mrs.') || nameLower.includes('ms.') || nameLower.includes('miss') ||
    nameLower.endsWith('a') || nameLower.endsWith('i') || nameLower.endsWith('y')) {
    // Very rough heuristic for demo purposes if name not in list
    // Ideally we just add them to the list above
    const femaleAvatars = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80"
    ];
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return femaleAvatars[seed % femaleAvatars.length];
  }

  // 4. Default Fallback
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://i.pravatar.cc/150?u=${seed}`;
}

// 1. GET THE FEED
export const fetchFeed = async (userLat?: number, userLon?: number) => {
  const formData = new FormData();
  // We send fake user coordinates to get the "Golden Match"
  formData.append("user_skills", "Medical, Rescue");

  // Use provided coordinates or default to Bahawalpur
  const lat = userLat ? userLat.toString() : "29.3956";
  const lon = userLon ? userLon.toString() : "71.6833";

  formData.append("user_lat", lat);
  formData.append("user_lon", lon);

  try {
    const response = await fetch(`${API_URL}/my_feed`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    // Convert Python data to React data
    return data.feed.map((item: any) => ({
      id: item.id.toString(),
      type: isGovernmentCategory(item.category) ? 'government' : 'volunteer',
      title: item.title,
      description: item.description,
      aiAnalysis: item.aiAnalysis || "Analysing...",
      severity: item.severity,
      location: {
        lat: item.lat || parseFloat(lat), // Fallback to user loc if missing
        lng: item.lon || parseFloat(lon),
        address: item.location || "Bahawalpur"
      },
      category: item.category,
      // Mock timestamp: Random time within last 10 days
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)),
      status: item.status || 'pending',
      supportersJoined: Math.floor(Math.random() * 20),
      volunteersNeeded: 10,
      volunteersJoined: Math.floor(Math.random() * 8),
      reportedBy: item.reportedBy || "Civic Citizen",
      department: getDepartment(item),
      avatar: getAvatar(item.reportedBy || "User" + item.id),
      imageUrl: item.image_url
    }));
  } catch (error) {
    console.error("Feed Error:", error);
    return [];
  }
};

// 2. SUBMIT REPORT
export const submitReport = async (description: string, imageFile: File | null) => {
  const formData = new FormData();
  formData.append("description", description);
  if (imageFile) {
    formData.append("file", imageFile);
  }

  const response = await fetch(`${API_URL}/report`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
};

// 3. DRAFT COMPLAINT
export const draftComplaint = async (issueId: number) => {
  const formData = new FormData();
  formData.append("issue_id", issueId.toString());

  const response = await fetch(`${API_URL}/draft_complaint`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
};

// 4. GET SINGLE ISSUE
export const fetchIssue = async (id: string) => {
  try {
    const url = `${API_URL}/issue/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const item = await response.json();
    if (item.error) {
      throw new Error(item.error);
    }

    // Convert to frontend model
    return {
      id: item.id.toString(),
      type: isGovernmentCategory(item.category) ? 'government' : 'volunteer',
      title: item.title,
      description: item.description,
      aiAnalysis: item.aiAnalysis || "Analysing...",
      severity: item.severity,
      location: {
        lat: item.lat,
        lng: item.lon,
        address: item.location || "Bahawalpur"
      },
      category: item.category,
      timestamp: new Date(),
      status: item.status,
      supportersJoined: item.supportersJoined,
      volunteersNeeded: item.volunteersNeeded,
      volunteersJoined: item.volunteersJoined,
      reportedBy: item.reportedBy,
      department: getDepartment(item),
      avatar: getAvatar(item.reportedBy || "User" + item.id),
      aiConfidence: item.ai_confidence,
      opikTraceId: item.opik_trace_id,
      fairnessScore: item.fairness_score,
      disagreementRate: item.disagreement_rate,
      financialRelief: item.financial_relief,
      imageUrl: item.image_url // Mapped from backend
    };
  } catch (error) {
    console.error("api.ts: Fetch Issue Error:", error);
    return null;
  }
};

// 5. COMMENTS SYSTEM
export const fetchComments = async (issueId: string) => {
  try {
    const response = await fetch(`${API_URL}/comments/${issueId}?t=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error("Comments Error:", error);
    return [];
  }
};

export const postComment = async (issueId: string, userName: string, text: string, avatar: string = "") => {
  const formData = new FormData();
  formData.append("issue_id", issueId);
  formData.append("user_name", userName);
  formData.append("text", text);
  formData.append("avatar", avatar);

  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Status: ${response.status}, Error: ${errorText}`);
      throw new Error(`Failed to post comment: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Post Comment Error:", error);
    throw error;
  }
};

// 7. CHATBOT RAG
export const sendChat = async (query: string, useDocs: boolean) => {
  const formData = new FormData();
  formData.append("query", query);
  formData.append("use_docs", useDocs.toString());

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Chat Error:", error);
    return { reply: "Error connecting to brain." };
  }
}