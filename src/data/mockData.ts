import {
  User,
  Blueprint,
  BlueprintCategory,
  Internship,
  Company,
  Course,
  Video,
  Language,
  LogEntry,
  ActivityLog,
  DatabaseInfo,
  TableInfo,
  Movie,
  Song,
  BankAccount,
  Submission
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr_101',
    name: 'Suresh Raina',
    email: 'suresh.raina@example.com',
    profile: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    type: 'Creator',
    status: 'approved',
    platform: 'web',
    platform_name: 'Chrome Windows',
    uploads: 14,
    downloads: 3200,
    time: '2026-09-28 10:15',
    created_at: '2026-09-28'
  },
  {
    id: 'usr_102',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    profile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    type: 'Student',
    status: 'approved',
    platform: 'mobile',
    platform_name: 'Android App',
    uploads: 3,
    downloads: 850,
    time: '2026-09-29 14:22',
    created_at: '2026-09-29'
  },
  {
    id: 'usr_103',
    name: 'Vikram Patel',
    email: 'vikram.p@example.com',
    profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'Creator',
    status: 'pending',
    platform: 'web',
    platform_name: 'Firefox Mac',
    uploads: 8,
    downloads: 1240,
    time: '2026-09-30 09:05',
    created_at: '2026-09-30'
  },
  {
    id: 'usr_104',
    name: 'Ananya Reddy',
    email: 'ananya.r@example.com',
    profile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    type: 'Member',
    status: 'approved',
    platform: 'web',
    platform_name: 'Edge Windows',
    uploads: 1,
    downloads: 410,
    time: '2026-10-01 11:30',
    created_at: '2026-10-01'
  },
  {
    id: 'usr_105',
    name: 'Rohit Verma',
    email: 'rohit.verma@example.com',
    profile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    type: 'Moderator',
    status: 'disapproved',
    platform: 'mobile',
    platform_name: 'iOS App',
    uploads: 0,
    downloads: 95,
    time: '2026-10-01 16:45',
    created_at: '2026-10-01'
  }
];

export const initialBlueprints: Blueprint[] = [
  {
    bp_id: 'bp_saturn_v',
    name: 'Saturn V Heavy Lifter',
    user: { name: 'Sadhu Ashok', email: 'ashok@ascentracoresolutions.com' },
    image: 'https://images.unsplash.com/photo-1517976487502-5731f30bc482?w=400',
    type: 'blueprint',
    categories: ['Rockets', 'Heavy Lifters', 'Apollo'],
    downloads: 14820,
    likes: 3920,
    views: 89400,
    share: 610,
    fdownloads: 15200,
    flikes: 4100,
    fviews: 92000,
    fshare: 700,
    sfs_link: 'https://sharing.spaceflightsimulator.app/rocket/saturn-v-ultimate',
    status: 'approved',
    created_at: '2026-09-12'
  },
  {
    bp_id: 'bp_falcon_heavy',
    name: 'Falcon Heavy Reusable Booster',
    user: { name: 'Elon M.', email: 'spacex@orbit.org' },
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400',
    type: 'blueprint',
    categories: ['SpaceX', 'Reusable'],
    downloads: 28940,
    likes: 8430,
    views: 142000,
    share: 1420,
    fdownloads: 30000,
    flikes: 9000,
    fviews: 150000,
    fshare: 1500,
    sfs_link: 'https://sharing.spaceflightsimulator.app/rocket/falcon-heavy-v3',
    status: 'approved',
    created_at: '2026-09-15'
  },
  {
    bp_id: 'bp_iss_station',
    name: 'International Space Station Modular',
    user: { name: 'NASA Fanatic', email: 'station@astro.net' },
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    type: 'blueprint',
    categories: ['Stations', 'Modular'],
    downloads: 9410,
    likes: 2190,
    views: 52000,
    share: 340,
    fdownloads: 10000,
    flikes: 2500,
    fviews: 55000,
    fshare: 400,
    sfs_link: 'https://sharing.spaceflightsimulator.app/rocket/iss-complete',
    status: 'approved',
    created_at: '2026-09-18'
  },
  {
    bp_id: 'planet_mars_colony',
    name: 'Mars Colony 2050 Custom World',
    user: { name: 'Astro Terra', email: 'worlds@terra.io' },
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400',
    type: 'planet',
    categories: ['Planets', 'Custom Worlds'],
    downloads: 5120,
    likes: 1840,
    views: 31000,
    share: 190,
    fdownloads: 6000,
    flikes: 2000,
    fviews: 35000,
    fshare: 250,
    sfs_link: 'https://sharing.spaceflightsimulator.app/planet/mars-colony-system',
    status: 'approved',
    created_at: '2026-09-22'
  },
  {
    bp_id: 'planet_jupiter_moons',
    name: 'Jupiter Full Moon System Pack',
    user: { name: 'Cosmo Dev', email: 'cosmo@galaxies.org' },
    image: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400',
    type: 'planet',
    categories: ['Planets', 'Moons'],
    downloads: 3890,
    likes: 1210,
    views: 24000,
    share: 110,
    fdownloads: 4500,
    flikes: 1500,
    fviews: 28000,
    fshare: 150,
    sfs_link: 'https://sharing.spaceflightsimulator.app/planet/jupiter-pack',
    status: 'pending',
    created_at: '2026-09-25'
  }
];

