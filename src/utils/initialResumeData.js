export const initialResumeData = {
  personalInfo: {
    fullName: "ANSHUL SINGH",
    phone: "6387339319",
    location: "India",
    email: "singhanshul2807@gmail.com",
    github: "GitHub",
    linkedin: "LinkedIn",
    portfolio: "Portfolio",
  },

  // Optional professional summary (shown in resume only if styleConfig.showSummary is true)
  summary:
    "Results-driven Software Engineer with 2+ years of experience building scalable backend systems and full-stack web applications. Proficient in Java, Spring Boot, and React.js with a strong foundation in system design and distributed architectures.",

  experience: [
    {
      role: "Java Developer",
      company: "Tata Consultancy Services",
      location: "Ghaziabad, India",
      duration: "December 2023 - Present",
      points: [
        "Database Activity Monitoring Tool: Engineered and deployed a Spring Boot-based monitoring dashboard...",
        "Automated JavaScript Deployment System: Developed a Spring Boot UI-based solution...",
      ],
    },
  ],

  projects: [
    {
      title: "Employee Management System",
      tech: "Java Spring Boot, React.js, MongoDB NOSQL",
      link: "GitHub",
      liveLink: "Live Preview",
      points: [
        "Designed and Developed a full-stack Employee Management System (EMS)...",
      ],
    },
  ],

  skills: {
    languages: "Java, JavaScript, Python, SQL",
    frameworks: "Spring Boot, React.js, Node.js, Kafka, RabbitMQ",
    databases: "Oracle SQL, MongoDB NOSQL, Firebase",
    tools: "Git, Docker, GCP, AWS Lambda",
    specializations: "Data Structures, OOPs, RESTful APIs",
  },

  education: [
    {
      degree: "Bachelor of Technology in Computer Science",
      school: "Graphic Era Hill University, Dehradun",
      duration: "2019 - 2023",
      score: "CGPA: 8.0/10.0",
    },
  ],

  achievements: [
    "Achieved an Expert rating with a score of 1815+ on Codeforces.",
    "Secured Rank 22 in GeeksforGeeks' Weekly Interview Series.",
  ],
};