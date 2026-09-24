Autentikasi akan memakai sesi admin dan cookie aman. Saya cek file utama, variabel lingkungan, serta panduan desain sebelum membangun.
Action: view_bulk({"paths":["/app/backend/server.py","/app/backend/requirements.txt","/app/backend/.env","/app/frontend/package.json","/app/frontend/.env","/app/frontend/src/App.js","/app/frontend/src/App.css","/app/frontend/src/index.css","/app/frontend/src/index.js","/app/design_guidelines.json","/app/memory/test_credentials.md","/app/frontend/tailwind.config.js"]})
Observation: ===FILE: /app/backend/server.py
/app/backend/server.py:
1|from fastapi import FastAPI, APIRouter
2|from dotenv import load_dotenv
3|from starlette.middleware.cors import CORSMiddleware
4|from motor.motor_asyncio import AsyncIOMotorClient
5|import os
6|import logging
7|from pathlib import Path
8|from pydantic import BaseModel, Field, ConfigDict
9|from typing import List
10|import uuid
11|from datetime import datetime, timezone
12|
13|
14|ROOT_DIR = Path(__file__).parent
15|load_dotenv(ROOT_DIR / '.env')
16|
17|# MongoDB connection
18|mongo_url = os.environ['MONGO_URL']
19|client = AsyncIOMotorClient(mongo_url)
20|db = client[os.environ['DB_NAME']]
21|
22|# Create the main app without a prefix
23|app = FastAPI()
24|
25|# Create a router with the /api prefix
26|api_router = APIRouter(prefix="/api")
27|
28|
29|# Define Models
30|class StatusCheck(BaseModel):
31|    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
32|    
33|    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
34|    client_name: str
35|    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
36|
37|class StatusCheckCreate(BaseModel):
38|    client_name: str
39|
40|# Add your routes to the router instead of directly to app
41|@api_router.get("/")
42|async def root():
43|    return {"message": "Hello World"}
44|
45|@api_router.post("/status", response_model=StatusCheck)
46|async def create_status_check(input: StatusCheckCreate):
47|    status_dict = input.model_dump()
48|    status_obj = StatusCheck(**status_dict)
49|    
50|    # Convert to dict and serialize datetime to ISO string for MongoDB
51|    doc = status_obj.model_dump()
52|    doc['timestamp'] = doc['timestamp'].isoformat()
53|    
54|    _ = await db.status_checks.insert_one(doc)
55|    return status_obj
56|
57|@api_router.get("/status", response_model=List[StatusCheck])
58|async def get_status_checks():
59|    # Exclude MongoDB's _id field from the query results
60|    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
61|    
62|    # Convert ISO string timestamps back to datetime objects
63|    for check in status_checks:
64|        if isinstance(check['timestamp'], str):
65|            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
66|    
67|    return status_checks
68|
69|# Include the router in the main app
70|app.include_router(api_router)
71|
72|app.add_middleware(
73|    CORSMiddleware,
74|    allow_credentials=True,
75|    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
76|    allow_methods=["*"],
77|    allow_headers=["*"],
78|)
79|
80|# Configure logging
81|logging.basicConfig(
82|    level=logging.INFO,
83|    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
84|)
85|logger = logging.getLogger(__name__)
86|
87|@app.on_event("shutdown")
88|async def shutdown_db_client():
89|    client.close()

===END

===FILE: /app/backend/requirements.txt
/app/backend/requirements.txt:
1|fastapi==0.110.1
2|uvicorn==0.25.0
3|boto3>=1.34.129
4|requests-oauthlib>=2.0.0
5|cryptography>=42.0.8
6|python-dotenv>=1.0.1
7|pymongo==4.6.3
8|pydantic>=2.6.4
9|email-validator>=2.2.0
10|pyjwt>=2.10.1
11|bcrypt==4.1.3
12|passlib>=1.7.4
13|tzdata>=2024.2
14|motor==3.3.1
15|pytest>=8.0.0
16|pytest-xdist>=3.6.0
17|black>=24.1.1
18|isort>=5.13.2
19|flake8>=7.0.0
20|mypy>=1.8.0
21|python-jose>=3.3.0
22|requests>=2.31.0
23|pandas>=2.2.0
24|numpy>=1.26.0
25|python-multipart>=0.0.9
26|jq>=1.6.0
27|typer>=0.9.0
28|emergentintegrations==0.2.1
29|