export const initialCategories: BlueprintCategory[] = [
  {
    id: 1,
    bp_name: 'Heavy Launch Vehicles',
    bp_img: 'https://images.unsplash.com/photo-1517976487502-5731f30bc482?w=400',
    bp_para: 'Massive orbital rockets designed for interplanetary payload missions and deep space exploration.',
    status: 'approved'
  },
  {
    id: 2,
    bp_name: 'Reusable Boosters',
    bp_img: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400',
    bp_para: 'State of the art vertical takeoff and vertical landing recovery launch systems.',
    status: 'approved'
  },
  {
    id: 3,
    bp_name: 'Orbital Space Stations',
    bp_img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    bp_para: 'Modular habitats, solar arrays, and scientific research labs stationed in low earth orbit.',
    status: 'approved'
  },
  {
    id: 4,
    bp_name: 'Planets & Solar Systems',
    bp_img: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400',
    bp_para: 'Custom planetary packs, realistic terrains, and celestial textures for Spaceflight Simulator.',
    status: 'approved'
  }
];

export const initialCompanies: Company[] = [
  {
    company_id: 'comp_google',
    name: 'Google LLC',
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100',
    description: 'Multinational technology company focusing on search, AI, cloud computing, and software.',
    status: 'active',
    created_at: '2026-08-10',
    internships_count: 5
  },
  {
    company_id: 'comp_microsoft',
    name: 'Microsoft Corporation',
    image: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=100',
    description: 'Leading technology pioneer developing Windows, Azure cloud services, and productivity tools.',
    status: 'active',
    created_at: '2026-08-12',
    internships_count: 3
  },
  {
    company_id: 'comp_ascentra',
    name: 'Ascentracore Solutions',
    image: '/as_logo.webp',
    description: 'Advanced software engineering, space tech simulation, and educational ecosystem provider.',
    status: 'active',
    created_at: '2026-07-01',
    internships_count: 8
  }
];

