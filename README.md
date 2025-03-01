# MediCast

MediCast is a full-stack application that generates AI-powered medical podcasts for healthcare professionals. It uses advanced AI models to create engaging, informative content about recent medical research papers.

## Features

- 🎙️ AI-generated medical podcasts based on specialty
- 📱 Mobile app for easy podcast generation and listening
- 🔍 Automatic research paper sourcing from medical journals
- 🗣️ Natural-sounding voice synthesis
- 📅 Customizable podcast duration and frequency
- 📲 Push notifications for new podcast alerts
- ☁️ Cloud storage with AWS S3

## Tech Stack

### Backend (Flask)
- Flask web server
- Groq AI for text generation
- ElevenLabs for voice synthesis
- Firecrawl for research paper extraction
- AWS S3 for audio storage

### Mobile App (React Native/Expo)
- React Native with Expo
- TypeScript
- Custom UI components
- Push notifications

## Setup Instructions

### AWS S3 Setup

1. Create an AWS account if you don't have one
2. Create a new S3 bucket:
   - Go to AWS Console > S3
   - Click "Create bucket"
   - Choose a unique bucket name
   - Select your preferred region
   - Enable public access (for podcast streaming)
   - Add the following bucket policy (replace `your-bucket-name`):
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Sid": "PublicRead",
                 "Effect": "Allow",
                 "Principal": "*",
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::your-bucket-name/podcasts/*"
             }
         ]
     }
     ```

3. Create an IAM user for API access:
   - Go to AWS Console > IAM
   - Create a new user
   - Attach the `AmazonS3FullAccess` policy
   - Save the Access Key ID and Secret Access Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd medicalpod
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. Fill in your API keys in the `.env` file:
   - FIRECRAWL_API_KEY: Get from [Firecrawl](https://firecrawl.com)
   - GROQ_API_KEY: Get from [Groq](https://groq.com)
   - ELEVENLABS_API_KEY: Get from [ElevenLabs](https://elevenlabs.io)
   - AWS_ACCESS_KEY_ID: From your IAM user
   - AWS_SECRET_ACCESS_KEY: From your IAM user
   - AWS_REGION: Your S3 bucket region
   - S3_BUCKET_NAME: Your S3 bucket name

6. Start the Flask server:
   ```bash
   python app.py
   ```

### Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd medicalpod/medicast_phone
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file:
   ```bash
   echo "EXPO_PUBLIC_API_URL=http://localhost:5000" > .env
   ```

4. Start the Expo development server:
   ```bash
   yarn start
   ```

## Usage

1. Open the mobile app and select a medical specialty or type a custom one
2. Choose the desired podcast duration (5-15 minutes)
3. Set your preferred podcast frequency
4. Tap "Generate Podcast" to create a new episode
5. Once generated, find your podcast in the Player tab
6. Enable notifications to get alerts when new podcasts are ready

## API Endpoints

- `POST /generate-podcast`: Generate a new podcast
  ```json
  {
    "specialty": "Cardiology",
    "duration": 10,
    "frequency": "daily"
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "podcastId": "uuid",
    "audioUrl": "https://your-bucket.s3.region.amazonaws.com/podcasts/uuid.mp3",
    "transcript": "..."
  }
  ```

- `GET /podcast/<podcast_id>`: Get the podcast URL
  Response:
  ```json
  {
    "success": true,
    "audioUrl": "https://your-bucket.s3.region.amazonaws.com/podcasts/podcast_id.mp3"
  }
  ```

## Development

- Backend code is in the `medicalpod` directory
- Mobile app code is in `medicalpod/medicast_phone`
- Generated audio files are stored in AWS S3 under the `podcasts/` prefix

## Security Notes

- Never commit the `.env` file
- Keep API keys secure and rotate them regularly
- Ensure S3 bucket permissions are properly configured
- Use IAM roles and policies with minimal required permissions

## License

[Add your license information here]

Note: Never commit your `.env` file to version control. It's already added to `.gitignore`.