===END

===FILE: /app/backend/.env
/app/backend/.env:
1|MONGO_URL="mongodb://localhost:27017"
2|DB_NAME="test_database"
3|CORS_ORIGINS="*"

===END

===FILE: /app/frontend/package.json
/app/frontend/package.json:
1|{
2|  "name": "frontend",
3|  "version": "0.1.0",
4|  "private": true,
5|  "dependencies": {
6|    "@hookform/resolvers": "5.0.1",
7|    "@radix-ui/react-accordion": "1.2.8",
8|    "@radix-ui/react-alert-dialog": "1.1.11",
9|    "@radix-ui/react-aspect-ratio": "1.1.4",
10|    "@radix-ui/react-avatar": "1.1.7",
11|    "@radix-ui/react-checkbox": "1.2.3",
12|    "@radix-ui/react-collapsible": "1.1.8",
13|    "@radix-ui/react-context-menu": "2.2.12",
14|    "@radix-ui/react-dialog": "1.1.11",
15|    "@radix-ui/react-dropdown-menu": "2.1.12",
16|    "@radix-ui/react-hover-card": "1.1.11",
17|    "@radix-ui/react-label": "2.1.4",
18|    "@radix-ui/react-menubar": "1.1.12",
19|    "@radix-ui/react-navigation-menu": "1.2.10",
20|    "@radix-ui/react-popover": "1.1.11",
21|    "@radix-ui/react-progress": "1.1.4",
22|    "@radix-ui/react-radio-group": "1.3.4",
23|    "@radix-ui/react-scroll-area": "1.2.6",
24|    "@radix-ui/react-select": "2.2.2",
25|    "@radix-ui/react-separator": "1.1.4",
26|    "@radix-ui/react-slider": "1.3.2",
27|    "@radix-ui/react-slot": "1.2.0",
28|    "@radix-ui/react-switch": "1.2.2",
29|    "@radix-ui/react-tabs": "1.1.9",
30|    "@radix-ui/react-toast": "1.2.11",
31|    "@radix-ui/react-toggle": "1.1.6",
32|    "@radix-ui/react-toggle-group": "1.1.7",
33|    "@radix-ui/react-tooltip": "1.2.4",
34|    "@tanstack/react-query": "5.56.2",
35|    "axios": "1.18.0",
36|    "class-variance-authority": "0.7.1",
37|    "clsx": "2.1.1",
38|    "cmdk": "1.1.1",
39|    "cra-template": "1.2.0",
40|    "date-fns": "4.1.0",
41|    "dayjs": "1.11.13",
42|    "embla-carousel-react": "8.6.0",
43|    "framer-motion": "11.18.0",
44|    "input-otp": "1.4.2",
45|    "lodash": "4.18.1",
46|    "lucide-react": "0.516.0",
47|    "next-themes": "0.4.6",
48|    "react": "19.0.0",
49|    "react-day-picker": "8.10.1",
50|    "react-dom": "19.0.0",
51|    "react-hook-form": "7.56.2",
52|    "react-resizable-panels": "3.0.1",
53|    "react-router-dom": "7.15.0",
54|    "react-scripts": "5.0.1",
55|    "recharts": "3.6.0",
56|    "sonner": "2.0.3",
57|    "swr": "2.3.8",
58|    "tailwind-merge": "3.2.0",
59|    "tailwindcss-animate": "1.0.7",
60|    "vaul": "1.1.2",
61|    "zod": "3.24.4"
62|  },
63|  "scripts": {
64|    "start": "craco start",
65|    "build": "craco build",
66|    "test": "craco test"
67|  },
68|  "browserslist": {
69|    "production": [
70|      ">0.2%",
71|      "not dead",
72|      "not op_mini all"
73|    ],
74|    "development": [
75|      "last 1 chrome version",
76|      "last 1 firefox version",
77|      "last 1 safari version"
78|    ]
79|  },
80|  "devDependencies": {
81|    "@babel/plugin-proposal-private-property-in-object": "7.21.11",
82|    "@craco/craco": "7.1.0",
83|    "@emergentbase/overlay": "https://assets.emergent.sh/npm/emergentbase-overlay-0.1.29.tgz",
84|    "@emergentbase/visual-edits": "https://assets.emergent.sh/npm/emergentbase-visual-edits-1.0.13.tgz",
85|    "@eslint/js": "9.23.0",
86|    "@types/lodash": "4.17.24",
87|    "autoprefixer": "10.4.20",
88|    "dotenv": "16.4.5",
89|    "eslint": "9.23.0",
90|    "eslint-plugin-import": "2.31.0",
91|    "eslint-plugin-jsx-a11y": "6.10.2",
92|    "eslint-plugin-react": "7.37.4",
93|    "eslint-plugin-react-hooks": "5.2.0",
94|    "globals": "15.15.0",
95|    "postcss": "8.5.10",
96|    "tailwindcss": "3.4.17"
97|  },
98|  "resolutions": {
99|    "react-router": "7.15.1",
100|    "node-forge": "1.4.0",
101|    "fast-uri": "3.1.2",
102|    "flatted": "3.4.2",
103|    "qs": "6.15.2",
104|    "diff": "4.0.4",
105|    "follow-redirects": "1.16.0",
106|    "path-to-regexp": "0.1.13",
107|    "rollup": "2.80.0",
108|    "underscore": "1.13.8",
109|    "@babel/plugin-transform-modules-systemjs": "7.29.4",
110|    "@eslint/plugin-kit": "0.3.4",
111|    "shell-quote": "1.9.0",
112|    "jsonpath": "1.3.0",
113|    "nth-check": "2.0.1",
114|    "serialize-javascript": "7.0.5",
115|    "uuid": "11.1.1",
116|    "@tootallnate/once": "2.0.1",
117|    "webpack-dev-server": "5.2.6",
118|    "resolve-url-loader": "5.0.0",
119|    "**/resolve-url-loader/postcss": "8.5.10",
120|    "**/axios/form-data": "4.0.6",
121|    "**/jsdom/form-data": "3.0.5",
122|    "**/postcss-svgo/svgo": "2.8.1",
123|    "**/webpack-dev-server/ws": "8.21.0",
124|    "**/postcss-load-config/yaml": "2.8.3",
125|    "**/cosmiconfig/yaml": "1.10.3",
126|    "**/cssnano/yaml": "1.10.3",
127|    "**/eslint/js-yaml": "4.3.0",
128|    "**/@eslint/eslintrc/js-yaml": "4.3.0",
129|    "**/svgo/js-yaml": "3.15.0",
130|    "**/@istanbuljs/load-nyc-config/js-yaml": "3.15.0",
131|    "**/css-loader/postcss": "8.5.10",
132|    "**/css-minimizer-webpack-plugin/postcss": "8.5.10",
133|    "**/react-scripts/postcss": "8.5.10",
134|    "**/filelist/minimatch": "5.1.8",
135|    "**/anymatch/picomatch": "2.3.2",
136|    "**/micromatch/picomatch": "2.3.2",
137|    "**/readdirp/picomatch": "2.3.2",
138|    "**/jest-util/picomatch": "2.3.2",
139|    "**/tinyglobby/picomatch": "4.0.4",
140|    "http-proxy-middleware": "2.0.10"
141|  },
142|  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
143|}
144|

