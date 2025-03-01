from flask import Flask, render_template, jsonify, request, send_file
import requests
from datetime import datetime, timedelta
import json
import os
from groq import Groq
import boto3
import uuid
from elevenlabs import ElevenLabs

# Create a Flask application instance
app = Flask(__name__)

# Define the route for the homepage
@app.route('/')
def home():
    return "Hi Pranav. Welcome to medicast."

# Additional route example
@app.route('/about')
def about():
    return "This is the about page."

# Install with pip install firecrawl-py
from firecrawl import FirecrawlApp
from pydantic import BaseModel
from typing import Any, Optional, List

firecrawl_app = FirecrawlApp(api_key=os.getenv('FIRECRAWL_API_KEY'))


def fetch_recent_papers(url="https://medrxiv.org/collection/cardiovascular-medicine", count=3):
    """
    Fetch the most recent papers from a given URL using Firecrawl
    
    Args:
        url (str): URL to extract papers from
        count (int): Number of recent papers to extract
        
    Returns:
        dict: Extracted paper data including titles and DOIs
    """
    data = firecrawl_app.extract([url], {
        'prompt': f'Extract the title and doi for the {count} most recent papers.',
    })
    return data


def get_full_paper_text(paper_index=0):
    """
    Get the full text of a paper returned by fetch_recent_papers
    
    Args:
        paper_index (int): Index of paper to retrieve (default: 0 for first paper)
        
    Returns:
        dict: Full text of the paper with metadata
    """
    # Get recent papers
    papers_data = fetch_recent_papers()
    
    # Check if we have papers
    if not papers_data.get('success') or not papers_data.get('data') or not papers_data.get('data').get('papers'):
        return {"error": "No papers found"}
    
    papers = papers_data['data']['papers']
    
    # Ensure the paper index is valid
    if paper_index >= len(papers):
        return {"error": f"Paper index {paper_index} is out of range"}
    
    # Get the specified paper
    paper = papers[paper_index]
    
    # Get the DOI to construct the PDF URL
    doi = paper.get('doi')
    if not doi:
        return {"error": f"No DOI found for paper at index {paper_index}"}
    
    # Extract just the DOI part if it's a full URL
    if doi.startswith('https://doi.org/'):
        doi = doi.replace('https://doi.org/', '')
    
    # Construct the PDF URL
    pdf_url = f"https://www.medrxiv.org/content/{doi}.full.pdf"
    
    # Extract full text using Firecrawl with token limit
    full_text_data = firecrawl_app.extract([pdf_url], {
        'prompt': 'Extract the full text of this research paper. Exclude URL links and author names. Limit the extracted text to approximately 5500 tokens to ensure the total response is under 6000 tokens.',
    })
    
    return full_text_data


# API endpoint to fetch recent papers
@app.route('/papers')
def get_recent_papers():
    data = fetch_recent_papers()
    return jsonify(data)


# API endpoint to get full text of first paper
@app.route('/paper-full-text')
def paper_full_text_endpoint():
    data = get_full_paper_text()
    return jsonify(data)


# New API endpoint to get a specific paper with its full text
@app.route('/paper/<int:index>')
def get_paper_with_full_text(index=0):
    # Get recent papers
    papers_data = fetch_recent_papers()
    
    # Check if we have papers
    if not papers_data.get('success') or not papers_data.get('data') or not papers_data.get('data').get('papers'):
        return jsonify({"error": "No papers found"})
    
    papers = papers_data['data']['papers']
    
    # Ensure the paper index is valid
    if index >= len(papers):
        return jsonify({"error": f"Paper index {index} is out of range"})
    
    # Get the specified paper metadata
    paper = papers[index]
    
    # Get the full text
    full_text_data = get_full_paper_text(index)
    
    # Combine metadata and full text
    result = {
        "metadata": paper,
        "full_text": full_text_data
    }
    
    return jsonify(result)


