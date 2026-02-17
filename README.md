# Sekilas Glance

**Sekilas Glance** is a cutting-edge, AI-powered news aggregator that transforms how you consume information. By combining real-time trend analysis with advanced LLM summarization, it delivers concise, high-impact "Flashcards" and personalized briefings to combat information overload.

But it's not just a reader—it's a social experience. See what your friends are reading, discuss trends, and stay accountable with our unique "Disappointed Dad" anti-doomscrolling mode.

## 🚀 Key Features

### 🧠 Hybrid AI Intelligence
-   **Instant Summaries**: Powered by **Groq (Llama 3)** for lightning-fast, 2-sentence summaries of any article.
-   **Deep Briefings**: Uses **Google Gemini 2.0 Flash** to synthesize multiple sources into cohesive Morning and Evening Briefings.
-   **Sentiment Analysis**: Automatically gauges the mood of every story (Positive, Neutral, Negative).

### 🕷️ Deep Research Scraping
-   **Firecrawl Integration**: Utilizes advanced web scraping to fetch full article content, not just headlines.
-   **Smart Fallback System**: Seamlessly switches between Firecrawl, Google News RSS, and custom Puppeteer scripts to ensure 99.9% data availability.
-   **Anti-Clickbait**: Analysis of full article content ensures summaries reflect the *actual* story, not misleading titles.

### 📱 Modern User Experience
-   **Flashcards**: A TikTok-style, swipeable interface for rapid news consumption.
-   **Personalized Briefings**: A "Morning Coffee" and "Evening Wrap" digest waiting for you every day.
-   **Social Graph**: Follow friends, view their reading history, and share insights directly in-app.
-   **Disappointed Dad Mode**: An AI personality that gently (or not so gently) judges your doomscrolling habits to help you stay productive.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Framer Motion](https://www.framer.com/motion/)
-   **AI & LLM**: 
    -   [Groq SDK](https://groq.com/) (Llama 3-70b)
    -   [Google Generative AI](https://ai.google.dev/) (Gemini 2.0 Flash)
-   **Data & Scraping**:
    -   [Firecrawl](https://www.firecrawl.dev/) (Deep web scraping)
    -   `puppeteer` & `@mozilla/readability` (Custom scraping logic)
    -   `google-trends-api` (Real-time trend discovery)
-   **Backend**: Next.js API Routes (Serverless Node.js)
-   **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose
-   **Authentication**: Custom JWT-based auth with `jose` and `bcryptjs`

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB Atlas account or local MongoDB instance
-   API Keys for **Groq**, **Google Gemini**, and **Firecrawl**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/trending_news_steal.git
    cd trending_news_steal
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add the following keys:

    ```env
    # Database
    DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/trending_news

    # Authentication
    JWT_SECRET=your_super_secret_jwt_key

    # AI Services
    GEMINI_API_KEY=your_google_gemini_api_key
    GROQ_API_KEY=your_groq_api_key

    # Scraping Service
    FIRECRAWL_API_KEY=your_firecrawl_api_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any features or bug fixes.