export const initialInternships: Internship[] = [
  {
    internship_id: 'intern_react_01',
    name: 'Frontend React & TypeScript Engineering Intern',
    company_id: 'comp_ascentra',
    company: {
      name: 'Ascentracore Solutions',
      image: '/as_logo.webp'
    },
    type: 'remote',
    paid: 1,
    price: 15000,
    location: 'Remote, India',
    apply_link: 'https://careers.ascentracoresolutions.com/frontend-intern',
    description: 'Build enterprise single page applications using React 19, TypeScript, and Vite.',
    deadline: '2026-11-15',
    status: 'active',
    created_at: '2026-09-20'
  },
  {
    internship_id: 'intern_backend_02',
    name: 'Python Django Cloud Systems Intern',
    company_id: 'comp_ascentra',
    company: {
      name: 'Ascentracore Solutions',
      image: '/as_logo.webp'
    },
    type: 'hybrid',
    paid: 1,
    price: 18000,
    location: 'Hyderabad / Bangalore',
    apply_link: 'https://careers.ascentracoresolutions.com/django-intern',
    description: 'Design robust REST APIs, multi-database routing, and cloud microservices.',
    deadline: '2026-11-20',
    status: 'active',
    created_at: '2026-09-22'
  },
  {
    internship_id: 'intern_data_03',
    name: 'Machine Learning & Data Analyst Fellow',
    company_id: 'comp_google',
    company: {
      name: 'Google LLC',
      image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100'
    },
    type: 'remote',
    paid: 0,
    location: 'Remote Global',
    apply_link: 'https://google.com/careers/students',
    description: 'Collaborate with researchers on neural network optimization and predictive modeling.',
    deadline: '2026-12-01',
    status: 'active',
    created_at: '2026-09-25'
  }
];

export const initialCourses: Course[] = [
  {
    course_id: 'crs_ts_mastery',
    name: 'Full Stack TypeScript & React 19 Architecture',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    type: 'advanced',
    paid: 1,
    price: 4999,
    description: 'Master advanced state management, strict typing, routing, and high performance SPA design.',
    status: 'active',
    created_at: '2026-09-01'
  },
  {
    course_id: 'crs_django_core',
    name: 'Scalable Django Microservices & Database Routing',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    type: 'intermediate',
    paid: 0,
    description: 'Build robust backend architectures with authentication, custom routers, and caching.',
    status: 'active',
    created_at: '2026-09-05'
  },
  {
    course_id: 'crs_space_sim',
    name: 'Orbital Mechanics & Physics for Spaceflight Simulator',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    type: 'beginner',
    paid: 1,
    price: 1999,
    description: 'Understand delta-v, Hohmann transfer orbits, and craft blueprint design fundamentals.',
    status: 'active',
    created_at: '2026-09-10'
  }
];

export const initialVideos: Video[] = [
  {
    video_id: 'vid_01',
    title: 'Introduction to React 19 Actions & Hooks',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    course_id: 'crs_ts_mastery',
    course_name: 'Full Stack TypeScript & React 19 Architecture',
    description: 'Deep dive into concurrent mode, useActionState, and server component optimizations.',
    status: 'active',
    created_at: '2026-09-15'
  },
  {
    video_id: 'vid_02',
    title: 'Configuring MySQL Multi-DB Routers in Django',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    course_id: 'crs_django_core',
    course_name: 'Scalable Django Microservices & Database Routing',
    description: 'Segregate read-replicas, dynamic schemas, and migration routers.',
    status: 'active',
    created_at: '2026-09-18'
  }
];

export const initialLanguages: Language[] = [
  { language_id: 'lang_ts', name: 'TypeScript', created_by: 'Sadhu Ashok', status: 'active', created_at: '2026-08-01' },
  { language_id: 'lang_py', name: 'Python', created_by: 'Sadhu Ashok', status: 'active', created_at: '2026-08-01' },
  { language_id: 'lang_js', name: 'JavaScript (ESNext)', created_by: 'Admin', status: 'active', created_at: '2026-08-05' },
  { language_id: 'lang_sql', name: 'SQL / MySQL', created_by: 'Admin', status: 'active', created_at: '2026-08-10' }
];

