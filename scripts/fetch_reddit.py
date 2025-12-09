import praw
import json
import sys

def get_reddit_trends(subreddit="india"):
    try:
        # Set up Reddit API client
        reddit = praw.Reddit(
            client_id='ZrROPP178ePREDk5NTcEDA',
            client_secret='AyP2_67pn5AMmDk6ZzOZwA7DFQhUQA',
            user_agent='trending_app'
        )
        
        # Fetch hot posts
        hot_posts = reddit.subreddit(subreddit).hot(limit=10)
        trending_keywords = [post.title for post in hot_posts]
        return trending_keywords
    except Exception as e:
        # Print error to stderr so it doesn't mess up JSON output
        print(f"Error fetching Reddit trends: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    trending_keywords = get_reddit_trends()
    # Output solely JSON for the Node.js process to consume
    print(json.dumps(trending_keywords))
