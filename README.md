# Hack For Humanity #1 Winning Project (out of 335 contestants)

<img width="976" alt="6" src="https://github.com/user-attachments/assets/01641522-5179-41cc-b298-7c794470886b" />

Youtube - https://www.youtube.com/watch?v=F0i_yGHbRX0

Access360 is an AI-powered agent that transforms Google Maps imagery into real-time accessibility insights. By analyzing 360° views of public spaces, Access360 scores venues and provides actionable recommendations, empowering individuals with disabilities to confidently choose accessible locations.

Features
	•	Real-Time Accessibility Analysis: Leverages 360° images from Google Maps to evaluate venue accessibility.
	•	Actionable Recommendations: Provides detailed insights and suggestions to help users make informed decisions.
	•	Voice Input Integration: Enables hands-free interaction for a seamless user experience.
	•	Global Scalability: Designed to assess venues worldwide, ensuring inclusivity across diverse environments.

Technology Stack

Python, JavaScript, React, Next.js, Flask, FastAPI, Uvicorn, Pydantic, Google Cloud Platform, Amazon EC2, Vercel, Google Maps Street View API, OpenAI API, Langchain, YOLO (Ultralytics, OpenCV), Prisma, Git, GitHub, Stripe, voice input functionality, base64 encoding

Architecture
	•	Frontend: Developed with React and Next.js, Access360 offers a responsive and user-friendly interface.
	•	Backend: Built initially with Flask and later enhanced using FastAPI and Uvicorn, running on Amazon EC2 for robust image processing and API management.
	•	AI & Image Processing: Utilizes a custom-trained YOLO model (integrated via Ultralytics and OpenCV) to detect accessibility features, while OpenAI’s API (leveraged through Langchain) generates comprehensive reports.
	•	APIs & Data: Integrates with the Google Maps Street View API to retrieve high-quality images and geocode addresses.
	•	Database: Managed using Prisma to ensure efficient data handling.
	•	Deployment: Frontend hosted on Vercel and backend deployed on Amazon EC2, ensuring scalability and high performance.

Installation
	1.	Clone the Repository

git clone https://github.com/yourusername/access360.git


	2.	Install Backend Dependencies

cd access360/backend
pip install -r requirements.txt


	3.	Install Frontend Dependencies

cd ../frontend
npm install


	4.	Configure Environment Variables
	•	Create a .env file in both the backend and frontend directories.
	•	Add your API keys and configuration settings (e.g., Google Maps API key, OpenAI API key).
	5.	Run the Backend Server

uvicorn main:app --reload


	6.	Run the Frontend Development Server

npm run dev



Usage
	1.	Open your browser and navigate to http://localhost:3000.
	2.	Enter a venue address to generate a comprehensive 360° accessibility analysis.
	3.	View the accessibility score and detailed recommendations for the selected venue.

Deployment
	•	Backend: Deployed on Amazon EC2 using FastAPI and Uvicorn.
	•	Frontend: Hosted on Vercel.
	•	Version Control: Managed with Git and GitHub for efficient collaboration.

Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your enhancements or bug fixes.