export const initialSubmissions: Submission[] = [
  {
    id: 'sub_001',
    student_name: 'Priya Sharma',
    task_title: 'Full Stack Django Multi-DB Router Implementation',
    program: 'Python Django Cloud Systems Intern',
    github_link: 'https://github.com/example/django-db-router',
    submitted_at: '2026-10-01 14:20',
    score: 95,
    status: 'approved',
    language: 'Python',
    code: 'class PrimaryReplicaRouter:\n    def db_for_read(self, model, **hints):\n        return "replica"'
  },
  {
    id: 'sub_002',
    student_name: 'Suresh Raina',
    task_title: 'React 19 SPA State & Concurrent Mode Optimization',
    program: 'Frontend React Engineering Intern',
    github_link: 'https://github.com/example/react-spa-perf',
    submitted_at: '2026-10-01 18:45',
    score: 88,
    status: 'approved',
    language: 'TypeScript',
    code: 'export function useOptimisticUpdate<T>(initial: T) {\n  return useActionState(...);\n}'
  },
  {
    id: 'sub_003',
    student_name: 'Rohit Verma',
    task_title: 'Maximum Subarray & Neural Network Loss',
    program: 'Machine Learning Fellow',
    github_link: 'https://github.com/example/ml-benchmarks',
    submitted_at: '2026-10-02 07:15',
    score: 60,
    status: 'pending',
    language: 'C++',
    code: 'int maxSubArray(vector<int>& nums) { return 0; }'
  }
];

export const initialLogs: LogEntry[] = [
  {
    id: 1,
    time: '2026-10-02 08:35:12',
    user: 'usr_admin_001',
    user_id: 'usr_admin_001',
    error_code: 200,
    error_msg: 'Session authenticated successfully',
    activity_id: 'AUTH_LOGIN',
    platform: 'Web',
    platform_name: 'Chrome on Windows 11',
    ip: '192.168.1.45',
    version: '2.0.4',
    status: 'Success'
  },
  {
    id: 2,
    time: '2026-10-02 07:14:03',
    user: 'usr_105',
    user_id: 'usr_105',
    error_code: 403,
    error_msg: '403 Forbidden: Insufficient clearance for /sfs/edit_bp',
    activity_id: 'SFS_BP_EDIT',
    platform: 'Mobile',
    platform_name: 'SFS Android Client',
    ip: '103.45.22.91',
    version: '1.9.8',
    status: 'Blocked'
  },
  {
    id: 3,
    time: '2026-10-01 22:50:41',
    user: 'anonymous',
    user_id: 'guest',
    error_code: 404,
    error_msg: '404 Not Found at /api/v1/legacy_endpoints',
    activity_id: 'PAGE_VIEW',
    platform: 'Web Bot',
    platform_name: 'Python Urllib / Crawler',
    ip: '45.132.88.12',
    version: '1.0.0',
    status: 'Not Found'
  },
  {
    id: 4,
    time: '2026-10-01 19:12:00',
    user: 'usr_admin_001',
    user_id: 'usr_admin_001',
    error_code: 200,
    error_msg: 'Blueprint uploaded successfully: Saturn V Heavy Lifter',
    activity_id: 'SFS_UPLOAD',
    platform: 'Web',
    platform_name: 'Chrome on Windows 11',
    ip: '192.168.1.45',
    version: '2.0.4',
    status: 'Success'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 1, activity_id: 'PROFILE_UPDATE', change: 'Updated admin notification settings and email address', user: 'Sadhu Ashok Kumar', time: '2026-10-01 15:40' },
  { id: 2, activity_id: 'DATABASE_QUERY', change: 'Ran table schema validation on sfs_blueprints', user: 'Sadhu Ashok Kumar', time: '2026-09-30 18:22' },
  { id: 3, activity_id: 'COMPANY_CREATE', change: 'Registered Ascentracore Solutions organization profile', user: 'Sadhu Ashok Kumar', time: '2026-09-28 11:05' },
  { id: 4, activity_id: 'INTERNSHIP_POST', change: 'Published Frontend React & TypeScript Engineering Intern', user: 'Sadhu Ashok Kumar', time: '2026-09-20 09:15' }
];

