import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  type: 'conference' | 'journal' | 'workshop';
}

interface Candidate {
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

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Research areas questions
    if (lowerQuestion.includes('research') || lowerQuestion.includes('area') || lowerQuestion.includes('focus')) {
      return `${candidate.name}'s research primarily focuses on ${candidate.researchAreas.join(', ')}. ${candidate.analysis.researchSummary}`;
    }
    
    // Publication quality questions
    if (lowerQuestion.includes('publication') || lowerQuestion.includes('venue') || lowerQuestion.includes('conference') || lowerQuestion.includes('journal')) {
      const topPub = candidate.publications.reduce((prev, current) => 
        (prev.citations > current.citations) ? prev : current
      );
      const venues = candidate.publications.map(p => p.venue);
      const conferenceCount = candidate.publications.filter(p => p.type === 'conference').length;
      const journalCount = candidate.publications.filter(p => p.type === 'journal').length;
      
      return `${candidate.name} has published ${candidate.publications.length} papers (${conferenceCount} conference, ${journalCount} journal). Their most cited work "${topPub.title}" has ${topPub.citations} citations and was published in ${topPub.venue}. They've published in venues like ${venues.slice(0, 3).join(', ')}, indicating strong publication quality.`;
    }
    
    // Machine Learning fit questions
    if (lowerQuestion.includes('machine learning') || lowerQuestion.includes('ml') || lowerQuestion.includes('ai')) {
      const mlMatch = candidate.researchAreas.some(area => 
        area.toLowerCase().includes('machine learning') || 
        area.toLowerCase().includes('artificial intelligence') ||
        area.toLowerCase().includes('deep learning')
      );
      
      if (mlMatch) {
        return `Yes, ${candidate.name} would be an excellent fit for ML roles! They have direct experience in ${candidate.researchAreas.filter(area => 
          area.toLowerCase().includes('machine') || 
          area.toLowerCase().includes('learning') || 
          area.toLowerCase().includes('ai')
        ).join(', ')}. Their ranking score of ${candidate.rankingScore}/100 reflects strong technical capabilities.`;
      } else {
        return `While ${candidate.name}'s primary focus is on ${candidate.researchAreas[0]}, they may still be suitable for ML roles depending on the specific requirements. Their technical background in ${candidate.researchAreas.join(', ')} could bring valuable interdisciplinary perspectives to ML teams.`;
      }
    }
    
    // Citation/metrics questions
    if (lowerQuestion.includes('citation') || lowerQuestion.includes('metric') || lowerQuestion.includes('impact') || lowerQuestion.includes('h-index')) {
      const avgCitations = Math.round(candidate.totalCitations / candidate.publications.length);
      return `${candidate.name} has strong research metrics: ${candidate.totalCitations} total citations (${avgCitations} avg per paper), h-index of ${candidate.hIndex}. ${candidate.analysis.scoreExplanation.breakdown.citations.explanation} This places them in the ${candidate.rankingScore >= 85 ? 'top tier' : candidate.rankingScore >= 70 ? 'strong' : 'solid'} category of PhD graduates.`;
    }
    
    // Strengths/standout questions
    if (lowerQuestion.includes('stand out') || lowerQuestion.includes('strength') || lowerQuestion.includes('special') || lowerQuestion.includes('unique')) {
      const topStrengths = candidate.analysis.keyStrengths.slice(0, 3);
      return `${candidate.name} stands out for several reasons: ${topStrengths.join('; ')}. With a ranking score of ${candidate.rankingScore}/100, they demonstrate ${candidate.rankingScore >= 90 ? 'exceptional' : candidate.rankingScore >= 80 ? 'strong' : 'solid'} research capabilities and potential.`;
    }
    
    // Hiring fit questions
    if (lowerQuestion.includes('hire') || lowerQuestion.includes('recruit') || lowerQuestion.includes('fit') || lowerQuestion.includes('suitable')) {
      const strengths = candidate.analysis.keyStrengths.slice(0, 2).join(' and ');
      const concerns = candidate.analysis.potentialConcerns.length > 0 
        ? ` However, consider that ${candidate.analysis.potentialConcerns[0].toLowerCase()}.`
        : '';
      
      return `${candidate.name} could be a strong hire based on their ${strengths.toLowerCase()}. They bring expertise in ${candidate.researchAreas.slice(0, 2).join(' and ')} with a solid publication record.${concerns} I'd recommend discussing specific role requirements to assess the best fit.`;
    }
    
    // Default response
    return `That's an interesting question about ${candidate.name}. Based on their profile, they have expertise in ${candidate.researchAreas.join(', ')}, with ${candidate.publications.length} publications and ${candidate.totalCitations} citations. Their ranking score is ${candidate.rankingScore}/100. Is there a specific aspect of their background you'd like me to elaborate on?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: generateResponse(inputValue),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputValue('');
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-600" />
          Ask about {candidate.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get insights about their research, publications, and potential fit
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Suggested Questions */}
        <div className="space-y-2">
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
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about their research, publications, fit..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}