def analyze_paper_with_groq(paper_text, prompt, model="llama-3.3-70b-versatile"):
    """
    Send paper text to Groq API for analysis
    
    Args:
        paper_text (str): The full text of the paper to analyze
        prompt (str): Instructions for what to do with the paper text
        model (str): The Groq model to use
        
    Returns:
        dict: Response from Groq containing analysis results
    """
    # Initialize Groq client with API key
    # Get API key from environment variable for security
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {"error": "GROQ_API_KEY environment variable not set"}
    
    client = Groq(api_key=groq_api_key)
    
    try:
        # Create the complete message for the model
        full_prompt = f"{prompt}:\n\n{paper_text}"
        
        # Call the Groq API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        
        # Return the response content
        return {
            "success": True,
            "analysis": response.choices[0].message.content,
            "model_used": model
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# API endpoint to analyze a paper with Groq
@app.route('/analyze-paper/<int:index>')
def analyze_paper_endpoint(index=0):
    # Get full text data from the specified paper
    full_text_data = get_full_paper_text(index)
    
    # Check if there was an error getting the paper
    if full_text_data.get("error"):
        return jsonify(full_text_data)
    
    # Extract the actual paper text from the response
    if full_text_data.get("success") and full_text_data.get("data"):
        # The Firecrawl response likely has the extracted text in a different key
        # Based on the fetch_recent_papers response structure, we need to check the correct path
        paper_text = full_text_data["data"].get("extractedText", "")  # Try a more likely key name
        
        # If the above key doesn't exist, try to find text in the response
        if not paper_text:
            # For debugging, let's include all available keys in the error
            available_keys = list(full_text_data["data"].keys())
            return jsonify({"error": f"Could not find paper text. Available keys: {available_keys}"})
        
        # Analyze the paper with Groq
        prompt = """Summarize this medical research paper and 
        it should be max 250 words and the intended audience is 
        physicians and they will be 
        listening to this summary on a podcast."""
        analysis = analyze_paper_with_groq(paper_text, prompt)
        return jsonify(analysis)

    return jsonify({"error": "Failed to extract paper text"})

@app.route('/podcast-summaries', methods=['GET'])
def get_podcast_summaries():
    """
    API endpoint that fetches the latest papers, retrieves their full text,
    and generates a podcast-style transcript using Groq.
    
    Returns:
        JSON response with individual summaries and a complete podcast transcript
    """
    # Get recent papers
    papers_data = fetch_recent_papers()
    
    # Check if we have papers
    if not papers_data.get('success') or not papers_data.get('data') or not papers_data.get('data').get('papers'):
        return jsonify({"error": "No papers found"})
    
    papers = papers_data['data']['papers']
    summaries = []
    
    # Process each paper
    for index, paper in enumerate(papers):
        # Get the full text for this paper
        full_text_data = get_full_paper_text(index)
        
        # Check if there was an error getting the paper
        if full_text_data.get("error"):
            summaries.append({
                "paper": paper,
                "error": full_text_data.get("error")
            })
            continue
            
        # Extract the paper text
        if full_text_data.get("success") and full_text_data.get("data"):
            paper_text = full_text_data["data"].get("extractedText", "")
            
            if not paper_text:
                summaries.append({
                    "paper": paper,
                    "error": "Could not find paper text"
                })
                continue
                
            # Generate podcast summary with Groq
            prompt = """Create a concise, engaging summary of this medical research paper.
            Target length is 200-250 words. Focus on key findings, clinical implications, 
            and what makes this research noteworthy."""
            
            analysis = analyze_paper_with_groq(paper_text, prompt, model="llama-3.3-70b-versatile")
            
            # Add to summaries
            summaries.append({
                "paper": paper,
                "summary": analysis
            })
    
    # Now create a complete podcast transcript from the summaries
    podcast_prompt = f"""
    Create an engaging podcast transcript that discusses the following medical research papers.
    The podcast should have:
    1. A warm welcome and introduction
    2. Discussion of each paper with smooth transitions between topics
    3. A brief conclusion with takeaways
    
    The podcast is aimed at medical professionals who want to stay updated on recent research.
    Include only one host named Dr. Varanasi who has a conversational style.
    
    Here are the papers to discuss:
    """
    
    # Build the papers section properly
    for i, s in enumerate(summaries):
        paper_title = s.get('paper', {}).get('title', 'Unknown Title')
        paper_authors = s.get('paper', {}).get('authors', 'Unknown Authors')
        paper_summary = ""
        if isinstance(s.get('summary'), dict) and 'analysis' in s.get('summary', {}):
            paper_summary = s.get('summary', {}).get('analysis', 'No summary available')
        else:
            paper_summary = "No summary available"
            
        podcast_prompt += f"\nPAPER {i+1}: {paper_title}\nAUTHORS: {paper_authors}\nSUMMARY: {paper_summary}\n\n"
    
    # Generate the podcast transcript
    podcast_transcript = analyze_paper_with_groq(podcast_prompt, "", model="llama-3.3-70b-versatile")
    
    return jsonify({
        "success": True,
        "individual_summaries": summaries,
        "podcast_transcript": podcast_transcript
    })

@app.route('/local-paper-text')
def get_local_paper_text():
    """
    API endpoint that loads papers from a local JSON file
    and gets the full text for the first paper.
    
    Returns:
        JSON response with the full text of the first paper
    """
    # Load papers from the local JSON file
    try:
        with open('paper_list.json', 'r') as file:
            papers_data = json.load(file)
    except Exception as e:
        return jsonify({"error": f"Failed to load paper_list.json: {str(e)}"})
    
    # Check if we have papers
    if not papers_data.get('success') or not papers_data.get('data') or not papers_data.get('data').get('papers'):
        return jsonify({"error": "No papers found in paper_list.json"})
    
    papers = papers_data['data']['papers']
    
    # Make sure there's at least one paper
    if not papers:
        return jsonify({"error": "No papers available in paper_list.json"})
    
    # Get the first paper
    paper = papers[0]
    
    # Get the DOI to construct the PDF URL
    doi = paper.get('doi')
    if not doi:
        return jsonify({"error": "No DOI found for the first paper"})
    
    # Extract just the DOI part if it's a full URL
    if doi.startswith('https://doi.org/'):
        doi = doi.replace('https://doi.org/', '')
    
    # Construct the PDF URL
    pdf_url = f"https://www.medrxiv.org/content/{doi}.full.pdf"
    
    # Extract full text using Firecrawl with token limit
    try:
        full_text_data = firecrawl_app.extract([pdf_url], {
            'prompt': 'Extract the full text of this research paper. Exclude URL links and author names. Limit the extracted text to approximately 5500 tokens to ensure the total response is under 6000 tokens.',
        })
        
        return jsonify({
            "success": True,
            "paper_title": paper.get('title', 'Unknown Title'),
            "paper_doi": doi,
            "full_text": full_text_data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to extract paper text: {str(e)}"
        })

@app.route('/summarize-local-papers')
def summarize_local_papers():
    """
    API endpoint that loads paper1.json, paper2.json, and paper3.json from the papers folder,
    first generates individual summaries for each paper, then creates a cohesive podcast transcript
    using these summaries.
    
    Returns:
        JSON response with individual summaries and combined podcast transcript
    """
    paper_files = ['paper1.json', 'paper2.json', 'paper3.json']
    individual_summaries = []
    paper_metadata = []
    
    # Process each paper file to generate individual summaries
    for paper_file in paper_files:
        # Construct full path to paper file
        paper_path = os.path.join('papers', paper_file)
        
        # Check if file exists
        if not os.path.exists(paper_path):
            return jsonify({
                "success": False,
                "error": f"Paper file '{paper_file}' not found in papers folder"
            })
        
        try:
            # Load paper content from file
            with open(paper_path, 'r') as file:
                paper_content = file.read().strip()
                
            # Check if paper has content
            if not paper_content:
                return jsonify({
                    "success": False,
                    "error": f"Paper file '{paper_file}' is empty"
                })
            
            # Parse JSON to extract paper metadata if available
            try:
                paper_data = json.loads(paper_content)
                metadata = paper_data.get('metadata', {})
                paper_metadata.append(metadata)
            except json.JSONDecodeError:
                # If not valid JSON, just use filename as metadata
                paper_metadata.append({"title": paper_file})
            
            # Generate individual summary for this paper
            paper_prompt = """Create a concise, engaging summary of this medical research paper.
            Target length is 150-200 words. Focus on key findings, clinical implications, 
            and what makes this research noteworthy. Structure it for a podcast audience 
            of medical professionals."""
            
            paper_summary = analyze_paper_with_groq(paper_content, paper_prompt)
            
            # Add paper summary to our collection
            individual_summaries.append({
                "paper_file": paper_file,
                "metadata": paper_metadata[-1],
                "summary": paper_summary
            })
                
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error processing {paper_file}: {str(e)}"
            })
    
    # Build the podcast prompt using the individual summaries
    podcast_prompt = """
    Create an engaging podcast transcript that discusses the following medical research papers.
    The podcast should have:
    1. A warm welcome and introduction
    2. Discussion of each paper with smooth transitions between topics
    3. A brief conclusion with takeaways
    
    The podcast is aimed at medical professionals who want to stay updated on recent research.
    Include only one host named Dr. Varanasi who has a conversational style.
    
    Here are the papers to discuss:
    """
    
    # Add each paper's summary to the podcast prompt
    for i, summary in enumerate(individual_summaries):
        paper_title = summary.get('metadata', {}).get('title', f'Paper {i+1}')
        paper_summary = ""
        
        if isinstance(summary.get('summary'), dict) and 'analysis' in summary.get('summary', {}):
            paper_summary = summary.get('summary', {}).get('analysis', 'No summary available')
        else:
            paper_summary = "No summary available"
            
        podcast_prompt += f"\nPAPER {i+1}: {paper_title}\nSUMMARY: {paper_summary}\n\n"
    
    # Generate the final podcast transcript
    podcast_transcript = analyze_paper_with_groq(podcast_prompt, "")
    
    # Save individual summaries to files in the summaries folder
    os.makedirs('summaries', exist_ok=True)
    for i, summary in enumerate(individual_summaries):
        summary_file = os.path.join('summaries', f'paper{i+1}.json')
        with open(summary_file, 'w') as f:
            json.dump({
                "filename": f'paper{i+1}.json',
                "success": True,
                "summary": summary['summary']
            }, f, indent=2)
    
    return jsonify({
        "success": True,
        "files_processed": paper_files,
        # "individual_summaries": individual_summaries,
        "podcast_transcript": podcast_transcript
    })

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

