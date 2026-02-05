export interface Issue {
  id: string;
  type: 'government' | 'volunteer';
  title: string;
  description: string;
  aiAnalysis: string;
  severity: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  category: string;
  timestamp: Date;
  status: 'pending' | 'in-progress' | 'resolved';
  volunteersNeeded?: number;
  volunteersJoined?: number;
  supportersJoined?: number;
  reportedBy: string;
}

export interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  skills: Array<'Medical' | 'Food' | 'Rescue' | 'Transport'>;
  distance: number;
  rating: number;
  helpedCount: number;
}

export const mockIssues: Issue[] = [
  {
    id: '1',
    type: 'government',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic hazard near intersection',
    aiAnalysis: 'This infrastructure issue poses a significant safety risk to motorists and pedestrians. The pothole measures approximately 2 feet in diameter and 6 inches deep, violating Municipal Road Safety Standards Section 4.2. Similar cases have resulted in vehicle damage claims and personal injury lawsuits. Immediate action is required under Local Government Act 2013, Section 11-B, which mandates repair within 7 working days of notification.',
    severity: 9,
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: 'Main Street, Model Town'
    },
    category: 'Road Safety',
    timestamp: new Date('2026-01-30'),
    status: 'pending',
    supportersJoined: 23,
    reportedBy: 'Rajesh Kumar'
  },
  {
    id: '2',
    type: 'government',
    title: 'Broken Street Light',
    description: 'Street light out for 2 weeks, safety concern',
    aiAnalysis: 'This non-functional street light has created a dangerous dark zone in a high-traffic pedestrian area. According to Public Lighting Standards 2019, all street lights must be functional to ensure citizen safety. The prolonged outage (14+ days) indicates negligence in maintenance protocols. This violates Section 8-A of the Municipal Services Act, which requires lighting infrastructure to be maintained at 95% operational capacity.',
    severity: 7,
    location: {
      lat: 40.7560,
      lng: -73.9870,
      address: 'Park Avenue'
    },
    category: 'Public Safety',
    timestamp: new Date('2026-01-28'),
    status: 'pending',
    supportersJoined: 15,
    reportedBy: 'Priya Sharma'
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Food Drive - Winter Donations',
    description: 'Collecting non-perishable items for local shelter',
    aiAnalysis: 'The local community shelter is experiencing increased demand due to winter conditions. They urgently need non-perishable food items including rice, lentils, canned goods, and cooking oil. The shelter serves approximately 150 families daily and current supplies will last only 5 more days. This is an excellent opportunity for community members to make a direct impact on families facing food insecurity.',
    severity: 5,
    location: {
      lat: 40.7590,
      lng: -73.9840,
      address: 'Community Center, Downtown'
    },
    category: 'Food',
    timestamp: new Date('2026-02-01'),
    status: 'in-progress',
    volunteersNeeded: 10,
    volunteersJoined: 7,
    reportedBy: 'Sarah Johnson'
  },
  {
    id: '4',
    type: 'volunteer',
    title: 'Blood Donation Camp',
    description: 'Urgent need for O+ blood type',
    aiAnalysis: 'City Hospital has issued an urgent appeal for O+ blood donations. Current blood bank reserves are at critically low levels (only 2 days supply remaining). O+ is the most common blood type and is needed for emergency surgeries and trauma cases. The donation camp will be held with full safety protocols, and each donation can save up to 3 lives. Medical staff will be present to ensure donor safety.',
    severity: 8,
    location: {
      lat: 40.7570,
      lng: -73.9860,
      address: 'City Hospital'
    },
    category: 'Medical',
    timestamp: new Date('2026-02-01'),
    status: 'pending',
    volunteersNeeded: 50,
    volunteersJoined: 32,
    reportedBy: 'Dr. Michael Chen'
  },
  {
    id: '5',
    type: 'government',
    title: 'Overflowing Gutter',
    description: 'Sewage overflow in residential area',
    aiAnalysis: 'Raw sewage overflow has been reported in a densely populated residential area, creating serious health hazards. This violates Environmental Protection Act Section 12-C and Public Health Standards 2020. Prolonged exposure to sewage overflow can lead to waterborne diseases including cholera, typhoid, and hepatitis. The Municipal Corporation is legally obligated to address sewage issues within 48 hours under emergency protocols.',
    severity: 8,
    location: {
      lat: 40.7600,
      lng: -73.9830,
      address: 'Model Town Block B'
    },
    category: 'Sanitation',
    timestamp: new Date('2026-01-31'),
    status: 'pending',
    supportersJoined: 41,
    reportedBy: 'Amit Patel'
  },
  {
    id: '6',
    type: 'volunteer',
    title: 'Elder Care Volunteers Needed',
    description: 'Weekly visits to senior citizens living alone',
    aiAnalysis: 'The Elder Care initiative needs volunteers to visit and assist senior citizens who live alone in our community. Tasks include companionship, helping with grocery shopping, and checking on their wellbeing. Studies show that regular social interaction significantly improves mental health and quality of life for elderly individuals. Volunteers will be matched with seniors based on location and availability.',
    severity: 6,
    location: {
      lat: 40.7585,
      lng: -73.9845,
      address: 'Silver Oak Senior Community'
    },
    category: 'Social',
    timestamp: new Date('2026-01-29'),
    status: 'pending',
    volunteersNeeded: 15,
    volunteersJoined: 9,
    reportedBy: 'Emily Rodriguez'
  },
  {
    id: '7',
    type: 'government',
    title: 'Illegal Construction Blocking Road',
    description: 'Unauthorized construction blocking public access',
    aiAnalysis: 'An illegal construction has encroached upon public road space, reducing the road width by 40% and creating traffic congestion. This violates Urban Planning Act Section 15-B and Building Code Regulations 2021. The construction lacks proper permits and is blocking emergency vehicle access. Legal precedent shows that municipal authorities must remove unauthorized constructions within 72 hours of formal complaint.',
    severity: 7,
    location: {
      lat: 40.7575,
      lng: -73.9850,
      address: 'Green Park Extension'
    },
    category: 'Urban Planning',
    timestamp: new Date('2026-01-27'),
    status: 'pending',
    supportersJoined: 18,
    reportedBy: 'Vikram Singh'
  },
  {
    id: '8',
    type: 'volunteer',
    title: 'Tree Plantation Drive',
    description: 'Community tree planting event this weekend',
    aiAnalysis: 'Join us for a community-wide tree plantation drive aimed at increasing green cover in our neighborhood. We plan to plant 200 native trees that will improve air quality, reduce urban heat, and provide habitat for local wildlife. The initiative includes proper training on tree planting techniques and long-term maintenance planning. Each participant will receive a certificate and can adopt a tree to monitor its growth.',
    severity: 4,
    location: {
      lat: 40.7595,
      lng: -73.9835,
      address: 'Central Park Area'
    },
    category: 'Environment',
    timestamp: new Date('2026-02-02'),
    status: 'pending',
    volunteersNeeded: 30,
    volunteersJoined: 22,
    reportedBy: 'Green Warriors Club'
  }
];

export const mockVolunteers: Volunteer[] = [
  {
    id: 'v1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
    skills: ['Medical'],
    distance: 0.5,
    rating: 4.9,
    helpedCount: 127
  },
  {
    id: 'v2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    skills: ['Transport', 'Rescue'],
    distance: 1.2,
    rating: 4.8,
    helpedCount: 89
  },
  {
    id: 'v3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    skills: ['Food', 'Medical'],
    distance: 0.8,
    rating: 5.0,
    helpedCount: 156
  }
];