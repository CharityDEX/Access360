from fastapi import FastAPI, Request
import base64
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import re
import requests
from langchain.prompts.chat import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from enum import Enum
from ultralytics import YOLO
import os
import cv2
import math
import time
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import io

model = YOLO("./best.pt")

app = FastAPI()

'''
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=allowed_regex, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
'''

OPENAI_API_KEY = ""
API_KEY = ""

class DisabilityType(Enum):
    MOBILITY = "MOBILITY"#, "Conditions affecting movement, balance, etc."
    VISUAL = "VISUAL"#, "Impairments related to sight."
    AUDITORY = "AUDITORY"#, "Hearing impairments."
    COGNITIVE = "COGNITIVE"#, "Difficulties with learning, memory, or processing."
    DEVELOPMENTAL = "DEVELOPMENTAL"#, "Conditions such as autism spectrum disorder."
    NEUROLOGICAL = "NEUROLOGICAL"#, "Disorders such as epilepsy or multiple sclerosis."
    MENTAL_HEALTH = "MENTAL_HEALTH"#, "Psychiatric conditions like depression or anxiety."
    SPEECH = "SPEECH"#, "Speech and communication impairments."

class ObservationSentiment(Enum):
    EGREGIOUS = "EGREGIOUS"#, "The violation is extreme and can not be tolerated."
    NEGATIVE = "NEGATIVE"#, "There has been a violation."
    POSITIVE = "POSITIVE"
    FANTASTIC = "FANTASTIC"#, "The criteria have been fulfilled or exceeded."
    NEUTRAL = "NEUTRAL"#, "You observe that there are no major failures or successes."

class AccessibilityObservation(BaseModel):
    """A positive or negative observation relating to a specific aspect of accessibility."""
    observation_name: str = Field(description="Concise name for this observation.")
    observation_sentiment: ObservationSentiment = Field(description="The sentiment of this observation. EGREGIOUS means there is a significant danger or violation. NEGATIVE means there is a minor problem. NEUTRAL means that the minimum possible requirement is upheld but barely. POSITIVE means the accessibility is upheld. FANTASTIC means there are advanced accessibility features.")
    associated_disability: List[DisabilityType] = Field(description="The disability(s) associated with this ranking.")
    explanation: str = Field(description="An explanation of your observation and evaluation.")
    feedback: str = Field(description="Provide some simple feedback for the restaurant owner on how they could improve the addressed area.")

class ObservationalReport(BaseModel):
    """The report of the accessibility of a building, consisting of multiple observations."""
    observations: List[AccessibilityObservation] = Field(description="Multiple observations regarding to different aspects of accessibility.")

observation_llm = ChatOpenAI(model_name="gpt-4o", openai_api_key=OPENAI_API_KEY, temperature=0).with_structured_output(ObservationalReport)

observation_system_prompt = """
    You are an accessibility building evaluation and classification assistant.
    Given an assortment of images displaying a specified building and its surroundings from different angles, please
    provide an accessibility report for the building. Use an observation-based approach, identifying 5 observations that relate
    to various aspects of accessibility, evaluating whether these aspects are FANTASTIC, POSITIVE, NEUTRAL, NEGATIVE or EGREGIOUS. 
    Support your 5 observations with explanations. Please try to make the overall sentiment of your observations reflect the overall accessiblity
    of the building.
"""

app.mount("/street_view_images", StaticFiles(directory="street_view_images"), name="street_view_images")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/ai")
async def ai(request: Request):
    print("  COOORS!!  ")
    data = await request.json()
    print(str(data))
    image_urls = generate_image_urls(data["address"])

    #print("IMAGE URLS: ", image_urls)

    #output = get_observations(image_urls, data["name"])
    #observations = output[0]
    #percentage = output[1]

    sys = SystemMessage(
        content=observation_system_prompt
    )

    message = HumanMessage(
    content=[
        {"type": "text", "text": f"Please evaluate the accessibility of the building: {data["name"]} from multiple angles as displayed in the following images."},
        {"type": "image_url", "image_url": {"url": image_urls[0]}},
        {"type": "image_url", "image_url": {"url": image_urls[1]}},
        {"type": "image_url", "image_url": {"url": image_urls[2]}},
        {"type": "image_url", "image_url": {"url": image_urls[3]}},
        {"type": "image_url", "image_url": {"url": image_urls[4]}},
        {"type": "image_url", "image_url": {"url": image_urls[5]}},
        {"type": "image_url", "image_url": {"url": image_urls[6]}},
        {"type": "image_url", "image_url": {"url": image_urls[7]}},
        {"type": "image_url", "image_url": {"url": image_urls[8]}},
        {"type": "image_url", "image_url": {"url": image_urls[9]}},
        {"type": "image_url", "image_url": {"url": image_urls[10]}},
        {"type": "image_url", "image_url": {"url": image_urls[11]}}
    ])

    result = observation_llm.invoke([sys, message])

    total_score = 0
    max_possible_score = len(result.observations) * 5
    for observation in result.observations:
        sentiment = observation.observation_sentiment
        total_score += get_score_from_enum(sentiment)
    
    percentage = (total_score / max_possible_score) * 100

    #scaled_percentage = (120 / math.pi) * math.atan((percentage - 80) / 10) + 80

    #scaled_percentage = max(0, min(scaled_percentage, 100))
    scaled_percentage = percentage

    return {"observations": result.observations, "percentage": scaled_percentage}

