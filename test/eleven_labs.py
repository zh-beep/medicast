from elevenlabs import ElevenLabs
import os

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

voices = client.voices.get_all()

for voice in voices:
    print(voice.name)
    print(voice.voice_id)
    print(voice.description)
    print(voice.gender)