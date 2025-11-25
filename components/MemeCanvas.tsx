import React, { useRef, useEffect } from 'react';

interface MemeCanvasProps {
  imageSrc: string | null;
  topText: string;
  bottomText: string;
  onDownloadReady?: (url: string) => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({ 
  imageSrc, 
  topText, 
  bottomText 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Calculate aspect ratio fit within a max width/height
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Configure Text Styles
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(2, canvas.width / 150);
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      
      const fontSize = canvas.width * 0.12;
      ctx.font = `700 ${fontSize}px "Oswald", sans-serif`;

      // Helper for text wrapping/drawing
      const drawMemeText = (text: string, y: number, baseline: CanvasTextBaseline) => {
        if (!text) return;
        ctx.textBaseline = baseline;
        const x = canvas.width / 2;
        const maxWidth = canvas.width * 0.9;
        
        // Simple word wrap
        const words = text.toUpperCase().split(' ');
        let line = '';
        let lines: string[] = [];

        for(let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        lines.forEach((l, i) => {
           // Adjust Y for multiple lines
           const offset = baseline === 'top' 
             ? y + (i * fontSize * 1.1) 
             : y - ((lines.length - 1 - i) * fontSize * 1.1);
           
           ctx.strokeText(l, x, offset);
           ctx.fillText(l, x, offset);
        });
      };

      // Draw Top Text
      drawMemeText(topText, canvas.height * 0.05, 'top');

      // Draw Bottom Text
      drawMemeText(bottomText, canvas.height * 0.95, 'bottom');
    };

  }, [imageSrc, topText, bottomText]);

  const downloadMeme = () => {
     if(!canvasRef.current) return;
     const link = document.createElement('a');
     link.download = 'meme-genius.png';
     link.href = canvasRef.current.toDataURL();
     link.click();
  };

  // Expose download method globally via custom event or similar if needed, 
  // but better to pass the ref or handle it differently. 
  // For this simplified version, we'll attach the handler to the window or context in parent.
  // Actually, we'll just put an ID on the canvas and access it in the parent or use a dedicated download button next to it.
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-2xl bg-black flex justify-center items-center min-h-[300px]">
       {!imageSrc && <p className="text-gray-500">Preview Area</p>}
       <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto object-contain"
        id="meme-canvas"
       />
    </div>
  );
};
