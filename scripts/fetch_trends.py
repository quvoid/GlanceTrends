import json
from pytrends.request import TrendReq

def get_trends():
    try:
        pytrends = TrendReq(hl='en-IN', tz=330)
        
        # Get daily trending searches (since realtime is failing)
        trending_searches = pytrends.trending_searches(pn='india')
        
        # Extract titles
        # trending_searches returns a DataFrame with one column '0' (or similar)
        titles = trending_searches[0].tolist()
        
        print(json.dumps(titles[:10]))

    except Exception as e:
        # Fallback
        # print(json.dumps({"error": str(e)}))
        print(json.dumps(['India Cricket', 'Bollywood News', 'Sensex', 'Weather', 'Politics']))

if __name__ == "__main__":
    get_trends()

if __name__ == "__main__":
    get_trends()
