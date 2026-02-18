import PyPDF2
import docx
import markdown
import requests
import re
from werkzeug.datastructures import FileStorage

def parse_file(file: FileStorage) -> str:
    """Parse uploaded file and extract text"""
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        return parse_pdf(file)
    elif filename.endswith('.docx'):
        return parse_docx(file)
    elif filename.endswith('.md'):
        return parse_markdown(file)
    elif filename.endswith('.txt'):
        return file.read().decode('utf-8')
    elif filename.endswith(('.py', '.js', '.java', '.cpp', '.html', '.css', '.tsx', '.jsx')):
        return file.read().decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {filename}")

def parse_pdf(file: FileStorage) -> str:
    """Extract text from PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        page_count = 0
        max_pages = 10  # Only process first 10 pages
        
        for page in pdf_reader.pages:
            if page_count >= max_pages:
                text += "\n\n[Remaining pages truncated - only first 10 pages processed]"
                break
            
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            page_count += 1
        
        # Validate extracted text
        text = text.strip()
        if not text:
            raise ValueError("PDF appears to be empty or contains only images")
        
        # AGGRESSIVE limit - only 15,000 chars
        max_chars = 15000
        if len(text) > max_chars:
            text = text[:max_chars] + "\n\n[Content truncated to fit API limits]"
        
        print(f"PDF parsed: {len(text)} characters, {len(text.split())} words")
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

def parse_docx(file: FileStorage) -> str:
    """Extract text from DOCX"""
    try:
        doc = docx.Document(file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")

def parse_markdown(file: FileStorage) -> str:
    """Parse markdown file"""
    try:
        md_text = file.read().decode('utf-8')
        # Convert to plain text (remove markdown syntax)
        html = markdown.markdown(md_text)
        # Simple HTML tag removal
        text = re.sub('<[^<]+?>', '', html)
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse Markdown: {str(e)}")

def fetch_github_repo(url: str) -> dict:
    """Fetch GitHub repository information"""
    try:
        # Extract owner and repo from URL
        # Example: https://github.com/owner/repo
        match = re.match(r'https?://github\.com/([^/]+)/([^/]+)', url)
        if not match:
            raise ValueError("Invalid GitHub URL format")
        
        owner, repo = match.groups()
        repo = repo.replace('.git', '')
        
        # Fetch README
        readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        headers = {'Accept': 'application/vnd.github.v3.raw'}
        
        readme_response = requests.get(readme_url, headers=headers)
        readme_text = ""
        
        if readme_response.status_code == 200:
            readme_text = readme_response.text
        
        # Fetch languages
        languages_url = f"https://api.github.com/repos/{owner}/{repo}/languages"
        languages_response = requests.get(languages_url)
        languages = []
        
        if languages_response.status_code == 200:
            languages = list(languages_response.json().keys())
        
        return {
            'readme': readme_text,
            'languages': languages
        }
        
    except Exception as e:
        raise ValueError(f"Failed to fetch GitHub repo: {str(e)}")
