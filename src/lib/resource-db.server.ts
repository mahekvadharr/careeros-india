// Curated, hand-verified resource database.
// Every YouTube URL is a canonical watch URL (https://www.youtube.com/watch?v=VIDEOID, 11-char id).
// Every link has been checked against known-stable content from major creators.
// When adding entries: verify the video ID exists before adding.

import { cleanYouTube } from "./link-sanitize.server";

export type ResourceVideo = { title: string; url: string };
export type SkillResources = {
  roadmap?: string;
  videos: ResourceVideo[];
  course?: string;
  practice?: string;
  docs?: string;
};

const RAW_DB: Record<string, SkillResources> = {
  // ── Web / Frontend ──────────────────────────────────────────────────────
  frontend: {
    roadmap: "https://roadmap.sh/frontend",
    videos: [
      { title: "freeCodeCamp — Responsive Web Design (full course)", url: "https://www.youtube.com/watch?v=mU6anWqZJcc" },
      { title: "Web Dev Simplified — Learn HTML in 1 Hour", url: "https://www.youtube.com/watch?v=qz0aGYrrlhU" },
    ],
    course: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    docs: "https://developer.mozilla.org/en-US/docs/Learn",
    practice: "https://www.frontendmentor.io",
  },
  html: {
    videos: [
      { title: "freeCodeCamp — HTML Full Course", url: "https://www.youtube.com/watch?v=pQN-pnXPaVg" },
      { title: "Web Dev Simplified — Learn HTML in 1 Hour", url: "https://www.youtube.com/watch?v=qz0aGYrrlhU" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    practice: "https://www.frontendmentor.io",
  },
  css: {
    videos: [
      { title: "freeCodeCamp — CSS Full Course", url: "https://www.youtube.com/watch?v=OXGznpKZ_sA" },
      { title: "Web Dev Simplified — Learn CSS in 20 Minutes", url: "https://www.youtube.com/watch?v=1PnVor36_40" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    practice: "https://www.frontendmentor.io",
  },
  tailwind: {
    videos: [
      { title: "freeCodeCamp — Tailwind CSS Full Course", url: "https://www.youtube.com/watch?v=ft30zcMlFao" },
      { title: "Fireship — Tailwind in 100 seconds", url: "https://www.youtube.com/watch?v=mr15Xzb1Ook" },
    ],
    docs: "https://tailwindcss.com/docs/installation",
    practice: "https://www.frontendmentor.io",
  },
  javascript: {
    roadmap: "https://roadmap.sh/javascript",
    videos: [
      { title: "freeCodeCamp — JavaScript Full Course", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
      { title: "Fireship — JS in 100 seconds", url: "https://www.youtube.com/watch?v=DHjqpvDnNGE" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    course: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    practice: "https://www.hackerrank.com/domains/javascript",
  },
  typescript: {
    roadmap: "https://roadmap.sh/typescript",
    videos: [
      { title: "freeCodeCamp — TypeScript Full Course", url: "https://www.youtube.com/watch?v=30LWjhZzg50" },
      { title: "Fireship — TypeScript in 100 seconds", url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA" },
    ],
    docs: "https://www.typescriptlang.org/docs/",
    practice: "https://www.hackerrank.com/domains/typescript",
  },
  react: {
    roadmap: "https://roadmap.sh/react",
    videos: [
      { title: "freeCodeCamp — React Full Course 2024", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
      { title: "Web Dev Simplified — Learn React in 30 min", url: "https://www.youtube.com/watch?v=hQAHSlTtcmY" },
    ],
    docs: "https://react.dev/learn",
    practice: "https://www.frontendmentor.io",
  },
  nextjs: {
    roadmap: "https://roadmap.sh/react",
    videos: [
      { title: "freeCodeCamp — Next.js Full Course", url: "https://www.youtube.com/watch?v=KjY94sAKLlw" },
      { title: "Fireship — Next.js in 100 seconds", url: "https://www.youtube.com/watch?v=Sklc_fQBmcs" },
    ],
    docs: "https://nextjs.org/docs",
    practice: "https://www.frontendmentor.io",
  },
  vue: {
    videos: [
      { title: "freeCodeCamp — Vue.js Full Course", url: "https://www.youtube.com/watch?v=FXpIoQ_rT_c" },
    ],
    docs: "https://vuejs.org/guide/introduction",
    practice: "https://www.frontendmentor.io",
  },

  // ── Backend ──────────────────────────────────────────────────────────────
  backend: {
    roadmap: "https://roadmap.sh/backend",
    videos: [
      { title: "freeCodeCamp — Backend Development & APIs", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      { title: "Hussein Nasser — Backend Engineering Basics", url: "https://www.youtube.com/watch?v=9z2BfVrM7H4" },
    ],
    course: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    practice: "https://leetcode.com/problemset/",
  },
  nodejs: {
    roadmap: "https://roadmap.sh/nodejs",
    videos: [
      { title: "freeCodeCamp — Node.js & Express Full Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
      { title: "Fireship — Node.js in 100 seconds", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4" },
    ],
    docs: "https://nodejs.org/en/learn",
    practice: "https://www.hackerrank.com/domains/nodejs",
  },
  "rest-api": {
    roadmap: "https://roadmap.sh/backend",
    videos: [
      { title: "Traversy Media — REST API Crash Course", url: "https://www.youtube.com/watch?v=GZvSYJDk-us" },
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
    practice: "https://www.hackerrank.com",
  },
  graphql: {
    videos: [
      { title: "freeCodeCamp — GraphQL Full Course", url: "https://www.youtube.com/watch?v=ed8SzALpx1Q" },
    ],
    docs: "https://graphql.org/learn/",
  },
  django: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — Django Full Course", url: "https://www.youtube.com/watch?v=F5mRW0jo-U4" },
    ],
    docs: "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
    practice: "https://www.hackerrank.com/domains/python",
  },
  flask: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — Flask Full Course", url: "https://www.youtube.com/watch?v=Qr4QMBUPxWo" },
    ],
    docs: "https://flask.palletsprojects.com/en/stable/quickstart/",
  },
  fastapi: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — FastAPI Course", url: "https://www.youtube.com/watch?v=0sOvCWFmrtA" },
    ],
    docs: "https://fastapi.tiangolo.com/tutorial/",
  },
  springboot: {
    roadmap: "https://roadmap.sh/java",
    videos: [
      { title: "Amigoscode — Spring Boot Full Course", url: "https://www.youtube.com/watch?v=9SGDpanrc8U" },
    ],
    docs: "https://spring.io/guides",
    practice: "https://leetcode.com/problemset/",
  },

  // ── Languages ────────────────────────────────────────────────────────────
  python: {
    roadmap: "https://roadmap.sh/python",
    videos: [
      { title: "freeCodeCamp — Python Full Course for Beginners", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
      { title: "Corey Schafer — Python Basics Playlist (Intro)", url: "https://www.youtube.com/watch?v=YYXdXT2l-Gg" },
    ],
    docs: "https://docs.python.org/3/tutorial/",
    course: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
    practice: "https://www.hackerrank.com/domains/python",
  },
  java: {
    roadmap: "https://roadmap.sh/java",
    videos: [
      { title: "freeCodeCamp — Java Full Course", url: "https://www.youtube.com/watch?v=GoXwIVyNvX0" },
      { title: "Kunal Kushwaha — Java + DSA Bootcamp (Intro)", url: "https://www.youtube.com/watch?v=rZ41y93P2Qo" },
    ],
    docs: "https://dev.java/learn/",
    practice: "https://www.hackerrank.com/domains/java",
  },
  "c++": {
    roadmap: "https://roadmap.sh/computer-science",
    videos: [
      { title: "freeCodeCamp — C++ Full Course", url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y" },
      { title: "Apna College — C++ Full Course (Hindi)", url: "https://www.youtube.com/watch?v=j8nAHeVKL08" },
    ],
    docs: "https://cppreference.com",
    practice: "https://www.hackerrank.com/domains/cpp",
  },
  c: {
    videos: [
      { title: "freeCodeCamp — C Programming Full Course", url: "https://www.youtube.com/watch?v=KJgsSFOSQv0" },
    ],
    practice: "https://www.hackerrank.com/domains/c",
  },
  golang: {
    roadmap: "https://roadmap.sh/golang",
    videos: [
      { title: "freeCodeCamp — Go Programming Full Course", url: "https://www.youtube.com/watch?v=YS4e4q9oBaU" },
    ],
    docs: "https://go.dev/tour/",
    practice: "https://leetcode.com/problemset/",
  },
  rust: {
    roadmap: "https://roadmap.sh/rust",
    videos: [
      { title: "freeCodeCamp — Rust Programming Full Course", url: "https://www.youtube.com/watch?v=BpPEoZW5IiY" },
    ],
    docs: "https://doc.rust-lang.org/book/",
  },
  kotlin: {
    roadmap: "https://roadmap.sh/android",
    videos: [
      { title: "freeCodeCamp — Kotlin Full Course", url: "https://www.youtube.com/watch?v=F9UC9DY-vIU" },
    ],
    docs: "https://kotlinlang.org/docs/home.html",
    practice: "https://www.hackerrank.com/domains/kotlin",
  },
  swift: {
    roadmap: "https://roadmap.sh/ios",
    videos: [
      { title: "Sean Allen — SwiftUI for Beginners", url: "https://www.youtube.com/watch?v=F2ojC6TNwws" },
    ],
    docs: "https://developer.apple.com/tutorials/swiftui",
  },
  dart: {
    videos: [
      { title: "freeCodeCamp — Flutter & Dart Full Course", url: "https://www.youtube.com/watch?v=VPvVD8t02U8" },
    ],
    docs: "https://dart.dev/guides",
  },

  // ── DSA ──────────────────────────────────────────────────────────────────
  "data-structures-and-algorithms": {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "freeCodeCamp — Data Structures Full Course", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM" },
      { title: "Abdul Bari — Algorithms Full Course", url: "https://www.youtube.com/watch?v=0IAPZzGSbME" },
    ],
    course: "https://www.coursera.org/specializations/data-structures-algorithms",
    practice: "https://leetcode.com/problemset/",
  },
  "competitive-programming": {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "Errichto — Competitive Programming Tutorial", url: "https://www.youtube.com/watch?v=xAeiXy8-9Y8" },
    ],
    practice: "https://www.hackerrank.com/domains/algorithms",
  },

  // ── Database ──────────────────────────────────────────────────────────────
  sql: {
    roadmap: "https://roadmap.sh/sql",
    videos: [
      { title: "freeCodeCamp — SQL Full Course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
    ],
    docs: "https://www.w3schools.com/sql/",
    practice: "https://leetcode.com/problemset/database/",
  },
  postgresql: {
    roadmap: "https://roadmap.sh/postgresql-dba",
    videos: [
      { title: "freeCodeCamp — PostgreSQL Full Course", url: "https://www.youtube.com/watch?v=qw--VYLpxG4" },
    ],
    docs: "https://www.postgresql.org/docs/current/tutorial.html",
    practice: "https://leetcode.com/problemset/database/",
  },
  mongodb: {
    videos: [
      { title: "freeCodeCamp — MongoDB Full Course", url: "https://www.youtube.com/watch?v=c2M-rlkkT5o" },
    ],
    docs: "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
    practice: "https://www.hackerrank.com",
  },
  redis: {
    videos: [
      { title: "freeCodeCamp — Redis Full Course", url: "https://www.youtube.com/watch?v=XCsS_NVAa1g" },
    ],
    docs: "https://redis.io/docs/latest/get-started/",
  },

  // ── System Design ─────────────────────────────────────────────────────────
  "system-design": {
    roadmap: "https://roadmap.sh/system-design",
    videos: [
      { title: "ByteByteGo — System Design Fundamentals", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I" },
      { title: "Gaurav Sen — System Design Introduction", url: "https://www.youtube.com/watch?v=xpDnVSmNFX0" },
    ],
    course: "https://www.coursera.org/learn/system-design",
    practice: "https://neetcode.io/practice",
  },
  "low-level-design": {
    roadmap: "https://roadmap.sh/software-design-architecture",
    videos: [
      { title: "Gaurav Sen — OOP & Low Level Design", url: "https://www.youtube.com/watch?v=-mYC-LB4Q14" },
    ],
    practice: "https://leetcode.com/problemset/",
  },

  // ── DevOps / Cloud ────────────────────────────────────────────────────────
  devops: {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "TechWorld with Nana — DevOps Full Bootcamp", url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY" },
      { title: "freeCodeCamp — DevOps Full Course", url: "https://www.youtube.com/watch?v=Xrgk023l4lI" },
    ],
  },
  docker: {
    videos: [
      { title: "TechWorld with Nana — Docker Full Course", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
    ],
    docs: "https://docs.docker.com/get-started/",
    practice: "https://www.hackerrank.com",
  },
  kubernetes: {
    videos: [
      { title: "TechWorld with Nana — Kubernetes Full Course", url: "https://www.youtube.com/watch?v=X48VuDVv0do" },
    ],
    docs: "https://kubernetes.io/docs/tutorials/",
  },
  aws: {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "freeCodeCamp — AWS Certified Cloud Practitioner", url: "https://www.youtube.com/watch?v=SOTamWNgDKc" },
    ],
    docs: "https://aws.amazon.com/getting-started/",
    course: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
  },
  gcp: {
    videos: [
      { title: "freeCodeCamp — Google Cloud Platform Fundamentals", url: "https://www.youtube.com/watch?v=M988_fsOSWo" },
    ],
    docs: "https://cloud.google.com/docs/overview",
  },
  azure: {
    videos: [
      { title: "freeCodeCamp — Microsoft Azure Fundamentals", url: "https://www.youtube.com/watch?v=NKEFWyqJ5XA" },
    ],
    docs: "https://learn.microsoft.com/en-us/azure/",
  },
  linux: {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "freeCodeCamp — Linux Command Line Full Course", url: "https://www.youtube.com/watch?v=iwolPf6kN-k" },
    ],
    docs: "https://linuxcommand.org/lc3_learning_the_shell.php",
  },
  git: {
    videos: [
      { title: "freeCodeCamp — Git & GitHub Full Course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
      { title: "Fireship — Git in 100 seconds", url: "https://www.youtube.com/watch?v=hwP7WQkmECE" },
    ],
    docs: "https://git-scm.com/doc",
    practice: "https://github.com",
  },
  "ci-cd": {
    roadmap: "https://roadmap.sh/devops",
    videos: [
      { title: "TechWorld with Nana — CI/CD Full Course", url: "https://www.youtube.com/watch?v=R8_veQiYBjI" },
    ],
    docs: "https://docs.github.com/en/actions",
  },

  // ── AI / ML / Data Science ────────────────────────────────────────────────
  "ai-data-scientist": {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "3Blue1Brown — Neural Networks (Chapter 1)", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
      { title: "StatQuest — Machine Learning Fundamentals", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI" },
    ],
    course: "https://www.coursera.org/specializations/machine-learning-introduction",
    practice: "https://www.kaggle.com/learn",
  },
  "machine-learning": {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "freeCodeCamp — Machine Learning Full Course", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg" },
      { title: "StatQuest — Machine Learning Fundamentals", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI" },
    ],
    course: "https://www.coursera.org/specializations/machine-learning-introduction",
    practice: "https://www.kaggle.com/learn",
  },
  "deep-learning": {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "3Blue1Brown — Neural Networks (Chapter 1)", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
      { title: "freeCodeCamp — Deep Learning Full Course", url: "https://www.youtube.com/watch?v=VyWAvY2CF9c" },
    ],
    course: "https://www.coursera.org/specializations/deep-learning",
    practice: "https://www.kaggle.com/learn",
  },
  nlp: {
    roadmap: "https://roadmap.sh/ai-data-scientist",
    videos: [
      { title: "freeCodeCamp — NLP with Python Full Course", url: "https://www.youtube.com/watch?v=vyOgWhwUmec" },
    ],
    practice: "https://www.kaggle.com/learn",
  },
  "data-analysis": {
    roadmap: "https://roadmap.sh/data-analyst",
    videos: [
      { title: "Alex The Analyst — Data Analyst Bootcamp", url: "https://www.youtube.com/watch?v=rGx1QNdYzvs" },
    ],
    course: "https://www.coursera.org/professional-certificates/google-data-analytics",
    practice: "https://www.kaggle.com/learn",
  },
  numpy: {
    videos: [
      { title: "freeCodeCamp — NumPy Full Course", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI" },
    ],
    docs: "https://numpy.org/doc/stable/user/quickstart.html",
    practice: "https://www.hackerrank.com/domains/python",
  },
  pandas: {
    videos: [
      { title: "freeCodeCamp — Pandas Full Course", url: "https://www.youtube.com/watch?v=gtjxAH8uaP0" },
    ],
    docs: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    practice: "https://www.kaggle.com/learn/pandas",
  },
  tensorflow: {
    videos: [
      { title: "freeCodeCamp — TensorFlow Full Course", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk" },
    ],
    docs: "https://www.tensorflow.org/tutorials",
  },
  pytorch: {
    videos: [
      { title: "freeCodeCamp — PyTorch Full Course", url: "https://www.youtube.com/watch?v=V_xro1bcAuA" },
    ],
    docs: "https://pytorch.org/tutorials/",
  },

  // ── Mobile ────────────────────────────────────────────────────────────────
  android: {
    roadmap: "https://roadmap.sh/android",
    videos: [
      { title: "Philipp Lackner — Android Kotlin for Beginners", url: "https://www.youtube.com/watch?v=BBWyXo-3JGQ" },
    ],
    docs: "https://developer.android.com/courses",
    practice: "https://developer.android.com/codelabs/",
  },
  ios: {
    roadmap: "https://roadmap.sh/ios",
    videos: [
      { title: "Sean Allen — SwiftUI for Beginners", url: "https://www.youtube.com/watch?v=F2ojC6TNwws" },
    ],
    docs: "https://developer.apple.com/tutorials/swiftui",
  },
  flutter: {
    videos: [
      { title: "freeCodeCamp — Flutter & Dart Full Course", url: "https://www.youtube.com/watch?v=VPvVD8t02U8" },
    ],
    docs: "https://docs.flutter.dev/get-started/",
    practice: "https://docs.flutter.dev/codelabs",
  },
  "react-native": {
    roadmap: "https://roadmap.sh/react",
    videos: [
      { title: "freeCodeCamp — React Native Full Course", url: "https://www.youtube.com/watch?v=obH0Po_RdWk" },
    ],
    docs: "https://reactnative.dev/docs/getting-started",
  },

  // ── Design ───────────────────────────────────────────────────────────────
  "ux-design": {
    roadmap: "https://roadmap.sh/ux-design",
    videos: [
      { title: "Flux Academy — UX Design Process", url: "https://www.youtube.com/watch?v=v6FfMu8gv2A" },
    ],
    course: "https://www.coursera.org/professional-certificates/google-ux-design",
    practice: "https://www.frontendmentor.io",
  },
  figma: {
    roadmap: "https://roadmap.sh/ux-design",
    videos: [
      { title: "freeCodeCamp — Figma Full Course", url: "https://www.youtube.com/watch?v=jwCmIBJ8Jtc" },
    ],
    docs: "https://help.figma.com/hc/en-us/categories/360002051613",
    practice: "https://www.frontendmentor.io",
  },

  // ── Product & Management ─────────────────────────────────────────────────
  "product-manager": {
    roadmap: "https://roadmap.sh/product-manager",
    videos: [
      { title: "Lenny — How to Be a Great PM", url: "https://www.youtube.com/watch?v=l4-Bf2u3gPo" },
    ],
    course: "https://www.coursera.org/learn/uva-darden-digital-product-management",
  },

  // ── Security ─────────────────────────────────────────────────────────────
  "cyber-security": {
    roadmap: "https://roadmap.sh/cyber-security",
    videos: [
      { title: "freeCodeCamp — Ethical Hacking Full Course", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
    ],
    practice: "https://www.hackerrank.com",
  },

  // ── Infra & Tools ─────────────────────────────────────────────────────────
  "full-stack": {
    roadmap: "https://roadmap.sh/full-stack",
    videos: [
      { title: "freeCodeCamp — Full Stack Web Dev Course", url: "https://www.youtube.com/watch?v=nu_pCVPKzTk" },
    ],
    course: "https://www.freecodecamp.org/learn/",
  },
  "computer-science": {
    roadmap: "https://roadmap.sh/computer-science",
    videos: [
      { title: "Harvard CS50 — Intro to Computer Science", url: "https://www.youtube.com/watch?v=8mAITcNt710" },
    ],
    course: "https://www.edx.org/cs50",
  },
  "operating-systems": {
    roadmap: "https://roadmap.sh/computer-science",
    videos: [
      { title: "freeCodeCamp — Operating Systems Full Course", url: "https://www.youtube.com/watch?v=yK1uBHPdp30" },
    ],
    docs: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  },
  networking: {
    roadmap: "https://roadmap.sh/computer-science",
    videos: [
      { title: "freeCodeCamp — Computer Networking Full Course", url: "https://www.youtube.com/watch?v=qiQR5rTSshw" },
    ],
  },
  qa: {
    roadmap: "https://roadmap.sh/qa",
    videos: [
      { title: "Raghav Pal — Automation Testing Tutorial", url: "https://www.youtube.com/watch?v=6Ywsj19eY44" },
    ],
  },
  "software-architecture": {
    roadmap: "https://roadmap.sh/software-architect",
    videos: [
      { title: "ByteByteGo — Software Architecture Patterns", url: "https://www.youtube.com/watch?v=BrT3AO8bVQY" },
    ],
  },
  "prompt-engineering": {
    roadmap: "https://roadmap.sh/prompt-engineering",
    videos: [
      { title: "freeCodeCamp — Prompt Engineering Full Course", url: "https://www.youtube.com/watch?v=_ZvnD73m40o" },
    ],
    course: "https://www.coursera.org/learn/prompt-engineering",
  },
  blockchain: {
    roadmap: "https://roadmap.sh/blockchain",
    videos: [
      { title: "freeCodeCamp — Blockchain Full Course", url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ" },
    ],
  },
  "data-structures": {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "freeCodeCamp — Data Structures Full Course", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM" },
    ],
    practice: "https://leetcode.com/problemset/",
  },
  algorithms: {
    roadmap: "https://roadmap.sh/datastructures-and-algorithms",
    videos: [
      { title: "Abdul Bari — Algorithms Full Course", url: "https://www.youtube.com/watch?v=0IAPZzGSbME" },
    ],
    practice: "https://leetcode.com/problemset/",
  },
};

// Validate all YouTube URLs at module init
const DB: Record<string, SkillResources> = Object.fromEntries(
  Object.entries(RAW_DB).map(([key, val]) => [
    key,
    {
      ...val,
      videos: val.videos
        .map((v) => ({ title: v.title, url: cleanYouTube(v.url) }))
        .filter((v) => v.url.length > 0),
    },
  ]),
);

const ALIASES: Record<string, string> = {
  // Frontend
  "frontend development": "frontend", "front-end": "frontend", "front end": "frontend",
  "html": "html", "css": "css", "html/css": "html", "tailwindcss": "tailwind",
  "web design": "css", "responsive design": "css",
  // JavaScript
  "js": "javascript", "es6": "javascript", "ecmascript": "javascript", "vanilla js": "javascript",
  // TypeScript
  "ts": "typescript",
  // React
  "react.js": "react", "reactjs": "react", "next.js": "nextjs", "nuxt": "vue",
  // Backend
  "backend development": "backend", "back-end": "backend", "back end": "backend",
  "rest api": "rest-api", "restful api": "rest-api", "apis": "rest-api", "api design": "rest-api",
  "express": "nodejs", "expressjs": "nodejs", "express.js": "nodejs",
  "node": "nodejs", "node.js": "nodejs",
  "spring": "springboot", "spring boot": "springboot",
  // Languages
  "py": "python", "python3": "python",
  "c/c++": "c++", "cpp": "c++",
  "go": "golang", "go lang": "golang",
  "kotlin": "kotlin",
  // Database
  "postgres": "postgresql", "mysql": "sql", "databases": "sql", "database": "sql",
  "nosql": "mongodb", "mongo": "mongodb",
  // DSA
  "dsa": "data-structures-and-algorithms",
  "data structures": "data-structures-and-algorithms",
  "data structures and algorithms": "data-structures-and-algorithms",
  "leetcode": "data-structures-and-algorithms",
  "competitive programming": "competitive-programming", "cp": "competitive-programming",
  // System Design
  "system design": "system-design", "distributed systems": "system-design",
  "low level design": "low-level-design", "lld": "low-level-design", "oop": "low-level-design",
  // ML/AI
  "ml": "machine-learning", "machine learning": "machine-learning",
  "ai": "ai-data-scientist", "artificial intelligence": "ai-data-scientist",
  "deep learning": "deep-learning", "dl": "deep-learning",
  "data science": "ai-data-scientist", "data scientist": "ai-data-scientist",
  "data analysis": "data-analysis", "data analyst": "data-analysis",
  // DevOps
  "ci/cd": "ci-cd", "cicd": "ci-cd", "github actions": "ci-cd", "jenkins": "ci-cd",
  "containers": "docker", "k8s": "kubernetes",
  "cloud": "aws", "cloud computing": "aws",
  // Design
  "ux": "ux-design", "ui/ux": "ux-design", "ui ux": "ux-design", "design": "ux-design",
  // Mobile
  "react native": "react-native",
  // Product
  "product management": "product-manager", "pm": "product-manager",
  // Security
  "cybersecurity": "cyber-security", "cyber security": "cyber-security", "ethical hacking": "cyber-security",
  // General
  "testing": "qa", "qa testing": "qa", "automation testing": "qa",
  "cs fundamentals": "computer-science", "os": "operating-systems",
  "computer networks": "networking", "cn": "networking",
  "prompt engineering": "prompt-engineering",
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[._]+/g, " ").replace(/\s+/g, " ");
}

export function lookupSkill(name: string | undefined | null): SkillResources | null {
  if (!name) return null;
  const n = normalize(name);
  if (DB[n]) return DB[n];
  const alias = ALIASES[n];
  if (alias && DB[alias]) return DB[alias];
  // Partial match on DB keys
  for (const key of Object.keys(DB)) {
    if (n.includes(key) || key.includes(n)) return DB[key];
  }
  // Partial match on aliases
  for (const [a, key] of Object.entries(ALIASES)) {
    if (n.includes(a) || a.includes(n)) return DB[key] ?? null;
  }
  return null;
}

export function videosForSkill(name: string | undefined | null): ResourceVideo[] {
  const r = lookupSkill(name);
  if (!r) return [];
  const seen = new Set<string>();
  const out: ResourceVideo[] = [];
  for (const v of r.videos) {
    const url = cleanYouTube(v.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title: v.title, url });
    if (out.length >= 3) break;
  }
  return out;
}
