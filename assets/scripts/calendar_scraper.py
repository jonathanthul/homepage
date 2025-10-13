from bs4 import BeautifulSoup #type: ignore
import requests #type: ignore
import datetime
from dateutil.relativedelta import relativedelta #type: ignore
import json
import html

TODAY = datetime.datetime.now()

def venster99_scraper():
    url = "https://www.venster99.at/proxy.php"
    params = {
        "startDate": f'{TODAY.strftime("%Y")}-{TODAY.strftime("%m")}-01',
        "endDate": f'{int(TODAY.strftime("%Y"))+1}-{TODAY.strftime("%m")}-{TODAY.strftime("%d")}',
    }
    print(f"Scraping Venster99 events with startDate {params['startDate']} and endDate {params['endDate']}")
    r = requests.get(url, params=params)
    if r.status_code == 200:
        content = r.json()
        event_data = content["events"] #is type: list of dicts

        events = []
        ## extract relevant data, put it in an ics event object and store in list
        for id, event_dict in enumerate(event_data):
            event = {
                "id": id,
                "calendarId": "venster99",
                "title": event_dict["title"],
                "category": "time",
                "start": event_dict["start_dt"],
                "end": event_dict["end_dt"],
                "location": "Venster99",
                "body": event_dict["notes"],
                "color": "#ffffff", # text color of the event in the calendar
                "bgColor": "#0017e7",
                "borderColor": "#ab3722", # bullet/left border color of the event in the calendar
            }
            events.append(event)
        print(f"Successfully scraped Venster99 events.")
        return events
    else:
        print(f"venster99_scraper error: Unable to fetch data. Staus code: {r.status_code}")
        return None

def flex_scraper():
    url = "https://flex.at/events/monat/"
    # create url path extension for the current and coming three months
    month_paths = [f'{month.strftime("%Y")}-{month.strftime("%m")}/' for month in [TODAY + relativedelta(months=+n) for n in range(0,4)]]

    event_data = []

    print(f"Scraping Flex events using these month_paths: {month_paths}")

    #extract event json data for each of the months and collect it in event_data
    for path in month_paths:
        r = requests.get(url + path)
        if r.status_code == 200:
            soup = BeautifulSoup(r.content, "html.parser", from_encoding='utf-8') #parse html
            result = soup.find("script", {"type": "application/ld+json"}) #find this: "<script type="application/ld+json">"
            #unescape html characters in the result
            result_dict = json.loads(result.text) #loads the json string into a list of dicts
            event_data.extend(result_dict)
        if r.status_code == 404:
            print(f"flex_scraper: Status code 404 for {r.url}. Exiting loop.")
            break

    events = []
    for id, event_dict in enumerate(event_data):
        # initialize ics Event object and assign all relevant attributes
        # unescape html characters in the name and descirption text
        event = {
            "id": id,
            "calendarId": "flex",
            "title": html.unescape(event_dict["name"]),
            "category": "time",
            "start": event_dict["startDate"],
            "end": event_dict["endDate"],
            "location": "Flex",
            "body": html.unescape(event_dict["description"]),
            "color": "#ffffff", # text color of the event in the calendar
            "bgColor": "#0017e7",
            "borderColor": '#f9d34d',
        }
        events.append(event)
    print(f"Successfully scraped Flex events.")    
    return events

venster99_events = venster99_scraper()
flex_events = flex_scraper()

with open("data/events.json", "w", encoding="utf-8") as file:
    json.dump(venster99_events + flex_events, file) #type: ignore
    print("Wrote events to data/events.json")