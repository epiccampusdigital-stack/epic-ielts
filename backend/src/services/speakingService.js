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
  if (!client) return null;

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
      disfluencies: true,
      speech_threshold: 0.2
    });

    console.log('Transcription complete:', transcript.text?.substring(0, 100));
    return transcript.text || null;
  } catch (e) {
    console.error('AssemblyAI transcription error:', e.message);
    return null;
  }
}

async function markSpeaking(transcripts, studentName, expectedBand) {
  const { gradeSpeakingAttempt } = require('./claudeMarking');
  const results = {};

  for (const [part, transcript] of Object.entries(transcripts)) {
    if (!transcript) continue;
    const partNumber = parseInt(part.replace('part', ''));
    console.log('Grading speaking Part', partNumber, 'for:', studentName);
    const feedback = await gradeSpeakingAttempt(
      transcript, partNumber,
      SPEAKING_QUESTIONS[partNumber - 1]?.questions?.join(' | ') || '',
      studentName, expectedBand
    );
    if (feedback) results[part] = { transcript, feedback };
  }

  return results;
}

const SPEAKING_QUESTIONS = [
  {
    part: 1,
    questions: [
      'Tell me about your hometown.',
      'What do you do in your free time?',
      'Do you prefer spending time indoors or outdoors?'
    ]
  },
  {
    part: 2,
    questions: ['Describe a person who has had a big influence on your life.']
  },
  {
    part: 3,
    questions: [
      'Do you think famous people have a responsibility to be good role models?',
      'How do social media influencers affect young people?'
    ]
  }
];

module.exports = { transcribeAudioFile, markSpeaking, SPEAKING_QUESTIONS };