===END

===FILE: /app/frontend/.env
/app/frontend/.env:
1|REACT_APP_BACKEND_URL=https://asset-care-system-7.preview.emergentagent.com
2|WDS_SOCKET_PORT=443
3|ENABLE_HEALTH_CHECK=false

===END

===FILE: /app/frontend/src/App.js
/app/frontend/src/App.js:
1|import { useEffect } from "react";
2|import "@/App.css";
3|import { BrowserRouter, Routes, Route } from "react-router-dom";
4|import axios from "axios";
5|import { HOME } from "@/constants/testIds";
6|
7|const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
8|const API = `${BACKEND_URL}/api`;
9|
10|const Home = () => {
11|  const helloWorldApi = async () => {
12|    try {
13|      const response = await axios.get(`${API}/`);
14|      console.log(response.data.message);
15|    } catch (e) {
16|      console.error(e, `errored out requesting / api`);
17|    }
18|  };
19|
20|  useEffect(() => {
21|    helloWorldApi();
22|  }, []);
23|
24|  return (
25|    // The marker attribute below lets the platform probe detect the stock splash — remove it with this page
26|    <div data-emergent-splash>
27|      <header className="App-header">
28|        <a
29|          data-testid={HOME.emergentLink}
30|          className="App-link"
31|          href="https://emergent.sh"
32|          target="_blank"
33|          rel="noopener noreferrer"
34|        >
35|          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" />
36|        </a>
37|        <p className="mt-5">Building something incredible ~!</p>
38|      </header>
39|    </div>
40|  );
41|};
42|
43|function App() {
44|  return (
45|    <div className="App">
46|      <BrowserRouter>
47|        <Routes>
48|          <Route path="/" element={<Home />}>
49|            <Route index element={<Home />} />
50|          </Route>
51|        </Routes>
52|      </BrowserRouter>
53|    </div>
54|  );
55|}
56|
57|export default App;
58|

