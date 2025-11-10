import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { generateChatResponse } from "../api/chat";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  type: 'conference' | 'journal' | 'workshop';
}

export interface Candidate {
  id: string;
  name: string;
  university: string;
  department: string;
  advisor: string;
  researchAreas: string[];
  publications: Publication[];
  totalCitations: number;
  hIndex: number;
  graduationYear: number;
  email: string;
  website?: string;
  radarData: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  rankingScore: number;
  analysis: {
    bio: string;
    researchSummary: string;
    scoreExplanation: {
      totalScore: number;
      breakdown: {
        citations: { score: number; explanation: string; };
        hIndex: { score: number; explanation: string; };
        publications: { score: number; explanation: string; };
        impact: { score: number; explanation: string; };
      };
    };
    keyStrengths: string[];
    potentialConcerns: string[];
  };
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface CandidateChatProps {
  candidate: Candidate;
}

const SUGGESTED_QUESTIONS = [
  "What are their main research areas?",
  "Are their publications in top-tier venues?",
  "Would they be a good fit for machine learning roles?",
  "How do their citation metrics compare?",
  "What makes them stand out as a candidate?"
];

export function CandidateChat({ candidate }: CandidateChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hi! I'm here to help you learn more about ${candidate.name}. Feel free to ask about their research, publications, or potential fit for your organization.`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageContent = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Convert messages to GPT format (including the user message we just added)
      const conversationMessages = updatedMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Generate response using GPT API
      const response = await generateChatResponse(conversationMessages, candidate);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="max-h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-600" />
          Ask about {candidate.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get insights about their research, publications, and potential fit
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Suggested Questions */}
        <div className="space-y-2 flex-shrink-0">
          <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-accent text-xs border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-700"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {message.content}
                </div>
                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="bg-slate-100 text-slate-900 rounded-lg px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span className="font-medium">Thinking...</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about their research, publications, fit..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}