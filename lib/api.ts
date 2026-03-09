import { ChatResponse } from '@/types/rag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function askQuestion(question: string, token?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question }),
    });

    if (!response.ok) {
        let errorMessage = 'Failed to fetch response from AI Assistant';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {
            // If body is not JSON, use default message
        }
        throw new Error(errorMessage);
    }

    return response.json();
}