===END

===FILE: /app/frontend/src/App.css
/app/frontend/src/App.css:
1|.App-logo {
2|    height: 40vmin;
3|    pointer-events: none;
4|}
5|
6|@media (prefers-reduced-motion: no-preference) {
7|    .App-logo {
8|        animation: App-logo-spin infinite 20s linear;
9|    }
10|}
11|
12|.App-header {
13|    background-color: #0f0f10;
14|    min-height: 100vh;
15|    display: flex;
16|    flex-direction: column;
17|    align-items: center;
18|    justify-content: center;
19|    font-size: calc(10px + 2vmin);
20|    color: white;
21|}
22|
23|.App-link {
24|    color: #61dafb;
25|}
26|
27|@keyframes App-logo-spin {
28|    from {
29|        transform: rotate(0deg);
30|    }
31|    to {
32|        transform: rotate(360deg);
33|    }
34|}
35|

===END

===FILE: /app/frontend/src/index.css
/app/frontend/src/index.css:
1|@tailwind base;
2|@tailwind components;
3|@tailwind utilities;
4|
5|body {
6|    margin: 0;
7|    font-family:
8|        -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
9|        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
10|        sans-serif;
11|    -webkit-font-smoothing: antialiased;
12|    -moz-osx-font-smoothing: grayscale;
13|}
14|
15|code {
16|    font-family:
17|        source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
18|}
19|
20|@layer base {
21|    :root {
22|        --background: 0 0% 100%;
23|        --foreground: 0 0% 3.9%;
24|        --card: 0 0% 100%;
25|        --card-foreground: 0 0% 3.9%;
26|        --popover: 0 0% 100%;
27|        --popover-foreground: 0 0% 3.9%;
28|        --primary: 0 0% 9%;
29|        --primary-foreground: 0 0% 98%;
30|        --secondary: 0 0% 96.1%;
31|        --secondary-foreground: 0 0% 9%;
32|        --muted: 0 0% 96.1%;
33|        --muted-foreground: 0 0% 45.1%;
34|        --accent: 0 0% 96.1%;
35|        --accent-foreground: 0 0% 9%;
36|        --destructive: 0 84.2% 60.2%;
37|        --destructive-foreground: 0 0% 98%;
38|        --border: 0 0% 89.8%;
39|        --input: 0 0% 89.8%;
40|        --ring: 0 0% 3.9%;
41|        --chart-1: 12 76% 61%;
42|        --chart-2: 173 58% 39%;
43|        --chart-3: 197 37% 24%;
44|        --chart-4: 43 74% 66%;
45|        --chart-5: 27 87% 67%;
46|        --radius: 0.5rem;
47|    }
48|    .dark {
49|        --background: 0 0% 3.9%;
50|        --foreground: 0 0% 98%;
51|        --card: 0 0% 3.9%;
52|        --card-foreground: 0 0% 98%;
53|        --popover: 0 0% 3.9%;
54|        --popover-foreground: 0 0% 98%;
55|        --primary: 0 0% 98%;
56|        --primary-foreground: 0 0% 9%;
57|        --secondary: 0 0% 14.9%;
58|        --secondary-foreground: 0 0% 98%;
59|        --muted: 0 0% 14.9%;
60|        --muted-foreground: 0 0% 63.9%;
61|        --accent: 0 0% 14.9%;
62|        --accent-foreground: 0 0% 98%;
63|        --destructive: 0 62.8% 30.6%;
64|        --destructive-foreground: 0 0% 98%;
65|        --border: 0 0% 14.9%;
66|        --input: 0 0% 14.9%;
67|        --ring: 0 0% 83.1%;
68|        --chart-1: 220 70% 50%;
69|        --chart-2: 160 60% 45%;
70|        --chart-3: 30 80% 55%;
71|        --chart-4: 280 65% 60%;
72|        --chart-5: 340 75% 55%;
73|    }
74|}
75|
76|@layer base {
77|    * {
78|        @apply border-border;
79|    }
80|    body {
81|        @apply bg-background text-foreground;
82|    }
83|}
84|
85|@layer base {
86|    [data-debug-wrapper="true"] {
87|        display: contents !important;
88|    }
89|
90|    [data-debug-wrapper="true"] > * {
91|        margin-left: inherit;
92|        margin-right: inherit;
93|        margin-top: inherit;
94|        margin-bottom: inherit;
95|        padding-left: inherit;
96|        padding-right: inherit;
97|        padding-top: inherit;
98|        padding-bottom: inherit;
99|        column-gap: inherit;
100|        row-gap: inherit;
101|        gap: inherit;
102|        border-left-width: inherit;
103|        border-right-width: inherit;
104|        border-top-width: inherit;
105|        border-bottom-width: inherit;
106|        border-left-style: inherit;
107|        border-right-style: inherit;
108|        border-top-style: inherit;
109|        border-bottom-style: inherit;
110|        border-left-color: inherit;
111|        border-right-color: inherit;
112|        border-top-color: inherit;
113|        border-bottom-color: inherit;
114|    }
115|}
116|

