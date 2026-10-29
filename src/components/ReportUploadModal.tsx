import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, X, ArrowRight, Sparkles, FileSpreadsheet, File } from 'lucide-react';
import { extractTextFromFile, ExtractionResult } from '../services/textExtractor';
import { analyzeReportNarrative, analyzeReportNarrativeAsync, inferAssetAndInstallationFromText } from '../services/reportAnalyzer';
import { useApp } from '../context/AppContext';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: 'Workover • Energy Isolation Precursor',
    label: 'Flagship Precursor',
    installation: 'Duliajan Central Field',
    asset: 'Workover Rig WOR-07',
    text: 'During scheduled maintenance on Workover Rig WOR-07 wellhead, the main isolation gate valve was closed but not verified with zero-energy bleedoff. Residual trapped pressure of 45 psi remained in the line while technicians entered the cellar without independent isolation authority sign-off.'
  },
  {
    title: 'Work at Height • Failed Fall Protection',
    label: 'Derrick Incident',
    installation: 'Jorhat Exploration Rig 4',
    asset: 'Jorhat Exploration Rig 4',
    text: 'During monkey board pipe racking at 28 meters elevation, the derrickman unhooked his safety lanyard to reach an obstinate drill collar. High wind gusts caused sudden mast sway and worker slipped onto outer perimeter grating with zero tie-off.'
  },
  {
    title: 'Confined Space • Gas Test Omission',
    label: 'Separator Entry',
    installation: 'Bagjan Wellsite Operations',
    asset: 'High-Pressure 3-Phase Test Separator V-201',
    text: 'Contractor crew commenced interior vessel sand cleanout of test separator V-201. Confined space entry permit was authorized from control room but field 4-gas test was omitted because portable detector battery had discharged.'
  }
];

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({ isOpen, onClose }) => {
  const { addReport, setActiveTab, selectReport } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTabMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Metadata inputs
  const [installation, setInstallation] = useState('Duliajan Central Field');
  const [asset, setAsset] = useState('Workover Rig WOR-07');
  const [reportType, setReportType] = useState('Incident Precursor');
  const [assetManuallyModified, setAssetManuallyModified] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (targetFile: File) => {
    setFile(targetFile);
    setErrorMessage(null);
    setWarningMessage(null);
    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const result = await extractTextFromFile(targetFile);
      setExtractionResult(result);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setExtractedText(result.text);
        if (result.warning) {
          setWarningMessage(result.warning);
        }

        // Auto-detect asset and installation from extracted narrative
        const inferred = inferAssetAndInstallationFromText(result.text);
        if (inferred.asset && inferred.asset !== 'Duliajan Production Station') {
          setAsset(inferred.asset);
        }
        if (inferred.installation) {
          setInstallation(inferred.installation);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract text from file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText.trim()) {
      setErrorMessage('Please provide report narrative text before analyzing.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analyzed = await analyzeReportNarrativeAsync(extractedText, {
        installation,
        asset,
        reportType
      });

      if (file) {
        analyzed.extractedFrom = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      } else {
        analyzed.extractedFrom = 'Manual / Pasted Input';
      }

      addReport(analyzed);
      selectReport(analyzed.id);
      setIsAnalyzing(false);
      onClose();
      setActiveTab('report-analyzer');
    } catch (err: any) {
      setErrorMessage(`Analysis error: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleTextChange = (newText: string) => {
    setExtractedText(newText);
    if (!assetManuallyModified && newText.trim().length > 15) {
      const inferred = inferAssetAndInstallationFromText(newText);
      if (inferred.asset && inferred.asset !== 'Duliajan Production Station') {
        setAsset(inferred.asset);
      }
      if (inferred.installation) {
        setInstallation(inferred.installation);
      }
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setInstallation(preset.installation);
    setAsset(preset.asset);
    setAssetManuallyModified(true);
    setExtractedText(preset.text);
    setFile(null);
    setExtractionResult({
      text: preset.text,
      sourceType: 'DEMO_PRESET',
      fileName: `${preset.title.replace(/\s+/g, '_')}.txt`,
      fileSize: preset.text.length,
      fileType: 'text/plain',
      wordCount: preset.text.split(' ').length
    });
    setErrorMessage(null);
    setWarningMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-oil-100 flex items-center justify-center text-oil-700 font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ingest Real Safety Report</h2>
              <p className="text-xs text-slate-500">Real browser-compatible parsing: PDF, DOCX, TXT, CSV with deterministic NLP precursor classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Presets for Demo */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-oil-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-oil-600" />
                Quick-Test Presets (Click to Load Real Oil India Scenario)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 rounded-md bg-white border border-emerald-200 hover:border-oil-600 hover:shadow-sm transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-oil-700 truncate">{preset.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{preset.installation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTabMode('upload')}
              className={`pb-2.5 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-oil-600 text-oil-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Real File (PDF / DOCX / TXT / CSV)
            </button>
            <button
              onClick={() => setActiveTabMode('paste')}
              className={`pb-2.5 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-oil-600 text-oil-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Report Text
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div>
              {/* Hidden Real File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv"
                onChange={handleFileSelect}
                className="hidden"
                id="real-file-upload-input"
              />

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-oil-600 rounded-xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-oil-50/30 transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-oil-100 flex items-center justify-center text-slate-500 group-hover:text-oil-700 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-800 group-hover:text-oil-700">Click to select a file from your computer</span>
                  <span className="text-sm text-slate-500"> or drag and drop here</span>
                </div>
                <p className="text-xs text-slate-400">Supported formats: PDF, Microsoft Word (.docx), Plain Text (.txt), CSV</p>
              </div>

              {/* File details banner when file selected */}
              {file && (
                <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    {file.name.endsWith('.pdf') ? <File className="w-4 h-4 text-rose-600" /> :
                     file.name.endsWith('.docx') ? <FileText className="w-4 h-4 text-blue-600" /> :
                     file.name.endsWith('.csv') ? <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> :
                     <FileText className="w-4 h-4 text-slate-600" />}
                    <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                    <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  {isExtracting && (
                    <div className="flex items-center gap-1.5 text-oil-700 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting text...</span>
                    </div>
                  )}
                  {!isExtracting && extractionResult && !errorMessage && (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Extracted ({extractionResult.wordCount} words)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Paste Safety Observation / Incident Narrative
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type or paste the actual incident or near-miss observation text here..."
                rows={5}
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-oil-500 focus:border-oil-500 outline-none"
              />
            </div>
          )}

          {/* Warnings & Errors */}
          {warningMessage && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Text Extraction Notice:</span> {warningMessage}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Error:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Editable Extracted Text Preview */}
          {extractedText && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Extracted Text (Review & Edit Before AI Analysis)
                </label>
                <span className="text-[11px] text-slate-400">
                  {extractedText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={6}
                className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-oil-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Metadata selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">OIL Installation</label>
              <select
                value={installation}
                onChange={(e) => setInstallation(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-oil-500 outline-none"
              >
                <option value="Duliajan Central Field">Duliajan Central Field</option>
                <option value="Moran Oil Field">Moran Oil Field</option>
                <option value="Digboi Refinery Area & Fields">Digboi Refinery Area & Fields</option>
                <option value="Jorhat Exploration Rig 4">Jorhat Exploration Rig 4</option>
                <option value="Bagjan Wellsite Operations">Bagjan Wellsite Operations</option>
                <option value="Rajasthan Block-RJ (Jaisalmer)">Rajasthan Block-RJ (Jaisalmer)</option>
                <option value="Dandewala Gas Plant">Dandewala Gas Plant</option>
                <option value="Kumchai Field (Arunachal)">Kumchai Field (Arunachal)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Associated Asset</label>
              <input
                type="text"
                value={asset}
                onChange={(e) => {
                  setAsset(e.target.value);
                  setAssetManuallyModified(true);
                }}
                placeholder="e.g. Workover Rig WOR-07"
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-oil-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-oil-500 outline-none"
              >
                <option value="Incident Precursor">Incident Precursor</option>
                <option value="Unsafe Condition">Unsafe Condition</option>
                <option value="Unsafe Act">Unsafe Act</option>
                <option value="Near Miss">Near Miss</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-oil-700">Prototype Note:</span> Parsing is client-side; no confidential files leave your browser.
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!extractedText.trim() || isAnalyzing || isExtracting}
              onClick={handleAnalyze}
              className="px-5 py-2.5 text-xs font-bold text-white bg-oil-600 hover:bg-oil-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running AI Pipeline...
                </>
              ) : (
                <>
                  ANALYZE WITH OIL HSE INTELLIGENCE
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