export const initialDatabases: DatabaseInfo[] = [
  { name: 'ascentracore_admin', tables_count: 24, size: '48.2 MB', created_at: '2026-01-15' },
  { name: 'sfs_core_prod', tables_count: 18, size: '185.6 MB', created_at: '2026-02-01' },
  { name: 'skiltrix_learning', tables_count: 14, size: '32.1 MB', created_at: '2026-03-10' },
  { name: 'sonicora_media', tables_count: 12, size: '210.4 MB', created_at: '2026-04-05' },
  { name: 'transport_hub_db', tables_count: 8, size: '14.9 MB', created_at: '2026-05-20' },
  { name: 'krishi_agri_db', tables_count: 10, size: '22.3 MB', created_at: '2026-06-11' }
];

export const initialDatabaseTables: Record<string, TableInfo[]> = {
  ascentracore_admin: [
    { table_name: 'auth_users', rows_count: 4210 },
    { table_name: 'django_sessions', rows_count: 852 },
    { table_name: 'system_logs', rows_count: 94102 },
    { table_name: 'admin_audit_trail', rows_count: 1240 }
  ],
  sfs_core_prod: [
    { table_name: 'sfs_blueprints', rows_count: 1223 },
    { table_name: 'sfs_categories', rows_count: 14 },
    { table_name: 'sfs_analytics_dlv', rows_count: 185040 },
    { table_name: 'sfs_bp_images', rows_count: 4890 },
    { table_name: 'sfs_user_profiles', rows_count: 38200 }
  ],
  skiltrix_learning: [
    { table_name: 'skiltrix_companies', rows_count: 48 },
    { table_name: 'skiltrix_internships', rows_count: 120 },
    { table_name: 'skiltrix_courses', rows_count: 36 },
    { table_name: 'skiltrix_videos', rows_count: 412 },
    { table_name: 'skiltrix_submissions', rows_count: 1980 }
  ]
};

export const initialMovies: Movie[] = [
  { movie_id: 'mov_rr', movie_name: 'RRR', movie_img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', hero: 'NTR Jr, Ram Charan', heroine: 'Alia Bhatt', release_year: 2022, status: 'approved' },
  { movie_id: 'mov_bb', movie_name: 'Baahubali 2: The Conclusion', movie_img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', hero: 'Prabhas', heroine: 'Anushka Shetty', release_year: 2017, status: 'approved' },
  { movie_id: 'mov_kgf', movie_name: 'K.G.F: Chapter 2', movie_img: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400', hero: 'Yash', heroine: 'Srinidhi Shetty', release_year: 2022, status: 'approved' },
  { movie_id: 'mov_pushpa', movie_name: 'Pushpa 2: The Rule', movie_img: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400', hero: 'Allu Arjun', heroine: 'Rashmika Mandanna', release_year: 2024, status: 'approved' }
];

export const initialSongs: Song[] = [
  { song_id: 'sng_naatu', song_name: 'Naatu Naatu', movie_name: 'RRR', hero_name: 'NTR Jr, Ram Charan', singer: 'Rahul Sipligunj, Kaala Bhairava', duration: '3:34', language: 'Telugu', category: 'High Energy Dance', status: 'approved' },
  { song_id: 'sng_dheevara', song_name: 'Dheevara', movie_name: 'Baahubali: The Beginning', hero_name: 'Prabhas', singer: 'Ramya Behara, Deepu', duration: '5:43', language: 'Telugu', category: 'Melody / Devotional', status: 'approved' },
  { song_id: 'sng_ooantava', song_name: 'Oo Antava Mava', movie_name: 'Pushpa: The Rise', hero_name: 'Allu Arjun', singer: 'Indravathi Chauhan', duration: '3:48', language: 'Telugu', category: 'Folk Beat', status: 'approved' }
];

export const initialBankAccounts: BankAccount[] = [
  {
    your_name: 'SADHU ASHOK KUMAR',
    bank_name: 'State Bank Of India',
    ifsc: 'SBIN0004312',
    account_number: '•••• •••• •••• 4312',
    is_primary: true
  }
];
