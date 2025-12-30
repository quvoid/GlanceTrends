# Sekilas Glance

**Sekilas Glance** is a modern, AI-powered trending news aggregator designed to combat information overload. By leveraging Google Trends and Reddit data, it delivers the most relevant stories in bite-sized, AI-generated summaries (Flashcards), allowing users to stay informed "at a glance."

Unlike passive news readers, Sekilas Glance is social. Connect with friends, share insights, and discuss what's trending—all within a unified, distraction-free interface.

## 🚀 Features

-   **Real-time Trending Trends**: Automatically aggregates trending topics from Google Trends and Reddit.
-   **AI Smart Summaries**: Uses **Google Gemini AI** to condense complex articles into quick 2-sentence summaries with sentiment analysis.
-   **Flashcards**: A TikTok-style or card-based interface for rapid consumption of news.
-   **Social Integration**:
    -   Add friends and see what they are reading.
    -   In-app messaging system to discuss news.
-   **Personalization**: Bookmark articles and track your reading history.
-   **Modern UI**: Built with responsive design, smooth animations, and a focus on readability.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Styling**: Vanilla CSS Modules (for custom performance/design), `framer-motion` (animations), `lucide-react` (icons)
-   **Backend**: Next.js API Routes (Serverless Node.js)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
-   **Authentication**: Custom JWT-based authentication using `jose` and `bcryptjs`
-   **AI & Data**:
    -   `@google/generative-ai` (Gemini Flash model)
    -   `puppeteer` & `cheerio` (Web scraping)
    -   `google-trends-api` (Trend data)

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB Atlas account or local MongoDB instance

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

    # AI Service
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any features or bug fixes.
