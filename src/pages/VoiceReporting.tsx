import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  Loader2,
  Info,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Square,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeReportNarrative } from '../services/reportAnalyzer';

export const VoiceReporting: React.FC = () => {
  const { addReport, selectReport, setActiveTab } = useApp();

  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Setup Web Speech API for real-time speech-to-text
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setTranscript(current.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status/warning:', event.error);
      };

      recognition.onend = () => {
        // Handled via state
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [selectedLanguage]);

  // Duration timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Start recording
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setRecordingDuration(0);

      // 1. Start audio stream capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          // Stop media stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250); // Collect data every 250ms
      }

      // 2. Start speech-to-text recognition
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition already started', e);
        }
      }

      setRecordingState('recording');
    } catch (err: any) {
      console.warn('Audio device access error, falling back to speech recognition / manual text:', err);
      // Even if mic stream is blocked in test environment, initiate speech recognition if available
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      setRecordingState('recording');
    }
  };

  // Pause recording
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setRecordingState('paused');
  };

  // Resume recording
  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
    setRecordingState('recording');
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setRecordingState('stopped');
  };

  // Delete recording
  const handleDeleteRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setTranscript('');
    setRecordingDuration(0);
    setRecordingState('idle');
  };

  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<any | null>(null);

  // Re-run real-time semantic analysis when transcript changes meaningfully
  useEffect(() => {
    if (transcript.trim().length > 15) {
      const result = analyzeReportNarrative(transcript, {
        installation: 'Duliajan Central Field',
        asset: 'Frontline Audio Ingestion',
        reportType: 'Near Miss'
      });
      setVoiceAnalysisResult(result);
    } else {
      setVoiceAnalysisResult(null);
    }
  }, [transcript]);

  const handleApplySampleHinglish = () => {
    setTranscript("Maintenance ke time valve properly isolate nahi tha aur line mein residual pressure tha.");
    if (recordingState === 'idle') {
      setRecordingState('stopped');
    }
  };

  const handleAnalyzeVoice = () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      const analyzed = analyzeReportNarrative(transcript, {
        installation: 'Duliajan Central Field',
        asset: 'Frontline Audio Ingestion',
        reportType: 'Near Miss'
      });

      analyzed.extractedFrom = `Voice Ingestion (${selectedLanguage === 'hi-IN' ? 'Hindi/Hinglish' : 'English'})`;
      analyzed.sourceType = 'voice';

      setVoiceAnalysisResult(analyzed);
      addReport(analyzed);
      selectReport(analyzed.id);
      setIsProcessing(false);
    }, 400);
  };

  const handleGoToAnalyzer = () => {
    if (voiceAnalysisResult) {
      selectReport(voiceAnalysisResult.id);
      setActiveTab('report-analyzer');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                Frontline Voice AI
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">Multilingual Ingestion</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-0.5">
              Voice Hazard Reporting (English / Hindi / Hinglish)
            </h1>
            <p className="text-xs text-slate-500">
              Speak field safety observations directly. Real audio recording with playback, pause, speech-to-text, and automated SIF classification.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <label className="text-xs font-bold text-slate-600">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 font-semibold outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">हिन्दी (Hindi / Hinglish)</option>
          </select>
        </div>
      </div>

      {/* Main Voice Control Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 text-center">
        
        {/* Sample Hinglish Loader Button */}
        <div className="flex justify-center">
          <button
            onClick={handleApplySampleHinglish}
            className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold text-purple-800 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Load Hinglish Sample: "Maintenance ke time valve properly isolate nahi tha..."</span>
          </button>
        </div>

        {/* Audio Recording State & Visualizer Display */}
        <div className="space-y-4">
          
          {/* Status Badge & Timer */}
          <div className="flex items-center justify-center space-x-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              recordingState === 'recording'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : recordingState === 'paused'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : recordingState === 'stopped'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                recordingState === 'recording'
                  ? 'bg-rose-600 animate-pulse'
                  : recordingState === 'paused'
                  ? 'bg-amber-500'
                  : recordingState === 'stopped'
                  ? 'bg-emerald-600'
                  : 'bg-slate-400'
              }`} />
              <span className="uppercase tracking-wider">
                {recordingState === 'recording' ? 'Recording Active' : recordingState === 'paused' ? 'Paused' : recordingState === 'stopped' ? 'Recording Captured' : 'Ready'}
              </span>
            </span>

            {(recordingState === 'recording' || recordingState === 'paused' || recordingDuration > 0) && (
              <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-3 py-0.5 rounded-lg border border-slate-200">
                {formatTime(recordingDuration)}
              </span>
            )}
          </div>

          {/* Action Control Buttons Row */}
          <div className="flex items-center justify-center gap-4 pt-2">
            
            {/* Start Button */}
            {recordingState === 'idle' && (
              <button
                onClick={handleStartRecording}
                id="voice-start-button"
                className="px-6 py-3.5 bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 border border-oil-700"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            )}

            {/* Controls when active */}
            {recordingState === 'recording' && (
              <>
                <button
                  onClick={handlePauseRecording}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-charcoal-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 active:scale-95 border border-amber-600"
                  title="Pause recording"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={handleStopRecording}
                  id="voice-stop-button"
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 active:scale-95 border border-rose-700"
                  title="Stop recording"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </>
            )}

            {/* Controls when paused */}
            {recordingState === 'paused' && (
              <>
                <button
                  onClick={handleResumeRecording}
                  className="px-5 py-3 bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 active:scale-95 border border-oil-700"
                  title="Resume recording"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>

                <button
                  onClick={handleStopRecording}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 active:scale-95 border border-rose-700"
                  title="Stop recording"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </>
            )}

            {/* Controls when stopped */}
            {recordingState === 'stopped' && (
              <>
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={handleDeleteRecording}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-rose-200"
                  title="Delete recording"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}

          </div>

          {/* Audio Playback Player (When audio is captured) */}
          {audioUrl && (
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-oil-600" />
                  Playback Audio Recording:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">WebM Audio</span>
              </div>
              <audio src={audioUrl} controls className="w-full h-10 outline-none" />
            </div>
          )}

        </div>

        {/* Live Transcript / Editable Textarea */}
        <div className="max-w-xl mx-auto text-left space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Speech Transcript (Editable):
            </label>
            <span className="text-[10px] text-slate-400">
              {speechSupported ? 'Web Speech Engine' : 'Manual Entry'}
            </span>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Spoken words appear here in real-time as you record. You can also edit or paste directly..."
            rows={4}
            className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-oil-500 leading-relaxed bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>

        {/* Submit & Analyze button */}
        <div className="flex justify-center pt-2">
          <button
            disabled={!transcript.trim() || isProcessing}
            onClick={handleAnalyzeVoice}
            id="voice-submit-button"
            className="px-8 py-3.5 bg-oil-600 hover:bg-oil-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 border border-oil-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing &amp; Structuring Safety Intelligence...</span>
              </>
            ) : (
              <>
                <span>Commit &amp; Add to Enterprise Incident Database</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Structured Output Display (Real-Time Voice Intelligence) */}
      {voiceAnalysisResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                  Live Structured Intelligence Output
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">Extracted from Spoken Narrative</span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Field Observation Diagnostics: {voiceAnalysisResult.id}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                voiceAnalysisResult.sifPrecursor !== 'No SIF'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {voiceAnalysisResult.sifPrecursor !== 'No SIF' ? '⚠️ Potential SIF Precursor' : '✓ Operational Observation'}
              </span>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                Risk Score: {voiceAnalysisResult.riskScore}/100
              </span>
            </div>
          </div>

          {/* 4-Box Intelligence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Box 1: Hazards Detected */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Detected Hazard</span>
              <div className="text-xs font-bold text-slate-900">{voiceAnalysisResult.hazard}</div>
              <p className="text-[11px] text-slate-500">
                Operational Context: <span className="font-semibold text-slate-700">{voiceAnalysisResult.activity}</span>
              </p>
            </div>

            {/* Box 2: SIF Indication */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">2. SIF Indication</span>
              <div className="text-xs font-bold text-rose-700">{voiceAnalysisResult.sifPrecursor}</div>
              <p className="text-[11px] text-slate-500">
                Exposure: <span className="font-semibold text-slate-700">{voiceAnalysisResult.exposure}</span>
              </p>
            </div>

            {/* Box 3: Barrier Analysis */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Defensive Barrier</span>
              <div className="text-xs font-bold text-slate-900">{voiceAnalysisResult.barrier}</div>
              <div className={`text-[10px] font-extrabold uppercase inline-block px-1.5 py-0.5 rounded ${
                voiceAnalysisResult.barrierDegraded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {voiceAnalysisResult.barrierDegraded ? 'Degraded / Bypassed' : 'Operational'}
              </div>
            </div>

            {/* Box 4: Risk Interpretation */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">4. Risk Interpretation</span>
              <div className="text-xs font-bold text-slate-900">{voiceAnalysisResult.riskLevel} Risk Exposure</div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {voiceAnalysisResult.dna?.potentialConsequence || 'Consequence requires barrier restoration.'}
              </p>
            </div>

          </div>

          {/* Corrective Actions Section */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recommended Corrective Action Plan
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                Action Intelligence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Immediate Field Mitigation</span>
                <p className="font-semibold text-slate-800">{voiceAnalysisResult.actionPlan?.immediateMitigation}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Engineering Barrier Restoration</span>
                <p className="font-semibold text-slate-800">{voiceAnalysisResult.actionPlan?.engineeringBarrierAction}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Precursor Prevention Verification</span>
                <p className="font-semibold text-slate-800">{voiceAnalysisResult.actionPlan?.sifPrecursorCheck}</p>
              </div>
            </div>
          </div>

          {/* Next Steps & Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500">
              Observation captured and parsed. Select next analytical step:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectReport(voiceAnalysisResult.id);
                  setActiveTab('sif-pathway');
                }}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Inspect Causal Pathway →
              </button>
              <button
                onClick={handleGoToAnalyzer}
                className="px-4 py-2 rounded-lg bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Inspect in Full Report Analyzer →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
