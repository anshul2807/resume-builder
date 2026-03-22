export const initialResumeData = {
  personalInfo: {
    fullName: "FIRSTNAME LASTNAME",
    phone: "+1 (555) 000-0000",
    location: "City, State",
    email: "professional.email@example.com",
    github: "github.com/username",
    linkedin: "linkedin.com/in/username",
    portfolio: "yourportfolio.com",
  },

  summary:
    "Dedicated Software Professional with over 2 years of experience in developing robust web applications and managing enterprise-level databases. Skilled in both frontend and backend technologies, with a strong focus on clean code, performance optimization, and scalable system architecture. Passionate about solving complex technical challenges and delivering user-centric solutions.",

  experience: [
    {
      role: "Software Development Engineer",
      company: "Major Tech Corporation",
      location: "Remote / Office",
      duration: "Jan 2024 - Present",
      points: [
        "Lead the development of a high-traffic web platform, improving page load speeds by 40% through efficient state management and code splitting.",
        "Collaborated with cross-functional teams to design and implement secure RESTful APIs serving over 50k daily active users.",
        "Optimized database schemas and query execution plans, resulting in a 20% reduction in server response times.",
        "Mentored junior developers and conducted thorough code reviews to maintain high standards of code quality and documentation."
      ],
    },
    {
      role: "Associate Developer",
      company: "Innovative Startups Ltd.",
      location: "City, Country",
      duration: "June 2022 - Dec 2023",
      points: [
        "Designed and maintained scalable microservices using modern backend frameworks and cloud-native tools.",
        "Automated deployment processes using CI/CD pipelines, reducing manual deployment errors by nearly 15%.",
        "Resolved critical system bugs and improved application stability during high-load periods."
      ],
    },
  ],

  projects: [
    {
      title: "Enterprise Management Dashboard",
      tech: "React, Node.js, PostgreSQL, Docker",
      link: "github.com/project-link",
      liveLink: "project-demo.com",
      points: [
        "Developed a comprehensive internal dashboard for real-time data visualization and resource tracking.",
        "Implemented secure user authentication and authorization using industry-standard protocols.",
        "Configured automated testing suites ensuring 90% code coverage across the primary codebase."
      ],
    },
    {
      title: "Real-Time Collaboration Tool",
      tech: "Socket.io, Express, MongoDB, Tailwind CSS",
      link: "github.com/project-two",
      liveLink: "live-demo-link.com",
      points: [
        "Built a collaborative workspace allowing multiple users to edit documents simultaneously with low latency.",
        "Integrated third-party cloud storage APIs for seamless file management and backup."
      ],
    },
  ],

  skills: {
    languages: "Java, JavaScript, Python, C++, SQL, HTML/CSS",
    frameworks: "Spring Boot, React.js, Node.js, Express, Tailwind CSS",
    databases: "Oracle, MongoDB, PostgreSQL, MySQL, Redis",
    tools: "Git, Docker, Kubernetes, AWS, GCP, Jenkins",
    specializations: "Full-Stack Development, Database Administration, System Design, Agile Methodologies",
  },

  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      location: "City, Country",
      duration: "2018 - 2022",
      score: "GPA: 8.0/10.0",
    },
  ],

  achievements: [
    "Winner of the National Level Hackathon organized by Tech-Forum 2023.",
    "Certified Professional in Cloud Architecture and Advanced Database Management.",
    "Contributed to open-source projects with over 500+ stars on GitHub.",
    "Consistently ranked in the top 5% of competitive programmers on global platforms."
  ],
};