require('dotenv').config();
const path = require('path');
const fs = require('fs');

let assemblyClient = null;

function getAssemblyClient() {
  if (assemblyClient) return assemblyClient;
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key || key === 'your_assemblyai_key_here') {
    console.log('AssemblyAI key not configured - transcription unavailable');
    return null;
  }
  try {
    const { AssemblyAI } = require('assemblyai');
    assemblyClient = new AssemblyAI({ apiKey: key });
    console.log('AssemblyAI client ready');
    return assemblyClient;
  } catch (e) {
    console.error('AssemblyAI init error:', e.message);
    return null;
  }
}

async function transcribeAudioFile(audioFilePath) {
  const client = getAssemblyClient();
  if (!client) {
    console.warn('AssemblyAI not available, skipping transcription');
    return null;
  }

  try {
    console.log('Uploading audio to AssemblyAI:', audioFilePath);
    const audioData = fs.readFileSync(audioFilePath);
    const uploadResponse = await client.files.upload(audioData);
    const audioUrl = uploadResponse.upload_url || uploadResponse;
    console.log('Audio uploaded, starting transcription...');

    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: 'en',
      punctuate: true,
      format_text: true,
      disfluencies: true
    });

    console.log('Transcription complete:', transcript.text?.substring(0, 100));
    return transcript.text || null;
  } catch (e) {
    console.error('AssemblyAI transcription error:', e.message);
    return null;
  }
}

/**
 * Extract speaking questions per part from the paper object
 * Supports: sections->groups->questions OR flat questions with sectionNumber
 */
function extractQuestionsFromPaper(paper) {
  if (!paper) return {};

  const questionsByPart = {};

  // Method 1: sections with groups (AI-imported papers)
  if (paper.sections?.length > 0) {
    for (const section of paper.sections) {
      const partNum = section.number;
      const questions = [];
      for (const group of (section.groups || [])) {
        for (const q of (group.questions || [])) {
          if (q.content) questions.push(q.content);
        }
        if (!group.questions?.length && group.instruction) {
          questions.push(group.instruction);
        }
      }
      if (questions.length > 0) {
        questionsByPart[partNum] = questions;
      }
    }
  }

  // Method 2: flat questions with sectionNumber (manually created papers)
  if (Object.keys(questionsByPart).length === 0 && paper.questions?.length > 0) {
    for (const q of paper.questions) {
      const partNum = q.sectionNumber || 1;
      if (!questionsByPart[partNum]) questionsByPart[partNum] = [];
      questionsByPart[partNum].push(q.content);
    }
  }

  return questionsByPart;
}

/**
 * Mark speaking transcripts using Claude
 * @param {Object} transcripts - { part1: "text", part2: "text", part3: "text" }
 * @param {string} studentName
 * @param {number} expectedBand
 * @param {Object} paper - full paper object to extract questions from
 */
async function markSpeaking(transcripts, studentName, expectedBand, paper) {
  const { gradeSpeakingAttempt } = require('./claudeMarking');
  const results = {};

  // Extract questions from DB paper
  const questionsByPart = extractQuestionsFromPaper(paper);

  // Fallback questions if DB has none
  const FALLBACK_QUESTIONS = {
    1: ['Tell me about your hometown.', 'What do you do in your free time?', 'Do you prefer indoors or outdoors?'],
    2: ['Describe a person who has had a significant influence on your life.'],
    3: ['Do you think famous people have a responsibility to be good role models?', 'How do social media influencers affect young people?', 'Should schools teach responsible social media use?']
  };

  for (const [part, transcript] of Object.entries(transcripts)) {
    if (!transcript) {
      console.log(`No transcript for ${part}, skipping`);
      continue;
    }

    const partNumber = parseInt(part.replace('part', ''));
    const questions = questionsByPart[partNumber] || FALLBACK_QUESTIONS[partNumber] || [];
    const questionPrompt = questions.join(' | ');

    console.log(`Grading speaking Part ${partNumber} for: ${studentName}`);
    console.log(`Questions used: ${questionPrompt.substring(0, 100)}`);

    try {
      const feedback = await gradeSpeakingAttempt(
        transcript,
        partNumber,
        questionPrompt,
        studentName,
        expectedBand
      );

      if (feedback) {
        results[part] = { transcript, feedback };
      } else {
        console.warn(`No feedback returned for Part ${partNumber}`);
      }
    } catch (err) {
      console.error(`Error grading Part ${partNumber}:`, err.message);
    }
  }

  return results;
}

module.exports = { transcribeAudioFile, markSpeaking, extractQuestionsFromPaper };