===END

===FILE: /app/frontend/src/index.js
/app/frontend/src/index.js:
1|import React from "react";
2|import ReactDOM from "react-dom/client";
3|import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
4|import "@/index.css";
5|import App from "@/App";
6|
7|const queryClient = new QueryClient({
8|  defaultOptions: {
9|    queries: {
10|      staleTime: 60_000,
11|      refetchOnWindowFocus: false,
12|    },
13|  },
14|});
15|
16|const root = ReactDOM.createRoot(document.getElementById("root"));
17|root.render(
18|  <React.StrictMode>
19|    <QueryClientProvider client={queryClient}>
20|      <App />
21|    </QueryClientProvider>
22|  </React.StrictMode>,
23|);
24|

===END

===FILE: /app/design_guidelines.json
/app/design_guidelines.json:
1|{
2|  "app_name": "Sistem Manajemen Aset & Perawatan Terpadu",
3|  "version": "1.0.0",
4|  "context": "Dashboards & Admin Panels (Asset Management & Maintenance CMMS)",
5|  "emotional_tone": "Precise, operational, high-contrast, robust, authoritative",
6|  "theme": "dark",
7|  "typography": {
8|    "heading_font": "Plus Jakarta Sans",
9|    "body_font": "Plus Jakarta Sans",
10|    "mono_font": "JetBrains Mono",
11|    "hierarchy": {
12|      "h1": "text-3xl sm:text-4xl lg:text-5xl tracking-tight font-extrabold",
13|      "h2": "text-2xl sm:text-3xl tracking-tight font-bold",
14|      "h3": "text-xl sm:text-2xl font-semibold",
15|      "h4": "text-lg sm:text-xl font-medium",
16|      "body": "text-sm sm:text-base font-normal leading-relaxed",
17|      "small": "text-xs sm:text-sm font-medium"
18|    }
19|  },
20|  "colors": {
21|    "archetype": "Swiss & High-Contrast (Authority, Clarity, Truth) adapted for Operations",
22|    "primary": "#2563EB",
23|    "primary_hover": "#1D4ED8",
24|    "background": "#090A0F",
25|    "surface": "#12141C",
26|    "surface_elevated": "#1A1D29",
27|    "border": "#2A2E3D",
28|    "text": "#F3F4F6",
29|    "text_muted": "#9CA3AF",
30|    "accent_success": "#10B981",
31|    "accent_warning": "#F59E0B",
32|    "accent_danger": "#EF4444",
33|    "accent_info": "#06B6D4"
34|  },
35|  "forbidden_colors": [
36|    "#1B93A4",
37|    "#7351B7"
38|  ],
39|  "forbidden_fonts": [
40|    "space grotesk",
41|    "inter",
42|    "roboto"
43|  ],
44|  "components_strategy": {
45|    "style": "Subtle roundness (max 6px border-radius), cardless or sharp borders, high data density",
46|    "shadcn_components": [
47|      "table",
48|      "dialog",
49|      "dropdown-menu",
50|      "tabs",
51|      "card",
52|      "select",
53|      "input",
54|      "button",
55|      "badge",
56|      "sonner",
57|      "calendar"
58|    ],
59|    "charts": "Recharts for analytics and asset/maintenance distribution"
60|  },
61|  "image_urls": {
62|    "dashboard_hero": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85",
63|    "maintenance_banner": "https://images.pexels.com/photos/37769419/pexels-photo-37769419.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
64|  },
65|  "api_documentation": [
66|    {
67|      "endpoint": "/api/v1/auth/login",
68|      "method": "POST",
69|      "description": "Authenticate admin user with username and password",
70|      "parameters": { "username": "string", "password": "string" },
71|      "response": { "token": "jwt_token", "user": { "username": "admin", "role": "Super Admin" } }
72|    },
73|    {
74|      "endpoint": "/api/v1/assets",
75|      "method": "GET/POST",
76|      "description": "Retrieve all assets with filtering or register a new asset (Kode, Nama, Kategori, Ruangan, Kondisi, Nilai, Tanggal Beli, Penanggung Jawab)",
77|      "response": "List of assets / Created asset object"
78|    },
79|    {
80|      "endpoint": "/api/v1/maintenance",
81|      "method": "GET/POST",
82|      "description": "Manage maintenance lifecycle: Permintaan -> Dijadwalkan -> Dilaksanakan -> Selesai -> Dibatalkan",
83|      "response": "List of maintenance logs / Created maintenance ticket"
84|    },
85|    {
86|      "endpoint": "/api/v1/master",
87|      "method": "GET/POST",
88|      "description": "Manage master data (kategori, ruangan, kondisi, penanggung_jawab)",
89|      "response": "Master data list / Updated item"
90|    },
91|    {
92|      "endpoint": "/api/v1/reports",
93|      "method": "GET",
94|      "description": "Generate detailed and recap reports aggregated by category, condition, room, or period",
95|      "response": "Report summary, detailed records, and statistics"
96|    },
97|    {
98|      "endpoint": "/api/v1/data/csv",
99|      "method": "GET/POST",
100|      "description": "Export database tables to CSV or import CSV data with validation",
101|      "response": "CSV file download / Import status summary"
102|    }
103|  ],
104|  "database_structure": {
105|    "tables": [
106|      {
107|        "name": "assets",
108|        "columns": [
109|          "id (PK)",
110|          "code (VARCHAR, Unique)",
111|          "name (VARCHAR)",
112|          "category_id (FK)",
113|          "room_id (FK)",
114|          "condition_id (FK)",
115|          "value (DECIMAL)",
116|          "purchase_date (DATE)",
117|          "pic_id (FK)",
118|          "created_at"
119|        ]
120|      },
121|      {
122|        "name": "maintenance_tickets",
123|        "columns": [
124|          "id (PK)",
125|          "asset_code (FK)",
126|          "request_date (DATE)",
127|          "status (ENUM: Permintaan, Dijadwalkan, Dilaksanakan, Selesai, Dibatalkan)",
128|          "scheduled_date (DATE)",
129|          "completion_date (DATE)",
130|          "cost (DECIMAL)",
131|          "technician (VARCHAR)",
132|          "notes (TEXT)"
133|        ]
134|      },
135|      {
136|        "name": "categories",
137|        "columns": ["id (PK)", "name (VARCHAR)", "description (TEXT)"]
138|      },
139|      {
140|        "name": "rooms",
141|        "columns": ["id (PK)", "code (VARCHAR)", "name (VARCHAR)", "building (VARCHAR)"]
142|      },
143|      {
144|        "name": "conditions",
145|        "columns": ["id (PK)", "name (VARCHAR)", "color_badge (VARCHAR)"]
146|      },
147|      {
148|        "name": "pic",
149|        "columns": ["id (PK)", "name (VARCHAR)", "department (VARCHAR)", "phone (VARCHAR)"]
150|      },
151|      {
152|        "name": "users",
153|        "columns": ["id (PK)", "username (VARCHAR)", "password_hash (VARCHAR)", "role (VARCHAR)"]
154|      }
155|    ],
156|    "navicat_connection_info": {
157|      "host": "localhost",
158|      "port": 5432,
159|      "database": "asset_maintenance_db",
160|      "driver": "PostgreSQL / MySQL compatible",
161|      "ssl": "Optional / Disabled for local Navicat client connection"
162|    }
163|  },
164|  "universal_guidelines": [
165|    "Always use data-testid on interactive elements for automated testing.",
166|    "Do not use transparent backgrounds on headers or sticky menus.",
167|    "Ensure high contrast text over all backgrounds.",
168|    "Provide CSV import and export capabilities.",
169|    "Support full maintenance lifecycle: Permintaan -> Dijadwalkan -> Dilaksanakan -> Selesai -> Dibatalkan."
170|  ]
171|}
172|