def get_score_from_enum(enum_value):
    switcher = {
        'FANTASTIC': 5,
        'POSITIVE': 4,
        'NEUTRAL': 3,
        'NEGATIVE': 2,
        'EGREGIOUS': 1
    }
    return switcher.get(enum_value.value, 0)

@app.post("/images")
async def images(request: Request):
    data = await request.json()
    print(str(data))

    image_urls = generate_image_urls(data["address"])

    file_paths = download_images(image_urls)

    resulting_paths = []

    results = []
    for file in file_paths:
        results = model.predict(file, save=True, conf=0.25)
        print("RESULTS " + str(results))
        
        image_path = file
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        for result in results:
            boxes = result.boxes.xyxy
            confidences = result.boxes.conf
            class_ids = result.boxes.cls.int()
            class_names = result.names

            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = map(int, box)
                confidence = confidences[i].item()
                class_id = class_ids[i].item()
                label = f"{class_names[class_id]}: {confidence:.2f}"

                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)

                cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        output_path = file.replace('.jpg', '') + f'-{int(time.time())}.jpg'
        resulting_paths.append(output_path)
        cv2.imwrite(output_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
        print(f"Saved image to: {output_path}")

    processed_images = []

    for o in resulting_paths:
        processed_images.append("http://44.246.144.147/" + o)

    print("PROCESSED IMAGES" + str(processed_images))

    return {"images": image_urls, "processed_images": processed_images}

def getLatLong(address, offset_ratio=0.02):

    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"
    response = requests.get(url)
    data = response.json()

    if data["status"] != "OK" or not data.get("results"):
        print(f"Error: {data['status']}")
        return None

    result = data["results"][0]
    location = result["geometry"]["location"]
    viewport = result["geometry"]["viewport"]

    viewport["southeast"] = {'lat': viewport["northeast"]["lat"], "lng": viewport["southwest"]["lng"]}
    viewport["northwest"] = {'lat': viewport["southwest"]["lat"], "lng": viewport["northeast"]["lng"]}

    lat, lng = location["lat"], location["lng"]

    delta_lat = (viewport["northeast"]["lat"] - viewport["southwest"]["lat"]) * offset_ratio
    delta_lng = (viewport["northeast"]["lng"] - viewport["southwest"]["lng"]) * offset_ratio

    survey_points = {
        "northeast": {"lat": lat + delta_lat, "lng": lng + delta_lng},
        "northwest": {"lat": lat + delta_lat, "lng": lng - delta_lng},
        "southeast": {"lat": lat - delta_lat, "lng": lng + delta_lng},
        "southwest": {"lat": lat - delta_lat, "lng": lng - delta_lng},
    }

    return survey_points

def get_street_view_image(lat, lng, heading, pitch=-10, fov=90, size='600x400'):
    base_url = "https://maps.googleapis.com/maps/api/streetview"

    params = {
        "size": size,
        "location": f"{lat},{lng}",
        "heading": heading,
        "pitch": pitch,
        "fov": fov,
        "key": API_KEY
    }

    response = requests.get(base_url, params=params)
    return response.url

def generate_image_urls(address):
  headings = {
    "northeast": [180, 225, 270],
    "northwest": [0, 315, 270],
    "southwest": [0, 45, 90],
    "southeast": [195, 150, 105],
  }

  survey_points = getLatLong(address)

  image_urls = []

  for direction, angles in headings.items():
      for angle in angles:
          lat = survey_points[direction]["lat"]
          lng = survey_points[direction]["lng"]

          url = get_street_view_image(lat, lng, angle)
          image_urls.append(url)

  return image_urls

def download_images(image_urls, save_directory="street_view_images"):
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    file_paths = []

    for i, url in enumerate(image_urls):
        response = requests.get(url)
        if response.status_code == 200:
            file_path = os.path.join(save_directory, f"image_{i+1}.jpg")
            file_paths.append(file_path)
            with open(file_path, "wb") as file:
                file.write(response.content)
            print(f"Downloaded: {file_path}")
        else:
            print(f"Failed to download image {i+1}")

    return file_paths