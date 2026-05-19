export type Project = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  screenshot: string | null;
  url: string | null;
  repo: string | null;
  status: "complete" | "building" | "archived";
};

export const projects: Project[] = [
  {
    id: "winrt",
    name: "windows-operation-runtime",
    description:
      "a local utility app for windows system operations. dns flushing, temp file clearing, port management, file organization.",
    tags: ["Rust", "Tauri", "JavaScript"],
    screenshot: "/screenshots/winrt.png",
    url: null,
    repo: "https://github.com/jABurat23/windows-operation-runtime",
    status: "building",
  },
  {
    id: "bsit-toolkit",
    name: "bsit-roadmap-&-notes",
    description: "This is my 4-year academic roadmap and note-taking system for my BSIT degree. Every subject, every semester, every year — documented here. Think of it as my second brain for college.",
    tags: ["nextjs", "typescript", "markdown", "react"],
    screenshot: "/screenshots/bsit-dashboard.png",
    url: "https://bsit-dashoard.vercel.app/notes",
    repo: "https://github.com/jABurat23/BSIT-Roadmap-and-Notes",
    status: "complete",
  },
  {
    id: "project-03",
    name: "project_03",
    description: "coming soon.",
    tags: [],
    screenshot: null,
    url: null,
    repo: null,
    status: "archived",
  },
  {
    id: "project-04",
    name: "project_04",
    description: "coming soon.",
    tags: [],
    screenshot: null,
    url: null,
    repo: null,
    status: "archived",
  },
  {
    id: "project-05",
    name: "project_05",
    description: "coming soon.",
    tags: [],
    screenshot: null,
    url: null,
    repo: null,
    status: "archived",
  },
];
