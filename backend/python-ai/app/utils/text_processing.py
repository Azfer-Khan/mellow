"""
Text processing utilities for Mellow AI Service
"""

from typing import List

def extract_common_topics(messages: List[str]) -> List[str]:
    """
    Extract common topics from conversation messages
    
    Args:
        messages: List of message strings to analyze
        
    Returns:
        List of top 5 most common topics
    """
    if not messages:
        return []
    
    # Simple keyword extraction
    common_words = {}
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", 
        "of", "with", "by", "i", "you", "we", "they", "he", "she", "it", 
        "is", "are", "was", "were", "be", "been", "have", "has", "had", 
        "do", "does", "did", "will", "would", "could", "should", "may", 
        "might", "can", "am", "this", "that", "these", "those"
    }
    
    for message in messages:
        words = message.lower().split()
        for word in words:
            # Clean word - keep only alphanumeric characters
            word = ''.join(c for c in word if c.isalnum())
            if len(word) > 3 and word not in stop_words:
                common_words[word] = common_words.get(word, 0) + 1
    
    # Return top 5 most common topics
    sorted_topics = sorted(common_words.items(), key=lambda x: x[1], reverse=True)
    return [topic[0] for topic in sorted_topics[:5]]

def detect_message_intent(message: str) -> dict:
    """
    Analyze a message to detect intent and emotional content
    
    Args:
        message: The user message to analyze
        
    Returns:
        Dictionary containing detected intents and emotions
    """
    message_lower = message.lower().strip()
    
    # Define keyword patterns
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    questions = ["how", "what", "when", "where", "why", "who"]
    emotions = ["sad", "happy", "angry", "frustrated", "excited", "worried", "anxious"]
    
    result = {
        "is_greeting": any(greeting in message_lower for greeting in greetings),
        "is_question": any(question in message_lower for question in questions),
        "detected_emotions": [emotion for emotion in emotions if emotion in message_lower],
        "message_length": len(message.split()),
        "is_short_response": len(message.split()) < 5
    }
    
    return result 