import OpenAI from 'openai';
import type { Candidate } from '../components/CandidateChat';

// Note: In production, API calls should go through a backend server
// to keep the API key secure. This direct browser implementation is
// for development purposes only.

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('VITE_OPENAI_API_KEY is not set. Chat functionality will not work.');
}

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be done via a backend API
}) : null;

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  candidate: Candidate
): Promise<string> {
  if (!openai || !apiKey) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    // Validate and format candidate data
    const university = candidate.university?.trim() || 'University information not available';
    const department = candidate.department?.trim() || 'Department not specified';
    const advisor = candidate.advisor?.trim() || 'Advisor information not available';
    const researchAreas = candidate.researchAreas?.length > 0 
      ? candidate.researchAreas.join(', ') 
      : 'Research areas not specified';
    const researchSummary = candidate.analysis?.researchSummary?.trim() || '';
    const keyStrengths = candidate.analysis?.keyStrengths || [];
    const potentialConcerns = candidate.analysis?.potentialConcerns || [];
    
    // Build publications list
    let publicationsText = '';
    if (candidate.publications && candidate.publications.length > 0) {
      const topPubs = candidate.publications.slice(0, 5);
      publicationsText = `\nTop Publications:\n${topPubs.map((pub, idx) => {
        const title = pub.title?.trim() || 'Untitled';
        const venue = pub.venue?.trim() || 'Unknown venue';
        const year = pub.year || 'Unknown year';
        const citations = pub.citations || 0;
        return `${idx + 1}. "${title}" - ${venue} (${year}), ${citations} citations`;
      }).join('\n')}`;
    } else {
      publicationsText = '\nPublications: No publications listed.';
    }

    // Check if university is unknown and try to infer from publications
    const isUniversityUnknown = university.toLowerCase().includes('unknown') || 
                                 university === 'University information not available';
    
    // Try to extract potential university hints from publications
    let universityHints = '';
    if (isUniversityUnknown && candidate.publications && candidate.publications.length > 0) {
      const venues = candidate.publications
        .map(p => p.venue?.trim())
        .filter(Boolean)
        .filter(v => !v.toLowerCase().includes('demo'));
      const uniqueVenues = [...new Set(venues)];
      
      if (uniqueVenues.length > 0) {
        universityHints = `\n\nNote: While the university is marked as "${university}", the candidate has published in the following venues: ${uniqueVenues.slice(0, 5).join(', ')}. You may infer potential institutional affiliations from these publication venues if they are typically associated with specific universities or research institutions.`;
      }
    }

    // Build comprehensive candidate profile
    const candidateProfile = `Candidate Name: ${candidate.name || '[Name not available]'}

Basic Information:
- University: ${university}${isUniversityUnknown ? ' (marked as unknown in database)' : ''}
- Department: ${department === 'Department not specified' ? '[Not specified]' : department}
- Advisor: ${advisor === 'Advisor information not available' || !advisor ? '[Information not available]' : advisor}
- Research Areas: ${researchAreas === 'Research areas not specified' ? '[Not specified]' : researchAreas}
- Graduation Year: ${candidate.graduationYear || '[Not specified]'}

Academic Metrics:
- Total Citations: ${candidate.totalCitations || 0}
- H-index: ${candidate.hIndex || 0}
- Ranking Score: ${candidate.rankingScore || 0}/100
- Number of Publications: ${candidate.publications?.length || 0} papers

${researchSummary ? `Research Summary: ${researchSummary}` : 'Research Summary: [Not available]'}
${keyStrengths.length > 0 ? `Key Strengths: ${keyStrengths.join('; ')}` : 'Key Strengths: [Not specified]'}
${potentialConcerns.length > 0 ? `Potential Concerns: ${potentialConcerns.join('; ')}` : 'Potential Concerns: [None listed]'}

${publicationsText}${universityHints}`;

    // Create system message - allow GPT to use external knowledge to supplement database data
    const systemMessage = `You are a professional recruitment assistant with access to both a database and your comprehensive knowledge base. Your role is to provide detailed, informative answers about PhD candidates by actively searching your knowledge.

DATABASE INFORMATION FOR "${candidate.name}":
${candidateProfile}

CRITICAL INSTRUCTIONS - BE PROACTIVE AND DETAILED:

1. ACTIVELY SEARCH YOUR KNOWLEDGE BASE:
   - Use the candidate's name "${candidate.name}" as the primary search key
   - Combine it with available information (publications, research areas, graduation year ${candidate.graduationYear || ''}, citations ${candidate.totalCitations || 0}, etc.) to identify this person
   - Look up their actual university, institution, department, research background, and achievements

2. PROVIDE SPECIFIC, DETAILED INFORMATION:
   - If database shows "Unknown University": ACTIVELY search your knowledge to find their actual university/institution. Don't just say "information is unknown" - try to identify it based on:
     * The candidate's name and publications
     * Research areas and publication venues
     * Graduation year and academic background
     * Any institutional affiliations you can find
   
   - For publications: Don't just mention the database list. If you know of additional notable publications, research contributions, or works by this person, include them. Provide context about their research impact and significance.
   
   - For research background: Provide detailed information about their research focus, expertise areas, notable contributions, and academic achievements.

3. ANSWER FORMAT - BE COMPREHENSIVE:
   - Start with specific, concrete information (university name, research focus, etc.)
   - List publications with full details (titles, venues, years, impact)
   - Include research background, expertise, and notable achievements
   - Provide context and insights that would be useful for recruitment
   - Avoid generic statements like "information is not available" - instead, provide what you can find

4. EXAMPLE OF GOOD VS BAD RESPONSE:
   BAD: "大学信息在数据库中标记为未知，无法提供具体学校名称。"
   GOOD: "根据我的了解，${candidate.name}来自[具体大学名称]，在[具体院系/专业]获得博士学位。他在[研究领域]方面有深入研究，主要研究方向包括[具体研究方向]。他在[期刊/会议]发表过多篇重要论文，包括[具体论文标题和详细信息]等，总引用数达${candidate.totalCitations || 0}次，H指数为${candidate.hIndex || 0}。"

5. LANGUAGE: Respond in the same language as the user's question (Chinese if asked in Chinese, English if asked in English)

Now, actively search your knowledge about "${candidate.name}" using all available clues (name, publications: ${candidate.publications?.map(p => p.title).slice(0, 3).join(', ') || 'none'}, research areas, etc.) and provide a comprehensive, detailed answer with specific information.`;

    // Prepare messages for API
    const apiMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Log the full prompt for debugging
    console.group('🤖 GPT API Call');
    console.log('📋 System Prompt:');
    console.log(systemMessage);
    console.log('\n💬 Conversation Messages:');
    console.log(JSON.stringify(messages, null, 2));
    console.log('\n📊 Candidate Data:');
    console.log(JSON.stringify({
      name: candidate.name,
      university: candidate.university,
      department: candidate.department,
      advisor: candidate.advisor,
      researchAreas: candidate.researchAreas,
      totalCitations: candidate.totalCitations,
      hIndex: candidate.hIndex,
      graduationYear: candidate.graduationYear,
      rankingScore: candidate.rankingScore,
      publicationCount: candidate.publications?.length || 0,
      publications: candidate.publications?.map(p => ({
        title: p.title,
        venue: p.venue,
        year: p.year,
        citations: p.citations
      })) || [],
    }, null, 2));
    if (isUniversityUnknown) {
      console.log('\n⚠️ University is marked as unknown. GPT will attempt to infer from publications.');
    }
    console.groupEnd();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost-effectiveness, can be changed to gpt-4 or gpt-3.5-turbo
      messages: apiMessages,
      temperature: 0.8, // Standard temperature to allow GPT to use its knowledge effectively
      max_tokens: 2000, // Increased to allow for more detailed and comprehensive responses
    });

    const responseContent = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Log the response for debugging
    console.group('✅ GPT API Response');
    console.log('📝 Response:');
    console.log(responseContent);
    console.log('\n📈 Usage:');
    console.log({
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens,
    });
    console.groupEnd();

    return responseContent;
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY in the .env file.');
      }
      throw new Error(`Failed to generate response: ${error.message}`);
    }
    throw new Error('Failed to generate response. Please check your API key and try again.');
  }
}

