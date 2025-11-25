import React, { useState, useRef, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { MemeCanvas } from './components/MemeCanvas';
import { Button } from './components/Button';
import { IconMagic, IconDownload, IconEdit, IconWand } from './components/Icons';
import { generateMemeCaptions, editMemeImage } from './services/geminiService';
import { LoadingState } from './types';

function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // Separate original image from the one being displayed/edited to allow resets if needed, 
  // but for now, we just update currentImage for edits.
  
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string>("");
  const [customTopText, setCustomTopText] = useState<string>("");
  const [customBottomText, setCustomBottomText] = useState<string>("");
  const [editPrompt, setEditPrompt] = useState<string>("");
  
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'caption' | 'edit'>('caption');

  const handleImageSelect = (base64: string) => {
    setCurrentImage(base64);
    setCaptions([]);
    setSelectedCaption("");
    setCustomTopText("");
    setCustomBottomText("");
    setEditPrompt("");
    setErrorMessage(null);
  };

  const handleMagicCaption = async () => {
    if (!currentImage) return;
    
    setLoadingState(LoadingState.ANALYZING);
    setErrorMessage(null);
    try {
      const generatedCaptions = await generateMemeCaptions(currentImage);
      setCaptions(generatedCaptions);
      if (generatedCaptions.length > 0) {
        // Automatically create a "bottom text" style from the first suggestion if it's long, 
        // or just set it as selected.
        // For simplicity, we just fill the "Selected Caption" state which users can map to top/bottom
      }
    } catch (error) {
      setErrorMessage("Failed to generate captions. Try again.");
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleImageEdit = async () => {
    if (!currentImage || !editPrompt.trim()) return;

    setLoadingState(LoadingState.GENERATING_IMAGE);
    setErrorMessage(null);
    try {
      const newImage = await editMemeImage(currentImage, editPrompt);
      setCurrentImage(newImage);
      // Clear prompt after successful edit
      setEditPrompt("");
    } catch (error) {
      setErrorMessage("Failed to edit image. Try a different prompt.");
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const downloadMeme = () => {
    const canvas = document.getElementById('meme-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `meme-genius-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Logic to split selected caption into top/bottom automatically if user clicks a suggestion
  const applyCaption = (text: string) => {
    setSelectedCaption(text);
    // Heuristic: Split by first comma or if length is > 20 chars, split in half
    // For now, simpler: Put it all in bottom text if it's long, or top if short? 
    // Standard meme format usually uses bottom text for the punchline.
    // Let's just put it in Bottom Text for the user to edit.
    setCustomBottomText(text);
    setCustomTopText(""); // Reset top text
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-2 rounded-lg">
                <span className="text-xl font-bold text-white font-mono">MG</span>
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
               MemeGenius AI
             </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* API Key warning or status could go here if needed */}
             <div className="hidden sm:block text-xs text-gray-500">
               Powered by Gemini
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentImage ? (
          <div className="max-w-3xl mx-auto mt-10 animate-fade-in">
             <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-4">Create Viral Memes with AI</h2>
                <p className="text-gray-400 text-lg">Upload an image, get smart captions from Gemini 3 Pro, or remix visuals with Nano Banana.</p>
             </div>
             <ImageUploader onImageSelect={handleImageSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Editor Controls */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              
              {/* Tabs */}
              <div className="flex p-1 bg-gray-800/50 rounded-xl border border-gray-700">
                <button
                  onClick={() => setActiveTab('caption')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'caption' 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Text & Captions
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'edit' 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Visual Editor
                </button>
              </div>

              {/* Text & Caption Tools */}
              {activeTab === 'caption' && (
                <div className="space-y-6 animate-fade-in">
                   <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <IconMagic className="text-purple-400" />
                          Magic Caption
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Let AI analyze the image and suggest funny captions.
                      </p>
                      <Button 
                        variant="accent" 
                        className="w-full" 
                        onClick={handleMagicCaption}
                        isLoading={loadingState === LoadingState.ANALYZING}
                        icon={<IconMagic />}
                      >
                        Generate Ideas
                      </Button>

                      {/* Suggestions List */}
                      {captions.length > 0 && (
                        <div className="mt-4 space-y-2">
                           <p className="text-xs font-semibold text-gray-500 uppercase">Suggestions</p>
                           <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                             {captions.map((cap, idx) => (
                               <button
                                 key={idx}
                                 onClick={() => applyCaption(cap)}
                                 className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-transparent hover:border-purple-500/50 transition-all text-sm text-gray-200"
                               >
                                 {cap}
                               </button>
                             ))}
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Manual Text</h3>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Top Text</label>
                        <input 
                          type="text" 
                          value={customTopText}
                          onChange={(e) => setCustomTopText(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase font-bold"
                          placeholder="TOP TEXT"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Bottom Text</label>
                        <input 
                          type="text" 
                          value={customBottomText}
                          onChange={(e) => setCustomBottomText(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase font-bold"
                          placeholder="BOTTOM TEXT"
                        />
                      </div>
                   </div>
                </div>
              )}

              {/* Visual Editor Tools */}
              {activeTab === 'edit' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                       <IconEdit className="text-blue-400" />
                       <h3 className="text-lg font-semibold text-white">Generative Edit</h3>
                     </div>
                     <p className="text-sm text-gray-400">
                       Describe how you want to change the image. e.g., "Add a retro filter", "Make it cyberpunk", "Remove the background person".
                     </p>
                     
                     <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Describe your edits..."
                     />

                     <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={handleImageEdit}
                        disabled={!editPrompt.trim()}
                        isLoading={loadingState === LoadingState.GENERATING_IMAGE}
                        icon={<IconWand />}
                     >
                        Apply Changes
                     </Button>
                     
                     <div className="text-xs text-gray-500 mt-2">
                       Powered by Gemini 2.5 Flash Image
                     </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => handleImageSelect('')}
                >
                  Start Over
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={downloadMeme}
                  icon={<IconDownload />}
                >
                  Download
                </Button>
              </div>
              
              {errorMessage && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="sticky top-24">
                <MemeCanvas 
                  imageSrc={currentImage}
                  topText={customTopText}
                  bottomText={customBottomText}
                />
                <div className="mt-4 text-center text-sm text-gray-500">
                   Right-click to copy or use Download button
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