def upload_to_s3(file_data, file_name, content_type='audio/mpeg'):
    """
    Upload a file to S3 bucket
    
    Args:
        file_data (bytes): The file data to upload
        file_name (str): The name to give the file in S3
        content_type (str): The content type of the file
        
    Returns:
        str: The URL of the uploaded file
    """
    try:
        bucket_name = os.getenv('S3_BUCKET_NAME')
        
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=file_data,
            ContentType=content_type
        )
        
        # Generate the URL
        url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file_name}"
        return url
        
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        raise

@app.route('/generate-podcast', methods=['POST'])
def generate_podcast():
    """
    Generate a new podcast based on the provided parameters
    """
    try:
        data = request.get_json()
        specialty = data.get('specialty')
        duration = data.get('duration')
        frequency = data.get('frequency')

        if not specialty or not duration:
            return jsonify({
                "success": False,
                "error": "Missing required parameters"
            }), 400

        # Get recent papers for the specialty
        papers_data = fetch_recent_papers()
        
        if not papers_data.get('success'):
            return jsonify({
                "success": False,
                "error": "Failed to fetch papers"
            }), 500

        # Generate podcast transcript
        podcast_prompt = f"""
        Create an engaging {duration}-minute podcast transcript about recent developments in {specialty}.
        The podcast should have:
        1. A warm welcome and introduction
        2. Discussion of each paper with smooth transitions between topics
        3. A brief conclusion with takeaways
        
        The podcast is aimed at medical professionals who want to stay updated on recent research.
        Include only one host named Dr. Varanasi who has a conversational style.
        """

        # Generate transcript using Groq
        transcript = analyze_paper_with_groq(podcast_prompt, "")
        
        if not transcript.get('success'):
            return jsonify({
                "success": False,
                "error": "Failed to generate transcript"
            }), 500

        try:
            # Initialize ElevenLabs client
            eleven_api_key = os.getenv("ELEVENLABS_API_KEY")
            
            if not eleven_api_key:
                return jsonify({
                    "success": False,
                    "error": "ELEVENLABS_API_KEY environment variable not set"
                }), 500
            
            eleven = ElevenLabs(api_key=eleven_api_key)
            
            # Generate a unique file name
            podcast_id = str(uuid.uuid4())
            file_name = f"podcasts/{podcast_id}.mp3"
            
            # Generate audio from text
            audio_generator = eleven.generate(
                text=transcript['analysis'],
                voice="ErXwobaYiN019PkySvjV",  # Antoni voice
                model="eleven_turbo_v2"
            )
            
            # Collect all audio chunks
            audio_chunks = bytearray()
            for chunk in audio_generator:
                audio_chunks.extend(chunk)
            
            # Upload to S3
            audio_url = upload_to_s3(audio_chunks, file_name)
            
            return jsonify({
                "success": True,
                "podcastId": podcast_id,
                "audioUrl": audio_url,
                "transcript": transcript['analysis']
            })
            
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error generating audio: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/podcast/<podcast_id>')
def get_podcast(podcast_id):
    """
    Get the S3 URL for the podcast
    """
    try:
        file_name = f"podcasts/{podcast_id}.mp3"
        bucket_name = os.getenv('S3_BUCKET_NAME')
        
        # Check if file exists in S3
        try:
            s3_client.head_object(Bucket=bucket_name, Key=file_name)
        except:
            return jsonify({
                "success": False,
                "error": "Podcast not found"
            }), 404
        
        # Generate the URL
        audio_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file_name}"
        
        return jsonify({
            "success": True,
            "audioUrl": audio_url
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Run the application
if __name__ == '__main__':
    # Run on localhost (127.0.0.1) on port 5000 with debug mode enabled
    app.run(host='127.0.0.1', port=5000, debug=True)
