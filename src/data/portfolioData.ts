import { Project, SkillCategory, ExperienceItem } from '../types';

export const USER_INFO = {
  name: 'PKFire',
  fullName: 'Nhat Quang Bui',
  tagline: 'Full-Stack Software Engineer & Creative Technologist',
  bio: 'Engineering resilient distributed web architectures, high-performance interactive interfaces, and developer-first tooling. Passionate about system latency, elegant TypeScript systems, and interactive experiences.',
  github: 'https://github.com/PKFire-223',
  email: 'nhatquang2703@gmail.com',
  alternateEmail: 'buiquang0123@gmail.com',
  location: 'Remote / Asia-Pacific (GMT+7)',
  status: 'Open to high-impact projects & innovative teams',
};

export const PROJECTS: Project[] = [
  {
    id: 'ignis-particle-engine',
    title: 'Ignis WebGL Engine',
    category: 'Interactive',
    summary: 'High-performance interactive particle and fluid physics simulation running 60fps on modern web browsers.',
    description: 'A hardware-accelerated fluid and particle dynamics engine implemented using WebGL 2.0 shaders and Web Workers. Designed for real-time visual fidelity with over 100,000 simultaneous interacting nodes.',
    metrics: ['120k active particles @ 60 FPS', '< 2.4MB bundle size', 'Zero GPU memory leak runtime'],
    techStack: ['TypeScript', 'WebGL 2.0', 'GLSL', 'Vite', 'Web Workers'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#pkfire-lab',
    featured: true,
    date: '2026',
    highlights: [
      'GPGPU computational shaders offloaded from main thread',
      'Adaptive particle culling based on viewport occlusion',
      'Dynamic turbulence field generator using Perlin noise'
    ],
    color: 'from-amber-500 to-rose-600'
  },
  {
    id: 'nexus-mesh-stream',
    title: 'Nexus Stream Mesh',
    category: 'Systems & Tools',
    summary: 'Distributed pub/sub messaging broker bridge with end-to-end telemetry and sub-5ms relay latencies.',
    description: 'Engineered a lightweight WebSocket/gRPC multiplexer designed for edge topologies. Bridges disparate browser clients with streaming servers while providing automated backpressure management.',
    metrics: ['Sub-5ms p99 message transit', 'Handles 40k concurrent connections', 'Automatic reconnect with zero message drop'],
    techStack: ['Node.js', 'TypeScript', 'WebSockets', 'Protocol Buffers', 'Redis'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#',
    featured: true,
    date: '2025 - 2026',
    highlights: [
      'Zero-allocation binary frame parser reducing GC pause overhead',
      'Client session resume token mechanism for network handoffs',
      'Live metric dashboard tracking stream health'
    ],
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'aether-design-system',
    title: 'Aether Component Kit',
    category: 'Web Apps',
    summary: 'Accessible, ergonomic headless design system crafted with Tailwind CSS and modern React 19 primitives.',
    description: 'A component foundation tailored for data-dense engineering consoles and consumer products alike. Built strictly with WCAG 2.1 AAA contrast and keyboard-first navigation patterns.',
    metrics: ['100% WCAG AAA accessible', '18 core accessible primitives', '40% faster dev velocity in team tests'],
    techStack: ['React 19', 'Tailwind CSS', 'TypeScript', 'ARIA Primitives'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#',
    featured: true,
    date: '2025',
    highlights: [
      'Strict keyboard navigation trap for nested dialogs & modals',
      'Polymorphic as-prop support with compile-time type guarantees',
      'Automated dark/light/high-contrast palette token generator'
    ],
    color: 'from-amber-400 to-orange-600'
  },
  {
    id: 'pulse-telemetry-engine',
    title: 'Pulse Telemetry Hub',
    category: 'Full-Stack',
    summary: 'Privacy-preserving real-time analytical pipeline and visualization platform with edge aggregation.',
    description: 'An end-to-end full-stack analytics suite that strips identifying PII at the edge before recording aggregated behavioral metrics. Features interactive drill-down charts and cohort segmentations.',
    metrics: ['Zero cookie dependencies', '< 15ms query execution', 'GDPR & CCPA compliant by design'],
    techStack: ['TypeScript', 'Express', 'React', 'Tailwind CSS', 'Chart Engine'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#',
    featured: false,
    date: '2025',
    highlights: [
      'Differential privacy noise injected into user counts',
      'Real-time streaming websocket feeds for live visitor heatmaps',
      'Configurable retention rules and auto-vacuuming storage'
    ],
    color: 'from-red-500 to-amber-600'
  },
  {
    id: 'firestorm-cli',
    title: 'Firestorm Task Daemon',
    category: 'Systems & Tools',
    summary: 'Blazingly fast development runner that computes task dependency graphs and caches intermediate builds.',
    description: 'Command line orchestrator designed to eliminate redundant test and compilation runs across multi-package projects. Integrates git tree hashing to verify artifact freshness.',
    metrics: ['6x build pipeline acceleration', 'Instant content-addressed cache hit', 'Zero configuration defaults'],
    techStack: ['Node.js', 'TypeScript', 'CLI Architecture', 'Git Tree Hashing'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#',
    featured: false,
    date: '2024 - 2025',
    highlights: [
      'Directed Acyclic Graph (DAG) cycle detection and parallel execution',
      'Human-readable terminal animations with interactive progress states',
      'Deterministic output checksumming'
    ],
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'hyperion-collab-board',
    title: 'Hyperion Collaborative Canvas',
    category: 'Full-Stack',
    summary: 'Infinite collaborative whiteboard with real-time multi-cursor sync and CRDT state reconciliation.',
    description: 'Interactive canvas allowing engineering teams to map architectures, sketch low-fidelity wireframes, and run asynchronous retrospectives in real-time.',
    metrics: ['Sub-20ms cursor sync latency', 'CRDT conflict-free convergence', 'Infinite 2D zoom & pan coordinate space'],
    techStack: ['React', 'TypeScript', 'WebSockets', 'Canvas 2D', 'CRDT'],
    githubUrl: 'https://github.com/PKFire-223/Website',
    demoUrl: '#',
    featured: true,
    date: '2024',
    highlights: [
      'Optimistic rendering with client-side prediction interpolation',
      'Spatial quadtree index for instant shape hit detection',
      'Offline-first draft buffer syncing seamlessly upon reconnect'
    ],
    color: 'from-orange-600 to-red-700'
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend Engineering',
    iconName: 'Layout',
    description: 'Creating hyper-responsive, fluid, and robust user experiences.',
    skills: [
      { name: 'TypeScript', level: 95, category: 'Core' },
      { name: 'React 19 / Modern Hooks', level: 95, category: 'Core' },
      { name: 'Tailwind CSS', level: 92, category: 'Styling' },
      { name: 'Next.js & Vite Ecosystem', level: 90, category: 'Tooling' },
      { name: 'HTML5 Canvas & WebGL', level: 85, category: 'Graphics' },
      { name: 'Web Performance Optimization', level: 88, category: 'Performance' },
    ]
  },
  {
    title: 'Backend & Systems',
    iconName: 'Server',
    description: 'Architecting resilient APIs, streaming conduits, and persistent layers.',
    skills: [
      { name: 'Node.js & Express', level: 92, category: 'Runtime' },
      { name: 'REST & GraphQL APIs', level: 90, category: 'Protocol' },
      { name: 'WebSockets & Event-Driven', level: 88, category: 'Real-time' },
      { name: 'PostgreSQL & Cloud SQL', level: 84, category: 'Database' },
      { name: 'Redis & Caching Strategies', level: 85, category: 'In-Memory' },
      { name: 'Authentication (OAuth/JWT)', level: 86, category: 'Security' },
    ]
  },
  {
    title: 'DevOps & Tooling',
    iconName: 'Cpu',
    description: 'Ensuring frictionless deployments, observability, and code confidence.',
    skills: [
      { name: 'Git & GitHub Workflows', level: 94, category: 'VCS' },
      { name: 'Docker & Containerization', level: 82, category: 'Infra' },
      { name: 'CI/CD Pipelines (GitHub Actions)', level: 84, category: 'Automation' },
      { name: 'Linux CLI & Bash Scripting', level: 86, category: 'Environment' },
      { name: 'Testing (Vitest, Jest)', level: 85, category: 'Testing' },
      { name: 'Cloud Deployments (GCP / Vercel)', level: 86, category: 'Cloud' },
    ]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Lead Full-Stack Engineer / Creator',
    organization: 'PKFire Systems & Open Tech',
    period: '2024 - Present',
    location: 'Remote',
    type: 'Full-time',
    summary: 'Architecting next-generation web platforms, developer tooling, and client-centric SaaS solutions.',
    points: [
      'Engineered interactive visualization interfaces with sub-16ms render budgets using React and Canvas/WebGL.',
      'Constructed distributed microservices and WebSocket relays handling thousands of concurrent interactions.',
      'Authored open-source libraries and utilities focused on ergonomic developer workflows and clean code patterns.'
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS', 'Vite', 'Cloud Platforms']
  },
  {
    id: 'exp-2',
    role: 'Senior Software Developer',
    organization: 'Digital Solutions Lab',
    period: '2022 - 2024',
    location: 'Hybrid',
    type: 'Full-time',
    summary: 'Spearheaded modern web app rewrites and cross-functional feature delivery for enterprise clients.',
    points: [
      'Migrated legacy monolithic frontend codebase to modular React/TypeScript SPA, trimming load times by 48%.',
      'Designed robust RESTful API endpoints and integrated relational schemas with zero-downtime database migrations.',
      'Mentored junior engineers and standardized unit/integration test suites across multi-repository workspaces.'
    ],
    skills: ['React', 'TypeScript', 'PostgreSQL', 'Express', 'Docker', 'Jest']
  },
  {
    id: 'exp-3',
    role: 'Software Engineering Graduate',
    organization: 'Computer Science & Software Engineering',
    period: '2019 - 2022',
    location: 'University',
    type: 'Education',
    summary: 'Focused on algorithms, distributed architectures, data structures, and computer networks.',
    points: [
      'Graduated with honors; led capstone research on real-time asynchronous distributed consensus.',
      'Active competitive programmer in algorithmic problem solving and hackathon champion.'
    ],
    skills: ['Algorithms', 'Data Structures', 'C++', 'System Design', 'Networks']
  }
];

export const TERMINAL_COMMANDS: Record<string, string[]> = {
  help: [
    'Available commands:',
    '  about        - View background & core engineering philosophy',
    '  skills       - Print key technical proficiencies',
    '  projects     - List top featured projects',
    '  contact      - Display communication channels & emails',
    '  fire         - Trigger interactive elemental blast',
    '  clear        - Reset terminal window'
  ],
  about: [
    'Nhat Quang Bui (PKFire) - Full-Stack Engineer.',
    'Focused on high-performance web systems, resilient APIs, and expressive user experiences.',
    'Current focus: Reactive architectures, WebGL simulations, and edge telemetry.'
  ],
  skills: [
    '• Languages: TypeScript, JavaScript, Go, Python, SQL, C++',
    '• Frontend: React 19, Tailwind CSS, Vite, HTML5 Canvas, WebGL',
    '• Backend: Node.js, Express, WebSockets, REST, Redis, PostgreSQL',
    '• Tools: Git, Docker, GitHub Actions, Linux, Vitest'
  ],
  projects: [
    '1. Ignis WebGL Engine       - 120k particles @ 60 FPS hardware-accelerated simulation',
    '2. Nexus Stream Mesh        - Sub-5ms WebSocket/gRPC edge message broker',
    '3. Aether Component Kit     - 100% accessible headless design primitives',
    '4. Hyperion Collab Board    - Real-time infinite collaborative whiteboard with CRDT'
  ],
  contact: [
    '• GitHub: https://github.com/PKFire-223',
    '• Direct Email: nhatquang2703@gmail.com',
    '• Secondary: buiquang0123@gmail.com',
    '• Status: Open for collaborations & engineering roles'
  ],
  fire: [
    '🔥 [PK FIRE!] A blazing pillar of psychic flame erupts on the canvas below!',
    'Check out the "PK Fire Lab" section for interactive particle physics!'
  ]
};
