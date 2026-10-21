import type { ResumeData } from '../types/resume';

export const SAMPLE_RESUMES: ResumeData[] = [
  {
    id: 'resume-software-eng',
    title: 'Senior Software Engineer (Full Stack)',
    language: 'en',
    theme: 'ats-pure',
    accentColor: '#2563EB',
    targetRole: 'Lead Full Stack Engineer',
    atsScore: 92,
    lastSavedAt: Date.now() - 3600000,
    contact: {
      fullName: 'Alex Vance',
      jobTitle: 'Senior Full Stack Software Engineer',
      email: 'alex.vance.dev@gmail.com',
      phone: '+1 (415) 890-4321',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/alexvance-dev',
      githubUrl: 'https://github.com/alexvance',
      websiteUrl: 'https://alexvance.io',
      showPhoto: false,
      photoShape: 'circle',
    },
    summary:
      'Results-driven Senior Full Stack Engineer with 7+ years of experience architecting distributed cloud systems, modern React frontends, and scalable Node.js microservices. Proven track record of reducing latency by 42% for 2M+ active users and mentoring engineering teams to ship high-reliability software using automated CI/CD and zero-downtime deployments.',
    experience: [
      {
        id: 'exp-1',
        role: 'Senior Software Engineer',
        company: 'Vanguard Systems',
        companyUrl: 'https://vanguardsystems.example.com',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: '',
        current: true,
        bullets: [
          'Spearheaded the redesign of the core transaction pipeline using TypeScript, Node.js, and Redis, decreasing p99 latency from 450ms to 98ms.',
          'Architected and deployed a multi-tenant event streaming infrastructure using Apache Kafka and AWS Lambda processing 15M+ events daily with 99.99% uptime.',
          'Engineered reusable micro-frontend components using React 19, Tailwind CSS, and Vite, cutting average page load times by 35% across all customer portals.',
          'Mentored 6 junior and mid-level engineers through bi-weekly architectural reviews, accelerating squad delivery velocity by 28%.',
        ],
      },
      {
        id: 'exp-2',
        role: 'Software Engineer',
        company: 'Helios Cloud Technologies',
        companyUrl: 'https://helioscloud.example.io',
        location: 'Seattle, WA',
        startDate: 'Jun 2019',
        endDate: 'Dec 2021',
        current: false,
        bullets: [
          'Developed and maintained high-throughput RESTful and GraphQL APIs in Go and TypeScript serving over 800,000 monthly active users.',
          'Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 3 days to under 45 minutes.',
          'Optimized PostgreSQL database schemas and query indexes, eliminating query bottlenecks and saving $18,000 in monthly database provisioning costs.',
        ],
      },
      {
        id: 'exp-3',
        role: 'Associate Web Developer',
        company: 'Pulse Digital Agency',
        companyUrl: 'https://pulsedigital.example.agency',
        location: 'Austin, TX',
        startDate: 'Aug 2017',
        endDate: 'May 2019',
        current: false,
        bullets: [
          'Built responsive, WCAG 2.1 AA compliant client web portals using modern JavaScript, HTML5, and CSS3.',
          'Integrated secure OAuth2 authentication and Stripe billing checkout workflows for 14 enterprise client applications.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Texas at Austin',
        location: 'Austin, TX',
        graduationYear: '2017',
        gpa: '3.85 / 4.0',
        honors: 'Dean’s Honor List (4 Semesters)',
      },
    ],
    skills: [
      {
        id: 'skill-1',
        category: 'Languages & Core Technologies',
        items: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
      },
      {
        id: 'skill-2',
        category: 'Frameworks & Libraries',
        items: ['React 19', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'GraphQL'],
      },
      {
        id: 'skill-3',
        category: 'Cloud, DevOps & Databases',
        items: ['AWS (ECS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'CI/CD (GitHub Actions)'],
      },
      {
        id: 'skill-4',
        category: 'Practices & Architecture',
        items: ['Microservices', 'System Design', 'RESTful APIs', 'Test-Driven Development (Jest)', 'Agile/Scrum'],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'StreamSync Distributed Cache Engine',
        description: 'Engineered an open-source distributed in-memory cache with Raft consensus protocol in Go, supporting 50,000 RPS with sub-millisecond lookups.',
        technologies: ['Go', 'gRPC', 'Docker', 'Raft'],
        link: 'https://github.com/alexvance/streamsync',
      },
      {
        id: 'proj-2',
        name: 'OmniDash Real-Time Analytics Portal',
        description: 'Constructed an interactive real-time dashboard visualizing WebSocket telemetry and database metrics using React and Canvas.',
        technologies: ['TypeScript', 'React', 'WebSockets', 'Tailwind'],
        link: 'https://omnidash-demo.alexvance.io',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        date: '2023',
        credentialId: 'https://aws.amazon.com/verification',
      },
      {
        id: 'cert-2',
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation (CNCF)',
        date: '2022',
        credentialId: 'CKA-894102-LF',
      },
    ],
    customSections: [
      {
        id: 'sec-awards',
        title: 'Honors & Key Awards',
        items: [
          {
            id: 'award-1',
            title: 'Global Hackathon Grand Champion (1st Place)',
            subtitle: 'International Cloud Architecture Summit',
            date: '2023',
            link: 'https://hackathon.example.org/winners/2023',
            description:
              'Selected 1st out of 140 global teams for architecting a low-latency distributed event cache with fault-tolerant recovery.',
          },
          {
            id: 'award-2',
            title: 'Engineering Innovation Award',
            subtitle: 'Vanguard Systems Annual Excellence',
            date: '2022',
            description:
              'Awarded for pioneering asynchronous micro-frontend tooling adopted by 40+ engineering squads.',
          },
        ],
      },
    ],
  },
  {
    id: 'resume-product-mgr',
    title: 'Lead Technical Product Manager',
    language: 'en',
    theme: 'professional',
    targetRole: 'Director of Product',
    atsScore: 88,
    lastSavedAt: Date.now() - 86400000,
    contact: {
      fullName: 'Elena Rostova',
      jobTitle: 'Lead Technical Product Manager',
      email: 'elena.rostova.pm@gmail.com',
      phone: '+1 (206) 555-0199',
      location: 'Seattle, WA',
      linkedinUrl: 'https://linkedin.com/in/elena-rostova-pm',
    },
    summary:
      'Strategic Product Leader with 8+ years scaling B2B SaaS platforms from ideation through hyper-growth. Expert in data-driven prioritization, developer API ecosystems, and cross-functional team orchestration. Drove a 160% ARR expansion to $24M by delivering high-impact billing, workflow automation, and enterprise integrations.',
    experience: [
      {
        id: 'exp-pm-1',
        role: 'Lead Product Manager',
        company: 'CloudFlow Technologies',
        location: 'Seattle, WA',
        startDate: 'Mar 2021',
        endDate: '',
        current: true,
        bullets: [
          'Defined the multi-year product roadmap for the enterprise workflow automation engine, boosting Annual Recurring Revenue (ARR) by 160% in 24 months.',
          'Conducted 120+ customer discovery interviews with CTOs and VPs of Engineering to pinpoint enterprise workflow bottlenecks and inform the product backlog.',
          'Partnered with 4 distributed engineering squads (32 engineers) to transition legacy monoliths to self-service modular APIs, reducing onboarding time by 60%.',
        ],
      },
      {
        id: 'exp-pm-2',
        role: 'Senior Technical Product Manager',
        company: 'DataMetrics Corp',
        location: 'San Jose, CA',
        startDate: 'Aug 2018',
        endDate: 'Feb 2021',
        current: false,
        bullets: [
          'Launched automated SQL reporting and visualization suite used by 45,000 monthly enterprise analysts with a 94% retention rate.',
          'Reduced customer churn by 4.2% through data-driven feature adoption experiments and in-app onboarding walkthroughs.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-pm-1',
        degree: 'Master of Business Administration (MBA)',
        school: 'University of Washington, Foster School of Business',
        location: 'Seattle, WA',
        graduationYear: '2018',
      },
      {
        id: 'edu-pm-2',
        degree: 'Bachelor of Science in Electrical Engineering',
        school: 'University of Illinois Urbana-Champaign',
        location: 'Urbana, IL',
        graduationYear: '2015',
      },
    ],
    skills: [
      {
        id: 'skill-pm-1',
        category: 'Product Strategy & Execution',
        items: ['Product Roadmap', 'User Journey Mapping', 'A/B Testing', 'OKRs & KPI Tracking', 'Pricing Strategy'],
      },
      {
        id: 'skill-pm-2',
        category: 'Technical & Analytics',
        items: ['SQL', 'Mixpanel', 'Amplitude', 'Jira', 'API Architecture', 'Figma'],
      },
      {
        id: 'skill-pm-3',
        category: 'Leadership & Collaboration',
        items: ['Cross-Functional Leadership', 'Executive Stakeholder Management', 'Sprint Planning', 'Agile/Scrum'],
      },
    ],
    projects: [
      {
        id: 'proj-pm-1',
        name: 'Enterprise Workflow Automation Engine',
        description: 'Orchestrated the zero-to-one delivery of a no-code workflow builder that processed 8M executions in month 1.',
        technologies: ['API Integrations', 'No-Code', 'SaaS'],
      },
    ],
    certifications: [
      {
        id: 'cert-pm-1',
        name: 'Pragmatic Institute Certified (PMC-III)',
        issuer: 'Pragmatic Institute',
        date: '2021',
      },
    ],
  },
];