===END

===FILE: /app/memory/test_credentials.md
/app/memory/test_credentials.md:
1|# Test Credentials
2|# Agent writes here when creating/modifying auth credentials (admin accounts, test users).
3|# Testing agent reads this before auth tests. Fork/continuation agents read on startup.
4|

===END

===FILE: /app/frontend/tailwind.config.js
/app/frontend/tailwind.config.js:
1|/** @type {import('tailwindcss').Config} */
2|module.exports = {
3|    // `overline` is a Tailwind utility; without this an app's own eyebrow-label class draws a line above the text.
4|    blocklist: ["overline"],
5|    darkMode: ["class"],
6|    content: [
7|    "./src/**/*.{js,jsx,ts,tsx}",
8|    "./public/index.html"
9|  ],
10|  theme: {
11|    extend: {
12|      borderRadius: {
13|        lg: 'var(--radius)',
14|        md: 'calc(var(--radius) - 2px)',
15|        sm: 'calc(var(--radius) - 4px)'
16|      },
17|      colors: {
18|        background: 'hsl(var(--background))',
19|        foreground: 'hsl(var(--foreground))',
20|        card: {
21|          DEFAULT: 'hsl(var(--card))',
22|          foreground: 'hsl(var(--card-foreground))'
23|        },
24|        popover: {
25|          DEFAULT: 'hsl(var(--popover))',
26|          foreground: 'hsl(var(--popover-foreground))'
27|        },
28|        primary: {
29|          DEFAULT: 'hsl(var(--primary))',
30|          foreground: 'hsl(var(--primary-foreground))'
31|        },
32|        secondary: {
33|          DEFAULT: 'hsl(var(--secondary))',
34|          foreground: 'hsl(var(--secondary-foreground))'
35|        },
36|        muted: {
37|          DEFAULT: 'hsl(var(--muted))',
38|          foreground: 'hsl(var(--muted-foreground))'
39|        },
40|        accent: {
41|          DEFAULT: 'hsl(var(--accent))',
42|          foreground: 'hsl(var(--accent-foreground))'
43|        },
44|        destructive: {
45|          DEFAULT: 'hsl(var(--destructive))',
46|          foreground: 'hsl(var(--destructive-foreground))'
47|        },
48|        border: 'hsl(var(--border))',
49|        input: 'hsl(var(--input))',
50|        ring: 'hsl(var(--ring))',
51|        chart: {
52|          '1': 'hsl(var(--chart-1))',
53|          '2': 'hsl(var(--chart-2))',
54|          '3': 'hsl(var(--chart-3))',
55|          '4': 'hsl(var(--chart-4))',
56|          '5': 'hsl(var(--chart-5))'
57|        }
58|      },
59|      keyframes: {
60|        'accordion-down': {
61|          from: {
62|            height: '0'
63|          },
64|          to: {
65|            height: 'var(--radix-accordion-content-height)'
66|          }
67|        },
68|        'accordion-up': {
69|          from: {
70|            height: 'var(--radix-accordion-content-height)'
71|          },
72|          to: {
73|            height: '0'
74|          }
75|        }
76|      },
77|      animation: {
78|        'accordion-down': 'accordion-down 0.2s ease-out',
79|        'accordion-up': 'accordion-up 0.2s ease-out'
80|      }
81|    }
82|  },
83|  plugins: [require("tailwindcss-animate")],
84|};

===END